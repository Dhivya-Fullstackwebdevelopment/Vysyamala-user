import React, { useContext, useEffect, useState } from "react";
//import axios from "axios";
// import ProfileListImg from "../../assets/images/ProfileListImg.png";
import { MdVerifiedUser } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
import { MdStars } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { FaSuitcase } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
// import { MdOutlineGrid3X3 } from "react-icons/md";
// import { FaUser } from "react-icons/fa6";
// import { IoEye } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import MatchingScore from "../DashBoard/ProfileDetails/MatchingScore";
import Pagination from "../../Components/Pagination"; // Add your pagination component
import { ProfileContext } from "../../ProfileContext";
import apiClient from "../../API";
import { Hearts } from "react-loader-spinner";
import { toast } from "react-toastify";
import { encryptId } from "../../utils/cryptoUtils";
import PlatinumModal from "../DashBoard/ReUsePopup/PlatinumModalPopup";
// Define the shape of your profile data
interface Profile {
  profile_id: string;
  profile_name: string;
  profile_age: number;
  profile_img: string;
  profile_height: string;
  degree: string;
  star: string;
  profession: string;
  location: string;
  matching_score: number;
}

export const ViewAllFeaturedProfiles: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(ProfileContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const gender = localStorage.getItem("gender");
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

  if (!context) {
    throw new Error("ViewAllFeaturedProfiles must be used within a ProfileProvider");
  }

  const { setTotalPage, setTotalRecords, totalPage, TotalRecords } = context;
  console.log("TotalRecords", TotalRecords)

  // State to hold the profiles data
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const getInitialPage = () => {
    const searchParams = new URLSearchParams(location.search);
    const pageFromUrl = searchParams.get("page");
    return pageFromUrl ? parseInt(pageFromUrl) : 1;
  };

  const [page, setPage] = useState<number>(getInitialPage());
  const perPage = 10;
  // Fetch data from API
  const fetchProfiles = async (profileId: string, page: number) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        "/auth/Get_Featured_List/",
        {
          profile_id: profileId,
          // from_age: 20,
          // to_age: 40,
          // from_height: 100,
          // to_height: 200,
          per_page: perPage,
          page_number: page,
        }
      );

      if (response.data.status === "success") {
        setProfiles(response.data.data);
        setTotalRecords(response.data.total_count);
        setTotalPage(Math.ceil(response.data.total_count / perPage));
      } else {
        console.error("Failed to fetch profiles:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", page.toString());

    navigate(`?${searchParams.toString()}`, { replace: true });
  }, [page, location.search, navigate]);


  useEffect(() => {
    // Retrieve profile_id from sessionStorage
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    if (loginuser_profileId) {
      fetchProfiles(loginuser_profileId, page);
    } else {
      console.error("Profile ID not found in sessionStorage.");
    }
  }, [page]); // Re-fetch profiles when page changes

  const handleProfileClick = async (profileId: string) => {
    if (activeProfileId) return;
    if (isPlatinumModalOpen) return;
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
      navigate(`/ProfileDetails?id=${secureId}&rasi=1`);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="container mx-auto my-20 max-md:my-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-700 mb-2">
          Featured Profiles
          <span className="text-lg text-gray-400 ml-1">({TotalRecords})</span>
        </h1>

      </div>
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Hearts
              height="100"
              width="100"
              color="#FF6666"
              ariaLabel="hearts-loading"
              visible={true}
            />
            <p className="text-sm mt-4">Please wait...</p>
          </div>
        ) : profiles.length === 0 ? (
          <p>No Featured profiles available.</p>
        ) : (
          <div>
            {profiles.map((profile) => (
              <div
                key={profile.profile_id}
                className="flex justify-start items-center space-x-5 relative rounded-xl shadow-profileCardShadow py-5"
              >
                {activeProfileId === profile.profile_id && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
                    <Hearts height="80" width="80" color="#FF6666" visible={true} />
                    <p className="mt-2 text-sm text-primary">Please wait...</p>
                  </div>
                )}
                <div className="w-full flex justify-between items-center">
                  <div className="flex justify-between items-center space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
                    {/* Profile Image */}
                    <div className="relative  max-sm:w-full">
                      <img
                        src={profile.profile_img || defaultImgUrl}
                        alt="Profile-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.src = defaultImgUrl; // Set default image
                        }}
                        // className="rounded-[6px] w-full h-full max-2xl:w-[300px] max-lg:w-[400px] max-md:w-full"
                        className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full"
                      />
                    </div>

                    {/* Profile Details */}
                    <div className="">
                      {/* Name & Profile ID */}
                      <div className="relative mb-2">
                        <h5
                          onClick={() => handleProfileClick(profile.profile_id)}
                          className="text-[20px] text-secondary font-semibold cursor-pointer flex items-center gap-2"
                        >
                          {profile.profile_name || "Unknown"}{" "}
                          <span className="text-sm text-ashSecondary">
                            ({profile.profile_id || "N/A"})
                          </span>
                          <MdVerifiedUser className="left-[135px] text-checkGreen" />
                        </h5>
                      </div>

                      {/* Age & Height */}
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="flex items-center text-ashSecondary font-semibold">
                          <IoCalendar className="mr-2" />
                          {profile.profile_age || "N/A"} yrs
                        </p>

                        <p className="text-gray font-semibold">|</p>

                        <p className="flex items-center text-ashSecondary font-semibold">
                          <FaPersonArrowUpFromLine className="mr-2" />
                          {profile.profile_height || "N/A"} cm
                        </p>
                      </div>

                      {/* Star */}
                      <div className="mb-2">
                        <p className="flex items-center text-ashSecondary font-semibold">
                          <MdStars className="mr-2" />
                          {profile.star || "N/A"}
                        </p>
                      </div>

                      {/* Degree */}
                      <div className="mb-2">
                        <p className="flex items-center text-ashSecondary font-semibold">
                          <IoSchool className="mr-2" />
                          {profile.degree || "N/A"}
                        </p>
                      </div>

                      {/* Profession */}
                      <div className="mb-2">
                        <p className="flex items-center text-ashSecondary font-semibold">
                          <FaSuitcase className="mr-2" />
                          {profile.profession || "N/A"}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="mb-2">
                        <p className="flex items-center text-ashSecondary font-semibold">
                          <FaLocationDot className="mr-2" />
                          {profile.location || "N/A"}
                        </p>
                      </div>

                      {/* <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap max-md:hidden"> */}
                      {/* Horoscope Available */}
                      {/* <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <MdOutlineGrid3X3 className="mr-2" /> Horoscope
                            Available
                          </p>
                        </div> */}

                      {/* Active User */}
                      {/* <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <FaUser className="mr-2" /> Active user
                          </p>
                        </div> */}

                      {/* Last Visit */}
                      {/* <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <IoCalendar className="mr-2" /> Last visit on June
                            30, 2024
                          </p>
                        </div> */}

                      {/* Views */}
                      {/* <div>
                          <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                            <IoEye className="mr-2" /> 31 views
                          </p>
                        </div> */}
                      {/* </div> */}
                    </div>
                  </div>

                  {/* Matching Score */}
                  {profile.matching_score !== undefined &&
                    profile.matching_score > 50 && profile.matching_score !== 100 && (
                      <div className="max-lg:hidden">
                        <MatchingScore scorePercentage={profile.matching_score} />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Component */}
      <Pagination
        pageNumber={page}
        setPageNumber={setPage}
        totalRecords={TotalRecords}
        dataPerPage={perPage}
        toptalPages={totalPage}
      />
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
    </div>
  );
};
