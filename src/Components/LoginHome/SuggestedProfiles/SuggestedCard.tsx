// import React, { useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { showInterest } from "../../../redux/slices/interestSlice";
// // import { RootState } from '../../../redux/store';
// import { IoCalendar } from "react-icons/io5";
// import { FaPersonArrowUpFromLine } from "react-icons/fa6";
// import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
// import { Link } from "react-router-dom";

// interface SuggestedCardProps {
//   profileImg?: string;
//   profileId: string;
//   age: string;
//   height: string;
// }

// export const SuggestedCard: React.FC<SuggestedCardProps> = ({ profileImg, profileId, age, height }) => {
//   // Use Selector
//   // const showExpressInterest = useSelector((state: RootState) => state.interest.SuggestedProfilesShow);

//   // Redux
//   // const dispatch = useDispatch();

//   // const handleCardClick = () => {
//   //   dispatch(showInterest());
//   // };

//   // State to track if the card is bookmarked or not
//   const [isBookmarked, setIsBookmarked] = useState(false);

//   const handleBookmark = (event: React.MouseEvent) => {
//     event.stopPropagation();
//     setIsBookmarked(!isBookmarked);
//   };

//   return (
//     <Link to="/ProfileDetails" target="_blank">

//       <div
//         // onClick={handleCardClick}
//         className="relative w-fit mx-auto bg-white rounded-xl shadow-md px-3 py-3 my-5 cursor-pointer"
//       >
//         <div className="mb-3">
//           {profileImg ? (
//             <img src={profileImg} alt="Profile" className="w-full" />
//           ) : (
//             <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
//               <span className="text-gray-500">No Image</span>
//             </div>
//           )}
//         </div>
//         <div>
//           <h4 className="text-secondary text-[20px] font-semibold">
//             Harini{" "}
//             <span className="text-vysyamalaBlack text-[12px] font-bold">
//               ({profileId})
//             </span>
//           </h4>
//           <div className="flex justify-between items-center">
//             <p className="text-primary flex items-center">
//               <IoCalendar className="mr-2" /> {age} yrs{" "}
//             </p>
//             <p className="text-primary flex items-center">
//               <FaPersonArrowUpFromLine className="mr-2" /> {height}
//             </p>
//           </div>
//         </div>
//         {isBookmarked ? (
//           <MdBookmark
//             onClick={handleBookmark}
//             className="absolute top-5 right-5 text-white text-[22px] cursor-pointer"
//           />
//         ) : (
//           <MdBookmarkBorder
//             onClick={handleBookmark}
//             className="absolute top-5 right-5 text-white text-[22px] cursor-pointer"
//           />
//         )}
//       </div>
//     </Link>
//   );
// };

import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { showInterest } from "../../../redux/slices/interestSlice";
// import { RootState } from '../../../redux/store';
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../API";
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";
import PlatinumModal from "../../DashBoard/ReUsePopup/PlatinumModalPopup";

interface SuggestedCardProps {
  profileImg?: string;
  profile_name?: string;
  profileId: string;
  age: string;
  height: string;
}

export const SuggestedCard: React.FC<SuggestedCardProps> = ({
  profileImg,
  profile_name,
  profileId,
  age,
  height,
}) => {
  // Use Selector
  // const showExpressInterest = useSelector((state: RootState) => state.interest.SuggestedProfilesShow);

  // Redux
  // const dispatch = useDispatch();

  // const handleCardClick = () => {
  //   dispatch(showInterest());
  // };

  // State to track if the card is bookmarked or not
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlatinumModalOpen, setIsPlatinumModalOpen] = useState(false);

  const handleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const navigate = useNavigate();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);


  const handleProfileClick = async (profileId: string) => {
    if (isPlatinumModalOpen) return;
    if (activeProfileId) return;
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
      // onClick={handleCardClick}
      className="relative w-[90%] mx-auto !h-auto bg-white rounded-xl shadow-md px-3 py-3 my-5 cursor-pointer"
      onClick={() => handleProfileClick(profileId)}
    >
      <div className="mb-3 !h-auto ">
        {profileImg ? (
          <img src={profileImg || defaultImgUrl} alt="Profile"
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop
              e.currentTarget.src = defaultImgUrl; // Set default image
            }}
            className="w-full h-[260px] object-cover object-top" />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        {activeProfileId === profileId && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
            <Hearts height="80" width="80" color="#FF6666" visible={true} />
            <p className="mt-2 text-sm text-primary">Please wait...</p>
          </div>
        )}
      </div>
      <div className="!h-auto">
        <h4
          onClick={() => handleProfileClick(profileId)}
          className=" text-secondary text-[20px] font-semibold">
          {/* Harini{" "} */}
          ({profile_name})
          <span className="text-vysyamalaBlack text-[12px] font-normal">
            ({profileId})
          </span>
        </h4>
        <div className="flex justify-between items-center !h-auto">
          <p className="text-sm text-primary flex items-center">
            <IoCalendar className="mr-2" /> {age} yrs{" "}
          </p>
          <p className="text-sm text-primary flex items-center">
            <FaPersonArrowUpFromLine className="mr-2" /> {height}
          </p>
        </div>
      </div>
      {isBookmarked ? (
        <MdBookmark
          onClick={handleBookmark}
          className="absolute top-5 right-5 text-white text-[22px] fill-main cursor-pointer"
        />
      ) : (
        <MdBookmarkBorder
          onClick={handleBookmark}
          className="absolute top-5 right-5 text-white text-[22px] fill-[#72727240] cursor-pointer"
        />
      )}
      <PlatinumModal
        isOpen={isPlatinumModalOpen}
        onClose={() => setIsPlatinumModalOpen(false)}
      />
    </div>
  );
};
