import { useState, useEffect, SetStateAction, Dispatch } from "react";
import axios from "axios";
import { MdVerifiedUser, MdBookmark, MdBookmarkBorder, MdOutlineGrid3X3, MdStars } from "react-icons/md";
import { IoCalendar, IoEye, IoSchool } from "react-icons/io5";
import { FaUser, FaSuitcase } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";
import MatchingScore from "../ProfileDetails/MatchingScore";
import { ProfileNotFound } from "../../LoginHome/MatchingProfiles/ProfileNotFound";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../../API";
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";
import PlatinumModal from "../ReUsePopup/PlatinumModalPopup";

// Define the Profile interface
export interface Profile {
  mutint_Profile_img: string;
  mutint_profile_name: string;
  mutint_profileid: string;
  mutint_profile_age: number;
  horoscope_available: boolean;
  mutint_match_score?: number;
  mutint_star?: string;
  mutint_degree?: string;
  mutint_city?: string;
  mutint_profession?: string;
  mutint_horoscope?: string;
  mutint_userstatus?: string;
  mutint_lastvisit?: string;
  mutint_views?: string;
  mutint_profile_wishlist: number; // Add this field from API
}

interface MutualInterestCardProps {
  setCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalRecords: Dispatch<SetStateAction<number>>;
  setViewCount: Dispatch<SetStateAction<number>>;
  setDataPerPage: Dispatch<SetStateAction<number>>;
  pageNumber: number;
  sortBy: string;
}

export const MutualInterestCard: React.FC<MutualInterestCardProps> = ({
  setDataPerPage,
  setViewCount,
  setCount,
  setTotalRecords,
  pageNumber,
  sortBy,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [updatingBookmarks, setUpdatingBookmarks] = useState<Set<string>>(new Set());
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

  // Helper function to check if profile is bookmarked
  const isBookmarked = (wishListStatus: number): boolean => {
    return wishListStatus === 1;
  };

  const handleBookmarkToggle = async (profileId: string, currentWishListStatus: number) => {
    // Prevent multiple clicks while updating
    if (updatingBookmarks.has(profileId)) return;

    const newStatus = isBookmarked(currentWishListStatus) ? 0 : 1;

    // Optimistically update UI
    setProfiles(prev => prev.map(profile =>
      profile.mutint_profileid === profileId
        ? { ...profile, mutint_profile_wishlist: newStatus }
        : profile
    ));

    setUpdatingBookmarks(prev => new Set(prev.add(profileId)));

    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: newStatus.toString(),
        }
      );

      if (response.data.Status === 1) {
        if (newStatus === 1) {
          toast.success("Profile added to wishlist!");
        } else {
          toast.success("Profile removed from wishlist!");
        }
      } else {
        // Revert on failure
        setProfiles(prev => prev.map(profile =>
          profile.mutint_profileid === profileId
            ? { ...profile, mutint_profile_wishlist: currentWishListStatus }
            : profile
        ));
        toast.error(`Failed to ${newStatus === 1 ? "add to" : "remove from"} wishlist.`);
      }
    } catch (error) {
      // Revert on error
      setProfiles(prev => prev.map(profile =>
        profile.mutint_profileid === profileId
          ? { ...profile, mutint_profile_wishlist: currentWishListStatus }
          : profile
      ));
      toast.error(`An error occurred while ${newStatus === 1 ? "adding to" : "removing from"} wishlist.`);
      console.error("Error updating bookmark:", error);
    } finally {
      setUpdatingBookmarks(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post(
          "/auth/Get_mutual_intrests/",
          {
            profile_id: loginuser_profileId,
            page_number: pageNumber,
            sort_by: sortBy,
          }
        );
        setCount(response.data.mut_int_count);
        setTotalRecords(response.data.data.total_records || 0);
        setDataPerPage(response.data.data.per_page || 0);
        setViewCount(response.data.viewed_count || 0);
        if (response.data.Status === 1) {
          const profilesArray = response.data.data.profiles;
          setProfiles(profilesArray);
        } else {
          setError("No Data Found");
        }
        setLoading(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.message);
        } else {
          setError("Unexpected error occurred");
        }
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [loginuser_profileId, setCount, setTotalRecords, setDataPerPage, setViewCount, pageNumber, sortBy]);

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
      {profiles.length ? (
        profiles.map((profile) => (
          <ProfileCard
            key={profile.mutint_profileid}
            profile={profile}
            isBookmarked={isBookmarked(profile.mutint_profile_wishlist)}
            isUpdating={updatingBookmarks.has(profile.mutint_profileid)}
            onBookmarkToggle={(e) => {
              e.stopPropagation();
              handleBookmarkToggle(profile.mutint_profileid, profile.mutint_profile_wishlist);
            }}
            sortBy={sortBy}
          />
        ))
      ) : (
        <div className="pt-10 pb-[122px] max-md:pt-10 max-md:pb-16">
          <ProfileNotFound />
        </div>
      )}
    </div>
  );
};

interface ProfileCardProps {
  profile: Profile;
  isBookmarked: boolean;
  isUpdating: boolean;
  onBookmarkToggle: (e: React.MouseEvent<SVGElement, MouseEvent>) => void;
  sortBy: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isBookmarked,
  isUpdating,
  onBookmarkToggle,
  sortBy
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);


  const handleProfileClick = async (profileId: string, sortBy: string) => {
    if (isPlatinumModalOpen) return;
    if (activeProfileId) return;
    setActiveProfileId(profileId);
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

      const searchParams = new URLSearchParams(location.search);
      const pageFromUrl = searchParams.get('page');
      const currentPage = pageFromUrl ? parseInt(pageFromUrl) : 1;

      navigate(`/ProfileDetails?id=${secureId}&page=1&sortBy=${sortBy}`, {
        state: {
          from: 'MutualInterest',
          pageNumber: currentPage,
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
      setActiveProfileId(null);
    }
  };

  const gender = localStorage.getItem("gender");
  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

  return (
    <>
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
      <div
        className="flex justify-start items-center space-x-5 relative rounded-xl shadow-profileCardShadow p-5 mb-5"
        onClick={() => handleProfileClick(profile.mutint_profileid, sortBy)}
      >
        {activeProfileId === profile.mutint_profileid && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
            <Hearts height="80" width="80" color="#FF6666" visible={true} />
            <p className="mt-2 text-sm text-primary">Please wait...</p>
          </div>
        )}
        <div className="w-full flex justify-between items-center">
          <div className="flex justify-between items-center space-x-5 max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
            <div className="relative max-sm:w-full">
              <img
                src={profile.mutint_Profile_img || defaultImgUrl}
                alt="Profile image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = defaultImgUrl;
                }}
                className="rounded-[6px] w-[218px] h-[218px] max-md:w-full"
              />
              {isBookmarked ? (
                <MdBookmark
                  onClick={onBookmarkToggle}
                  className={`absolute top-2 right-2 text-white text-[22px] cursor-pointer ${isUpdating ? 'opacity-50' : ''
                    }`}
                />
              ) : (
                <MdBookmarkBorder
                  onClick={onBookmarkToggle}
                  className={`absolute top-2 right-2 text-white text-[22px] cursor-pointer ${isUpdating ? 'opacity-50' : ''
                    }`}
                />
              )}
            </div>

            <div>
              <div className="relative mb-2">
                <div className="flex items-center">
                  <h5 className="text-[20px] text-secondary font-semibold cursor-pointer">
                    {profile.mutint_profile_name || "Unknown"}{" "}
                    <span className="text-sm text-ashSecondary">
                      ({profile.mutint_profileid || "N/A"})
                    </span>
                  </h5>
                  <MdVerifiedUser className="text-[20px] text-checkGreen ml-2" />
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-2">
                <p className="flex items-center text-sm text-primary font-normal">
                  <IoCalendar className="mr-2 text-primary" />
                  {profile.mutint_profile_age || "N/A"} yrs
                </p>
              </div>

              <div className="mb-2">
                <p className="flex items-center text-sm text-primary font-normal">
                  <MdStars className="mr-2 text-primary" />
                  {profile.mutint_star || "N/A"}
                </p>
              </div>
              <div className="mb-2">
                <p className="flex items-center text-sm text-primary font-normal">
                  <IoSchool className="mr-2 text-primary" />
                  {profile.mutint_degree || "N/A"}
                </p>
              </div>
              <div className="mb-2">
                <p className="flex items-center text-sm text-primary font-normal">
                  <FaSuitcase className="mr-2 text-primary" />
                  {profile.mutint_profession || "N/A"}
                </p>
              </div>
              <div className="mb-2">
                <p className="flex items-center text-sm text-primary font-normal">
                  <FaLocationDot className="mr-2 text-primary" />
                  {profile.mutint_city || "N/A"}
                </p>
              </div>

              <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap">
                <div>
                  <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                    <MdOutlineGrid3X3 className="mr-2 text-primary" />{" "}
                    {profile.mutint_horoscope || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                    <FaUser className="mr-2 text-primary" /> {profile.mutint_userstatus}
                  </p>
                </div>
                <div>
                  <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                    <IoCalendar className="mr-2 text-primary" /> Last visit on{" "}
                    {profile.mutint_lastvisit}
                  </p>
                </div>
                <div>
                  <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                    <IoEye className="mr-2 text-primary" /> {profile.mutint_views} views
                  </p>
                </div>
              </div>
            </div>
          </div>
          {profile.mutint_match_score !== undefined &&
            profile.mutint_match_score > 50 && (
              <div className="max-lg:hidden">
                <MatchingScore scorePercentage={profile.mutint_match_score} />
              </div>
            )}
        </div>
      </div>
    </>
  );
};