import Image from "next/image";
import React from "react";
import { MdCancel } from "react-icons/md";
import record from "@/assets/images/instant-meet/record.svg";

function MeetingRecordingModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: (result: boolean) => void;
}) {
  return (
    <>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 backdrop-blur-md"
          // onClick={onClose}
          ></div>
          <div className="bg-[#2f2f2f] rounded-3xl shadow-lg px-4 py-8 pt-9 xs:p-8 relative w-full max-w-lg mx-4">
            <button
              onClick={() => onClose(false)}
              className="text-gray-100 hover:text-gray-500 absolute top-4 right-4"
            >
              <MdCancel size={20} className="" />
            </button>
            <div className="mb-6">
              <div className="flex gap-3 items-center">
                <Image
                  alt="record-left"
                  width={25}
                  height={25}
                  src={record}
                  className="w-5 h-5"
                />
                <h2 className="text-lg font-bold font-robotoMono text-white">
                  Do you want to record the meeting?
                </h2>
              </div>

            </div>
            <div className="flex text-sm text-justify font-robotoMono text-gray-300">
              In order for meeting participants to claim both offchain and
              onchain attestations, the meeting must be recorded. Without a
              recording, they will not be able to claim these attestations.
            </div>
            <div className="flex justify-center space-x-4 pt-4 font-robotoMono">
              <button
                onClick={() => onClose(true)}
                className="bg-blue-shade-200 text-xs text-white px-6 py-2 rounded-full font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => onClose(false)}
                className="bg-[#FF0000] text-xs text-white px-6 py-2 rounded-full font-bold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MeetingRecordingModal;
