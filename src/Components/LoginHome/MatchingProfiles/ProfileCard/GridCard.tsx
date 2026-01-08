import React, { useState, useContext, useEffect } from "react";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
import { MdBookmark, MdBookmarkBorder, MdVerifiedUser } from "react-icons/md";
import { ProfileContext, Profile } from "../../../../ProfileContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../Spinner";
import { IoMdLock } from "react-icons/io";
import apiClient from "../../../../API";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../../utils/cryptoUtils";
import PlatinumModal from "../../../DashBoard/ReUsePopup/PlatinumModalPopup";

// import { toast } from "react-toastify";


interface GridCardProps {
  profile: Profile; // Use Profile type here
  searchvalues: string;
}

export const GridCard: React.FC<GridCardProps> = ({ profile }) => {
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
      // toast.success("Bookmarke Removed successfully")
    } else {
      // Add bookmark
      updatedBookmarks.push(profile);
      addBookmark(profile);
      setSelectedProfiles(updatedBookmarks);
      // toast.success("Bookmarke Added successfully")
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


  // Updated handleCardClick in GridCard component
  const handleCardClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isPlatinumModalOpen) return;
    if (isLoading) return;
    setIsLoading(true);
    e.stopPropagation();

    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

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
  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );

  return (
    <div
      onClick={handleCardClick}
      className="relative sm:w-fit md:w-11/12 rounded-xl shadow-profileCardShadow px-3 py-3 mx-auto"
    >
      {/* <div className="mb-3">
        <img
          src={profile.profile_img}
          alt={profile.profile_name}
          className="w-full rounded-[6px] mx-auto"
        />
      </div> */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
          <Hearts height="80" width="80" color="#FF6666" visible={true} />
          <p className="mt-2 text-sm text-primary">Please wait...</p>
        </div>
      )}

      <div className="mb-3">
        {/* <ToastContainer /> */}
        {profile.photo_protection === 1 ? (
          <div className="relative">
            <img
              src={profile.profile_img || defaultImgUrl}
              alt={profile.profile_name}
              onError={(e) => {
                e.currentTarget.onerror = null; // Prevent infinite loop
                e.currentTarget.src = defaultImgUrl; // Set default image
              }}
              className="w-[321px] h-[321px] rounded-[6px] mx-auto opacity-50" // Reduced opacity to indicate locked state
            />
            <div className="absolute top-0 left-0 w-full h-full rounded-[6px] flex items-center justify-center bg-black bg-opacity-40">
              <div className="text-center lock-style text-white">
                <IoMdLock className="w-fit mx-auto text-secondary text-[50px]" />
                <p className="text-sm font-semibold">
                  Click and enter password to view profile photo
                </p>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={profile.profile_img || defaultImgUrl}
            alt={profile.profile_name}
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop
              e.currentTarget.src = defaultImgUrl; // Set default image
            }}
            className="w-[320px] h-[280px] rounded-[6px] mx-auto object-cover object-top"
          />
        )}
      </div>

      <div>
        {/* <Link to={`/ProfileDetails?id=${profile.profile_id}&rasi=1`}> */}
        <div className="flex">
          <h4
            onClick={handleCardClick}
            className="text-secondary text-[20px] font-semibold cursor-pointer mb-1">
            {profile.profile_name}{" "}
            <span
              onClick={handleCardClick}
              className="text-sm text-ashSecondary font-semibold">
              ({profile.profile_id})
            </span>
          </h4>
          {profile.verified === 1 && (
            <MdVerifiedUser className="ml-2 mt-2 text-checkGreen text-[20px]" />
          )}
        </div>
        {/* </Link> */}

        <div className="flex justify-between items-center">
          <p className="text-primary flex items-center">
            <IoCalendar className="mr-2" /> {profile.profile_age} yrs
          </p>
          <p className="text-primary flex items-center">
            <FaPersonArrowUpFromLine className="mr-2" /> {profile.height}
          </p>
        </div>
      </div>

      {isBookmarked ? (
        <MdBookmark
          onClick={handleBookmark}
          className="absolute top-4 right-4 text-secondary text-[22px] cursor-pointer"
        />
      ) : (
        <MdBookmarkBorder
          onClick={handleBookmark}
          className="absolute top-4 right-4 text-secondary text-[22px] cursor-pointer"
        />
      )}
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
    </div>
  );
};

