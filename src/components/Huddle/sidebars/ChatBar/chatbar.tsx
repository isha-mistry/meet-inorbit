import { BasicIcons } from "@/utils/BasicIcons";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import ChatsPreview from "./chatsPreview";
import { useDataMessage, useLocalPeer } from "@huddle01/react/hooks";
import { useState } from "react";
import { PeerMetadata } from "@/utils/types";
import { useStudioState } from "@/store/studioState";

const ChatBar = () => {
  const { sendData } = useDataMessage();
  const [message, setMessage] = useState("");
  const { metadata } = useLocalPeer<PeerMetadata>();
  const [isFileUploading, setIsFileUploading] = useState(false);

  const { setIsChatOpen } = useStudioState();

  const sendMessage = () => {
    if (message != "") {
      sendData({
        to: "*",
        payload: JSON.stringify({
          message,
          name: metadata?.displayName,
        }),
        label: "chat",
      });
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsFileUploading(true);

        const response = await fetch("/uploadFile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (response.ok) {
          const { url, fields } = await response.json();
          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          formData.append("file", file);

          const uploadResponse = await fetch(url, {
            method: "POST",
            body: formData,
          });


          if (uploadResponse.ok) {
            sendData({
              to: "*",
              payload: JSON.stringify({
                message: `${url}${fields.key}`,
                fileName: file.name,
                name: metadata?.displayName,
              }),
              label: "file",
            });
          }
        }
      }
    };
    input.click();
    setIsFileUploading(false);
  };

  return (
    // <div className="absolute right-0 top-0 h-full flex w-full 0.5xm:w-96 0.5xm:rounded-l-lg flex-col 0.5xm:border-y 0.5xm:border-l border-white bg-[#2f2f2f] text-white shadow-lg transition-transform duration-300 ease-in-out">
    <div className="absolute right-0 top-0 h-full flex w-full 0.5xm:w-96 0.5xm:rounded-l-lg flex-col bg-[#202020] text-white shadow-lg transition-transform duration-300 ease-in-out z-20">
      <div className="flex px-4 py-2 border-b-1 border-[#2f2f2f] justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-300 ">Chat</h1>
        <button type="button" onClick={() => setIsChatOpen(false)}>
          {BasicIcons.close}
        </button>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <ChatsPreview />
      </div>
      <div className="p-2 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            className="flex-1 rounded-lg bg-[#202020]  text-white placeholder-gray-400"
            placeholder="Type your message"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            onKeyDown={handleKeyDown}
          />
          {/* <Button
            className='bg-gray-700 hover:bg-gray-600 text-gray-200 p-2'
            onClick={handleUpload}
          >
            {BasicIcons.upload}
          </Button> */}
          <Button
            className="bg-[#202020] hover:bg-gray-600/50 text-gray-200"
            onClick={sendMessage}
          >
            {BasicIcons.send}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
