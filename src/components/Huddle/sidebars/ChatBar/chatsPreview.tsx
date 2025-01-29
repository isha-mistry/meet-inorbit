import React, { useRef, useEffect, useState } from "react";
import { IChatMessage, useStudioState } from "@/store/studioState";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const ChatsPreview = () => {
  const { chatMessages, hasUnreadMessages, setHasUnreadMessages } =
    useStudioState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastReadIndex, setLastReadIndex] = useState<number>(
    chatMessages.length
  );

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

  // Modified formatDisplayUrl to return the full URL
  const formatDisplayUrl = (url: string): string => {
    try {
      const urlObject = new URL(
        url.startsWith("http") ? url : `https://${url}`
      );
      // Return full URL path without protocol
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
              chat.isUser
                ? "ml-auto text-md break-words max-w-xs w-fit py-1 px-2 mb-2 bg-[#216CFC] rounded-lg items-center flex"
                : "w-fit py-1 px-2 break-words max-w-xs text-md mb-2 rounded-lg bg-gray-600/50"
            )}
          >
            <div className="text-xs text-blue-300">
              {chat.isUser ? null : chat.name}
            </div>
            <div className="text-sm">{formatTextWithUrls(chat.text)}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ChatsPreview;
