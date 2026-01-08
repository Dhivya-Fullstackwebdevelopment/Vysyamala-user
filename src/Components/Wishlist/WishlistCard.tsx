import React, { useContext, useEffect, useState } from "react";
//import axios from "axios";
//import ProfileListImg from "../../assets/images/ProfileListImg.png";
import { MdBookmark, MdBookmarkBorder, MdVerifiedUser } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
import { MdStars } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { FaSuitcase } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineGrid3X3 } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { IoEye } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import MatchingScore from "../DashBoard/ProfileDetails/MatchingScore";
import { ProfileContext } from "../../ProfileContext";
import { WhishlistNotFound } from "./WhishlistNotFound";
import apiClient from "../../API";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../utils/cryptoUtils";
import PlatinumModal from "../DashBoard/ReUsePopup/PlatinumModalPopup";

// Define the shape of your wishlist profile
interface WishlistProfile {
  height: string;
  degree: string;
  profession: string;
  location: string;
  wishlist_profileid: string;
  wishlist_profile_name: string;
  wishlist_Profile_img: string;
  wishlist_profile_age: number;
  wishlist_verified?: number;
  wishlist_match_score?: number;
  wishlist_height: number;
  wishlist_star: string;
  wishlist_profession: string;
  wishlist_degree: string;
  wishlist_city: string;
  wishlist_views: number;
  wishlist_lastvisit: string;
  wishlist_userstatus: string;
  wishlist_horoscope: string;
  wishlist_profile: number;
}
interface WishlistCardProps {
  page: number;
  perPage: number;
  sortBy: string;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ page, sortBy }) => {
  const navigate = useNavigate();
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("MyComponent must be used within a ProfileProvider");
  }
  const { setTotalPage, setTotalRecords, setWhistListPerpage } = context;
  const [wishlistProfiles, setWishlistProfiles] = useState<WishlistProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<string[]>([]);
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);

  const fetchWishlistProfiles = async (profileId: string) => {
    setIsLoading(true); // Start loading
    try {
      const response = await apiClient.post(
        "/auth/Get_profile_wishlist/",
        {
          profile_id: profileId,
          page_number: page,
          sort_by: sortBy || "",
          // Include the profile_id in the request body
        }
      );

      if (response.data.Status === 1) {
        setTotalRecords(response.data.data.total_records);
        setTotalPage(response.data.data.total_pages);
        setWhistListPerpage(response.data.data.per_page
        )
        console.log(response.data.data, "lllllllllllll");
        // Assuming you have a state to store the profiles
        const fetchedProfiles = response.data.data.profiles;
        setWishlistProfiles(fetchedProfiles);

        const bookmarkedIds = fetchedProfiles
          .filter((profile: { wishlist_profile: number; }) => profile.wishlist_profile === 1)
          .map((profile: { wishlist_profileid: any; }) => profile.wishlist_profileid);

        // Set the bookmarked state
        setBookmarkedProfiles(bookmarkedIds);
        // Scroll to the top of the window
        window.scrollTo({
          top: 0,
          behavior: "smooth", // Optional: Adds smooth scrolling effect
        });

      } else {
        console.error(
          "Failed to fetch wishlist profiles:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching wishlist profiles:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, sortBy]);

  useEffect(() => {
    // Retrieve profile_id from sessionStorage
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    if (loginuser_profileId) {
      fetchWishlistProfiles(loginuser_profileId);
    } else {
      console.error("Profile ID not found in sessionStorage.");
    }
  }, [page, sortBy]);

  // const handleProfileClick = (profileId: string) => {
  //   navigate(`/ProfileDetails?id=${profileId}&page=2`);
  // };
  // const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const handleProfileClick = async (profileId: string) => {
    if (isPlatinumModalOpen) return;
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
      // navigate(`/ProfileDetails?id=${profileId}&rasi=1`);
      // navigate(`/ProfileDetails?id=${profileId}&page=2&from=wishlist`);
      navigate(`/ProfileDetails?id=${secureId}&page=2&sortBy=${sortBy}`, {
        state: {
          from: 'Wishlist',
          pageNumber: page,
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

  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

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
        // );
        if (loginuser_profileId) {
          await fetchWishlistProfiles(loginuser_profileId);
        }
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
        if (loginuser_profileId) {
          await fetchWishlistProfiles(loginuser_profileId);
        }
        // sessionStorage.setItem("bookmarkedProfiles", JSON.stringify(updatedBookmarks));
      } else {
        toast.error("Failed to remove from wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while removing from wishlist.");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Hearts
              height="100"
              width="100"
              color="#FF6666"
              ariaLabel="hearts-loading"
              visible={true}
            />
            <p className="text-sm">Loading your wishlist, please wait...</p>
          </div>
        ) : wishlistProfiles.length === 0 ? (
          <div className="py-20">
            <WhishlistNotFound />
          </div>
        ) : (
          <div>
            {wishlistProfiles.map((profile) => (
              <div
                key={profile.wishlist_profileid}
                className="flex justify-start items-center space-x-5 relative rounded-xl shadow-profileCardShadow px-3 py-3 mb-5"
              >
                {activeProfileId === profile.wishlist_profileid && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
                    <Hearts height="80" width="80" color="#FF6666" visible={true} />
                    <p className="mt-2 text-sm text-primary">Please wait...</p>
                  </div>
                )}
                <div className="w-full flex justify-between items-center">
                  <div className="flex justify-between items-center space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
                    {/* Profile Image */}
                    <div className="relative max-sm:w-full">
                      <img
                        src={profile.wishlist_Profile_img || defaultImgUrl}
                        alt="Profile-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.src = defaultImgUrl; // Set default image
                        }}
                        className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full"
                      />
                      {bookmarkedProfiles.includes(profile.wishlist_profileid) ? (
                        <MdBookmark
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkToggle(profile.wishlist_profileid);
                          }}
                          className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                        />
                      ) : (
                        <MdBookmarkBorder
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkToggle(profile.wishlist_profileid);
                          }}
                          className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                        />
                      )}
                      {/* No Bookmark icon functionality here */}
                    </div>

                    {/* Profile Details */}
                    <div className="">
                      {/* Name & Profile ID */}

                      <div className="relative mb-2">
                        <div className="flex items-center">
                          <h5
                            onClick={() =>
                              handleProfileClick(profile.wishlist_profileid)
                            }
                            className="text-[20px] text-secondary font-semibold cursor-pointer"
                          >
                            {profile.wishlist_profile_name}
                            <span className="text-sm text-ashSecondary">
                              ({profile.wishlist_profileid})
                            </span>
                          </h5>
                          {profile.wishlist_verified === 1 && (
                            <MdVerifiedUser className=" text-[20px] text-checkGreen ml-2" />
                          )}
                        </div>
                      </div>

                      {/* Years & Height */}
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="flex items-center text-sm text-primary font-normal">
                          <IoCalendar className="mr-2 text-primary" />
                          {profile.wishlist_profile_age} yrs
                        </p>

                        <p className="text-gray font-semibold">|</p>

                        <p className="flex items-center text-sm text-primary font-normal">
                          <FaPersonArrowUpFromLine className="mr-2 text-primary" />
                          {profile.wishlist_height}
                        </p>
                      </div>

                      {/* Uthiram */}
                      <div className="mb-2">
                        <p className="flex items-center text-sm text-primary font-normal">
                          <MdStars className="mr-2 text-primary" />
                          {profile.wishlist_star}
                        </p>
                      </div>

                      {/* Bachelors */}
                      <div className="mb-2">
                        <p className="flex items-center text-sm text-primary font-normal">
                          <IoSchool className="mr-2 text-primary" />
                          {profile.wishlist_degree}
                        </p>
                      </div>

                      {/* Employed */}
                      <div className="mb-2">
                        <p className="flex items-center text-sm text-primary font-normal">
                          <FaSuitcase className="mr-2 text-primary" />
                          {profile.wishlist_profession}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="mb-2 ">
                        <p className="flex items-center text-sm text-primary font-normal ">
                          <FaLocationDot className="mr-2 text-primary" />
                          {profile.wishlist_city}
                        </p>
                      </div>

                      <div className=" flex justify-start items-center gap-3 max-2xl:flex-wrap">
                        {/* Horoscope Available */}
                        <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <MdOutlineGrid3X3 className="mr-2 text-primary" />  {profile.wishlist_horoscope}
                          </p>
                        </div>

                        {/*  Active User */}
                        <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <FaUser className="mr-2 text-primary" />  {profile.wishlist_userstatus}
                          </p>
                        </div>

                        {/* Last Visit */}
                        <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <IoCalendar className="mr-2 text-primary" />Bookmarked on  {profile.wishlist_lastvisit}
                          </p>
                        </div>

                        {/* views */}
                        <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <IoEye className="mr-2 text-primary" /> {profile.wishlist_views} views
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matching Score */}
                  {profile.wishlist_match_score !== undefined &&
                    profile.wishlist_match_score > 50 && profile.wishlist_match_score !== 100 && (
                      <div className="max-lg:hidden">
                        <div>
                          {/* <img
                    src={MatchingScoreImg}
                    alt="Matching Score"
                    className="w-full"
                  /> */}
                          <MatchingScore scorePercentage={profile.wishlist_match_score} />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
    </div>
  );
};
