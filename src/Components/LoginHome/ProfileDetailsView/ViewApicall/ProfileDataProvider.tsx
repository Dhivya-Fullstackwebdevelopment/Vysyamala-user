// ProfileDataProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../../../../API';
// import { useLocation, useSearchParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { decryptId } from '../../../../utils/cryptoUtils';

interface ProfileData {
    personal_details: any;
    education_details: any;
    family_details: any;
    horoscope_details: any;
    contact_details: any;
}

const ProfileDataContext = createContext<ProfileData | null>(null);

export const ProfileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    //const location = useLocation();
    //const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get('id');
    const [searchParams] = useSearchParams(); // Add this hook (import from react-router-dom)
    const encryptedId = searchParams.get("id") || "";
    // Decrypt the ID immediately
    const id = decryptId(encryptedId);
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await apiClient.post("/auth/Get_profile_det_match/", {
                    profile_id: loginuser_profileId,
                    user_profile_id: id,
                    page_id: "2" // Or determine dynamically if needed
                });

                setProfileData(response.data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setError("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <span className="text-white text-lg font-medium">Loading...</span>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <span className="text-red-500 text-lg font-medium">Error: {error}</span>
            </div>
        );

    if (!profileData)
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <span className="text-gray-400 text-lg font-medium">No data available</span>
            </div>
        );


    return (
        <ProfileDataContext.Provider value={profileData}>
            {children}
        </ProfileDataContext.Provider>
    );
};

export const useProfileData = () => {
    const context = useContext(ProfileDataContext);
    if (!context) {
        throw new Error('ProfileDataProvider must be used within a ProfileDataProvider');
    }
    return context;
};