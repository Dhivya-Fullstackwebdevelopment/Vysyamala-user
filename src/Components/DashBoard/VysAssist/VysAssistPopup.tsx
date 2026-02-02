
import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
//import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../../API';
import { decryptId } from '../../../utils/cryptoUtils';
// import { Hearts } from 'react-loader-spinner';

interface VysAssistPopupProps {
    profileData: any; // Replace 'any' with the appropriate type
    closePopup: () => void;
}

export const VysAssistPopup: React.FC<VysAssistPopupProps> = ({ closePopup, profileData }) => {
    const [notes, setNotes] = useState<string>('');
    const [, setVysassistEnable] = useState(0)
    // console.log(VysassistEnable)
    const [, setVysassits] = useState()
    // console.log(vysassits)
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [, setData] = useState<any>()
    // console.log(data)
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get('id');
    const [searchParams] = useSearchParams();
    const encryptedId = searchParams.get("id") || "";
    const id = decryptId(encryptedId);
    const navigate = useNavigate()
    const formattedMessage = `We have shared the horoscope to ${loginuser_profileId}`;
    const [, setLoading] = useState(false);

    const VysassistEnable = profileData?.basic_details?.vysy_assist_enable || 0;
    const vysassits = profileData?.basic_details?.vys_assits || false;
    const data = profileData?.basic_details?.vys_list || null;


    const options = [
        formattedMessage,
        "We got ok from our Astrologer",
        "We are satisfied with the basic details",
        "We are yet to see the Astrologer",
        "We want to know the family background details",
        "No response from the opposite side"
    ];

    let page_id = "2"; // Default
    if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
        page_id = "1";
    }

    const getProfileDetMatch = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('profile_id', loginuser_profileId as string);
            formData.append('user_profile_id', id as string);
            formData.append('page_id', page_id as string);

            const response = await apiClient.post('/auth/Get_profile_det_match/', formData, {
                headers: { 'Content-Type': "multipart/form-data" },
            });

            console.log(response.data.basic_details, "Vysassist popup");
            setVysassistEnable(response.data.basic_details.vysy_assist_enable);
            setVysassits(response.data.basic_details.vys_assits)
            setData(response.data.basic_details.vys_list)
        } catch (error) {
            console.error("Error fetching profile details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfileDetMatch();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selectedOptions.length === 0) {
            toast.error("Please select at least one option");
            return;
        }
        try {
            const response = await apiClient.post('/auth/Send_vysassist_request/', {
                profile_id: loginuser_profileId,
                profile_to: id,
                status: 1,
                to_message: notes || selectedOptions.join(', '),
            });

            if (response.data.Status === 1) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }

            closePopup();
        } catch (error) {
            console.error("There was an error!", error);
            toast.error('Failed to submit the notes.');
        }
    };

    const handleCheckboxChange = (option: string) => {
        setNotes(''); // Clear notes if checkboxes are used
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };
    const formDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: "numeric",
            month: "short",
            day: "2-digit"
        })
    }


    return (


        < >
            {VysassistEnable === 1 && vysassits === false && data === null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white sm:w-[400px] w-[300px] rounded-lg container mx-auto relative">
                        <div className="rounded-lg">
                            <div className="bg-white rounded-t-lg flex justify-between items-center border-b-[1px] border-ashBorder px-3 py-2 mb-2">
                                <h4 className="text-[24px] text-primary font-bold">Vysassist Notes</h4>
                                <IoClose onClick={closePopup} className="text-[22px] text-primary cursor-pointer" />
                            </div>

                            <div>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-2">
                                        <div className="mb-1 font-semibold text-lg text-primary">
                                            Apply for Vysya Assist: ({selectedOptions.length}/{options.length})
                                        </div>
                                    </div>

                                    <div className="px-3 py-3">
                                        {!notes && (
                                            <div>
                                                <div className="mb-4">
                                                    {options.map((option, index) => (
                                                        <label key={index} className="block text-primary mb-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="mr-2"
                                                                value={option}
                                                                checked={selectedOptions.includes(option)}
                                                                onChange={() => handleCheckboxChange(option)}
                                                            />
                                                            {option === formattedMessage ? (
                                                                <>
                                                                    We have shared the horoscope to{' '}
                                                                    <span className="text-red-500 font-semibold">
                                                                        {loginuser_profileId}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                option
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="mb-3">
                                                    <label className="block text-lg font-medium text-primary mb-1">
                                                        Add Your Notes/Instructions
                                                    </label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="w-full px-3 py-2 border-[1px] border-ashBorder rounded-sm bg-gray-100"
                                                        value={selectedOptions.join(', ')}
                                                        placeholder="Selected options will appear here"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end items-center space-x-5 mx-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={closePopup}
                                            className="text-main flex items-center rounded-lg font-semibold px-5 py-2.5 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-gradient text-white flex items-center rounded-lg font-semibold border-2 px-5 py-2 cursor-pointer"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }


            {
                VysassistEnable === 0 && vysassits === false && data === null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={closePopup}>
                        <div className="bg-white w-[36rem] rounded-lg container mx-auto relative">
                            <div className="rounded-lg">
                                <div className="bg-white rounded-t-lg flex justify-between items-center border-b-[1px] border-ashBorder py-2 mb-2">
                                    <h4 className="text-[24px] text-primary font-bold">
                                        Apply for VysAssist
                                    </h4>
                                    <IoClose onClick={closePopup} className="text-[22px] text-primary cursor-pointer" />
                                </div>
                                <div className='mb-3'>
                                    <span className="text-md text-primary">
                                        {/* You have not activated VysAssist for your plan. You can opt VysAssist for 3 matching profiles for Rs.999/- */}
                                        You have not activated VysAssist for your plan. You can opt VysAssist for 3 matching profiles for Rs.900/-
                                    </span>
                                </div>

                                <div>
                                    <div className="mb-0">
                                        <div className="mb-0 mt-1 text-md text-primary font-normal">
                                            VysAssist Process:
                                        </div>

                                    </div>
                                    <div className="px-3 py-3 overflow-y-auto">

                                        <div>
                                            <div className="mb-1">
                                                <ul className="list-disc pl-5 text-black font-normal space-y-2">
                                                    <li className="text-sm text-primary pl-2">
                                                        Analyze your request and our relationship executive will share the profile
                                                        to prospective matches on behalf of you.
                                                    </li>
                                                    <li className="text-sm text-primary pl-2">Follow-up (5 attempts) with prospective matches and update the status</li>
                                                    <li className="text-sm text-primary pl-2"> Collect necessary family background information / photos (if available) and share it with you</li>
                                                </ul>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="flex justify-between items-center space-x-5 mx-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={closePopup}
                                            className="text-main flex items-start rounded-lg font-semibold px-5 py-2.5 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            //onClick={() => navigate("/UpgradePlan")}
                                            onClick={() => navigate("/PayNow")}
                                            className="bg-gradient text-white flex items-center rounded-lg font-semibold border-2 px-5 py-2 cursor-pointer"
                                        >
                                            Pay now
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                VysassistEnable === 1 && vysassits === true && data !== null && (

                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" >
                        <div className="bg-white w-[36rem] rounded-lg px-4 py-2 relative">

                            <div className="">
                                <div className="bg-white rounded-t-lg flex justify-between items-center border-b-[1px] border-ashBorder py-2 mb-2">
                                    <h4 className="text-[24px] text-primary font-bold">
                                        {/* VysAssist applied on 24th Dec 2024 */}
                                        VysAssist applied on {data?.[0]?.update_at ? formDate(data[0].update_at) : ""}
                                    </h4>
                                    <IoClose onClick={closePopup} className="text-[22px] text-primary cursor-pointer" />
                                </div>

                                <div className="">
                                    <div>
                                        {/* Description */}
                                        <p className="text-md text-black font-normal">Here is the status of your VysAssist Request:</p>

                                        <div className="px-3 py-5">
                                            {/* Timeline List */}
                                            <div className="max-h-[250px] overflow-y-auto px-3">
                                                <ul className="list-none relative pl-5">

                                                    {/* {data?.map((item: any, index: number) => (
                                                        <li key={index} className="flex items-start space-x-3 last:mb-0">

                                                            Date (Left Aligned)
                                                            <div className="w-28 text-right text-sm text-gray-600 font-medium">
                                                                {formDate(item.update_at)}
                                                            </div>

                                                            Timeline Icon & Vertical Line
                                                            <div className="relative flex flex-col items-center">
                                                                Bullet Point
                                                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>

                                                                Vertical Line (Hidden for Last Item)
                                                                {index !== data.length - 1 && (
                                                                    <div className="w-[2px] h-80 bg-primary"></div>
                                                                )}
                                                            </div>

                                                            Comments (Right Aligned)
                                                            <div className="text-sm text-gray-800 break-words max-w-[200px]">
                                                                {item.comments}
                                                            </div>

                                                        </li>
                                                    ))} */}


                                                    {data?.map((item: any, index: number) => (
                                                        <li key={index} className="mb-5 last:mb-0 relative">

                                                            {/* Vertical Line (Hidden for last item) */}
                                                            {index !== data.length - 1 && (
                                                                <div className="absolute left-[-1.2rem] top-4 bottom-[-20px] w-[2px] bg-primary-400"></div>
                                                            )}

                                                            {/* Bullet point */}
                                                            <div className="absolute left-[-1.65rem] top-0 w-4 h-4 bg-[#6AA84F] rounded-full"></div>

                                                            {/* Date & Comment */}
                                                            <div className="text-sm text-gray-600 font-medium">{formDate(item.update_at)}</div>
                                                            <div className="text-primary text-sm break-words leading-relaxed">{item.comments}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="flex justify-center items-center space-x-5 mx-3 mb-4">

                                    <button
                                        type="submit"
                                        onClick={closePopup}
                                        className="w-24 bg-gradient text-white flex items-center justify-center rounded-lg mt-2 font-semibold border-2 px-5 py-2 cursor-pointer"
                                    >
                                        OK
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
