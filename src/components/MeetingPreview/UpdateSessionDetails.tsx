"use client";
import { Button, ButtonGroup, TimeInput } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import EditSessionDetails from "./EditSessionDetails";
import SessionPreview from "./SessionPreview";
import { Time } from "@internationalized/date";
import { ThreeDots } from "react-loader-spinner";
import { useAccount } from "wagmi";
import { getAccessToken } from "@privy-io/react-auth";
import { useRouter } from "next-nprogress-bar";
import UpdateSessionDetailsSkeletonLoader from "@/components/SkeletonLoader/UpdateSessionDetailsSkeletonLoader";
// import not_found from "@/assets/images/daos/404.png";
import Image from "next/image";
import PageNotFound from "../PageNotFound/PageNotFound";
import { IoClose } from "react-icons/io5";
import SessionHostedModal from "@/components/ComponentUtils/SessionHostedModal";
import { APP_BASE_URL } from "@/config/constants";
import { getToken } from "next-auth/jwt";
import { fetchApi } from "@/utils/api";
import { updateOfficeHoursData } from "@/utils/LobbyApiActions";

function UpdateSessionDetails({
  roomId,
  meetingType,
}: {
  roomId: string;
  meetingType: string;
}) {
  // useEffect(() => {
  //   const storedStatus = sessionStorage.getItem("meetingData");
  //   if (storedStatus) {
  //     const parsedStatus = JSON.parse(storedStatus);
  //     if (parsedStatus.meetingId === roomId) {
  //       sessionStorage.removeItem("meetingData");
  //     }
  //   }
  // }, []);

  const [sessionDetails, setSessionDetails] = useState({
    title: "",
    description: "",
    image: "",
  });

  const [data, setData] = useState<any>();
  const [collection, setCollection] = useState<any>();
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { address } = useAccount();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(true);
  const [showHostPopup, setShowHostPopup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams({
          roomId: roomId,
        });
        const requestOptions: any = {
          method: "GET",
          redirect: "follow",
        };
        const response = await fetch(
          `/api/get-watch-data?${params.toString()}`,
          requestOptions
        );

        const result = await response.json();
        setData(result.data[0]);
        setCollection(result.collection);
        setShowPopup(true);
        setDataLoading(false);
      } catch (error) {
        console.error(error);
        setDataLoading(false);
      }
    }

    fetchData();
  }, [roomId]);

  const handleSessionDetailsChange = (field: string, value: any) => {
    setSessionDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (data) {
      setSessionDetails({
        title: data.title,
        description: data.description,
        image: data.thumbnail_image,
      });
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      if (address?.toLowerCase() === data.host_address.toLowerCase()) {
        setLoading(true);

        if (collection === "sessions") {
          const myHeaders = new Headers();
          const token = await getAccessToken();
          myHeaders.append("Content-Type", "application/json");
          if (address) {
            myHeaders.append("x-wallet-address", address);
            myHeaders.append("Authorization", `Bearer ${token}`);
          }

          const raw = JSON.stringify({
            meetingId: roomId,
            host_address: data.host_address,
            title: sessionDetails.title,
            description: sessionDetails.description,
            thumbnail_image: sessionDetails.image,
          });

          const requestOptions: any = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };
          const response = await fetchApi(
            `/update-recorded-session`,
            requestOptions
          );
          if (response) {
            const responseData = await response.json();
            setLoading(false);
            setShowHostPopup(true);
            // router.push(`/profile/${address}?active=sessions&session=hosted`);
          } else {
            setLoading(false);
            // setData(null);
          }
        } else if (collection === "office_hours") {
          const requestBody = {
            host_address: data.host_address,
            title: sessionDetails.title,
            description: sessionDetails.description,
            thumbnail_image: sessionDetails.image,
            dao_name: data.dao_name,
            reference_id: data.reference_id,
          };
          const responseData =
            address &&
            (await updateOfficeHoursData(
              address,
              await getAccessToken(),
              requestBody
            ));
          if (responseData) {
            setLoading(false);
            setShowHostPopup(true);
          } else {
            setLoading(false);
          }
        }
      }
    } catch (e) {
      console.log("Error:", e);
      setLoading(true);
    }
  };

  const handleRedirection = () => {
    console.log("collection", collection);
    if (collection === "sessions") {
      router.push(
        `${APP_BASE_URL}/profile/${data.host_address}?active=sessions&session=hosted`
      );
    } else if (collection === "office_hours") {
      router.push(
        `${APP_BASE_URL}/profile/${data.host_address}?active=officeHours&hours=hosted`
      );
    }
  };

  return (
    <div className="font-robotoMono">
      {!dataLoading ? (
        address?.toLowerCase() === data?.host_address.toLowerCase() ? (
          <div className="py-5 px-4 sm:px-6 lg:px-16">
            {showPopup && (
              <div
                className=" mx-auto transition-all duration-300 ease-in-out bg-[#c2defd22] text-gray-200 px-2 xm:px-4 py-3 rounded-lg w-fit mb-4"
                style={{ boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)" }}
              >
                <div className="flex flex-col-reverse xm:flex-row items-center font-semibold text-sm justify-between gap-1 xm:gap-4">
                  <span>🙂 Thank you for taking the {meetingType === "session" ? "session" : "lecture"} on Xcan</span>
                  <button
                    className="ml-auto rounded-full flex items-center"
                    onClick={() => setShowPopup(false)}
                  >
                    <IoClose className="text-white font-semibold bg-black size-3 xm:size-4 rounded-full " />
                  </button>
                </div>
              </div>
            )}
            <div className="justify-between flex flex-col md:flex-row-reverse border rounded-3xl py-4 xl:py-6 px-3 sm:px-6 xl:px-8 gap-3 md:gap-6 xl:gap-10 items-center mb-10">
              <div className="flex">
                <Button
                  onClick={() => setViewMode("edit")}
                  className={`rounded-l-full ${viewMode === "edit"
                    ? "bg-black text-white"
                    : "bg-white border border-black text-black"
                    }`}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => setViewMode("preview")}
                  className={`rounded-r-full ${viewMode === "preview"
                    ? "bg-black text-white"
                    : "bg-white border border-black text-black"
                    }`}
                >
                  Preview
                </Button>
              </div>
              <div
                className={`text-[13px] xs:text-sm sm:text-base xl:text-lg transition-all duration-300 ease-in-out`}
              >
                Please add a title and description for your {meetingType === "session" ? "session" : "lecture"} so that
                other users can easily understand what it&apos;s about before
                watching. You can edit this information later if needed.
              </div>
            </div>
            <div>
              {viewMode === "edit" ? (
                <div
                  className="rounded-3xl px-3 sm:px-6 xl:px-8 py-6"
                  style={{
                    boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)",
                  }}
                >
                  <EditSessionDetails
                    data={data}
                    sessionDetails={sessionDetails}
                    onSessionDetailsChange={handleSessionDetailsChange}
                  />
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      className="bg-blue-shade-200 rounded-full font-semibold px-10 text-white"
                      onClick={handleRedirection}
                    >
                      Back to Profile
                    </Button>
                    <Button
                      className="bg-blue-shade-200 rounded-full font-semibold px-10 text-white"
                      onClick={() => setViewMode("preview")}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full 1.7md:w-[70%] mx-auto">
                  <SessionPreview
                    data={data}
                    collection={collection}
                    sessionDetails={sessionDetails}
                  />
                  <div className="flex justify-center gap-3">
                    <Button
                      className="bg-black xm:bg-blue-shade-200 rounded-full font-semibold px-10 text-white"
                      onClick={() => setViewMode("edit")}
                    >
                      Continue Editing
                    </Button>
                    <Button
                      className="hidden xm:block bg-blue-shade-200 rounded-full font-semibold px-10 text-white"
                      onClick={handleRedirection}
                    >
                      Back to Profile
                    </Button>
                    <Button
                      className="bg-black xm:bg-blue-shade-200 text-white font-semibold rounded-full px-10"
                      onClick={() => handleUpdate()}
                    >
                      {loading ? (
                        <ThreeDots
                          visible={true}
                          height="40"
                          width="40"
                          color="#FFFFFF"
                          ariaLabel="oval-loading"
                        />
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                  <Button
                    className="xm:hidden bg-blue-shade-200 rounded-full font-semibold px-10 text-white w-fit mx-auto mt-2"
                    onClick={handleRedirection}
                  >
                    Back to Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <PageNotFound />
        )
      ) : (
        <UpdateSessionDetailsSkeletonLoader />
      )}
      {showHostPopup && (
        <SessionHostedModal data={data} collection={collection} />
      )}
    </div>
  );
}

export default UpdateSessionDetails;
