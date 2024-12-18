import React from "react";
import Strip from "./Strip";
import {
  useRoom,
  useHuddle01,
  useLocalPeer,
  useRemotePeer,
} from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";

type ListenersDataProps = {
  peerId: string;
};

const ListenersData: React.FC<ListenersDataProps> = ({ peerId }) => {
  const { leaveRoom, kickPeer } = useRoom();
  const { updateRole } = useRemotePeer({ peerId });
  const me = useLocalPeer();
  console.log("local role: ", me.role);

  return (
    <>
      {/* {me.role === "host" && (
      <div>
        <Strip
          type="personNormal"
          title="Invite as Co-Host"
          variant="normal"
          onClick={() => {
            updateRole(Role.CO_HOST);
          }}
        />
      </div>
    )} */}
      {me.role === "host" && (
        <div>
          <Strip
            type="personSpeaker"
            title="Invite as Speaker"
            variant="normal"
            onClick={() => {
              updateRole(Role.SPEAKER, {
                custom: {
                  admin: true,
                  canConsume: true,
                  canProduce: true,
                  canProduceSources: {
                    cam: true,
                    mic: true,
                    screen: true,
                  },
                  canRecvData: true,
                  canSendData: true,
                  canUpdateMetadata: true,
                },
              });
            }}
          />

          <Strip
            title="Invite as Co-Host"
            variant="normal"
            onClick={() => updateRole(Role.CO_HOST)}
            type="personNormal"
          />

          <Strip
            title="Remove from space"
            variant="danger"
            onClick={() => kickPeer(peerId)}
            type="leave"
          />
        </div>
      )}

      {me.role === Role.LISTENER && me.peerId === peerId && (
        <div>
          <Strip
            type="leave"
            title="Leave the spaces"
            variant="danger"
            onClick={leaveRoom}
          />
        </div>
      )}
    </>
  );
};
export default ListenersData;
