import type React from "react";
import {
  useDataMessage,
  useHuddle01,
  useLocalPeer,
  usePeerIds,
} from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import { BasicIcons } from "@/utils/BasicIcons";
import { Button } from "../ui/button";
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
    <div className="">
      <div>{BasicIcons.on.mic}</div>
      <div className="mt-4 mb-8 text-white">
        <div className="text-xl font-medium">Request to speak</div>
        <div className="max-w-[20rem] text-sm">
          You will become a speaker once your request is accepted by the Host or
          Co-host
        </div>
      </div>
      <div className="flex items-center gap-4 justify-center">
        <Button
          type="button"
          variant={"outline"}
          className="bg-white w-36 text-custom-6"
          onClick={() => setPromptView("close")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={"outline"}
          className="w-36 bg-blue-600 text-white"
          onClick={sendSpeakerRequest}
        >
          Send Request
        </Button>
      </div>
    </div>
  );
};
export default RequestToSpeak;
