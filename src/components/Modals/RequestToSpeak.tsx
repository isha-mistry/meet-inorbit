import type React from "react";
import {
  useDataMessage,
  useLocalPeer,
  usePeerIds,
} from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudioState } from "@/store/studioState";

type RequestToSpeakProps = {};

const RequestToSpeak: React.FC<RequestToSpeakProps> = () => {
  const { setPromptView } = useStudioState();

  const { peerId } = useLocalPeer();
  const { sendData } = useDataMessage();

  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.CO_HOST, Role.SPEAKER],
  });

  const sendSpeakerRequest = () => {
    sendData({
      to: peerIds,
      payload: JSON.stringify({
        peerId,
      }),
      label: "requestToSpeak",
    });
    setPromptView("close");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#1A1B1E] border-2 border-[#4c4d4f] p-8 rounded-2xl backdrop-blur-xl">
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-6 bg-[#2C2D30]">
          <Mic className="w-7 h-7 text-[#4169E1]" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">
          Request to Speak
        </h2>
        <p className="text-sm text-gray-400 mb-8 px-4">
          You will become a speaker once your request is accepted by the Host or
          Co-host.
        </p>
      </div>
      <div className="flex justify-center space-x-3">
        <Button
          type="button"
          className="w-32 bg-[#2C2D30] text-gray-300 hover:bg-[#363739] border-0 transition-colors"
          onClick={() => setPromptView("close")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="w-32 bg-[#4169E1] text-white hover:bg-[#3154B4] transition-colors"
          onClick={sendSpeakerRequest}
        >
          Send Request
        </Button>
      </div>
    </div>
  );
};

export default RequestToSpeak;
