


import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdVerifiedUser, MdBookmark, MdBookmarkBorder } from "react-icons/md";
//import ProfileListImg from "../../../../assets/images/ProfileListImg.png";
import { ProfileContext, Profile } from "../../../../ProfileContext"; // Adjust the path as needed
// import { Link } from "react-router-dom";
// import { fetchProfiles } from "../../../../commonapicall"; // Import the API function
// import Spinner from "../../../Spinner";
// import { toast } from "react-toastify";
// import { ToastNotification } from "../../../Toast/ToastNotification";
import "react-toastify"
import { IoMdLock } from "react-icons/io";
import apiClient from "../../../../API";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../../utils/cryptoUtils";
import PlatinumModal from "../../../DashBoard/ReUsePopup/PlatinumModalPopup";
// import { toast } from "react-toastify";
// import { ToastNotification } from "../../../Toast/ToastNotification";

interface GridListCardProps {
  profileId: string;
  searchvalues: string;
  profile: Profile;
}

export const GridListCard: React.FC<GridListCardProps> = ({ profile }) => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("MyComponent must be used within a ProfileProvider");
  }

  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const { addBookmark, removeBookmark, setSelectedProfiles } = useContext(
    ProfileContext
  ) || {
    addBookmark: () => { },
    removeBookmark: () => { },
    setSelectedProfiles: () => { },
  };
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);
  const navigate = useNavigate();
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id")

  // useEffect(() => {
  //   if (profile) {
  //     const bookmarkedProfiles = JSON.parse(
  //       localStorage.getItem("bookmarkedProfiles") || "[]"
  //     );
  //     const isBookmarked = bookmarkedProfiles.some(
  //       (item: Profile) => item.profile_id === profile.profile_id
  //     );
  //     setIsBookmarked(isBookmarked);
  //   }
  // }, [profile]);

  useEffect(() => {
    if (profile) {
      // Set the initial bookmark state based on the 'wish_list' property
      // from the API response.
      setIsBookmarked(profile.wish_list === 1);
    }
  }, [profile]); // This dependency array is correct

  const handleBookmark = async (
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) => {
    e.stopPropagation(); // Prevent triggering card click

    if (!profile) return;

    let updatedBookmarks = JSON.parse(
      localStorage.getItem("bookmarkedProfiles") || "[]"
    );

    if (isBookmarked) {
      // Remove bookmark
      updatedBookmarks = updatedBookmarks.filter(
        (item: Profile) => item.profile_id !== profile.profile_id
      );
      removeBookmark(profile.profile_id);
      setSelectedProfiles(updatedBookmarks);
      // toast.success("Bookmarke Removed successfully")
    } else {
      // Add bookmark
      updatedBookmarks.push(profile);
      addBookmark(profile);
      setSelectedProfiles(updatedBookmarks);
      //toast.success("Bookmarke Added successfully")


    }

    localStorage.setItem(
      "bookmarkedProfiles",
      JSON.stringify(updatedBookmarks)
    );
    setIsBookmarked(!isBookmarked);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleCardClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isPlatinumModalOpen) return;
    if (isLoading) return;
    setIsLoading(true);
    e.stopPropagation();

    let page_id = "1"; // Default

    try {
      const checkResponse = await apiClient.post(
        "/auth/Get_profile_det_match/",
        {
          profile_id: loginuser_profileId,
          user_profile_id: profile.profile_id,
          page_id: page_id,
        }
      );

      // Check for failure response
      // if (checkResponse.data.status === "failure") {
      //   toast.error(checkResponse.data.message || "Limit reached to view profile");
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

      // Get current page number from URL
      const secureId = encryptId(profile.profile_id);
      const searchParams = new URLSearchParams(window.location.search);
      const pageFromUrl = searchParams.get('page');
      const currentPage = pageFromUrl ? parseInt(pageFromUrl) : 1;
      const currentSortOrder = sessionStorage.getItem('sortOrder') || '1';

      const searchState = {
        searchProfileId: sessionStorage.getItem('searchProfileId') || '',
        profession: sessionStorage.getItem('profession') || '',
        selectAge: sessionStorage.getItem('selectAge') || '',
        selectedLocation: sessionStorage.getItem('selectedLocation') || '',
        paginationValue: sessionStorage.getItem('paginationValue') || '1',
        currentView: sessionStorage.getItem('currentView') || 'gridlist',
        sortOrder: currentSortOrder,
        searchValue: sessionStorage.getItem('searchvalue') || ''
      };
      // If successful, create profile visit and navigate
      navigate(`/ProfileDetails?id=${secureId}&rasi=1&order_by=${currentSortOrder}`, {
        state: {
          from: ["LoginHome", "SearchProfiles"],
          pageNumber: currentPage,
          searchState: searchState,
          sortOrder: currentSortOrder
        }
      });
    } catch (error: any) {
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
      setIsLoading(false);
    }
  };
  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  const {
    profile_img,
    profile_name,
    profile_id,
    profile_age,
    height,
    degree,
    profession,
    location: profile_location,
    verified,
  } = profile;

  return (
    // <Link to="/ProfileDetails" target="_blank">

    <div
      className="flex justify-start items-center space-x-5 relative rounded-xl shadow-profileCardShadow px-4 py-[18px]  max-sm:w-fit max-sm:mx-auto "
      onClick={handleCardClick}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex flex-col items-center justify-center rounded-xl">
          <Hearts height="80" width="80" color="#FF6666" visible={true} />
          <p className="text-sm mt-2 text-primary">Please wait...</p>
        </div>
      )}

      <div className="flex justify-between gap-x-4 max-sm:flex-col max-sm:w-full max-sm:gap-2">
        {/* {/ Profile Image /} */}
        {/* <div className="relative max-sm:w-full">
            <img
              src={profile_img || ProfileListImg}
              alt="Profile-image"
              className="w-[180px] rounded-[6px] max-sm:w-full max-sm:h-[250px]"
            />
            {isBookmarked ? (
              <MdBookmark
                onClick={handleBookmark}
                className="absolute top-2 right-2 text-secondary text-[22px] cursor-pointer"
              />
            ) : (
              <MdBookmarkBorder
                onClick={handleBookmark}
                className="absolute top-2 right-2 text-secondary text-[22px] cursor-pointer"
              />
            )}
          </div> */}

        {/* <ToastContainer /> */}

        <div className="relative w-[180px] h-full flex-shrink-[0] max-sm:w-full">
          {profile.photo_protection === 1 ? (
            <>
              <img
                src={profile_img || defaultImgUrl}
                alt="Profile-image"
                onError={(e) => {
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = defaultImgUrl; // Set default image
                }}
                className="w-[180px] h-[180px] rounded-[6px] max-sm:w-full max-sm:h-[250px] object-cover object-top"
              />
              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-black bg-opacity-50 rounded-[6px]">
                <IoMdLock className="w-fit mx-auto text-secondary text-[50px]" />
                <p className="text-sm text-white font-semibold">
                  Click and Enter password to view profile photo
                </p>
              </div>
            </>
          ) : (
            <img
              src={profile_img || defaultImgUrl}
              alt="Profile-image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultImgUrl;
              }}
              className="w-[180px] h-[180px] rounded-[6px] max-sm:w-full max-sm:h-[250px] object-cover object-top"
            />
          )}

          {/* Bookmark Icon */}
          {isBookmarked ? (
            <MdBookmark
              onClick={handleBookmark}
              className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
            />
          ) : (
            <MdBookmarkBorder
              onClick={handleBookmark}
              className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
            />
          )}
        </div>

        {/* {/ Profile Details /} */}
        <div className="max-sm:w-full">
          {/* {/ Name & Profile ID /} */}
          <div className="relative mb-2 max-sm:w-full">
            {/* <Link to={`/ProfileDetails?id=${profile_id}&rasi=1`}> */}
            <div className="flex items-center">
              <h5
                onClick={handleCardClick}
                className="text-secondary text-[20px] font-bold cursor-pointer">
                {profile_name || "Unknown"}{" "}

              </h5>
              {verified === 1 && (
                <MdVerifiedUser className="ml-2 text-checkGreen text-[20px]" />
              )}
            </div>
            {/* </Link> */}
          </div>
          <div
            onClick={handleCardClick}
            className="mb-1">
            <p className="text-sm text-primary-400">
              ({profile_id || "N/A"})
            </p>
          </div>

          {/* {/ Years & Height /} */}
          <div className="flex items-center space-x-3 mb-1">
            <p className="flex items-center text-sm text-primary-400">
              {/* <IoCalendar className="mr-2" /> */}
              {profile_age || "N/A"} yrs
            </p>
            <p className="text-gray">|</p>
            <p className="flex items-center text-sm text-primary-400">
              {/* <FaPersonArrowUpFromLine className="mr-2" /> */}
              {height || "N/A"}
            </p>
          </div>

          {/* {/ Degree /} */}
          <div className="mb-1">
            <p className="w-[180px] text-sm text-primary-400 whitespace-nowrap overflow-hidden text-ellipsis ">
              {/* <IoSchool className="mr-2" /> */}
              {degree || "N/A"}
            </p>
          </div>

          {/* {/ Profession /} */}
          <div className="mb-1">
            <p className="flex items-center text-sm text-primary-400">
              {/* <FaSuitcase className="mr-2" /> */}
              {profession || "N/A"}
            </p>
          </div>

          {/* {/ Location /} */}
          <div className="mb-1">
            <p className="flex items-center text-sm text-primary-400">
              {/* <FaLocationDot className="mr-2" /> */}
              {profile_location || "N/A"}
            </p>
          </div>
        </div>
        <PlatinumModal
          isOpen={isPlatinumModalOpen}
          onClose={() => setIsPlatinumModalOpen(false)}
        />
      </div>
      {/* <ToastNotification/> */}
    </div>
    // </Link>
  );
};

