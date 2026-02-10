import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProfileContext } from "../ProfileContext";
import axios from "axios";
import apiClient from "../API";
import config from "../Config";

interface GetProfileDetMatch {
  profile_id: string;
  personal_profile_name: string;
  personal_age: number;
  personal_profile_height: string;
  personal_profile_marital_status_name: string;
  personal_about_self: string;
  personal_weight: string;
  personal_verify: number;
  package_name: string;
  valid_upto: string;
  profile_completion: string;
  star: string;
  gothram: string;
  prosession: string;
  heightest_education: string;
}

export const BasicInfoPdf = () => {
  const context = useContext(ProfileContext);
  const [searchParams] = useSearchParams(); // Get URL search parameters

  const [profileDetails, setProfileDetails] = useState<GetProfileDetMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract `id` from URL query parameters
  const profileId = searchParams.get("id");

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!profileId) return; // If no `id` in URL, skip fetching
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("profile_id", profileId);

        const response = await apiClient.post(
          "/auth/get_myprofile_personal/",
          formData
        );

        if (response.data.status === "success") {
          setProfileDetails(response.data.data);
          setError(null);
          console.log(response.data)
        } else {
          setError("Failed to fetch profile details.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data || "Axios error occurred.");
        } else {
          setError("Unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [profileId]);

  if (!context) {
    throw new Error("BasicInfoPdf must be used within a ProfileProvider");
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  //   const [searchParams] = useSearchParams("");
  // const encodedData = searchParams.get("data");

  // Decode and parse the profile data
  // const profileData = encodedData ? JSON.parse(atob(encodedData)) : null;


  return (
    <div>
      <div className="container">
        <div className="w-[450px] max-sm:w-fit flex flex-col items-center p-10  mx-auto my-28 max-md:my-20 bg-gray-50 shadow-profileCardShadow">

          <div className="w-full">
            <div className="flex justify-start mb-6">
              <img
                src={

                  `${config.apiUrl}/media/default_groom.png`
                  //"http://103.214.132.20:8000/media/default_groom.png"
                }
                alt={profileDetails?.personal_profile_name || "Name not available"}
                className="w-full h-[300px]  object-contain rounded-3xl  shadow-redboxshadow hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-start space-y-4">
              <h1 className="text-4xl sm:text-3xl font-semibold text-gray-800 mb-5 text-start">
                {profileDetails?.personal_profile_name || "Profile Details"}
              </h1>
              <p className="text-lg text-gray-600">
                <span className="font-medium text-gray-700">Profile ID :</span> {profileDetails?.profile_id || "N/A"}
              </p>
              <p className="text-lg text-gray-600">
                <span className="font-medium text-gray-700">Age :</span> {profileDetails?.personal_age || "N/A"}
              </p>
              <p className="text-lg text-gray-600">
                <span className="font-medium text-gray-700">Star :</span> {profileDetails?.star || "N/A"}
              </p>
              <p className="text-lg text-gray-600">
                <span className="font-medium text-gray-700">About :</span> {profileDetails?.personal_about_self || "N/A"}
              </p>
              <p className="text-lg text-gray-600">
                <span className="font-medium text-gray-700">Education :</span> {profileDetails?.heightest_education || "N/A"}
              </p>
              <p className="text-lg text-gray-600">
                <span className="font-medium text-gray-700">Profession :</span> {profileDetails?.prosession || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
