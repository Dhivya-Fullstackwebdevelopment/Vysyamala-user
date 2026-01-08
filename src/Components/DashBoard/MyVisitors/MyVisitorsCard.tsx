import { useState, useEffect } from "react";
//import axios from "axios";
//import ProfileListImg from "../../../assets/images/ProfileListImg.png";
import {
  MdVerifiedUser,
  MdBookmark,
  MdBookmarkBorder,
  MdOutlineGrid3X3,
  MdStars,
} from "react-icons/md";
import { IoCalendar, IoSchool } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import MatchingScore from "../ProfileDetails/MatchingScore";
import {
  FaLocationDot,
  FaPersonArrowUpFromLine,
  FaSuitcase,
} from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileNotFound } from "../../LoginHome/MatchingProfiles/ProfileNotFound";
import apiClient from "../../../API";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";
import PlatinumModal from "../ReUsePopup/PlatinumModalPopup";

// Define the profile and API response types
interface Profile {
  viwed_profileid: string;
  viwed_profile_name: string;
  viwed_Profile_img: string;
  viwed_profile_age: number;
  viwed_verified: number;
  viwed_height: number;
  viwed_star: string;
  viwed_profession: string;
  viwed_city: string;
  viwed_degree: string;
  viwed_match_score?: number;
  viwed_views: number;
  viwed_lastvisit: string;
  viwed_userstatus: string;
  viwed_horoscope: string;
  viwed_profile_wishlist?: number;
}

interface ApiResponse {
  Status: number;
  message: string;
  data: {
    profiles: Profile[];
  };
}

type VisitorsProfilesCardProps = {
  pageNumber: number;
  dataPerPage: number;
  sortBy: string;
};

export const MyVisitorsCard: React.FC<VisitorsProfilesCardProps> = ({ pageNumber, sortBy }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]); // Store multiple profiles
  // const [isBookmarked, setIsBookmarked] = useState<{ [key: string]: boolean }>({});
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<string[]>([]);
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const navigate = useNavigate();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);
  // Function to handle the bookmark toggle
  // const handleBookmark = (profileId: string) => {
  //   setIsBookmarked((prev) => ({
  //     ...prev,
  //     [profileId]: !prev[profileId],
  //   }));
  // };

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
        // sessionStorage.setItem(
        //   "bookmarkedProfiles",
        //   JSON.stringify([...bookmarkedProfiles, profileId])
        // );ss
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
        // sessionStorage.setItem("bookmarkedProfiles", JSON.stringify(updatedBookmarks));
      } else {
        toast.error("Failed to remove from wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while removing from wishlist.");
    }
  };

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post<ApiResponse>(
          "/auth/My_profile_visit/",
          {
            profile_id: loginuser_profileId,
            page_number: pageNumber,
            sort_by: sortBy,
          }
        );

        // Check if response is successful and contains profiles
        if (response.data.Status === 1 && response.data.data.profiles.length > 0) {
          // setProfiles(response.data.data.profiles); // Store all profiles
          const fetchedProfiles = response.data.data.profiles;
          setProfiles(fetchedProfiles); // Set the full profile data

          // const initialBookmarks: { [key: string]: boolean } = {};
          // fetchedProfiles.forEach(profile => {
          //   initialBookmarks[profile.viwed_profileid] = profile.viwed_profile_wishlist === 1;
          // });
          // setBookmarkedProfiles(initialBookmarks);
          const bookmarkedIds = fetchedProfiles
            .filter(profile => profile.viwed_profile_wishlist === 1)
            .map(profile => profile.viwed_profileid);

          setBookmarkedProfiles(bookmarkedIds);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
      finally {
        setLoading(false); // 👈 always stop loading here
      }
    };
    fetchProfileData();
  }, [loginuser_profileId, pageNumber, sortBy]);

  // const handleProfileClick = (profileId: string) => {
  //   navigate(`/ProfileDetails?id=${profileId}&page=5`);
  // };

  const handleProfileClick = async (profileId: string) => {
    if (isPlatinumModalOpen) return; if (isPlatinumModalOpen) return;
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
      navigate(`/ProfileDetails?id=${secureId}&page=5&sortBy=${sortBy}`, {
        state: {
          from: 'myVisitors',
          pageNumber: pageNumber,
          sortBy: sortBy
        }
      });
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

  if (profiles.length === 0) {
    return (
      <div className="py-20">
        <ProfileNotFound />
      </div>
    );
  }

  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

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
      {profiles.map((profile) => (
        <div
          key={profile.viwed_profileid}
          className="border-b-[1px] border-footer-text-gray mb-4"
        >
          {activeProfileId === profile.viwed_profileid && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
              <Hearts height="80" width="80" color="#FF6666" visible={true} />
              <p className="mt-2 text-sm text-primary">Please wait...</p>
            </div>
          )}
          <div className="flex justify-start items-center space-x-5 relative rounded-xl shadow-sm py-5">
            <div className="w-full flex justify-between items-center">
              <div className="flex justify-between items-start space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
                {/* Profile Image */}
                <div className="relative  max-sm:w-full">
                  <img
                    src={profile.viwed_Profile_img || defaultImgUrl}
                    alt="Profile-image"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = defaultImgUrl; // Set default image
                    }}
                    className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full"
                  />

                  {/* {bookmarkedProfiles[profile.viwed_profileid] ? (
                    <MdBookmark
                      onClick={() => handleBookmark(profile.viwed_profileid)}
                      className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                    />
                  ) : (
                    <MdBookmarkBorder
                      onClick={() => handleBookmark(profile.viwed_profileid)}
                      className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                    />
                  )} */}
                  {bookmarkedProfiles.includes(profile.viwed_profileid) ? (
                    <MdBookmark
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkToggle(profile.viwed_profileid);
                      }}
                      className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                    />
                  ) : (
                    <MdBookmarkBorder
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkToggle(profile.viwed_profileid);
                      }}
                      className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                    />
                  )}
                </div>

                {/* Profile Details */}
                <div>
                  {/* Name & Profile ID */}
                  <div className="relative mb-2">
                    <h5
                      className="text-[20px] text-secondary font-semibold flex items-center gap-2 cursor-pointer"
                      onClick={() => handleProfileClick(profile.viwed_profileid)}
                    >
                      {profile.viwed_profile_name}
                      <span className="text-sm text-ashSecondary">
                        ({profile.viwed_profileid})
                      </span>
                      {profile.viwed_verified === 1 && (
                        <MdVerifiedUser className=" text-checkGreen" />
                      )}
                    </h5>
                  </div>

                  {/* Years & Height */}
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="flex items-center text-sm text-primary font-normal">
                      <IoCalendar className="mr-2 text-primary" />
                      {profile.viwed_profile_age} yrs
                    </p>
                    <p className="text-gray font-semibold">|</p>
                    <p className="flex items-center text-sm text-primary font-normal">
                      <FaPersonArrowUpFromLine className="mr-2 text-primary" />
                      {profile.viwed_height}
                    </p>
                  </div>

                  {/* Star */}
                  <div className="mb-2">
                    <p className="flex items-center text-sm text-primary font-normal">
                      <MdStars className="mr-2 text-primary" />
                      {profile.viwed_star}
                    </p>
                  </div>

                  {/* Degree */}
                  <div className="mb-2">
                    <p className="flex items-center text-sm text-primary font-normal">
                      <IoSchool className="mr-2 text-primary" />
                      {profile.viwed_degree}
                    </p>
                  </div>

                  {/* Profession */}
                  <div className="mb-2">
                    <p className="flex items-center text-sm text-primary font-normal">
                      <FaSuitcase className="mr-2 text-primary" />
                      {profile.viwed_profession}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="mb-2">
                    <p className="flex items-center text-sm text-primary font-normal">
                      <FaLocationDot className="mr-2 text-primary" />
                      {profile.viwed_city}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap">
                    <div>
                      <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                        <MdOutlineGrid3X3 className="mr-2 text-primary" />{" "}
                        {profile.viwed_horoscope}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                        <FaUser className="mr-2 text-primary" />
                        {profile.viwed_userstatus}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                        <IoCalendar className="mr-2 text-primary" /> Last visit on{" "}
                        {profile.viwed_lastvisit}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                        <IoEye className="mr-2 text-primary" /> {profile.viwed_views} views
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching Score */}
              {profile.viwed_match_score !== undefined &&
                profile.viwed_match_score > 50 && profile.viwed_match_score !== 100 && (
                  <div className="max-lg:hidden">
                    <MatchingScore scorePercentage={profile.viwed_match_score} />
                  </div>
                )}
            </div>
          </div>
        </div>
      ))}
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
    </div>
  );
};
