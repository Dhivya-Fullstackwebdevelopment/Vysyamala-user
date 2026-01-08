

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiSolidUserCircle } from "react-icons/bi";
import { FaSuitcase, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { MdFamilyRestroom, MdContacts } from "react-icons/md";
import { PersonalView } from './PersonalView';
import { EducationProfessionView } from './EducationProfessionView';
import { FamilyView } from './FamilyView';
import { HoroscopeView } from './HoroscopeView';
import { ContactView } from './ContactView';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaRegListAlt } from 'react-icons/fa';
import { ProfileDataProvider } from './ViewApicall/ProfileDataProvider';
import { decryptId, encryptId } from '../../../utils/cryptoUtils';


interface ProfileDetailsSettingsViewProps { }

interface ProfileListResponse {
    Status: number;
    message: string;
    all_profile_ids?: Record<string, string>;
    data?: {
        all_profile_ids?: Record<string, string>;
    };
}

export const ProfileDetailsSettingsView: React.FC<ProfileDetailsSettingsViewProps> = () => {
    const [activeSection, setActiveSection] = useState<string>('PersonalView');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const pageid = queryParams.get("page") || "";
    // const currentProfileId = queryParams.get("id") || "";
    const [searchParams] = useSearchParams(); // Add this hook (import from react-router-dom)
    const encryptedId = searchParams.get("id") || "";
    // Decrypt the ID immediately
    const currentProfileId = decryptId(encryptedId);

    const sortBy = queryParams.get("sortBy") || "datetime";
    const orderBy = queryParams.get("order_by") || "1"; // Get order_by from URL

    const renderSection = () => {
        switch (activeSection) {
            case 'PersonalView':
                return <PersonalView />;
            case 'EducationProfessionView':
                return <EducationProfessionView />;
            case 'FamilyView':
                return <FamilyView />;
            case 'HoroscopeView':
                return <HoroscopeView />;
            case 'ContactView':
                return <ContactView />;
            default:
                return <PersonalView />;
        }
    };

    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    const [profileIds, setProfileIds] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [, setLoading] = useState<boolean>(true);
    const [, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileIds = async () => {
            setLoading(true);
            try {
                const apiEndpoints: Record<string, string> = {
                    "1": 'https://app.vysyamala.com/auth/Get_mutual_intrests/',
                    "2": 'https://app.vysyamala.com/auth/Get_profile_wishlist/',
                    "3": 'https://app.vysyamala.com/auth/My_intrests_list/',
                    "4": 'https://app.vysyamala.com/auth/My_viewed_profiles/',
                    "5": 'https://app.vysyamala.com/auth/My_profile_visit/',
                    "6": 'https://app.vysyamala.com/auth/Get_photo_request_list/',
                    // "7": 'https://app.vysyamala.com/auth/Get_Gallery_lists/',
                    // "1": 'http://103.214.132.20:8000/auth/Get_mutual_intrests/',
                    // "2": 'http://103.214.132.20:8000/auth/Get_profile_wishlist/',
                    // "3": 'http://103.214.132.20:8000/auth/My_intrests_list/',
                    // "4": 'http://103.214.132.20:8000/auth/My_viewed_profiles/',
                    // "5": 'http://103.214.132.20:8000/auth/My_profile_visit/',
                    // "6": 'http://103.214.132.20:8000/auth/Get_photo_request_list/',
                };

                const apiEndpoint = apiEndpoints[pageid] || 'https://app.vysyamala.com/auth/Get_prof_list_match/';
                //const apiEndpoint = apiEndpoints[pageid] || 'http://103.214.132.20:8000/auth/Get_prof_list_match/';

                const requestBody: any = {
                    profile_id: loginuser_profileId,
                };


                if (!pageid || pageid === "") {
                    requestBody.order_by = orderBy;
                } else {
                    requestBody.sort_by = sortBy; // Adjust based on your needs
                }

                const response = await axios.post<ProfileListResponse>(apiEndpoint, requestBody);

                let data: {
                    Status?: number;
                    all_profile_ids?: Record<string, string>;
                } | undefined;

                if (["1", "2", "3", "4", "5", "6"].includes(pageid)) {
                    data = response.data.data;
                } else {
                    data = response.data;
                }

                if (data && data.all_profile_ids) {
                    const ids = Object.values(data.all_profile_ids);
                    setProfileIds(ids);

                    // Set current index based on URL id
                    const index = ids.indexOf(currentProfileId.toString()); // Ensure comparison is done with string
                    if (index !== -1) {
                        setCurrentIndex(index);
                    } else if (ids.length > 0) {
                        setCurrentIndex(0); // Start with the first index if there are profiles
                    }
                } else {
                    setError("Failed to fetch profiles.");
                }
            } catch (err) {
                console.error("Error fetching profile IDs:", err);
                setError("Failed to fetch profiles.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileIds();
    }, [loginuser_profileId, pageid, orderBy, sortBy, currentProfileId]);

    // Effect to watch the currentProfileId and re-fetch if changed
    useEffect(() => {
        // Debugging: Log the current profile IDs and index
        //console.log("Profile IDs:", profileIds);
        //console.log("Current Profile ID:", currentProfileId);
        if (profileIds.length > 0) {
            const index = profileIds.indexOf(currentProfileId.toString()); // Ensure comparison is done with string
            //console.log("Current Index:", index); // Log the index
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
    }, [currentProfileId, profileIds]);

    const handlePrevious = () => {
        console.log("outside")
        if (currentIndex > 0) {
            console.log("within")
            const newIndex = currentIndex - 1;
            const rawId = profileIds[newIndex];

            // 1. Encrypt the raw ID from your array
            const secureId = encryptId(rawId);
            setCurrentIndex(newIndex);
            // navigate(`/ProfileDetails?id=${profileIds[newIndex]}&page=${pageid}&sortBy=${sortBy}`);
            const newUrl = pageid
                ? `/ProfileDetails?id=${secureId}&page=${pageid}&sortBy=${sortBy}`
                : `/ProfileDetails?id=${secureId}&rasi=1&order_by=${orderBy}`;
            navigate(newUrl);
            setTimeout(() => {
                window.scrollTo(0, 0);  // Move scroll to the top after navigation
            }, 2000);
        }
    };

    const handleNext = () => {
        if (currentIndex < profileIds.length - 1) {
            const newIndex = currentIndex + 1;
            const rawId = profileIds[newIndex];

            // 1. Encrypt the raw ID from your array
            const secureId = encryptId(rawId);
            //console.log("Navigating to next profile, New Index:", newIndex); // Debugging log
            setCurrentIndex(newIndex);
            // navigate(`/ProfileDetails?id=${profileIds[newIndex]}&page=${pageid}&sortBy=${sortBy}`);
            const newUrl = pageid
                ? `/ProfileDetails?id=${secureId}&page=${pageid}&sortBy=${sortBy}`
                : `/ProfileDetails?id=${secureId}&rasi=1&order_by=${orderBy}`;
            navigate(newUrl);
            setTimeout(() => {
                window.scrollTo(0, 0);  // Move scroll to the top after navigation
            }, 2000);
        }
    };

    return (
        <div className="bg-ash">

            <div className="container mx-auto py-20 max-sm:py-8">
                <ProfileDataProvider>
                    <div className="w-full flex justify-between items-start space-x-5 max-lg:flex-col max-lg:space-x-0 ">
                        <div className="sidebar  max-sm:w-full">
                            <ul className="w-full space-y-10 max-lg:flex max-lg:flex-row  max-lg:flex-wrap max-lg:gap-x-10 max-lg:justify-between max-lg:space-y-0 max-lg:mb-8 max-md:gap-x-0 max-sm:flex-col max-sm:gap-0 max-sm:divide-y-[1px] max-sm:divide-ashBorder max-sm:w-full ">
                                <li className={`flex items-center text-[20px] text-[#ffffff] font-normal opacity-[0.5] cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                ${activeSection === 'PersonalView' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('PersonalView')}>
                                    <BiSolidUserCircle className="text-[22px] mr-2" />
                                    Personal
                                </li>
                                <li className={`flex items-center text-[20px] text-[#ffffff] font-normal opacity-[0.5] cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px]  
                ${activeSection === 'EducationProfessionView' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('EducationProfessionView')}>
                                    <FaSuitcase className="text-[22px] mr-2" />
                                    Education & Profession
                                </li>
                                <li className={`flex items-center text-[20px] text-[#ffffff] font-normal opacity-[0.5] cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                ${activeSection === 'FamilyView' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('FamilyView')}>
                                    <MdFamilyRestroom className="text-[22px] mr-2" />
                                    Family
                                </li>
                                <li className={`flex items-center text-[20px] text-[#ffffff] font-normal opacity-[0.5] cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                ${activeSection === 'HoroscopeView' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('HoroscopeView')}>
                                    <FaRegListAlt className="text-[22px] mr-2" />
                                    Horoscope
                                </li>
                                <li className={`flex items-center text-[20px] text-[#ffffff] font-normal opacity-[0.5] cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                ${activeSection === 'ContactView' ? 'active' : ''}`}
                                    onClick={() => setActiveSection('ContactView')}>
                                    <MdContacts className="text-[22px] mr-2" />
                                    Contact
                                </li>
                            </ul>
                        </div>

                        <div className="w-3/4 bg-white rounded-lg max-lg:w-full">
                            <div className="p-10 max-md:p-8 max-sm:p-4">{renderSection()}</div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-20 max-sm:mt-8">
                        <button onClick={handlePrevious} disabled={currentIndex <= 0} className='bg-ash text-white flex items-center rounded-md border-2 px-5 py-3'>
                            <FaArrowLeft /> Previous
                        </button>
                        <button onClick={handleNext} disabled={currentIndex >= profileIds.length - 1} className='bg-ash text-white flex items-center rounded-md border-2 px-5 py-3'>
                            Next <FaArrowRight />
                        </button>
                    </div>
                </ProfileDataProvider>

            </div>
        </div >
    );
};
