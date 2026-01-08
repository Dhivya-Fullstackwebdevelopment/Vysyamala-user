import React, { useState, useEffect } from "react";
//import axios from "axios";
//import ProfileListImg from "../../../assets/images/./ProfileListImg.png";
import { MdVerifiedUser } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
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
import apiClient from "../../../API";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";

// Define the interface for the profile data
interface ProfileData {
    vys_profileid: string;
    vys_profile_name: string;
    vys_Profile_img: string;
    vys_profile_age: number;
    vys_verified: number;
    vys_height: number;
    vys_star: string;
    vys_profession: string;
    vys_degree: string;
    vys_match_score: number;
    vys_views: number
    vys_lastvisit: string;
    vys_userstatus: string;
    vys_horoscope: string;
    vys_profile_wishlist: number
    // score: number; // Define the score prop
}

// Define the interface for the entire API response
interface ApiResponse {
    Status: number;
    message: string;
    data: {
        profiles: ProfileData[];
        page: number;
        per_page: number;
        total_pages: number;
        total_records: number;
        all_profile_ids: { [key: string]: string };
    };
    vysassist_count: number;
}

interface VysassistCardProps {
    pageNumber: number;
    sortBy: string;
}

export const VysAssistCard: React.FC<VysassistCardProps> = ({ pageNumber, sortBy }) => {
    // const [isBookmarked, setIsBookmarked] = useState<{ [key: string]: boolean }>({}); // Track bookmarks for each profile
    const [updatingBookmarks, setUpdatingBookmarks] = useState<Set<string>>(new Set());
    const [profiles, setProfiles] = useState<ProfileData[]>([]); // Store all profiles
    const [noVysassistFound, setNoVysassistFound] = useState(false); // Track if no vysassist is found
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    const navigate = useNavigate();
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const location = useLocation();
    const gender = localStorage.getItem("gender");
    const defaultImgUrl =
        gender?.toLowerCase() === "male"
            ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
            : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";
    const isBookmarked = (wishListStatus: number): boolean => {
        return wishListStatus === 1;
    };

    // const handleBookmark = (profileId: string) => {
    //     setIsBookmarked(prevState => ({
    //         ...prevState,
    //         [profileId]: !prevState[profileId]
    //     }));
    // };

    const handleBookmarkToggle = async (profileId: string, currentWishListStatus: number) => {
        // Prevent multiple clicks while updating
        if (updatingBookmarks.has(profileId)) return;

        const newStatus = isBookmarked(currentWishListStatus) ? 0 : 1;

        // Optimistically update UI
        setProfiles(prev => prev.map(profile =>
            profile.vys_profileid === profileId
                ? { ...profile, vys_profile_wishlist: newStatus }
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
                    profile.vys_profileid === profileId
                        ? { ...profile, vys_profile_wishlist: currentWishListStatus }
                        : profile
                ));
                toast.error(`Failed to ${newStatus === 1 ? "add to" : "remove from"} wishlist.`);
            }
        } catch (error) {
            // Revert on error
            setProfiles(prev => prev.map(profile =>
                profile.vys_profileid === profileId
                    ? { ...profile, vys_profile_wishlist: currentWishListStatus }
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

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post<ApiResponse>("/auth/My_vysassist_list/", {
                profile_id: loginuser_profileId, // Pass the profile ID in the payload
                page_number: pageNumber,
                sort_by: sortBy,
            });
            if (response.data.Status === 1 && response.data.data.profiles.length > 0) {
                setProfiles(response.data.data.profiles); // Store all profile data
            } else {
                setNoVysassistFound(true); // Set the flag to true if no profiles found
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false); // 👈 always stop loading here
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [pageNumber, sortBy, loginuser_profileId]);

    const handleProfileClick = async (profileId: string) => {
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

            if (checkResponse.data.status === "failure") {
                toast.error(checkResponse.data.message || "Limit reached to view profile");
                setActiveProfileId(null);
                return;
            }
            // Navigate after validation
            navigate(`/ProfileDetails?id=${secureId}&rasi=1&sortBy=${sortBy}`, {
                state: {
                    from: 'VysAssit',
                    pageNumber: pageNumber, // Pass the current page number
                    sortBy: sortBy
                }
            });
        } catch (error) {
            toast.error("Error accessing profile.");
            console.error("API Error:", error);
        } finally {
            setActiveProfileId(null); // reset loading
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
        <div className="space-y-5 rounded-xl shadow-profileCardShadow p-5 mb-5">

            {noVysassistFound ? (
                <div>No Vysassist found for the given profile ID</div>
            ) : (
                profiles.map(profile => (
                    <div key={profile.vys_profileid} className="flex justify-start items-center space-x-5 relative rounded-xl py-5">
                        {activeProfileId === profile.vys_profileid && (
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
                                        src={profile.vys_Profile_img || defaultImgUrl}
                                        alt="Profile-image"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null; // Prevent infinite loop
                                            e.currentTarget.src = defaultImgUrl; // Set default image
                                        }}
                                        onClick={() => handleProfileClick(profile.vys_profileid)}
                                        className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full"
                                    />
                                    {/* {isBookmarked[profile.vys_profileid] ? ( */}

                                    {isBookmarked(profile.vys_profile_wishlist) ? (
                                        <MdBookmark
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookmarkToggle(profile.vys_profileid, profile.vys_profile_wishlist);
                                            }}
                                            className={`absolute top-2 right-2 text-white text-[22px] cursor-pointer ${updatingBookmarks.has(profile.vys_profileid) ? 'opacity-50' : ''
                                                }`}
                                        />
                                    ) : (
                                        <MdBookmarkBorder
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookmarkToggle(profile.vys_profileid, profile.vys_profile_wishlist);
                                            }}
                                            className={`absolute top-2 right-2 text-white text-[22px] cursor-pointer ${updatingBookmarks.has(profile.vys_profileid) ? 'opacity-50' : ''
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Profile Details */}
                                <div>
                                    {/* Name & Profile ID */}
                                    <div className="relative mb-2">
                                        <h5
                                            onClick={() => handleProfileClick(profile.vys_profileid)}
                                            className="flex gap-1    text-[20px] text-secondary font-semibold cursor-pointer">
                                            {profile.vys_profile_name}{" "}
                                            <span className="text-sm text-ashSecondary">
                                                ({profile.vys_profileid})
                                            </span>
                                            <MdVerifiedUser
                                                className={` ${profile.vys_verified ? "text-checkGreen" : ""
                                                    }`}
                                            />
                                        </h5>
                                    </div>

                                    {/* Years & Height */}
                                    <div className="flex items-center space-x-3 mb-2">
                                        <p className="flex items-center text-sm text-primary font-normal">
                                            <IoCalendar className="mr-2 text-primary" />
                                            {profile.vys_profile_age} yrs
                                        </p>
                                        <p className="text-gray font-semibold">|</p>
                                        <p className="flex items-center text-sm text-primary font-normal">
                                            <FaPersonArrowUpFromLine className="mr-2 text-primary" />
                                            {profile.vys_height}
                                        </p>
                                    </div>

                                    {/* Other Profile Information */}
                                    <div className="mb-2">
                                        <p className="flex items-center text-sm text-primary font-normal">
                                            <MdStars className="mr-2 text-primary" />
                                            {profile.vys_star}
                                        </p>
                                    </div>

                                    <div className="mb-2">
                                        <p className="flex items-center text-sm text-primary font-normal">
                                            <IoSchool className="mr-2 text-primary" />
                                            {profile.vys_degree}
                                        </p>
                                    </div>

                                    <div className="mb-2">
                                        <p className="flex items-center text-sm text-primary font-normal">
                                            <FaSuitcase className="mr-2 text-primary" />
                                            {profile.vys_profession}
                                        </p>
                                    </div>

                                    <div className="mb-2">
                                        <p className="flex items-center text-sm text-primary font-normal">
                                            <FaLocationDot className="mr-2 text-primary" />
                                            N/A
                                        </p>
                                    </div>

                                    <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap">
                                        <div>
                                            <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                <MdOutlineGrid3X3 className="mr-2 text-primary" />   {profile.vys_horoscope}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                <FaUser className="mr-2 text-primary" />{profile.vys_userstatus}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                <IoCalendar className="mr-2 text-primary" /> Last visit on{profile.vys_lastvisit}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                <IoEye className="mr-2 text-primary" /> {profile.vys_views}views
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Matching Score */}
                            {profile.vys_match_score !== undefined &&
                                profile.vys_match_score > 50 && profile.vys_match_score !== 100 && (
                                    <div className="max-lg:hidden">
                                        <div>
                                            <MatchingScore scorePercentage={profile.vys_match_score} />
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                ))
            )}


        </div>
    );
};
