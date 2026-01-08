import { useState, useEffect } from "react";
import axios from "axios";
//import ProfileListImg from "../../../assets/images/ProfileListImg.png";
// import MatchingScoreImg from "../../../assets/images/MatchingScore.png";
import { MdVerifiedUser, MdStars, MdOutlineGrid3X3, MdBookmark, MdBookmarkBorder, } from "react-icons/md";
import { IoCalendar, IoSchool, IoEye } from "react-icons/io5";
import { FaPersonArrowUpFromLine, FaSuitcase, FaLocationDot, FaUser } from "react-icons/fa6";
import MatchingScore from "../ProfileDetails/MatchingScore";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../../API";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";

interface GetProfListMatch {
  profile_id: string;
  profile_name: string;
  age: number;
  star: string;
  height: string;
  weight: string;
  degree: string;
  profession: string;
  location: string;
  profile_image: string;
  wish_list: number | string;
  notes_details: string;
  notes_datetime: string;
  notes_match_score?: number;
  notes_horoscope: string;
  notes_userstatus: string;
  notes_lastvisit: string,
  notes_views?: number,
}

interface PersonalNotesCardProps {
  pageNumber: number;
  sortBy: string;
}

export const PersonalNotesCard: React.FC<PersonalNotesCardProps> = ({ pageNumber, sortBy }) => {
  // const [isBookmarked, setIsBookmarked] = useState(false);
  const [profilesData, setProfilesData] = useState<GetProfListMatch[]>([]); // Updated to an array for multiple profiles
  const [statusMessage] = useState<string>(""); // State variable for the status message
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const navigate = useNavigate();
  const gender = localStorage.getItem("gender");
  const [loading, setLoading] = useState<boolean>(true);
  // const [bookmarkedProfiles, setBookmarkedProfiles] = useState<string[]>(() => {
  //   const savedBookmarks = sessionStorage.getItem("bookmarkedProfiles");
  //   return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  // });
  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post("/auth/Get_personal_notes/", {
          profile_id: loginuser_profileId,
          page_number: pageNumber,
          sort_by: sortBy,
        });
        //console.log(response.data);

        const profiles = response.data.data.profiles;

        const transformedProfiles: GetProfListMatch[] = profiles.map((profile: any) => ({
          profile_id: profile.notes_profileid,
          profile_name: profile.notes_profile_name,
          age: profile.notes_profile_age,
          star: profile.notes_star,
          height: profile.notes_height, // Add height if available
          weight: "N/A", // Add weight if available
          degree: profile.notes_degree, // Add degree if available
          profession: profile.notes_profession, // Add profession if available
          location: profile.notes_city, // Add location if available
          profile_image: profile.notes_Profile_img || defaultImgUrl,
          wish_list: profile.notes_profile_wishlist,
          notes_details: profile.notes_details,
          notes_datetime: profile.notes_datetime,
          notes_match_score: profile.notes_match_score, // Match score if available
          notes_horoscope: profile.notes_horoscope,
          notes_userstatus: profile.notes_userstatus,
          notes_lastvisit: profile.notes_lastvisit,
          notes_views: profile.notes_views,
        }));

        setProfilesData(transformedProfiles);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      } finally {
        setLoading(false); // 👈 always stop loading here
      }
    };

    fetchProfileData();
  }, [pageNumber, sortBy]);


  // const handleBookmark = () => {
  //   setIsBookmarked(!isBookmarked);
  // };

  const handleBookmarkToggle = async (profileId: string, currentWishListStatus: number | string) => {
    const newStatus = (currentWishListStatus === 1 || currentWishListStatus === "1") ? "0" : "1";

    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: newStatus,
        }
      );

      if (response.data.Status === 1) {
        // Update the local state to reflect the change
        setProfilesData(prevProfiles =>
          prevProfiles.map(profile =>
            profile.profile_id === profileId
              ? { ...profile, wish_list: newStatus === "1" ? 1 : 0 }
              : profile
          )
        );

        // Show appropriate toast message
        if (newStatus === "1") {
          toast.success("Profile added to wishlist!");
        } else {
          toast.success("Profile removed from wishlist.");
        }
      } else {
        toast.error(`Failed to ${newStatus === "1" ? "add to" : "remove from"} wishlist.`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${newStatus === "1" ? "adding to" : "removing from"} wishlist.`);
      console.error("Error toggling bookmark:", error);
    }
  };

  // const handleProfileClick = (profileId: string) => {
  //   navigate(`/ProfileDetails?id=${profileId}`);
  // };

  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const handleProfileClick = async (profileId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    const secureId = encryptId(profileId);
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    let page_id = "2"; // Default
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

      // Check for failure response
      if (checkResponse.data.status === "failure") {
        toast.error(checkResponse.data.message || "Limit reached to view profile");
        return;
      }

      // If successful, create profile visit and navigate
      // If successful, navigate with pageNumber in state
      navigate(`/ProfileDetails?id=${secureId}&rasi=1&sortBy=${sortBy}`, {
        state: {
          from: 'PersonalNotes',
          pageNumber: pageNumber,
          sortBy: sortBy
        }
      });

      await apiClient.post(
        "/auth/Create_profile_visit/",
        {
          profile_id: loginuser_profileId,
          viewed_profile: profileId,
        }
      );
    } catch (error) {
      toast.error("Error accessing profile.");
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <Hearts height="80" width="80" color="#FF6666" visible={true} />
        <p className="mt-2 text-sm text-primary">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      {profilesData.length > 0 ? (
        profilesData.map((profileData) => (
          <div key={profileData.profile_id} className="space-y-5 rounded-xl shadow-profileCardShadow p-5 mb-5">
            <div className="flex justify-start items-start space-x-5 relative">
              <div className="w-full flex justify-between items-center">
                <div className="flex justify-between items-center space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
                  {/* Profile Image */}
                  <div className="relative  max-sm:w-full">
                    <img src={profileData.profile_image || defaultImgUrl} alt="Profile"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // Prevent infinite loop
                        e.currentTarget.src = defaultImgUrl; // Set default image
                      }}
                      className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full" />
                    {profileData.wish_list === 1 || profileData.wish_list === "1" ? (
                      <MdBookmark
                        onClick={() => handleBookmarkToggle(profileData.profile_id, profileData.wish_list)}
                        className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                      />
                    ) : (
                      <MdBookmarkBorder
                        onClick={() => handleBookmarkToggle(profileData.profile_id, profileData.wish_list)}
                        className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                      />
                    )}
                  </div>

                  {/* Profile Details */}
                  <div className="">
                    {/* Name & Profile ID */}
                    <div className="relative mb-2">
                      <h5 className="text-[20px] text-secondary font-semibold cursor-pointer"
                        onClick={() => handleProfileClick(profileData.profile_id)}
                      >
                        {profileData.profile_name}
                        <span className="text-sm text-ashSecondary ml-2">
                          ({profileData.profile_id})
                        </span>
                        <MdVerifiedUser className="inline-block ml-2 text-checkGreen" />
                      </h5>
                    </div>

                    {/* Age & Height */}
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="flex items-center text-sm text-primary font-normal">
                        <IoCalendar className="mr-2 text-primary" />
                        {profileData.age} yrs
                      </p>
                      <p className="text-gray font-semibold">|</p>
                      <p className="flex items-center text-sm text-primary font-normal">
                        <FaPersonArrowUpFromLine className="mr-2 text-primary" />
                        {profileData.height} ft
                      </p>
                    </div>

                    {/* Other Details */}
                    <div className="mb-2">
                      <p className="flex items-center text-sm text-primary font-normal">
                        <MdStars className="mr-2 text-primary" />
                        {profileData.star}
                      </p>
                    </div>

                    <div className="mb-2">
                      <p className="flex items-center text-sm text-primary font-normal">
                        <IoSchool className="mr-2 text-primary" />
                        {profileData.degree}
                      </p>
                    </div>

                    <div className="mb-2">
                      <p className="flex items-center text-sm text-primary font-normal">
                        <FaSuitcase className="mr-2 text-primary" />
                        {profileData.profession}
                      </p>
                    </div>

                    <div className="mb-2">
                      <p className="flex items-center text-sm text-primary font-normal">
                        <FaLocationDot className="mr-2 text-primary" />
                        {profileData.location}
                      </p>
                    </div>

                    {/* Additional Info */}
                    <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap">
                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                          <MdOutlineGrid3X3 className="mr-2 text-primary" />   {profileData.notes_horoscope}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                          <FaUser className="mr-2 text-primary" />  {profileData.notes_userstatus}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                          <IoCalendar className="mr-2 text-primary" /> Last visit on {profileData.notes_lastvisit}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                          <IoEye className="mr-2 text-primary" />{profileData.notes_views} views
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matching Score */}
                {profileData.notes_match_score !== undefined &&
                  profileData.notes_match_score > 50 && profileData.notes_match_score !== 100 && (
                    <div className="max-lg:hidden">
                      <div>
                        <MatchingScore scorePercentage={profileData.notes_match_score} />
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[#D9D9D966] rounded-xl p-5 space-y-1">
              <h5 className="text-primary font-semibold">
                {profileData.notes_details ?? "N/A"}
              </h5>
              <p className="text-sm text-primary">
                Last updated on {profileData.notes_datetime
                  ? profileData.notes_datetime.split('T')[0]
                  : "N/A"}
              </p>
              {statusMessage && <p className="mt-2 text-sm">{statusMessage}</p>}
            </div>
          </div>
        ))
      ) : (
        <p>No profile data...</p>
      )}
    </div>
  );
};