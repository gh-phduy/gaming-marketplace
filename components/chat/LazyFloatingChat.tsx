"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ActiveConversation } from "./useFloatingChat";

const FloatingChatWidget = dynamic(() => import("./FloatingChatWidget"), {
  ssr: false,
});

/** Keep the message UI and its subscriptions out of the initial page load. */
export default function LazyFloatingChat() {
  const [conversation, setConversation] = useState<ActiveConversation | null>(
    null,
  );
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<ActiveConversation>).detail;
      if (detail) setConversation(detail);
    };
    window.addEventListener("difmark:open-chat", open);
    return () => window.removeEventListener("difmark:open-chat", open);
  }, []);

  return conversation ? (
    <FloatingChatWidget initialConversation={conversation} />
  ) : null;
}
