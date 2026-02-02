import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import apiClient from '../../../API';
import { useSearchParams } from 'react-router-dom';
import { decryptId } from '../../../utils/cryptoUtils';

interface PersonalNotesPopupProps {
    closePopup: () => void;
    profileId: string; // Profile ID of the current user
    profileTo: string; // Profile ID of the profile to view/edit
}

export const PersonalNotesPopup: React.FC<PersonalNotesPopupProps> = ({ closePopup }) => {
    const [notes, setNotes] = useState<string>('');
    const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false); // To show the upgrade overlay
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get('id');
    const [searchParams] = useSearchParams();
    const encryptedId = searchParams.get("id") || "";
    const id = decryptId(encryptedId);

    let page_id = "2"; // Default
    if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
        page_id = "1";
    }

    // Fetch personal notes when the component mounts
    useEffect(() => {
        const fetchPersonalNotes = async () => {
            try {
                const response = await apiClient.post('/auth/Get_profile_det_match/', {
                    profile_id: loginuser_profileId,
                    user_profile_id: id,
                    page_id: page_id
                });

                const personalNotes = response.data.basic_details.personal_notes;
                setNotes(personalNotes || '');
            } catch (error) {
                console.error('Error fetching personal notes:', error);
                setNotes('');
            }
        };

        fetchPersonalNotes();
    }, [loginuser_profileId, id]);

    const handleUpgradeCancel = () => {
        setShowUpgradePrompt(false);
        closePopup();
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await apiClient.post('/auth/Save_personal_notes/', {
                profile_id: loginuser_profileId,
                profile_to: id,
                notes: notes,
            });

            if (response.data.Status === 1) {
                toast.success('Your Notes have been saved!');
                closePopup();
            } else if (response.data.Status === 0) {
                setShowUpgradePrompt(true); // Show upgrade overlay if upgrade is needed
            } else {
                toast.error('Failed to save notes');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('An error occurred while saving notes');
        }


    };

    const handleUpgrade = () => {

        setShowUpgradePrompt(false);
        closePopup();
        window.location.href = '/MembershipPlan'; // Adjust route if needed
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white sm:w-[400px] w-[300px] rounded-lg container mx-auto relative">
                <div className="rounded-lg">
                    {!showUpgradePrompt && (
                        <div className="bg-white rounded-t-lg flex justify-between items-center border-b-[1px] border-ashBorder px-3 py-2 mb-2">
                            <h4 className="text-[24px] text-primary font-bold">Personal Notes</h4>
                            <IoClose onClick={closePopup} className="text-[22px] text-primary cursor-pointer" />
                        </div>
                    )}



                    {!showUpgradePrompt ? (
                        <form onSubmit={handleSubmit}>
                            <div className="">
                                <textarea
                                    name="personalNotes"
                                    rows={6}
                                    className="w-full bg-white text-primary rounded-lg px-3 py-3 focus:outline-none"
                                    placeholder="Take a Note..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end items-center space-x-5 mx-3 mb-4 border-t-[1px] pt-2 border-ashBorder">
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
                    ) : (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white rounded-lg p-5 w-3/4">

                                <p className="text-lg font-semibold mb-4">
                                    You need to upgrade your package to access this functionality.
                                </p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={handleUpgradeCancel}
                                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpgrade}
                                        className="bg-gradient text-white flex items-center rounded-lg font-semibold border-2 px-5 py-2 cursor-pointer"
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};
