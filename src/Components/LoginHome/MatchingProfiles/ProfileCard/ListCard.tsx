import React, { useState, useContext, useEffect } from "react";
import {
  MdVerifiedUser,
  // MdOutlineGrid3X3,
  MdBookmark,
  MdBookmarkBorder,
  MdStars,
} from "react-icons/md";
import { IoCalendar, IoSchool } from "react-icons/io5";
import {
  FaPersonArrowUpFromLine,
  FaSuitcase,
  FaLocationDot,
  // FaUser,
} from "react-icons/fa6";
//import ProfileListImg from "../../../../assets/images/ProfileListImg.png";
// import MatchingScoreImg from '../../../../assets/images/MatchingScore.png';
import { ProfileContext, Profile } from "../../../../ProfileContext"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";
import MatchingScore from "../../../DashBoard/ProfileDetails/MatchingScore";
import Spinner from "../../../Spinner";
import { IoMdLock } from "react-icons/io";
import apiClient from "../../../../API";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../../utils/cryptoUtils";
import PlatinumModal from "../../../DashBoard/ReUsePopup/PlatinumModalPopup";

interface ListCardProps {
  profile: Profile;
  searchvalues: string;
}

export const ListCard: React.FC<ListCardProps> = ({ profile }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { addBookmark, removeBookmark, setSelectedProfiles } = useContext(
    ProfileContext
  ) || {
    addBookmark: () => { },
    removeBookmark: () => { },
    setSelectedProfiles: () => { },
  };
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);
  // useEffect(() => {
  //   const bookmarkedProfiles = JSON.parse(
  //     localStorage.getItem("bookmarkedProfiles") || "[]"
  //   );
  //   const isBookmarked = bookmarkedProfiles.some(
  //     (item: Profile) => item.profile_id === profile.profile_id
  //   );
  //   setIsBookmarked(isBookmarked);
  // }, [profile.profile_id]);

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
      //toast.success("Bookmarked Removed successfully")
    } else {
      // Add bookmark
      updatedBookmarks.push(profile);
      addBookmark(profile);
      setSelectedProfiles(updatedBookmarks);
      //toast.success("Bookmarked Added successfully")
    }

    localStorage.setItem(
      "bookmarkedProfiles",
      JSON.stringify(updatedBookmarks)
    );
    setIsBookmarked(!isBookmarked);
  };
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  //const location = useLocation();
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

  const handleCardClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isPlatinumModalOpen) return;
    if (isLoading) return;
    setIsLoading(true);
    e.stopPropagation();

    let page_id = "1"; // Default
    // if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
    //   page_id = "1";
    // }

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
          pageNumber: currentPage, // Pass the current page number
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

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);


  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );

  const {
    profile_img,
    profile_name,
    profile_id,
    profile_age,
    height,
    star,
    degree,
    profession,
    location: profile_location,
    matching_score,
    // user_profile_views,
    verified,
  } = profile;

  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  return (
    // <Link to="/ProfileDetails" target="_blank">
    <div
      className="flex justify-between items-start space-x-5 relative rounded-xl shadow-profileCardShadow p-6 mb-5 max-md:w-[400px] max-sm:w-[300px]"
      onClick={handleCardClick}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center bg-white bg-opacity-80 rounded-xl">
          <div className="flex flex-col items-center justify-center">
            <Hearts
              height="80"
              width="80"
              color="#FF6666"
              ariaLabel="hearts-loading"
              visible={true}
            />
            <p className="mt-2 text-sm text-primary">Please wait...</p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center max-md:flex-col">
        <div className="flex justify-between md:items-center space-x-5 max-md:flex-col max-md:w-full">
          {/* <ToastContainer /> */}
          {/* {/ Profile Image /} */}
          <div className="relative max-md:w-full">
            {profile.photo_protection === 1 ? (
              <>
                <img
                  src={profile_img || defaultImgUrl}
                  alt="Profile-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = defaultImgUrl; // Set default image
                  }}
                  className="w-[218px] h-[218px] rounded-[6px] max-md:w-full max-md:h-[280px] opacity-50" // Reduced opacity when locked
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
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = defaultImgUrl; // Set default image
                }}
                className="w-[218px] h-[218px] rounded-[6px]  max-md:w-full max-md:h-[280px] object-cover object-top"
              />
            )}

            {/* Bookmark Icon */}
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
          </div>


          {/* {/ Profile Details /} */}
          <div className="max-md:w-full">
            {/* {/ Name & Profile ID /} */}
            <div className="relative mb-2 max-md:w-full">
              {/* <Link to={`/ProfileDetails?id=${profile_id}&rasi=1`}> */}
              <div className="flex items-center">
                <h5
                  onClick={handleCardClick}
                  className="text-[20px] text-secondary font-semibold cursor-pointer">
                  {profile_name || "Unknown"}{" "}
                  <span
                    onClick={handleCardClick}
                    className="text-sm text-ashSecondary">
                    ({profile_id || "N/A"})
                  </span>
                </h5>
                {verified === 1 && (
                  <MdVerifiedUser className="ml-2 text-checkGreen text-[20px]" />
                )}
              </div>
              {/* </Link> */}
            </div>

            {/* {/ Years & Height /} */}
            <div className="flex items-center space-x-3 mb-[6px]">
              <p className="flex items-center text-sm text-ashSecondary font-normal">
                <IoCalendar className="mr-2" />
                {profile_age || "N/A"} yrs
              </p>

              <p className="text-gray font-semibold">|</p>

              <p className="flex items-center text-sm text-ashSecondary font-normal">
                <FaPersonArrowUpFromLine className="mr-2" />
                {height || "N/A"}
              </p>
            </div>

            {/* {/ Uthiram /} */}
            <div className="mb-[6px]">
              <p className="flex items-center text-sm text-ashSecondary font-normal">
                <MdStars className="mr-2" />
                {star}
              </p>
            </div>

            {/* {/ Degree /} */}
            <div className="mb-[6px]">
              <p className="flex items-center text-sm text-ashSecondary font-normal">
                <IoSchool className="mr-2" />
                {degree || "N/A"}
              </p>
            </div>

            {/* {/ Profession /} */}
            <div className="mb-[6px]">
              <p className="flex items-center text-sm text-ashSecondary font-normal">
                <FaSuitcase className="mr-2" />
                {profession || "N/A"}
              </p>
            </div>

            {/* {/ Location /} */}
            <div className="mb-[6px]">
              <p className="flex items-center text-sm text-ashSecondary font-normal">
                <FaLocationDot className="mr-2" />
                {profile_location || "N/A"}
              </p>
            </div>


          </div>
        </div>

        {matching_score !== undefined &&
          Number(matching_score) > 50 && (
            <div className="sm:hidden md:block">
              <MatchingScore scorePercentage={matching_score} />
            </div>
          )}
        <PlatinumModal
          isOpen={isPlatinumModalOpen}
          onClose={() => setIsPlatinumModalOpen(false)}
        />
      </div>
    </div>
    // </Link>
  );
};


