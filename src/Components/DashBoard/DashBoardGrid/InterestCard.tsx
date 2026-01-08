import React, { useEffect, useState } from 'react';
//import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import ReceivedInterestImg from "../../../assets/images/ReceivedInterest.png"
import { ToastNotification, NotifySuccess, NotifyError } from "../../Toast/ToastNotification";
import { toast } from 'react-toastify';
import apiClient from '../../../API';
import { encryptId } from '../../../utils/cryptoUtils';

interface Profile {
    int_profileid: string;
    int_profile_name: string;
    int_Profile_img: string;
    int_profile_age: number;
    int_profile_notes: string;
    int_status: number;
}


type InterestProfilesCardProps = {
    pageNumber: number;
    dataPerPage: number;
};

// const InterestCard: React.FC = () => {
export const InterestCard: React.FC<InterestProfilesCardProps> = ({ pageNumber }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const response = await apiClient.post<{ Status: number, message: string, data: { profiles: Profile[] } }>(
                    '/auth/Get_profile_intrests_list/',
                    {
                        profile_id: loginuser_profileId,
                        page_number: pageNumber,
                    }
                );
                if (response.data.Status === 1) {
                    setProfiles(response.data.data.profiles);
                } else {
                    console.error('Error fetching profiles:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching profiles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [loginuser_profileId, pageNumber]);


    const handleUpdateInterest = async (profileId: string, status: string) => {
        try {
            const response = await apiClient.post(
                '/auth/Update_profile_intrests/',
                {
                    profile_id: loginuser_profileId,
                    profile_from: profileId,
                    status: status
                }
            );
            if (response.data.Status === 1) {

                // Remove the profile from the state if rejected
                if (status === '2') {
                    NotifySuccess('Interest Accepted');
                    setProfiles(profiles.filter(profile => profile.int_profileid !== profileId));
                }
                else if (status === '3') {
                    setProfiles(profiles.filter(profile => profile.int_profileid !== profileId));
                    toast.error('Interest Declined');
                }
                else {
                    console.error('Error updating profile interest:', response.data.message);
                    NotifyError('Error updating profile interest');
                }
            }
        } catch (error) {
            console.error('Error updating profile interest:', error);
            NotifyError('Error updating profile interest');
        }
    };

    // const handleProfileClick = (profileId: string) => {
    //     navigate(`/profiledetails?id=${profileId}&interest=1`,);
    // };
    const handleProfileClick = (profileId: string) => {
        const secureId = encryptId(profileId);
        navigate(`/profiledetails?id=${secureId}&interest=1`, {
            state: {
                from: 'viewedProfiles',
                pageNumber: pageNumber // Pass the current page number
            }
        });
    };

    return (
        <div className="p-4 space-y-4 max-md:flex max-md:gap-5 max-md:p-5 max-md:overflow-scroll">
            {loading ? (
                <p>Loading...</p> // Or any loading indicator you prefer
            ) : profiles.length === 0 ? (


                // Received Interest Empty State
                <div className="text-center py-4">
                    <div className="my-5">
                        <img src={ReceivedInterestImg} alt="Received Interest" className="w-fit mx-auto" />
                    </div>
                    <h4 className="text-lg text-primary font-semibold">Received Interest</h4>
                    <p className="text-md text-vysyamalaBlack">The people who showed interest on you will be listed here.</p>
                </div>

            ) : (
                profiles.map(profile =>
                    profile.int_status === 1 ? (
                        <div
                            key={profile.int_profileid}
                            className="flex justify-between items-center bg-white shadow-sm rounded-xl p-4 mb-4 cursor-pointer max-xl:flex-col max-xl:items-start max-lg:flex-row max-md:flex-col"
                            onClick={() => handleProfileClick(profile.int_profileid)}
                        >
                            <div className="flex justify-center items-center gap-5 max-md:flex-col max-md:items-start">
                                <div className="p-2">
                                    <img
                                        src={profile.int_Profile_img}
                                        alt={profile.int_profile_name}
                                        className="w-24 h-16 object-cover rounded-md "
                                    />
                                </div>

                                <div>
                                    <h5 className="text-[18px] text-primary font-bold">
                                        {profile.int_profile_name} <span className="text-sm text-ashSecondary font-semibold">({profile.int_profileid})</span>
                                    </h5>
                                    <p className="text-sm text-ashSecondary">{profile.int_profile_age} yrs</p>
                                    <p className="text-sm text-ashSecondary">{profile.int_profile_notes}</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <FaCheckCircle
                                        className="text-[60px] text-checkGreen rounded-xl px-3 py-3 m-3 cursor-pointer hover:bg-gray"
                                        onClick={(e) => { e.stopPropagation(); handleUpdateInterest(profile.int_profileid, '2'); }}
                                    />
                                    <IoMdCloseCircle
                                        className="text-[65px] text-closeRed rounded-xl px-3 py-3 m-3 cursor-pointer hover:bg-gray"
                                        onClick={(e) => { e.stopPropagation(); handleUpdateInterest(profile.int_profileid, '3'); }}
                                    />

                                    {/* // Toast Notification */}
                                    <ToastNotification />
                                </div>
                            </div>
                        </div>
                    ) : null
                )
            )}
        </div>
    );
};

export default InterestCard;
