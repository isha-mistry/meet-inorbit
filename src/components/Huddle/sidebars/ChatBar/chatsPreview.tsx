import React, { useRef, useEffect, useState } from "react";
import { IChatMessage, useStudioState } from "@/store/studioState";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// First, update the IChatMessage interface in your types (if you have access to it)
// interface IChatMessage {
//   name: string;
//   text: string;
//   isUser: boolean;
//   timestamp: Date; // Add this field
// }

const ChatsPreview = () => {
  const { chatMessages, hasUnreadMessages, setHasUnreadMessages } =
    useStudioState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastReadIndex, setLastReadIndex] = useState<number>(
    chatMessages.length
  );

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (hasUnreadMessages) {
      setLastReadIndex((prevIndex) =>
        Math.min(prevIndex, chatMessages.length - 1)
      );
    } else {
      setLastReadIndex(chatMessages.length);
    }
  }, [hasUnreadMessages, chatMessages.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      const isAtBottom =
        Math.abs(
          container.scrollHeight - container.clientHeight - container.scrollTop
        ) < 10;

      if (isAtBottom) {
        setHasUnreadMessages(false);
        setLastReadIndex(chatMessages.length);
      }
    }
  };

  const validateUrl = (text: string): boolean => {
    try {
      if (text.length > 2083) return false;
      if (!text.includes(".")) return false;

      const simpleUrlRegex =
        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?$/i;

      const timeoutMs = 100;
      const startTime = Date.now();

      while (Date.now() - startTime < timeoutMs) {
        if (simpleUrlRegex.test(text)) {
          try {
            new URL(text.startsWith("http") ? text : `https://${text}`);
            return true;
          } catch {
            return false;
          }
        }
        return false;
      }
      return false;
    } catch {
      return false;
    }
  };

  const formatDisplayUrl = (url: string): string => {
    try {
      const urlObject = new URL(
        url.startsWith("http") ? url : `https://${url}`
      );
      return `${urlObject.hostname}${urlObject.pathname}${urlObject.search}${urlObject.hash}`;
    } catch {
      return url;
    }
  };

  const formatTextWithUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (validateUrl(part)) {
        return (
          <React.Fragment key={index}>
            <Link
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-blue-200 transition-colors"
            >
              <LinkIcon size={16} className="flex-shrink-0" />
              <span className="text-sm underline break-all">
                {formatDisplayUrl(part)}
              </span>
            </Link>
          </React.Fragment>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      {chatMessages.map((chat: IChatMessage, index: number) => (
        <React.Fragment key={`${chat.name}-${index}`}>
          {hasUnreadMessages && index === lastReadIndex && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-500/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#202020] px-2 text-xs text-red-400 font-medium">
                  New messages
                </span>
              </div>
            </div>
          )}
          <div
            className={clsx(
              "flex flex-col mb-2",
              chat.isUser ? "items-end" : "items-start"
            )}
          >
            <div
              className={clsx(
                "break-words max-w-xs w-fit py-1 px-2 rounded-lg",
                chat.isUser ? "bg-[#216CFC]" : "bg-gray-600/50"
              )}
            >
              {!chat.isUser && (
                <div className="text-xs text-blue-300">{chat.name}</div>
              )}
              <div className="text-sm">{formatTextWithUrls(chat.text)}</div>
            </div>
            <div className="text-[0.6rem] text-gray-400 mt-1 px-2">
              {formatTime(new Date(chat.timestamp))}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ChatsPreview;
