import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdVerifiedUser } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine, FaSuitcase, FaLocationDot } from "react-icons/fa6";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { Hearts } from "react-loader-spinner";
import { LoginPopupModal } from "../HomePage/PopUpsLogin/LoginPopupModal";

// Define the interface for a profile
interface Profile {
    profile_id: string;
    profile_name: string;
    profile_img: string;
    profile_age: number;
    profile_gender: string;
    height: string;
    degree: string;
    profession: string;
    location: string;
}

// Define the API response interface
interface ApiResponse {
    Status: number;
    message: string;
    profiles: Profile[];
}

const defaultImgUrl = "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

const API_URL = "https://app.vysyamala.com/auth/Get_featured_profiles/";
//const API_URL = "http://103.214.132.20:8000/auth/Get_featured_profiles/";

export const FeaturedGroomCard: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true); // ← New loading state
    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            try {
                const response = await axios.post<ApiResponse>(API_URL, { gender: "male" });
                if (response.data.Status === 1) {
                    setProfiles(response.data.profiles);
                    console.log('featuredgroom', response.data.profiles)
                } else {
                    console.error("Failed to fetch profiles");
                }
            } catch (error) {
                console.error("Error fetching profiles:", error);
            } finally {
                setLoading(false); // ← Stop loading in both success/fail
            }
        };

        fetchProfiles();
    }, []);


    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

    const handleLoginClick = () => {
        setIsLoginPopupOpen(true);
    };

    const handleCloseLoginPopup = () => {
        setIsLoginPopupOpen(false);
        ////console.log("Closing Login PopupModal popup"); // Debug log
    };


    return (
        <div className="container mx-auto mt-28 mb-10  max-md:mt-20 max-md:mb-8">
            <h2 className="text-3xl font-bold mb-6 max-lg:text-xl max-lg:mb-3">Featured Grooms</h2>
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Hearts
                        height="100"
                        width="100"
                        color="#FF6666"
                        ariaLabel="hearts-loading"
                        visible={true}
                    />
                    <p className="text-sm text-gray-500 mt-2">Please wait...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-5 2xl:grid-cols-3 max-lg:grid-cols-1 max-md:grid-cols-1">
                    {profiles.map((profile) => (
                        <div key={profile.profile_id} onClick={handleLoginClick} className="space-y-5 rounded-xl shadow-md p-5 mb-5 cursor-pointer">
                            <div className="flex justify-start items-center space-x-5 relative">
                                <div className="w-full flex justify-between items-center">
                                    <div className="flex justify-between items-center space-x-5 max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
                                        {/* Profile Image */}
                                        <div className="relative max-sm:w-full">
                                            <img
                                                src={profile.profile_img || defaultImgUrl}
                                                alt={`${profile.profile_name}-image`}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null; // Prevent infinite loop
                                                    e.currentTarget.src = defaultImgUrl; // Set default image
                                                }}
                                                className="rounded-[6px] w-[218px] h-[218px]  max-md:w-full object-cover object-top aspect-square"
                                            />
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

                                        {/* Profile Details */}
                                        <div>
                                            <div className="relative mb-2">
                                                <div className="flex items-center flex-wrap">

                                                    <h5 className="text-[20px] text-secondary font-semibold cursor-pointer">
                                                        {profile.profile_name}{" "}
                                                        <span className="text-sm text-ashSecondary">({profile.profile_id})</span>
                                                    </h5>
                                                    <MdVerifiedUser className="text-[20px] text-checkGreen ml-2" />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 mb-2">
                                                <p className="flex items-center text-sm text-primary font-normal">
                                                    <IoCalendar className="mr-2" />
                                                    {profile.profile_age} yrs
                                                </p>
                                                <p className="text-gray font-semibold">|</p>
                                                <p className="flex items-center text-sm text-primary font-normal">
                                                    <FaPersonArrowUpFromLine className="mr-2" />
                                                    {profile.height} cms
                                                </p>
                                            </div>

                                            <div className="mb-2">
                                                <p className="flex items-center text-sm text-primary font-normal">
                                                    <IoSchool className="mr-2" />
                                                    {profile.degree || "N/A"}
                                                </p>
                                            </div>

                                            <div className="mb-2">
                                                <p className="flex items-center text-sm text-primary font-normal">
                                                    <FaSuitcase className="mr-2" />
                                                    {profile.profession || "N/A"}
                                                </p>
                                            </div>

                                            <div className="mb-2">
                                                <p className="flex items-center text-sm text-primary font-normal">
                                                    <FaLocationDot className="mr-2" />
                                                    {profile.location}
                                                </p>
                                            </div>


                                            {/* <div className=" flex justify-start items-center gap-3 max-2xl:flex-wrap ">
                                                <div>
                                                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                        <MdOutlineGrid3X3 className="mr-2" /> Horoscope Available
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                        <FaUser className="mr-2" /> Active user
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                        <IoCalendar className="mr-2" /> Last visit on June 30, 2024
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                                                        <IoEye className="mr-2" /> 31 views
                                                    </p>
                                                </div>
                                            </div> */}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isLoginPopupOpen && (
                <LoginPopupModal
                    onClose={handleCloseLoginPopup}
                    onForgetPassword={function (): void {
                        throw new Error("Function not implemented.");
                    }} isopen={false} />
            )}
        </div>
    );
};
