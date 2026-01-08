import { useContext, useState } from "react";
// import { useDispatch } from "react-redux";
// import { showInterest } from "../../../../redux/slices/interestSlice";
// import ProfileListImg from "../../../../assets/images/./ProfileListImg.png";
import { MdVerifiedUser } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
import { MdStars } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { FaSuitcase } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
// import { MdOutlineGrid3X3 } from "react-icons/md";
// import { FaUser } from "react-icons/fa6";
// import { IoEye } from "react-icons/io5";
import { ProfileContext } from "../ProfileContext";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
// import MatchingScoreImg from "../../../../assets/images/MatchingScore.png";
import { useNavigate } from "react-router-dom";
import MatchingScore from "./DashBoard/ProfileDetails/MatchingScore";
import { encryptId } from "../utils/cryptoUtils";

const AdvanceSearchCard = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("MyComponent must be used within a ProfileProvider");
  }

  const { searchProfileData } = context;
  //console.log(searchProfileData, "searchProfileData");

  // Redux
  // const dispatch = useDispatch();

  // const handleCardClick = () => {
  //   dispatch(showInterest());
  // };

  // State to track if the card is bookmarked or not
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // console.log(searchProfileData[0].profile_id, "sssss");
  const navigate = useNavigate();
  const routToProfileDetail = () => {
    const secureId = encryptId(searchProfileData[0]?.profile_id);
    navigate(`/ProfileDetails?id=${secureId}`);
  };

  //console.log(searchProfileData[0]?.matching_score, "lll");
  return (
    // <Link to={`/ProfileDetails/${searchProfileData[0]?.profile_id}`}>
    <div
      onClick={routToProfileDetail}
      className="flex justify-start items-center ml-10 mt-9 w-[90%] space-x-5 relative rounded-xl shadow-md px-3 py-3 mb-5"
    >
      <div className="w-full flex justify-between items-center">
        <div className="flex justify-between items-center space-x-5">
          {/* Profile Image */}
          <div className="relative">
            {searchProfileData[0]?.profile_img ? (
              <img
                src={searchProfileData[0]?.profile_img}
                alt="Profile-image"
              />
            ) : (
              <p>Loading image...</p>
            )}

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

          <div className="">
            {/* Name & Profile ID */}
            <div className="relative mb-2">
              <h5
                //  onClick={handleCardClick}
                className="text-[20px] text-secondary flrx gap-2 font-semibold cursor-pointer"
              >
                {searchProfileData[0]?.profile_name}
                <p className="text-sm text-ashSecondary">
                  {searchProfileData[0]?.profile_id}
                </p>
                <MdVerifiedUser className="absolute top-1.5 left-[143px] text-checkGreen" />
              </h5>
            </div>

            {/* Years & Height */}
            <div className="flex items-center space-x-3 mb-2">
              <p className="flex items-center text-ashSecondary font-semibold">
                <IoCalendar className="mr-2" />
                {searchProfileData[0]?.profile_age}
              </p>

              <p className="text-gray font-semibold">|</p>

              <p className="flex items-center text-ashSecondary font-semibold">
                <FaPersonArrowUpFromLine className="mr-2" />
                {searchProfileData[0]?.profile_height}
              </p>
            </div>

            {/* Uthiram */}
            <div className="mb-2">
              <p className="flex items-center text-ashSecondary font-semibold">
                <MdStars className="mr-2" />
                {searchProfileData[0]?.star}
              </p>
            </div>

            {/* Bachelors */}
            <div className="mb-2">
              <p className="flex items-center text-ashSecondary font-semibold">
                <IoSchool className="mr-2" />
                {searchProfileData[0]?.degree}
              </p>
            </div>

            {/* Employed */}
            <div className="mb-2">
              <p className="flex items-center text-ashSecondary font-semibold">
                <FaSuitcase className="mr-2" />
                {searchProfileData[0]?.profession}
              </p>
            </div>

            {/* Location */}
            <div className="mb-2">
              <p className="flex items-center text-ashSecondary font-semibold">
                <FaLocationDot className="mr-2" />
                {searchProfileData[0]?.location}
              </p>
            </div>
            {/* <div className="mb-2">
              <p className=" text-secondary text-[20px] flex items-centerfont-semibold">
                Matching Score {searchProfileData[0]?.matching_score}%
              </p>
            </div> */}

            {/* <div className="flex justify-start items-center space-x-3"> */}
            {/* Horoscope Available */}
            {/* <div>
                <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                  <MdOutlineGrid3X3 className="mr-2" />
                </p>
              </div> */}

            {/*  Active User */}
            {/* <div>
                <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                  <FaUser className="mr-2" /> Active user
                </p>
              </div> */}

            {/* Last Visit */}
            {/* <div>
                <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                  <IoCalendar className="mr-2" /> Last visit on June 30, 2024
                </p>
              </div> */}

            {/* views */}
            {/* <div>
                <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                  <IoEye className="mr-2" /> 31 views
                </p>
              </div> */}
            {/* </div> */}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <MatchingScore />
          </div>
        </div>
      </div>
    </div>
    // </Link>
  );
};

export default AdvanceSearchCard;
