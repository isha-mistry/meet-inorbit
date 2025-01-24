import { usePeerIds } from "@huddle01/react/hooks";
import PeerData from "./peerData";
import { useStudioState } from "@/store/studioState";
import clsx from "clsx";
import { BasicIcons } from "@/utils/BasicIcons";
import Peers from "./Peers/Peers";

const ParticipantsBar = ({ meetingCategory }: { meetingCategory: string }) => {
  const { peerIds } = usePeerIds();
  const { requestedPeers, setIsParticipantsOpen } = useStudioState();

  return (
    <aside className="absolute right-0 top-0 w-full 0.5xm:w-96 bg-[#202020] h-full  0.5xm:rounded-l-lg transition-transform duration-300 ease-in-out shadow-lg z-20">
      <div className="mb-6">
        <div className="flex justify-between items-center px-4 py-2 border-b border-[#2f2f2f]">
          <h1 className="text-xl font-semibold text-gray-300">Participants</h1>
          <button type="button" onClick={() => setIsParticipantsOpen(false)}>
            {BasicIcons.close}
          </button>
        </div>
        <div className="flex flex-col gap-2 mt-2 px-4 py-2 overflow-y-auto">
          {/* {peerIds.map((peerId) => (
            <PeerData peerId={peerId} key={peerId} />
          ))} */}
          <Peers meetingCategory={meetingCategory} />
        </div>
      </div>
    </aside>
  );
};

export default ParticipantsBar;
