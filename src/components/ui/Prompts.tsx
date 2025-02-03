import React from "react";

// Common
import OverlayContainer from "./OverlayContainer";
import RequestToSpeak from "../Modals/RequestToSpeak";
import { useStudioState } from "@/store/studioState";

type PromptsProps = {};

const Prompts: React.FC<PromptsProps> = () => {
  const { promptView, setPromptView } = useStudioState();

  const prompt = {
    "request-to-speak": <RequestToSpeak />,
  } as const;

  if (promptView === "close") return null;

  return (
    <OverlayContainer onClick={() => setPromptView("close")}>
      {prompt[promptView]}
    </OverlayContainer>
  );
};
export default React.memo(Prompts);
