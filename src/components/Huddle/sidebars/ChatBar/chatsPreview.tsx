import React, { useRef, useEffect, useState } from "react";
import { IChatMessage, useStudioState } from "@/store/studioState";
import { BasicIcons } from "@/utils/BasicIcons";
import clsx from "clsx";
import Link from "next/link";

const ChatsPreview = () => {
  const { chatMessages, hasUnreadMessages, setHasUnreadMessages } =
    useStudioState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastReadIndex, setLastReadIndex] = useState<number>(
    chatMessages.length
  );

  // Set scroll position to bottom when component mounts or messages change
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, [chatMessages]);

  // Update last read index when new messages arrive
  useEffect(() => {
    if (hasUnreadMessages) {
      setLastReadIndex((prevIndex) =>
        Math.min(prevIndex, chatMessages.length - 1)
      );
    } else {
      setLastReadIndex(chatMessages.length);
    }
  }, [hasUnreadMessages, chatMessages.length]);

  // Reset unread state when user scrolls to bottom
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

  const validateUrl = (text: string) => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/;
    return urlRegex.test(text);
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
                : "w-fit py-1 px-2 break-words max-w-xs text-md mb-2 rounded-lg bg-gray-600/50",
              validateUrl(chat.text) && "hover:bg-blue-500/50"
            )}
          >
            <div className="text-xs text-blue-300">
              {chat.isUser ? null : chat.name}
            </div>
            {validateUrl(chat.text) ? (
              <Link href={chat.text} target="_blank" rel="noreferrer">
                <div className="flex gap-2 items-center justify-center">
                  <span>{BasicIcons.folder}</span>
                  <span>{chat?.fileName}</span>
                </div>
              </Link>
            ) : (
              <div className="text-sm">{chat.text}</div>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ChatsPreview;
