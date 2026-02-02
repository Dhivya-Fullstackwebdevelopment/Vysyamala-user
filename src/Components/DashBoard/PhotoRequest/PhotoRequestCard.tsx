/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import {
  MdBookmark,
  MdBookmarkBorder,
  MdMessage,
  MdOutlineGrid3X3,
  MdStars,
  MdVerifiedUser,
} from "react-icons/md";
import axios from "axios";
import { Update_photo_request } from "../../../commonapicall";
import {
  ToastNotification,
  NotifyError,
  NotifySuccess,
} from "../../Toast/ToastNotification";
// import { useNavigate } from "react-router-dom";
import { IoCalendar, IoEye, IoSchool } from "react-icons/io5";
import {
  FaLocationDot,
  FaPersonArrowUpFromLine,
  FaSuitcase,
  FaUser,
} from "react-icons/fa6";
import MatchingScore from "../ProfileDetails/MatchingScore";
// import ProfileListImg from "../../../assets/images/./ProfileListImg.png";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { PhotoRequestPopup } from "./PhotoRequestPopup";
//import Spinner from "../../Spinner";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../../API";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";
import PlatinumModal from "../ReUsePopup/PlatinumModalPopup";


interface PhotoRequestData {
  req_Profile_img: string;
  req_profile_age: number;
  req_profile_name: string;
  req_profileid: string;
  req_status: number;
  response_message: string | null;
  req_verified: number;
  req_height: number;
  req_star: string;
  req_profession: string;
  req_city: string;
  req_degree: string;
  req_match_score?: number;
  req_views: number;
  req_lastvisit: string;
  req_userstatus: string;
  req_horoscope: string;
  req_profile_wishlist: string | number;
}

interface proptype {
  NewUpdatedData: boolean;
  setNewUPDatedData: (value: boolean) => void;
  data: PhotoRequestData;
  totalRecords: number;
  toptalPages: number;
  sortBy: string;
}

const PhotoRequestCard = ({
  NewUpdatedData,
  setNewUPDatedData,
  sortBy,
  data,
}: proptype) => {
  const navigate = useNavigate();
  // const [photoRequests, setPhotoRequests] = useState<PhotoRequestData[]>([]);
  const [, setPhotoRequests] = useState<PhotoRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const [RejectMsg] = useState<string>("");
  // const [, setShowPhotoRequestNotesPopup] = useState<boolean>(false);

  //const [showMessageButton, setShowMessageButton] = useState<boolean>(false);
  //const [isBookmarked, setIsBookmarked] = useState(false);
  // const [requestHandled, setRequestHandled] = useState(false);
  const [showPhotoRequestPopup, setshowPhotoRequestPopup] = useState(false);
  //const [declineButtonVisible, setDeclineButtonVisible] = useState(true); // State to control the visibility of the Decline button
  ///const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState("");
  const [isRedirect, setIsRedirect] = useState(false);
  const [userName] = useState("");
  // Added state to capture the selected from_profile_id for messaging
  const [, setSelectedFromProfileId] = useState<string | null>(null);
  ////console.log("setSelectedFromProfileId",setSelectedFromProfileId)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const location = useLocation();
  // const [isBookmarked, setIsBookmarked] = useState(
  //   data.req_profile_wishlist === 1 || data.req_profile_wishlist === "1"
  // );
  const [isBookmarked] = useState(
    data.req_profile_wishlist === 1 || data.req_profile_wishlist === "1"
  );
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<string[]>(() => {
    const savedBookmarks = sessionStorage.getItem("bookmarkedProfiles");
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);

  const handleMessage = async (fromProfileId: string) => {
    try {
      // First API call to Create_or_retrievechat
      const response = await apiClient.post("/auth/Create_or_retrievechat/", {
        profile_id: loginuser_profileId,
        profile_to: fromProfileId, // Use the passed fromProfileId
      });


      if (response.data.statue === 1) {
        const { room_id_name } = response.data;

        // Second API call to Get_user_chatlist
        const chatListResponse = await apiClient.post("/auth/Get_user_chatlist/", {
          profile_id: loginuser_profileId,
        });

        if (chatListResponse.data.status === 1) {
          // Extract relevant profile data
          const profileData = chatListResponse.data.data.find(
            (item: { room_name_id: any; }) => item.room_name_id === room_id_name
          );

          // Structure profileData with actual details from chatListResponse
          const selectedProfileData = {
            room_name_id: profileData.room_name_id,
            profile_image: profileData.profile_image,
            profile_user_name: profileData.profile_user_name,
            profile_lastvist: profileData.profile_lastvist,
          };

          // Save profile data with room ID to sessionStorage
          sessionStorage.setItem("selectedProfile", JSON.stringify(selectedProfileData));
          console.log(selectedProfileData, "selectedProfileData");

          // Set state and navigate to messages page
          setRoomId(room_id_name);
          setIsRedirect(true);
          navigate("/Messages");
        } else {
          console.error("Failed to fetch chat list:", chatListResponse.data.mesaage);
        }
      } else {
        console.error("Failed to create chat room:", response.data.Message);
      }
    } catch (error) {
      console.error("Error creating or fetching chat room:", error);
    }
  };


  useEffect(() => {
    if (isRedirect) {
      window.location.href = `/messages/${roomId}/${userName}`;
    }
  }, [isRedirect, roomId, userName]);

  useEffect(() => {
    const fetchPhotoRequests = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_photo_request_list/",
          {
            profile_id: loginuser_profileId,
          }
        );

        if (response.data.Status === 1) {
          // Map response to add response_message dynamically
          const profiles = response.data.data.profiles.map(
            (profile: PhotoRequestData) => ({
              ...profile,
              response_message: profile.response_message || null, // Initialize response_message
            })
          );
          setPhotoRequests(profiles);
        } else {
          setError("Failed to fetch photo requests.");
        }
      } catch (err) {
        setError("Error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoRequests();
  }, [loginuser_profileId]);

  //console.log(photoRequests, "ddddddddddddddd");


  const handleUpdateInterest = async (status: string) => {
    const payload = {
      profile_id: loginuser_profileId,
      profile_from: data.req_profileid,
      status: status === "2" ? "2" : "3",
      response_message: status === "3" ? RejectMsg : undefined,
    };

    try {
      const response = await axios.post(Update_photo_request, payload);
      if (response.status === 200 && response.data.Status === 1) {
        if (status === "2") {
          NotifySuccess("Photo request accepted successfully");
        } else {
          NotifyError("Photo request declined");
        }

        setNewUPDatedData(!NewUpdatedData); // Trigger a refresh
      } else {
        NotifyError("Failed to update photo request");
      }
    } catch (error) {
      console.error("Error updating photo request:", error);
      NotifyError("An error occurred while updating the photo request");
    }
  };

  // const handleBookmark = () => {
  //   setIsBookmarked(!isBookmarked);
  // };

  const handleBookmarkToggle = async () => {
    const profileId = data.req_profileid;

    if (isBookmarked) {
      await removeBookmark(profileId);
    } else {
      await addBookmark(profileId);
    }
  };

  const addBookmark = async (profileId: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: "1",
        }
      );
      if (response.data.Status === 1) {
        toast.success("Profile added to wishlist!");
        // //console.log("Profile added to wishlist!");
        setBookmarkedProfiles((prev) => [...prev, profileId]);
        sessionStorage.setItem(
          "bookmarkedProfiles",
          JSON.stringify([...bookmarkedProfiles, profileId])
        );
      } else {
        toast.error("Failed to add to wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while adding to wishlist.");
      console.error("Error adding bookmark:", error);
    }
  };

  const removeBookmark = async (profileId: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: "0",
        }
      );
      if (response.data.Status === 1) {
        toast.error("Profile removed from wishlist.");
        ////console.log("Profile removed from wishlist.");
        const updatedBookmarks = bookmarkedProfiles.filter((id) => id !== profileId);
        setBookmarkedProfiles(updatedBookmarks);
        sessionStorage.setItem("bookmarkedProfiles", JSON.stringify(updatedBookmarks));
      } else {
        toast.error("Failed to remove from wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while removing from wishlist.");
      console.error("Error removing bookmark:", error);
    }
  };

  const handleshowPhotoRequestPopup = (profileId: string) => {
    setSelectedProfileId(profileId); // Set the selected profile ID
    setshowPhotoRequestPopup(!showPhotoRequestPopup); // Toggle the popup
  };


  const handleDeclineSubmit = async (message: string) => {
    if (!selectedProfileId) return;

    try {
      const response = await axios.post(Update_photo_request, {
        profile_id: loginuser_profileId,
        profile_from: selectedProfileId,
        status: "3",
        response_message: message,
      });

      if (response.data.Status === 1) {
        setNewUPDatedData(!NewUpdatedData); // Trigger a refresh
      } else {
        alert("Failed to update photo request.");
      }
    } catch (error) {
      console.error("Error updating photo request:", error);
      alert("An error occurred while updating the photo request.");
    }
  };


  if (loading) {
    return (
      <div className="w-fit mx-auto py-40">
        <Hearts
          height="100"
          width="100"
          color="#FF6666"
          ariaLabel="hearts-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p className="text-sm">Please wait...</p>
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  // const handleProfileClick = (profileId: string) => {
  //   navigate(`/ProfileDetails?id=${profileId}&page=6`);
  // };

  const handleProfileClick = async (profileId: string, sortBy: string) => {
    if (activeProfileId) return;
    setActiveProfileId(profileId); // set the card that's loading
    const secureId = encryptId(profileId);
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    let page_id = "2";

    if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
      page_id = "1";
    }

    try {
      const checkResponse = await apiClient.post(
        "/auth/Get_profile_det_match/",
        {
          profile_id: loginuser_profileId,
          user_profile_id: profileId,
          page_id: page_id,
        }
      );

      // if (checkResponse.data.status === "failure") {
      //   toast.error(checkResponse.data.message || "Limit reached to view profile");
      //   setActiveProfileId(null);
      //   return;
      // }


      if (checkResponse.data.status === "failure") {
        if (checkResponse.data.message === "Profile visibility restricted") {
          setIsPlatinumModalOpen(true);
        } else {
          toast.error(checkResponse.data.message || "Limit reached to view profile");
        }
        return;
      }
      // Navigate after validation
      navigate(`/ProfileDetails?id=${secureId}&page=6&sortBy=${sortBy}`);
    } catch (error: any) {
      // toast.error("Error accessing profile.");
      // console.error("API Error:", error);
      const serverMessage = error.response?.data?.message;

      if (serverMessage === "Profile visibility restricted") {
        setIsPlatinumModalOpen(true);
      } else {
        // Only show the toast if it's NOT the visibility restriction
        toast.error(serverMessage || "Error accessing profile.");
        console.error("API Error:", error);
      }
      console.error("API Error:", error);
    } finally {
      setActiveProfileId(null); // reset loading
    }
  };

  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  return (
    <div>
      <ToastNotification />

      <div
        key={data.req_profileid}
        className=""
      >
        {activeProfileId === data.req_profileid && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
            <Hearts height="80" width="80" color="#FF6666" visible={true} />
            <p className="mt-2 text-sm text-primary">Please wait...</p>
          </div>
        )}
        <div className="flex justify-start items-center space-x-5 relative rounded-xl shadow-profileCardShadow   py-5">
          <div className="w-full flex justify-between items-center">
            <div className="flex justify-between items-center space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
              <div className="relative  max-sm:w-full">
                <img
                  src={data.req_Profile_img || defaultImgUrl}
                  alt="Profile-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = defaultImgUrl; // Set default image
                  }}
                  className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full"
                  onClick={() => handleProfileClick(data.req_profileid, sortBy)} // ✅ Add this line
                />
                {isBookmarked ? (
                  <MdBookmark
                    onClick={handleBookmarkToggle}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                ) : (
                  <MdBookmarkBorder
                    onClick={handleBookmarkToggle}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                )}
              </div>

              <div className="">
                {/* <div className="relative mb-2">
                    <h5 className="text-[20px] text-secondary font-semibold cursor-pointer">
                      {data.req_profile_name}{" "}
                      <span className="text-sm text-ashSecondary">({data.req_profileid})</span>
                      <MdVerifiedUser className="absolute top-1.5 left-[135px] text-checkGreen" />
                    </h5>
                  </div> */}

                <div className="relative mb-2">
                  <div className="flex items-center">
                    <h5
                      className="text-[20px] text-secondary font-semibold cursor-pointer flex gap-2 items-center"
                      onClick={() => handleProfileClick(data.req_profileid, sortBy)}
                    >
                      {data.req_profile_name}
                      <span className="text-sm text-ashSecondary">
                        ({data.req_profileid})
                      </span>
                    </h5>
                    {data.req_verified === 1 && (
                      <MdVerifiedUser className="text-[20px] text-checkGreen ml-2" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <IoCalendar className="mr-2 text-primary" />
                    {data.req_profile_age} yrs
                  </p>
                  <p className="text-gray font-semibold">|</p>
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaPersonArrowUpFromLine className="mr-2 text-primary" />
                    {data.req_height} ft
                  </p>
                </div>

                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <MdStars className="mr-2 text-primary" />
                    {data.req_star}
                  </p>
                </div>

                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <IoSchool className="mr-2 text-primary" />
                    {data.req_degree}
                  </p>
                </div>

                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaSuitcase className="mr-2 text-primary" />
                    {data.req_profession}
                  </p>
                </div>

                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaLocationDot className="mr-2 text-primary" />
                    {data.req_city}i
                  </p>
                </div>

                <div className=" flex justify-start items-center gap-3 max-2xl:flex-wrap">
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <MdOutlineGrid3X3 className="mr-2 text-primary" /> {data.req_horoscope}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <FaUser className="mr-2 text-primary" />
                      {data.req_userstatus}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <IoCalendar className="mr-2 text-primary" /> Last visit on{" "}
                      {data.req_lastvisit}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <IoEye className="mr-2 text-primary" /> {data.req_views} views
                    </p>
                  </div>
                </div>

                <div></div>

                <div className="flex space-x-4 mt-4">
                  {/* {!requestHandled && !data.response_message && data.req_status === 2 && ( */}

                  {/* <>
                      <button
                        onClick={() => handleUpdateInterest("2")}
                        className="bg-checkGreen text-white flex items-center rounded-lg px-5 py-3 cursor-pointer"
                      >
                        <FaCheckCircle className="text-[22px] mr-2 text-primary" /> Accept
                      </button>
                     */}

                  {/* {!data.response_message && (
                        <button
                          onClick={() =>
                            handleshowPhotoRequestPopup(data.req_profileid)
                          } // Open decline popup
                          className="bg-white text-main flex items-center rounded-lg border-2 px-5 py-2.5 cursor-pointer"
                        >
                              <IoMdCloseCircle className="text-[26px] mr-2 text-primary" />{" "}
                          Decline
                        </button>
                      )}
                    </>
                  )} */}
                  {/* {data.req_status === 2 && (
                    <button className="text-main font-semibold flex items-center rounded-lg py-5 cursor-pointer">
                      <MdMessage className="text-[26px] mr-2 text-primary" /> Message
                    </button>
                  )} */}

                  {/* {!requestHandled && ( */}

                  {/* // {!requestHandled && !responseMessage && !data.response_message && ( */}
                  {data.req_status !== 2 && data.req_status !== 3 && (
                    <>
                      <button
                        onClick={() => handleUpdateInterest("2")}
                        className="bg-checkGreen text-white flex items-center rounded-lg px-5 py-3 cursor-pointer"
                      >
                        <FaCheckCircle className="text-[22px] mr-2 text" /> Accept
                      </button>
                      {/* {declineButtonVisible && ( */}
                      <button
                        onClick={() =>
                          handleshowPhotoRequestPopup(data.req_profileid)
                        }
                        className="bg-white text-main flex items-center rounded-lg border-2 px-5 py-2.5 cursor-pointer"
                      >
                        <IoMdCloseCircle className="text-[26px] mr-2 text-main" /> Decline
                      </button>
                      {/* )} */}
                    </>
                  )}
                  {/* {showMessageButton && data.req_status === 2  ( */}
                  {data.req_status === 2 && (
                    <button className="text-main font-semibold flex items-center rounded-lg py-5 cursor-pointer"
                      onClick={() => {
                        setSelectedFromProfileId(data.req_profileid); // Set the selected profile ID
                        handleMessage(data.req_profileid); // Pass the ID to the handler
                      }}


                    >
                      <MdMessage className="text-[26px] mr-2 text-main" /> Message
                    </button>
                  )}
                </div>
                <div>
                  <div>
                    {/* {data.response_message && (
                      <div className="text-main font-semibold mt-4">
                        <p>Response Message: {data.response_message}</p>
                      </div>
                    )} */}

                    {/* {responseMessage &&   ( */}
                    {data.req_status === 3 && (
                      <div className="text-main font-semibold mt-4">
                        Response Message: {data.response_message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {data.req_match_score !== undefined &&
              data.req_match_score > 50 && (
                <div className="max-lg:hidden">
                  <MatchingScore scorePercentage={data.req_match_score} />
                </div>
              )}
          </div>
        </div>
        {showPhotoRequestPopup && (
          // <PhotoRequestPopup
          //   closePopup={() => handleshowPhotoRequestPopup()}
          //   profileId={data.req_profileid}
          //   profileTo={loginuser_profileId || ""}
          //   // onDeclineSubmit={handleDeclineSubmit}
          //   onDeclineSubmit={(message) => handleDeclineSubmit(selectedProfileId, message)}

          // />
          <PhotoRequestPopup
            closePopup={() => setshowPhotoRequestPopup(false)}
            profileId={selectedProfileId || ""}
            profileTo={loginuser_profileId || ""}
            onDeclineSubmit={handleDeclineSubmit}
          />
        )}
        <PlatinumModal
          isOpen={isPlatinumModalOpen}
          onClose={() => setIsPlatinumModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default PhotoRequestCard;
