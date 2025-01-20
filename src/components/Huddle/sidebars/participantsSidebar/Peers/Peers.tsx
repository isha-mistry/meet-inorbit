import React, { use, useMemo, useState } from "react";

// Assets
import { BasicIcons } from "@/utils/BasicIcons";

// Components
import PeerList from "./PeerList";
import PeerMetaData from "./PeerMetaData/LocalPeerMetaData";

// Hooks
import { useLocalPeer, usePeerIds, useRoom } from "@huddle01/react/hooks";

// import useStore from "@/components/store/slices";
import HostsList from "./SidebarViewPorts/HostsList";
import CoHostsList from "./SidebarViewPorts/CoHostsList";
import { Role } from "@huddle01/server-sdk/auth";
import SpeakersList from "./SidebarViewPorts/SpeakersList";
import ListenersList from "./SidebarViewPorts/ListenersList";
import { NestedPeerListIcons } from "@/utils/PeerListIcons";
import GuestData from "./PeerRole/GuestData";
import GuestList from "./SidebarViewPorts/GuestList";
import { useStudioState } from "@/store/studioState";
import AcceptDenyPeer from "./PeerMetaData/AcceptDenyPeer";

type PeersProps = {
  meetingCategory: string;
};

const Peers: React.FC<PeersProps> = ({ meetingCategory }) => {
  const BlackList = ["peer", "listener"];

  const me = useLocalPeer();
  const { muteEveryone } = useRoom();
  const { requestedPeers } = useStudioState();

  const { peerIds: hostPeerIds } = usePeerIds({ roles: ["host"] });
  const { peerIds: coHostPeerIds } = usePeerIds({ roles: ["coHost"] });
  const { peerIds: speakerPeerIds } = usePeerIds({ roles: ["speaker"] });
  const { peerIds: listenerPeerIds } = usePeerIds({ roles: ["listener"] });
  const { peerIds: guestPeerIds } = usePeerIds({ roles: ["guest"] });

  const uniqueRequestedPeers = useMemo(() => {
    return [...new Set(requestedPeers)];
  }, [requestedPeers]);

  return (
    <div>
      {me.role === Role.HOST && <MuteMicDiv onClick={muteEveryone} />}

      {meetingCategory === "officehours" &&
        uniqueRequestedPeers.length > 0 &&
        (me.role === Role.HOST || me.role === Role.CO_HOST) && (
          <PeerList className="mt-5" title="Requested to Speak">
            {uniqueRequestedPeers.map((peerId) => {
              return (
                <AcceptDenyPeer key={`sidebar-${peerId}`} peerId={peerId} />
              );
            })}
          </PeerList>
        )}

      {/* Host */}
      {(hostPeerIds.length > 0 || me.role === "host") && (
        <PeerList title="Host">
          <HostsList className="mt-5" />
        </PeerList>
      )}
      {/* Co-Hosts */}
      {(coHostPeerIds.length > 0 || me.role === "coHost") && (
        <PeerList title="Co-Hosts">
          <CoHostsList className="mt-5" />
        </PeerList>
      )}

      {/* Speakers */}
      {(speakerPeerIds.length > 0 || me.role === "speaker") && (
        <PeerList
          title="Speakers"
          // count={speakerPeerIds.length + (me.role == "speaker" ? 1 : 0)}
        >
          <SpeakersList className="mt-5" />
        </PeerList>
      )}

      {/* listeners */}
      {(listenerPeerIds.length > 0 || me.role === "listener") && (
        <PeerList
          title="Listeners"
          // count={listenerPeerIds.length + (me.role == "listeners" ? 1 : 0)}
        >
          <ListenersList className="mt-5" />
        </PeerList>
      )}

      {(guestPeerIds.length > 0 || me.role === "guest") && (
        <PeerList
          title="Guests"
          // count={listenerPeerIds.length + (me.role == "listeners" ? 1 : 0)}
        >
          <GuestList className="mt-5" />
        </PeerList>
      )}
    </div>
  );
};
export default Peers;

interface Props {
  onClick: () => void;
}

const MuteMicDiv: React.FC<Props> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center border border-custom-4 rounded-lg p-2 gap-2 w-full bg-[#202020]"
  >
    <span>{NestedPeerListIcons.inactive.mic}</span>
    <span className="text-gray-400 text-sm font-semibold">Mute Everyone</span>
  </button>
);
