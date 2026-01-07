import { useState, useEffect } from "react";
//import axios from "axios";
//import ProfileListImg from "../../../assets/images/ProfileListImg.png";
import { MdVerifiedUser } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { MdStars } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { FaSuitcase } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineGrid3X3 } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { IoEye } from "react-icons/io5";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
// import MatchingScoreImg from "../../../assets/images/MatchingScore.png";
import MatchingScore from "../ProfileDetails/MatchingScore";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for react-toastify
import apiClient from "../../../API";
import { Hearts } from "react-loader-spinner";
//import PlatinumModal from "../ReUsePopup/PlatinumModalPopup";
// Define types for API response
interface Profile {
  visited_profileid: string;
  visited_profile_name: string;
  visited_Profile_img: string;
  visited_profile_age: number;
  visited_verified: number;
  visited_height: number;
  visited_star: string;
  visited_profession: string;
  visited_city: string;
  visited_degree: string;
  visited_match_score: number;
  visited_views: number;
  visited_lastvisit: string;
  visited_userstatus: string;
  visited_horoscope: string;
  visited_profile_wishlist: number;
  visited_datetime: string;
}

interface ApiResponse {
  Status: number;
  message: string;
  data: {
    profiles: Profile[];
  };
}

type ViewedProfilesCardProps = {
  pageNumber: number;
  dataPerPage: number;
  sortBy: string;
};

export const ViewedProfilesCard: React.FC<ViewedProfilesCardProps> = ({ pageNumber, sortBy }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<string[]>(() => {
    const savedBookmarks = sessionStorage.getItem("bookmarkedProfiles");
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const navigate = useNavigate();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true); // 👈 add local loading
  //const [showPlatinumModal, setShowPlatinumModal] = useState(false);

  useEffect(() => {
    // Fetch the data from the API
    setLoading(true); // start loading before API
    apiClient
      .post<ApiResponse>(
        "/auth/My_viewed_profiles/",
        {
          profile_id: loginuser_profileId, // Send profile_id in the request body
          page_number: pageNumber,
          sort_by: sortBy || "",
        }
      )
      .then((response) => {
        if (response.data.Status === 1) {
          const fetchedProfiles = response.data.data.profiles;
          setProfiles(fetchedProfiles); // Set the full profile data

          // --- START: New logic to set bookmark state ---
          // Get all profile IDs that are bookmarked (wishlist = 1)
          const bookmarkedIds = fetchedProfiles
            .filter(profile => profile.visited_profile_wishlist === 1)
            .map(profile => profile.visited_profileid);

          // Update the bookmarkedProfiles state
          setBookmarkedProfiles(bookmarkedIds);

          // Also update sessionStorage to keep it in sync
          //  localStorage.setItem("bookmarkedProfiles", JSON.stringify(bookmarkedIds));
          // --- END: New logic ---

        }
      })
      .catch((error) => {
        console.error("Error fetching profiles:", error);
      }).finally(() => {
        setLoading(false); // stop loading after API call
      });;
  }, [loginuser_profileId, pageNumber, sortBy]); // Include profile_id in the dependency array if it can change

  const handleBookmarkToggle = async (profileId: string) => {
    if (bookmarkedProfiles.includes(profileId)) {
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
        ////console.log("Profile added to wishlist!");
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
        toast.success("Profile removed from wishlist.");
        ////console.log("Profile removed from wishlist.");
        const updatedBookmarks = bookmarkedProfiles.filter((id) => id !== profileId);
        setBookmarkedProfiles(updatedBookmarks);
        sessionStorage.setItem("bookmarkedProfiles", JSON.stringify(updatedBookmarks));
      } else {
        toast.error("Failed to remove from wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while removing from wishlist.");
    }
  };
  // const handleProfileClick = (profileId: string) => {
  //   navigate(`/ProfileDetails?id=${profileId}&page=4`);
  // };


  const handleProfileClick = async (profileId: string) => {
    if (activeProfileId) return;
    setActiveProfileId(profileId); // set the card that's loading

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

      if (checkResponse.data.status === "failure") {
        toast.error(checkResponse.data.message || "Limit reached to view profile");
        setActiveProfileId(null);
        return;
      }

      // Navigate after validation
      //navigate(`/ProfileDetails?id=${profileId}&rasi=1`);
      // navigate(`/ProfileDetails?id=${profileId}&page=4&from=viewedProfiles`);
      navigate(`/Profiledetails?id=${profileId}&page=4&sortBy=${sortBy}`, {
        state: {
          from: 'viewedProfiles',
          pageNumber: pageNumber, // Pass the current page number
          sortBy: sortBy
        }
      });
      // navigate(`/ProfileDetails?id=${profileId}&page=4`);
    } catch (error) {
      toast.error("Error accessing profile.");
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

  //console.log(profiles, "profilesssssss");
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <Hearts height="80" width="80" color="#FF6666" visible={true} />
        <p className="mt-2 text-sm text-primary">Loading profiles...</p>
      </div>
    );
  }


  return (
    <div className="">
      <ToastContainer />
      {/* <PlatinumModal
        isOpen={showPlatinumModal}
        onClose={() => setShowPlatinumModal(false)}
      /> */}
      {profiles.map((profile) => (
        <div
          key={profile.visited_profileid}
          className="flex justify-start items-center space-x-5 relative  py-5  border-b-[1px] border-ashSecondary rounded-none"
        >
          {activeProfileId === profile.visited_profileid && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
              <Hearts height="80" width="80" color="#FF6666" visible={true} />
              <p className="mt-2 text-sm text-primary">Please wait...</p>
            </div>
          )}
          <div className="w-full flex justify-between items-center">
            <div className="flex justify-between items-start space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
              {/* Profile Image */}
              <div className="relative  max-sm:w-full cursor-pointer" onClick={() => handleProfileClick(profile.visited_profileid)}>
                <img
                  src={profile.visited_Profile_img || defaultImgUrl}
                  alt="Profile-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = defaultImgUrl; // Set default image
                  }}
                  className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full"
                />

                {bookmarkedProfiles.includes(profile.visited_profileid) ? (
                  <MdBookmark
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(profile.visited_profileid);
                    }}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                ) : (
                  <MdBookmarkBorder
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(profile.visited_profileid);
                    }}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                )}
              </div>

              {/* Profile Details */}
              <div className="">
                {/* Name & Profile ID */}
                <div className="relative mb-2">
                  <div className="flex items-center">
                    <h5
                      className="text-[20px] text-secondary font-semibold cursor-pointer"
                      onClick={() =>
                        handleProfileClick(profile.visited_profileid)
                      }
                    >
                      {profile.visited_profile_name}
                      <span className="text-sm text-ashSecondary">
                        ({profile.visited_profileid})
                      </span>
                    </h5>
                    {profile.visited_verified === 1 && (
                      <MdVerifiedUser className="text-[20px] text-checkGreen ml-2" />
                    )}
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center space-x-3 mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <IoCalendar className="mr-2 text-primary" />
                    {profile.visited_profile_age} yrs
                  </p>
                </div>

                {/* Other Details */}
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <MdStars className="mr-2 text-primary" />
                    {profile.visited_star}
                  </p>
                </div>
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <IoSchool className="mr-2 text-primary" />
                    {profile.visited_degree}
                  </p>
                </div>
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaSuitcase className="mr-2 text-primary" />
                    {profile.visited_profession}
                  </p>
                </div>
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaLocationDot className="mr-2 text-primary" />
                    {profile.visited_city}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap">
                  <div
                    // onClick={(e) => {
                    //   e.stopPropagation(); // Prevents triggering handleProfileClick
                    //   setShowPlatinumModal(true);
                    // }}
                  >
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <IoCalendar className="mr-2 text-primary" /> Last viewed on {profile.visited_datetime}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <MdOutlineGrid3X3 className="mr-2 text-primary" /> {profile.visited_horoscope}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <FaUser className="mr-2 text-primary" /> {profile.visited_userstatus}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <IoEye className="mr-2 text-primary" /> {profile.visited_views} views
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Matching Score */}
            {profile.visited_match_score !== undefined &&
              profile.visited_match_score > 50 && profile.visited_match_score !== 100 && (
                <div>
                  <div className="max-lg:hidden">
                    {/* <img
                                    src={MatchingScoreImg}
                                    alt="Matching Score"
                                    className="w-full"
                                /> */}
                    <MatchingScore scorePercentage={profile.visited_match_score} />
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};
