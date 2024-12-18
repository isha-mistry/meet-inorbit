import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BasicIcons } from "@/utils/BasicIcons";
import { Menu } from "lucide-react";
import { PiLinkSimpleBold } from "react-icons/pi";
import { PeerMetadata } from "@/utils/types";
import { useLocalPeer } from "@huddle01/react";

interface MobileMenuDropdownProps {
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenShared: boolean;
  shareStream: MediaStream | null;
  metadata?: PeerMetadata | null;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  peerCount: number;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreen: () => void;
  onToggleHand: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onCopyLink: () => void;
}

const MobileMenuDropdown: React.FC<MobileMenuDropdownProps> = ({
  isVideoOn,
  isAudioOn,
  isScreenShared,
  shareStream,
  metadata,
  isChatOpen,
  isParticipantsOpen,
  peerCount,
  onToggleVideo,
  onToggleAudio,
  onToggleScreen,
  onToggleHand,
  onToggleChat,
  onToggleParticipants,
  onCopyLink,
}) => {
  const { role } = useLocalPeer<PeerMetadata>();

  return (
    <div className="lg:hidden ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#202020] hover:bg-gray-500/50"
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full bg-[#202020] text-white p-2 rounded-lg">
          <div className="space-y-2">
            {/* Chat Option */}
            <Button
              className="w-full flex items-center justify-start gap-2 bg-[#2f2f2f] hover:bg-gray-600/50"
              onClick={onToggleChat}
            >
              {BasicIcons.chat}
              <span>Chat</span>
            </Button>

            {/* Participants Option */}
            <Button
              className="w-full flex items-center justify-start gap-2 bg-[#2f2f2f] hover:bg-gray-600/50"
              onClick={onToggleParticipants}
            >
              <div className="flex items-center gap-2">
                {BasicIcons.people}
                <span>Participants ({peerCount})</span>
              </div>
            </Button>

            {/* Screen Share Option */}
            {role !== "listener" && (
              <Button
                className="w-full flex items-center justify-start gap-2 bg-[#2f2f2f] hover:bg-gray-600/50"
                onClick={onToggleScreen}
                disabled={isScreenShared && !shareStream}
              >
                {BasicIcons.screenShare}
                <span>
                  {isScreenShared && shareStream
                    ? "Stop Sharing"
                    : shareStream
                    ? "Stop Sharing"
                    : isScreenShared
                    ? "Screen share in use"
                    : "Share Screen"}
                </span>
              </Button>
            )}

            {/* Hand Raise Option */}
            <Button
              className="w-full flex items-center justify-start gap-2 bg-[#2f2f2f] hover:bg-gray-600/50"
              onClick={onToggleHand}
            >
              {BasicIcons.handRaise}
              <span>
                {metadata?.isHandRaised ? "Lower Hand" : "Raise Hand"}
              </span>
            </Button>

            {/* Invite Link Option */}
            <Button
              className="w-full flex items-center justify-start gap-2 bg-[#2f2f2f] hover:bg-gray-600/50"
              onClick={onCopyLink}
            >
              <PiLinkSimpleBold className="h-5 w-5" />
              <span>Copy Invite Link</span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileMenuDropdown;
