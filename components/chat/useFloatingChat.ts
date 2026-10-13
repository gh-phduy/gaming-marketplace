"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

/* ==========================================================================
   TYPE DEFINITIONS & INTERFACES
   ========================================================================== */

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  senderName: string;
  senderAvatar: string;
}

export interface ActiveConversation {
  id: string;
  sellerId: string;
  buyerId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  listingTitle: string;
}

/* ==========================================================================
   CUSTOM STATE HOOK: useFloatingChat
   ========================================================================== */

/**
 * useFloatingChat Hook
 *
 * Encapsulates the state and side-effects for the floating chat room,
 * including loading existing threads, resetting unread badges, and listening
 * for postgres insert changes via Supabase realtime channels.
 */
export function useFloatingChat(initialConversation?: ActiveConversation) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(Boolean(initialConversation));
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(initialConversation ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialConversation) {
      setActiveConversation(initialConversation);
      setIsOpen(true);
    }
  }, [initialConversation]);

  // Hook 1: Listen for custom trigger events to launch chat overlays
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<ActiveConversation>;
      if (customEvent.detail) {
        setActiveConversation(customEvent.detail);
        setIsOpen(true);
      }
    };

    window.addEventListener("difmark:open-chat", handleOpenChat);
    return () => {
      window.removeEventListener("difmark:open-chat", handleOpenChat);
    };
  }, []);

  // Hook 2: Sync active chat ID to window so header NavBar badges can suppress new indicators
  useEffect(() => {
    if (isOpen && activeConversation) {
      (window as any).difmarkActiveChatId = activeConversation.id;
    } else {
      (window as any).difmarkActiveChatId = null;
    }
    return () => {
      (window as any).difmarkActiveChatId = null;
    };
  }, [isOpen, activeConversation]);

  // Hook 3: Fetch messages log and reset unread counts when conversation switches
  useEffect(() => {
    if (!activeConversation || !isOpen) return;

    // Reset unread count indicators on open actions
    const resetUnreadOnOpen = async () => {
      if (!user?.id) return;
      const isCurrentUserSeller = activeConversation.sellerId === user.id;
      const { error } = await supabase
        .from("conversations")
        .update({
          [isCurrentUserSeller ? "unread_for_seller" : "unread_for_buyer"]: 0,
        })
        .eq("id", activeConversation.id);
      if (error) {
        console.error("Error resetting unread count on open:", error);
      }
    };

    void resetUnreadOnOpen();

    // Load message logs history
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(`
            *,
            sender:users (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq("conversation_id", activeConversation.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const mappedMessages: Message[] = (data || []).map((row: any) => ({
          id: row.id,
          senderId: row.sender_id,
          text: row.text,
          createdAt: row.created_at,
          senderName: row.sender?.display_name || "User",
          senderAvatar: row.sender?.avatar_url || "/avt1.png",
        }));

        setMessages(mappedMessages);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMessages();

    // Subscribe to Postgres realtime message insert updates
    const subscription = supabase
      .channel(`chat-room:${activeConversation.id}-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          
          // Verify duplicate rows are ignored
          setMessages((prev) => {
            if (prev.some((m) => m.id === newRow.id)) return prev;

            const isCurrentUser = newRow.sender_id === user?.id;
            
            // Instantly sync active viewing states
            if (!isCurrentUser) {
              const isCurrentUserSeller = activeConversation.sellerId === user?.id;
              void supabase
                .from("conversations")
                .update({
                  [isCurrentUserSeller ? "unread_for_seller" : "unread_for_buyer"]: 0,
                })
                .eq("id", activeConversation.id);
            }

            const senderName = isCurrentUser 
              ? (user?.name || "Me") 
              : activeConversation.recipientName;
            const senderAvatar = isCurrentUser 
              ? (user?.picture || "/avt1.png") 
              : activeConversation.recipientAvatar;

            return [
              ...prev,
              {
                id: newRow.id,
                senderId: newRow.sender_id,
                text: newRow.text,
                createdAt: newRow.created_at,
                senderName,
                senderAvatar,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }, [activeConversation, isOpen, user]);

  // Hook 4: Auto scroll list container on new message arrival
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Action: Submit transaction processing handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: user.id,
          text: messageText,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state immediately if realtime subscription is delayed
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [
          ...prev,
          {
            id: data.id,
            senderId: data.sender_id,
            text: data.text,
            createdAt: data.created_at,
            senderName: user.name || "Me",
            senderAvatar: user.picture || "/avt1.png",
          },
        ];
      });
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    activeConversation,
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isSending,
    messagesEndRef,
    handleSendMessage,
    currentUser: user,
  };
}

