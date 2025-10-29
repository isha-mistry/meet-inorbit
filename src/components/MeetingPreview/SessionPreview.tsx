"use client";
import React, { useEffect, useState } from "react";
import WatchSessionVideo from "@/components/WatchMeeting/WatchSessionVideo";
import WatchSession from "@/components/WatchMeeting/WatchSession";

function SessionPreview({
  data,
  collection,
  sessionDetails,
}: {
  data: any;
  collection: any;
  sessionDetails: { title: string; description: string; image: string };
}) {
  return (
    <>
      {/* {data ? ( */}
      <div className="">
        <div className="space-y-5 font-robotoMono pb-5">
          <WatchSessionVideo
            data={data}
            collection={collection}
            autoplay={false}
            sessionDetails={sessionDetails}
          />
          <WatchSession
            data={data}
            collection={collection}
            sessionDetails={sessionDetails}
          />
        </div>
      </div>
      {/* ) : (
        "Loading"
      )} */}
    </>
  );
}

export default SessionPreview;
