import { useNavigate } from "react-router-dom";
import { GalleryItem } from "../Gallary"; // Ensure this path is correct
import apiClient from "../../../API";
import { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";


interface GalleryCardProps {
  profiles: GalleryItem[];
  pageNumber: number; // Add this prop
}

const GalleryCard: React.FC<GalleryCardProps> = ({ profiles, pageNumber }) => {
  const navigate = useNavigate()
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);
  //const location = useLocation();

  const handleProfileClick = async (profileId: string) => {
    if (loadingProfileId) return;
    setLoadingProfileId(profileId);
    const secureId = encryptId(profileId);
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    try {
      const checkResponse = await apiClient.post("/auth/Get_profile_det_match/", {
        profile_id: loginuser_profileId,
        user_profile_id: profileId,
        page_id: "1",
      });

      if (checkResponse.data.status === "failure") {
        toast.error(checkResponse.data.message || "Limit reached to view profile");
        return;
      }

      navigate(`/ProfileDetails?id=${secureId}&rasi=1`, {
        state: {
          from: 'Gallery',
          pageNumber: pageNumber // Pass the current page number
        }
      });
    } catch (error) {
      toast.error("Error accessing profile.");
      console.error("API Error:", error);
    } finally {
      setLoadingProfileId(null);
    }
  };

  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

  return (
    <>
      <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5">
        {profiles.map((profile) => (
          <div className="group cursor-pointer relative">
            <img
              src={profile.img_url || defaultImgUrl}
              alt={`Gallery image ${profile.profile_id}`}
              onError={(e) => {
                e.currentTarget.onerror = null; // Prevent infinite loop
                e.currentTarget.src = defaultImgUrl; // Set default image
              }}
              className="w-full h-[350px] object-cover rounded-lg transition-transform transform duration-500 scale-100 group-hover:scale-105 object-top"
            />
            <p className="mt-2 text-center">{profile.profile_id}</p>
            {loadingProfileId === profile.profile_id && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-lg">
                <Hearts height="80" width="80" color="#FF6666" visible={true} />
                <p className="mt-2 text-sm text-primary">Please wait...</p>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                //onClick={()=> navigate(`/ProfileDetails?id=${profile.profile_id}`)} 
                onClick={() => handleProfileClick(profile.profile_id)}
                className="bg-white  text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                View
              </button>

            </div>
          </div>
          // <div key={profile.profile_id} classNameName="p-4">

          //   <img
          //     classNameName="w-full h-48 object-cover rounded-lg transition-transform transform scale-100 group-hover:scale-105"
          //     src={profile.img_url}
          //     alt={`Gallery image ${profile.profile_id}`}
          //   />
          //   <p classNameName="mt-2 text-center">{profile.profile_id}</p>
          // </div>
        ))}
      </div>
    </>
  );
};

export default GalleryCard;
