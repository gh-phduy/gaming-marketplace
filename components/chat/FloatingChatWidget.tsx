"use client";

import React from "react";
import { useFloatingChat } from "./useFloatingChat";
import type { ActiveConversation } from "./useFloatingChat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

/* ==========================================================================
   MAIN COMPONENT: FloatingChatWidget Wrapper
   ========================================================================== */

/**
 * FloatingChatWidget Component
 *
 * Renders the floating chat room overlay at the bottom-right corner.
 * Coordinates input fields, header bars, and scrolling logs using the `useFloatingChat` hook.
 */
export default function FloatingChatWidget({ initialConversation }: { initialConversation?: ActiveConversation }) {
  const {
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
    currentUser,
  } = useFloatingChat(initialConversation);

  // Hidden when there is no active chat session triggered
  if (!isOpen || !activeConversation) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#161e28] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      {/* Top Header recipient segment */}
      <ChatHeader
        conversation={activeConversation}
        onClose={() => setIsOpen(false)}
      />
      
      {/* Scrollable message listing timeline */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentUserId={currentUser?.id}
        messagesEndRef={messagesEndRef}
      />
      
      {/* Message composition input footer */}
      <ChatInput
        value={newMessage}
        onChange={setNewMessage}
        onSubmit={handleSendMessage}
        isSending={isSending}
      />
    </div>
  );
}

