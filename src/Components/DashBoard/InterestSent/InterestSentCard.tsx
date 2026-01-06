import { useState, useEffect } from "react";
import axios from "axios";
//import ProfileListImg from "../../../assets/images/./ProfileListImg.png";
import { MdVerifiedUser, MdBookmark, MdBookmarkBorder, MdStars, MdOutlineGrid3X3, MdMessage, } from "react-icons/md";
import { IoCalendar, IoSchool, IoEye } from "react-icons/io5";
import { FaPersonArrowUpFromLine, FaSuitcase, FaLocationDot, FaUser } from "react-icons/fa6";
// import MatchingScoreImg from "../../../assets/images/MatchingScore.png";
import MatchingScore from "../ProfileDetails/MatchingScore";
// import Spinner from "../../Spinner";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileNotFound } from "../../LoginHome/MatchingProfiles/ProfileNotFound";
// import { toast } from "react-toastify";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for react-toastify
import apiClient from "../../../API";
import { Hearts } from "react-loader-spinner";

// Define the Profile interface
export interface Profile {
  myint_Profile_img: string;
  myint_profile_name: string;
  myint_profileid: string;
  myint_profile_age: number;
  myint_verified: number;
  myint_height: number;
  myint_star: string;
  myint_profession: string;
  myint_city: string;
  myint_degree: string;
  myint_match_score?: number;
  myint_views: number;
  myint_lastvisit: string;
  myint_userstatus: string;
  myint_horoscope: string;
  myint_profile_wishlist: number;
}

type InterestSentCardProps = {
  pageNumber: number;
  dataPerPage: number;
  sortBy: string;
};

export const InterestSentCard: React.FC<InterestSentCardProps> = ({ pageNumber, sortBy }) => {
  const navigate = useNavigate();
  // State to track if the card is bookmarked or not
  // const [isBookmarked, setIsBookmarked] = useState<{ [key: string]: boolean }>(
  //   {}
  // );
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<string[]>([]);
  // State to store the profile data fetched from the API
  const [profile, setProfiles] = useState<Profile[]>([]);
  //console.log(profile, "proooo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const [roomId, setRoomId] = useState("");
  const [isRedirect, setIsRedirect] = useState(false);
  const [userName] = useState("");
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const location = useLocation();

  // Added state to capture the selected from_profile_id for messaging
  // const [, setSelectedFromProfileId] = useState<string | null>(null);
  ////console.log("setSelectedFromProfileId",setSelectedFromProfileId)

  const handleMessage = async (fromProfileId: string) => {
    try {
      // First API call to Create_or_retrievechat
      const response = await apiClient.post("/auth/Create_or_retrievechat/", {
        profile_id: loginuser_profileId,
        profile_to: fromProfileId, // Use the passed fromProfileId
      });


      if (response.data.statue === 1) {
        const { room_id_name } = response.data;

        // Second API call to Get_user_chatlist
        const chatListResponse = await apiClient.post("/auth/Get_user_chatlist/", {
          profile_id: loginuser_profileId,
        });

        if (chatListResponse.data.status === 1) {
          // Extract relevant profile data
          const profileData = chatListResponse.data.data.find(
            (item: { room_name_id: any; }) => item.room_name_id === room_id_name
          );

          // Structure profileData with actual details from chatListResponse
          const selectedProfileData = {
            room_name_id: profileData.room_name_id,
            profile_image: profileData.profile_image,
            profile_user_name: profileData.profile_user_name,
            profile_lastvist: profileData.profile_lastvist,
          };

          // Save profile data with room ID to sessionStorage
          sessionStorage.setItem("selectedProfile", JSON.stringify(selectedProfileData));
          //console.log(selectedProfileData, "selectedProfileData");

          // Set state and navigate to messages page
          setRoomId(room_id_name);
          setIsRedirect(true);
          navigate("/Messages");
        } else {
          console.error("Failed to fetch chat list:", chatListResponse.data.mesaage);
        }
      } else {
        console.error("Failed to create chat room:", response.data.Message);
      }
    } catch (error) {
      console.error("Error creating or fetching chat room:", error);
    }
  };


  useEffect(() => {
    if (isRedirect) {
      window.location.href = `/messages/${roomId}/${userName}`;
    }
  }, [isRedirect, roomId, userName]);

  // Fetch data from the API
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!loginuser_profileId) {
        setError("Profile ID is not available");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await apiClient.post(
          "/auth/My_intrests_list/",
          {
            profile_id: loginuser_profileId,
            page_number: pageNumber,
            sort_by: sortBy,

          }
        );
        // Check the response status
        if (response.data.Status === 1) {
          const fetchedProfiles = response.data.data.profiles;
          setProfiles(fetchedProfiles);
          setNoData(fetchedProfiles.length === 0);
          const bookmarkedIds = fetchedProfiles
            .filter((profile: { myint_profile_wishlist: number; }) => profile.myint_profile_wishlist === 1)
            .map((profile: { myint_profileid: any; }) => profile.myint_profileid);

          setBookmarkedProfiles(bookmarkedIds);
        } else if (response.data.Status === 0) {
          setNoData(true);
          setProfiles([]);
        } else {
          setError("Error fetching profiles: " + response.data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("API Call Error:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError("No interests found for the given profile ID");
          } else {
            setError("Error loading profiles: " + error.message);
          }
        } else {
          setError("Unexpected error occurred");
        }
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [loginuser_profileId, pageNumber, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Hearts
          height="100"
          width="100"
          color="#FF6666"
          ariaLabel="hearts-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p className="text-sm">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return <p>Error loading profiles: {error}</p>;
  }

  if (noData) {
    return (
      <div className="py-20">
        <ProfileNotFound />
      </div>
    );
  }

  const handleBookmarkToggle = async (profileId: string) => {
    if (bookmarkedProfiles.includes(profileId)) {
      await removeBookmark(profileId);
    } else {
      await addBookmark(profileId);
    }
  };

  const addBookmark = async (profileId: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: "1",
        }
      );
      if (response.data.Status === 1) {
        toast.success("Profile added to wishlist!");
        ////console.log("Profile added to wishlist!");
        setBookmarkedProfiles((prev) => [...prev, profileId]);
        // sessionStorage.setItem(
        //   "bookmarkedProfiles",
        //   JSON.stringify([...bookmarkedProfiles, profileId])
        // );
      } else {
        toast.error("Failed to add to wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while adding to wishlist.");
    }
  };

  const removeBookmark = async (profileId: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: "0",
        }
      );
      if (response.data.Status === 1) {
        toast.success("Profile removed from wishlist.");
        ////console.log("Profile removed from wishlist.");
        const updatedBookmarks = bookmarkedProfiles.filter((id) => id !== profileId);
        setBookmarkedProfiles(updatedBookmarks);
        // sessionStorage.setItem("bookmarkedProfiles", JSON.stringify(updatedBookmarks));
      } else {
        toast.error("Failed to remove from wishlist.");
      }
    } catch (error) {
      toast.error("An error occurred while removing from wishlist.");
    }
  };

  // const handleProfileClick = (profileId: string) => {
  //   navigate(`/ProfileDetails?id=${profileId}&page=3`);
  // };



  const handleProfileClick = async (profileId: string) => {
    if (activeProfileId) return;
    setActiveProfileId(profileId); // set the card that's loading

    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    let page_id = "2";

    if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
      page_id = "1";
    }

    try {
      const checkResponse = await apiClient.post(
        "/auth/Get_profile_det_match/",
        {
          profile_id: loginuser_profileId,
          user_profile_id: profileId,
          page_id: page_id,
        }
      );

      if (checkResponse.data.status === "failure") {
        toast.error(checkResponse.data.message || "Limit reached to view profile");
        setActiveProfileId(null);
        return;
      }

      // Navigate after validation
      //navigate(`/ProfileDetails?id=${profileId}&page=3`);
      navigate(`/Profiledetails?id=${profileId}&page=3&sortBy=${sortBy}`, {
        state: {
          from: 'interestSent',
          pageNumber: pageNumber, // Pass the current page number
          sortBy: sortBy
        }
      });

      // await apiClient.post("/auth/Create_profile_visit/", {
      //   profile_id: loginuser_profileId,
      //   viewed_profile: profileId,
      // });
    } catch (error) {
      toast.error("Error accessing profile.");
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
    <div className="">
      <ToastContainer />

      {profile.map((profile) => (
        <div
          key={profile.myint_profileid}
          className="flex justify-start items-center space-x-5 relative rounded-xl py-5"
        >
          {activeProfileId === profile.myint_profileid && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-xl">
              <Hearts height="80" width="80" color="#FF6666" visible={true} />
              <p className="mt-2 text-sm text-primary">Please wait...</p>
            </div>
          )}

          <div className="w-full flex justify-between items-center">
            <div className="flex justify-between items-center space-x-5  max-sm:flex-col max-sm:gap-5 max-sm:w-full max-sm:items-start">
              {/* Profile Image */}
              <div className="relative  max-sm:w-full">
                <img
                  src={profile.myint_Profile_img || defaultImgUrl}
                  alt="Profile-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = defaultImgUrl; // Set default image
                  }}
                  className="rounded-[6px] w-[245px] h-[245px]  max-md:w-full"
                />


                {/* {isBookmarked[profile.myint_profileid] ? (
                  <MdBookmark
                    onClick={(e) => {
                      e.preventDefault();
                      handleBookmark(profile.myint_profileid);
                    }}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                ) : (
                  <MdBookmarkBorder
                    onClick={(e) => {
                      e.preventDefault();
                      handleBookmark(profile.myint_profileid);
                    }}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                )} */}
                {bookmarkedProfiles.includes(profile.myint_profileid) ? (
                  <MdBookmark
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(profile.myint_profileid);
                    }}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                ) : (
                  <MdBookmarkBorder
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(profile.myint_profileid);
                    }}
                    className="absolute top-2 right-2 text-white text-[22px] cursor-pointer"
                  />
                )}
              </div>

              {/* Profile Details */}
              <div className="">
                {/* Name & Profile ID */}
                <div className="relative mb-2">
                  <div className="flex items-center">
                    <h5
                      onClick={() =>
                        handleProfileClick(profile.myint_profileid)
                      }
                      className="text-[20px] text-secondary font-semibold cursor-pointer">
                      {profile.myint_profile_name}{" "}
                      <span className="text-sm text-ashSecondary">
                        ({profile.myint_profileid})
                      </span>
                    </h5>
                    {profile.myint_verified === 1 && (
                      <MdVerifiedUser className="text-[20px] text-checkGreen ml-2" />
                    )}
                  </div>
                </div>

                {/* Years & Height */}
                <div className="flex items-center space-x-3 mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <IoCalendar className="mr-2 text-primary" />
                    {profile.myint_profile_age} yrs
                  </p>

                  <p className="text-gray font-semibold">|</p>

                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaPersonArrowUpFromLine className="mr-2 text-primary" />
                    {profile.myint_height}
                  </p>
                </div>

                {/* Uthiram */}
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <MdStars className="mr-2 text-primary" />
                    {profile.myint_star}
                  </p>
                </div>

                {/* Bachelors */}
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <IoSchool className="mr-2 text-primary" />
                    {profile.myint_degree}
                  </p>
                </div>

                {/* Employed */}
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaSuitcase className="mr-2 text-primary" />
                    {profile.myint_profession}
                  </p>
                </div>

                {/* Location */}
                <div className="mb-2">
                  <p className="flex items-center text-sm text-primary font-normal">
                    <FaLocationDot className="mr-2 text-primary" />
                    {profile.myint_city}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex justify-start items-center gap-3 max-2xl:flex-wrap ">
                  {/* Horoscope Available */}
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <MdOutlineGrid3X3 className="mr-2 text-primary" />  {profile.myint_horoscope}
                    </p>
                  </div>

                  {/* Active User */}
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <FaUser className="mr-2 text-primary" /> {profile.myint_userstatus}
                    </p>
                  </div>

                  {/* Last Visit */}
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <IoCalendar className="mr-2 text-primary" />Express Interest on {profile.myint_lastvisit}
                    </p>
                  </div>

                  {/* Views */}
                  <div>
                    <p className="flex items-center bg-gray px-2 py-0.5 rounded-md text-ashSecondary font-semibold">
                      <IoEye className="mr-2 text-primary" />{profile.myint_views}  views
                    </p>
                  </div>
                </div>

                {/* Message button */}
                <button className="text-main text-sm font-medium flex items-center rounded-lg py-5 cursor-pointer"
                  onClick={() => {
                    //setSelectedFromProfileId(profile.myint_profileid); // Set the selected profile ID
                    handleMessage(profile.myint_profileid); // Pass the ID to the handler
                  }}
                >
                  <MdMessage className="text-main text-[20px] mr-2" /> Message
                </button>
              </div>
            </div>

            {/* Matching Score */}
            {profile.myint_match_score !== undefined &&
              profile.myint_match_score > 50 && profile.myint_match_score !== 100 && (
                <div>
                  <div className="max-lg:hidden">
                    {/* <img
                                    src={MatchingScoreImg}
                                    alt="Matching Score"
                                    className="w-full"
                                /> */}
                    <MatchingScore scorePercentage={profile.myint_match_score} />
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};
