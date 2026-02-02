// import React from "react";
// // import { useDispatch } from "react-redux";
// // import { showInterest } from "../../../redux/slices/interestSlice";
// import FeaturedProfileImg from "../../../assets/images/FeaturedProfileImg.png";
// import { IoCalendar } from "react-icons/io5";
// import { FaPersonArrowUpFromLine } from "react-icons/fa6";
// import { Link } from "react-router-dom";

// interface FeaturedProfileCardProps {
//   profileName: string;
//   profileId: string,
//   age: string,
//   height: string,
// }

// export const FeaturedProfileCard: React.FC<FeaturedProfileCardProps> = ({ profileName, profileId, age, height }) => {

//   // Redux
//   // const dispatch = useDispatch();

//   // const handleCardClick = () => {
//   //   dispatch(showInterest());
//   // };

//   return (
//     <Link to="/ProfileDetails" target="_blank">

//       <div>
//         <div
//           // onClick={handleCardClick} 
//           className="w-10/12 relative fade-bottom mx-auto my-5 cursor-pointer">
//           <img src={FeaturedProfileImg} alt="" className="w-full" />

//           <div className="w-full absolute bottom-0 px-2 py-3 z-10">
//             <h5 className="text-white font-semibold">
//               {profileName} <span>({profileId})</span>
//             </h5>
//             <div className="flex justify-between items-center">
//               <p className="text-white font-normal flex items-center">
//                 {" "}
//                 <IoCalendar className="mr-2" /> {age}
//               </p>
//               <p className="text-white font-normal flex items-center">
//                 <FaPersonArrowUpFromLine className="mr-2" /> {height}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import apiClient from "../../../API";
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";
import PlatinumModal from "../../DashBoard/ReUsePopup/PlatinumModalPopup";

interface FeaturedProfileCardProps {
  profileName: string;
  profileId: string;
  age: string;
  height: string;
  profileImage: string;
}

export const FeaturedProfileCard: React.FC<FeaturedProfileCardProps> = ({
  profileName,
  profileId,
  age,
  height,
  profileImage,
}) => {

  const navigate = useNavigate();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);

  const handleProfileClick = async (profileId: string) => {
    if (activeProfileId) return;
    if (isPlatinumModalOpen) return;
    setActiveProfileId(profileId); // set the card that's loading
    const secureId = encryptId(profileId);
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    let page_id = "2";

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

  const gender = localStorage.getItem("gender");

  const defaultImgUrl =
    gender?.toLowerCase() === "male"
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  return (
    <div
      className="w-10/12 relative fade-bottom mx-auto my-5 cursor-pointer rounded-lg after:!rounded-lg after:left-0"
      onClick={() => handleProfileClick(profileId)}

      role="button"
      tabIndex={0}
    >
      {activeProfileId === profileId && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
          <Hearts height="80" width="80" color="#FF6666" visible={true} />
          <p className="mt-2 text-sm text-primary">Please wait...</p>
        </div>
      )}

      <img src={profileImage || defaultImgUrl}
        alt={profileName}
        onError={(e) => {
          e.currentTarget.onerror = null; // Prevent infinite loop
          e.currentTarget.src = defaultImgUrl; // Set default image
        }}
        className="w-full h-[250px] rounded-lg object-cover object-top" />
      <div className="w-full absolute bottom-0 px-3 py-3 z-10">
        <h5
          onClick={() => handleProfileClick(profileId)}
          className="text-white font-semibold">
          {profileName} <span>({profileId})</span>
        </h5>
        <div className="flex justify-between items-center">
          <p className="text-white font-normal flex items-center">
            <IoCalendar className="mr-2" /> {age}
          </p>
          <p className="text-white font-normal flex items-center">
            <FaPersonArrowUpFromLine className="mr-2" /> {height}
          </p>
        </div>
      </div>
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
    </div>
  );
};
