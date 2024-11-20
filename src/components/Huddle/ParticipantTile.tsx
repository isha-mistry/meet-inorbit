import React from "react";
import GridContainer from "./GridContainer";
import { usePeerIds } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import clsx from "clsx";
import { useStudioState } from "@/store/studioState";
interface participantTileProps {
  className?: string;
}

function ParticipantTile({ className }: participantTileProps) {
  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.GUEST],
  });
  const { isScreenShared } = useStudioState();

  return (
    <GridContainer
      className={clsx(
        "bg-gray-100 bg-opacity-80 relative border border-white rounded-lg flex flex-col items-center justify-center min-w-[150px] min-h-[150px]",
        className
      )}
    >
      <div className="hidden sm:flex md:hidden lg:flex  items-center justify-center w-24 h-24 rounded-full bg-blue-shade-100 text-gray-200 text-3xl font-semibold ">
        +{peerIds.length - 2}
      </div>

      <div className="sm:hidden md:flex lg:hidden flex items-center justify-center w-24 h-24 rounded-full bg-blue-shade-100 text-gray-200 text-3xl font-semibold">
        +{peerIds.length - 1}
      </div>
    </GridContainer>
  );
}

export default ParticipantTile;
