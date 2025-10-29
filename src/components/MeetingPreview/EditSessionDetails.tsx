"use client";
import { Button } from "@nextui-org/react";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { imageCIDs } from "@/config/staticDataUtils";
import lighthouse from "@lighthouse-web3/sdk";
import Image from "next/image";
import { CgAttachment } from "react-icons/cg";
import { LIGHTHOUSE_BASE_API_KEY } from "@/config/constants";

function EditSessionDetails({
  data,
  sessionDetails,
  onSessionDetailsChange,
}: {
  data: any;
  sessionDetails: { title: string; description: string; image: string };
  onSessionDetailsChange: (field: string, value: any) => void;
}) {
  // const [title, setTitle] = useState("");
  // const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getDescriptionStatus = (length: number) => {
    if (length < 600) return "Bad";
    if (length >= 600 && length <= 1000) return "Medium";
    if (length > 1000 && length <= 1500) return "Good";
    if (length > 1500) return "Medium";
  };

  const handleTitleChange = (e: any) => {
    if (e.target.value.length <= 100) {
      onSessionDetailsChange("title", e.target.value);
    }
  };

  const handleDescriptionChange = (e: any) => {
    if (e.target.value.length <= 2000) {
      onSessionDetailsChange("description", e.target.value);
    }
  };

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * imageCIDs.length);
    // return imageCIDs[randomIndex];
    onSessionDetailsChange("image", imageCIDs[randomIndex]);
  };

  const handleChange = async (selectedImage: any) => {
    const apiKey = LIGHTHOUSE_BASE_API_KEY ? LIGHTHOUSE_BASE_API_KEY : "";

    if (selectedImage) {
      const output = await lighthouse.upload(selectedImage, apiKey);
      const imageCid = output.data.Hash;
      onSessionDetailsChange("image", imageCid);
    }
  };

  return (
    <div className="relative">
      <div>
        <div className="">
          <div className="text-xl font-semibold mb-2 text-gray-200 font-robotoMono flex flex-col gap-3 xm:gap-0 xm:flex-row-reverse xm:justify-between">
            <Button
              className="border-blue-shade-100 text-blue-shade-100 border rounded-full font-robotoMono font-semibold text-xs bg-white w-fit ml-auto"
              onClick={() => toast("Coming Soon! 🚀")}
            >
              Generate Title and Description
            </Button>
            Thumbnail Image
          </div>
          <div className="flex flex-col xm:flex-row gap-3 xm:items-center">
            <div className="w-40 h-24 bg-gray-100 xm:mb-5 rounded-lg flex items-center justify-center">
              {sessionDetails.image ? (
                <Image
                  src={`https://gateway.lighthouse.storage/ipfs/${sessionDetails.image}`}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-md"
                  width={100}
                  height={100}
                />
              ) : (
                <div className="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 xm:gap-4 rounded-lg p-3">
                <label className="bg-[#EEF8FF]  text-blue-shade-100 font-medium text-xs xm:text-sm py-[11px] xm:py-3 px-4 rounded-full border cursor-pointer border-blue-shade-100 cursor-point flex gap-2 items-center ">
                  <CgAttachment className="size-4" />
                  <span className="flex gap-1">
                    Upload <span className="hidden xm:block">Image</span>
                  </span>
                  <input
                    type="file"
                    name="image"
                    ref={fileInputRef}
                    accept="*/image"
                    className="hidden"
                    onChange={(e) => handleChange(e.target.files)}
                  />
                </label>
                <Button
                  className="bg-black text-white py-5 px-4 text-xs font-medium rounded-full font-robotoMono"
                  onClick={getRandomImage}
                >
                  Add Random Image
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="py-3 font-robotoMono">
          <div className="text-xl mb-2 font-semibold text-gray-200 font-robotoMono">
            Session Title
          </div>
          <div className="flex flex-col-reverse xs:flex-row items-center justify-between w-full border bg-[#212c4c] py-3 px-4 rounded-lg  xs:gap-4">
            <input
              type="text"
              className=" text-xs xs:text-sm bg-[#212c4c] w-full xm:p-1 rounded-lg outline-none "
              placeholder="Enter a descriptive title for your session"
              value={sessionDetails.title}
              onChange={handleTitleChange}
              maxLength={100}
            />
            <div className="text-[10px] xm:text-sm font-medium text-[#7C7C7C] font-robotoMono ml-auto">
              {sessionDetails.title.length}/100
            </div>
          </div>
        </div>
        <div className="py-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-xl font-semibold text-gray-200 font-robotoMono">
                Session Description
              </div>
            </div>
            <div
              className={`rounded-lg px-2 xm:px-4 py-1 text-xs border ${sessionDetails.description.length < 600
                  ? "bg-red-500"
                  : sessionDetails.description.length <= 1000
                    ? "bg-yellow-500"
                    : sessionDetails.description.length <= 1500
                      ? "bg-green-700"
                      : "bg-yellow-700"
                } text-white`}
            >
              {getDescriptionStatus(sessionDetails.description.length)}
            </div>
          </div>
          <div className="flex flex-col-reverse items-start justify-between w-full border bg-[#212c4c] py-3 px-4 rounded-lg">
            <textarea
              rows={8}
              className=" bg-[#212c4c] w-full text-xs xs:text-sm rounded-lg outline-none"
              placeholder="Briefly describe what your session covers"
              value={sessionDetails.description}
              onChange={handleDescriptionChange}
              maxLength={2000}
            ></textarea>
            <div className="text-[10px] xm:text-sm font-medium text-[#7C7C7C] ml-auto">
              {sessionDetails.description.length}/2000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditSessionDetails;
