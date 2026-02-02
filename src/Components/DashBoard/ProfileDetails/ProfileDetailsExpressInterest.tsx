/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, } from "react";
import axios, { AxiosResponse } from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MdArrowDropDown, MdLocalPrintshop, MdMessage, MdVerifiedUser } from "react-icons/md";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
import AgeIcon from "../../../assets/icons/ageIcon.png";
import { MdOutlineGrid3X3 } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { IoArrowBackOutline, IoEye } from "react-icons/io5";
import { FaHeart } from "react-icons/fa6";
import { FaTableList } from "react-icons/fa6";
import { ProfileSlickView } from "../../LoginHome/ProfileDetailsView/ProfileSlickView";
import { TbPhotoHeart } from "react-icons/tb";
import PersonalNotes from "../../../assets/icons/PersonalNotes.png";
import SupportAgent from "../../../assets/icons/SupportAgent.png";
import MatchingScore from "./MatchingScore";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import CustomMessagePopUp from "./CustomMessagePopup";
import { NotifySuccess, NotifyError } from "../../Toast/ToastNotification";
import { toast } from "react-toastify";
import { PersonalNotesPopup } from "../PersonalNotes/PersonalNotesPopup";
import { VysAssistPopup } from "../VysAssist/VysAssistPopup";
import apiClient from "../../../API";
import { Hearts } from 'react-loader-spinner'
import { ReUseUpGradePopup } from "../ReUsePopup/ReUseUpGradePopup";
import { GenderRestrictionPopup } from "../ReUsePopup/GenderRestrictionPopup";
import { decryptId } from "../../../utils/cryptoUtils";

// Define the interfaces for profile data
interface HoroscopeDetails {
  star_name: string;
  surya_gothram: string;
  padham?: string | number | null;
}

interface EducationDetails {
  profession: string;
  education_level: string;
  degeree: string;
}

interface BasicDetails {
  profile_id: string;
  profile_name: string;
  express_int: string;
  about: string;
  user_profile_views: string;
  matching_score: number;
  horoscope_available: number;
  horoscope_link: string;
  horoscope_available_text: string;
  user_status: string;
  last_visit: string;
  verified: number;
}

interface PersonalDetails {
  age: number;
  height: string;
  weight: string;
}

interface ProfileData {
  horoscope_details: HoroscopeDetails;
  education_details: EducationDetails;
  basic_details: BasicDetails;
  personal_details: PersonalDetails;
  photo_request: number;
}

interface ApiResponse {
  data: any;
  status: string;
  interest_status: string;
  // Add other fields based on the API response
}

// Define your ChatResponseData type, including all required properties
interface ChatResponseData {
  statue: number;
  room_id_name: string;
  Message?: string;           // Optional if it might not exist
}

interface ProfileDetailsExpressInterestProps { }

export const ProfileDetailsExpressInterest: React.FC<
  ProfileDetailsExpressInterestProps
> = () => {
  const [roomId, setRoomId] = useState("");
  const [userName,] = useState("");
  const [isRedirect, setIsRedirect] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [PhotoPasswordlock, setPhotoPasswordlock] = useState<number>(0);
  //console.log(typeof PhotoPasswordlock, "PhotoPasswordlock");
  // console.log(profileData?.basic_details.verified, "llllllllllllllllll");
  const [hideExpresButton, setHideExpressButton] = useState<boolean>(true);
  const [expressPopup, setExpressPopup] = useState<boolean>(false);
  const [bookMarkPopup, setBookMarkPopup] = useState<boolean>(false);
  const [matchingScorePopup, setMatchingScorePopup] = useState<boolean>(false);
  const [genderRestrictionMessage, setGenderRestrictionMessage] = useState<string>("");
  const [showGenderRestrictionPopup, setShowGenderRestrictionPopup] = useState<boolean>(false);
  //console.log('matchingScorePopup', matchingScorePopup)
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const interestParam = queryParams.get("interest");
  // const idparam = queryParams.get("id") || "";
  const [searchParams] = useSearchParams(); // Add this hook (import from react-router-dom)
  const encryptedId = searchParams.get("id") || "";
  // Decrypt the ID immediately
  const idparam = decryptId(encryptedId);
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const custom_message = localStorage.getItem("custom_message");
  const storedPlanId = localStorage.getItem("plan_id") || sessionStorage.getItem("plan_id");
  const isPlan16 = storedPlanId === "16";


  ////console.log("vysya", storedPlanId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!idparam && encryptedId) {
      console.error("Invalid Profile ID");
      toast.error("Invalid Profile ID");
      navigate(-1);
    }
  }, [idparam, encryptedId, navigate]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");

    if (!token) {
      // Save the current URL (including query params like ?id=VF37462)
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("intendedUrl", currentUrl);

      // Redirect to homepage
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleMessageClick = async () => {
    try {
      const response: AxiosResponse<ChatResponseData> = await apiClient.post(
        "/auth/Create_or_retrievechat/",
        {
          profile_id: loginuser_profileId,
          profile_to: idparam,
        }
      );
      if (response.data.statue === 1) {
        const { room_id_name } = response.data;
        const profileData = {
          room_name_id: room_id_name,
        };
        navigate("/Messages")
        // Save the profile with roomId to sessionStorage
        sessionStorage.setItem('selectedProfile', JSON.stringify(profileData));
        //console.log(profileData, "profileData")

        setRoomId(room_id_name);
        setIsRedirect(true); // Redirect to messages page
      } else {
        console.error("Failed to create chat room:", response.data.Message);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  useEffect(() => {
    if (isRedirect) {
      window.location.href = `/messages/${roomId}/${userName}`;
    }
  }, [isRedirect, roomId, userName]);



  const handleUpdateInterest = async (profileId: string, status: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Update_profile_intrests/",
        {
          profile_id: loginuser_profileId,
          profile_from: profileId,
          status: status,
        }
      );
      if (response.data.Status === 1) {
        // Remove the profile from the state if rejected
        if (status === "2") {
          // NotifySuccess("Interest Accepted");
          toast.success("Interest Accepted");
          setHideExpressButton(false);
          if (loginuser_profileId) {
            await fetchProfileStatusNew(loginuser_profileId);
          } else {
            console.error("loginuser_profileId is null or undefined");
          }
        } else if (status === "3") {
          // NotifyError("Interest Declined");
          toast.error("Interest Declined");
          setHideExpressButton(false);
        } else {
          console.error(
            "Error updating profile interest:",
            response.data.message
          );
          NotifyError("Error updating profile interest");
        }
      }
    } catch (error) {
      console.error("Error updating profile interest:", error);
      NotifyError("Error updating profile interest");
    }
  };



  const fetchProfileStatusNew = async (loginuser_profileId: string) => {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/auth/Get_expresint_status/`,
        {
          profile_id: loginuser_profileId,
          profile_to: idparam,
        }
      );
      ////console.log("Profile interest status:", response.data.data.interest_status);
      setStatus(response.data.data.interest_status); // Adjust based on your response structure
    } catch (err) {
      console.error("Failed to fetch profile status:", err);
      // setError('Failed to fetch profile status');
    }
  };

  const [status, setStatus] = useState<number | null>(); // State to hold API status
  // const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    // Define the API call function
    const fetchProfileStatus = async (loginuser_profileId: string) => {
      try {
        const response = await apiClient.post<ApiResponse>(
          `/auth/Get_expresint_status/`,
          {
            profile_id: loginuser_profileId,
            profile_to: idparam
          }
        );
        ////console.log("dddddddddddddddddddd", response.data.data.interest_status);
        setStatus(response.data.data.interest_status); // Adjust based on your response structure
      } catch (err) {
        // setError('Failed to fetch profile status');
        console.error(err);
      }
    };

    // Fetch profile status when profileIdViewed changes
    if (loginuser_profileId) {
      fetchProfileStatus(loginuser_profileId);
    }
  }, [idparam, loginuser_profileId]); // Dependency array: effect runs when profileIdViewed changes

  // //console.log("valueeee", status);
  // console.log(idparam, "id");
  const [vysAssistData, setVysAssistData] = useState<any>(null);

  // useEffect(() => {
  //   setLoading(true);
  //   const fetchProfileData = async () => {
  //     try {

  //       const response = await apiClient.post(
  //         "/auth/Get_profile_det_match/",
  //         {
  //           profile_id: loginuser_profileId,
  //           user_profile_id: idparam,
  //         }
  //       );


  //       await apiClient.post(
  //         "/auth/Create_profile_visit/",
  //         {
  //           profile_id: loginuser_profileId,
  //           viewed_profile: idparam,
  //         }
  //       );
  //       setProfileData(response.data);
  //       // setPhotoLock(response.data.photo_protection);
  //       sessionStorage.setItem("photolock", JSON.stringify(response.data.photo_protection));
  //       //console.log(response.data.photo_protection);
  //       const storedPhotoProtectionVal = sessionStorage.getItem("photolock");
  //       const parsedPhotoProtectionVal = storedPhotoProtectionVal ? JSON.parse(storedPhotoProtectionVal) : "0";
  //       setPhotoPasswordlock(parsedPhotoProtectionVal);

  //       if (response.data.basic_details.express_int === "1") {
  //         setIsHeartMarked(true);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching profile data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProfileData();
  // }, []);
  useEffect(() => {
    setLoading(true);
    const fetchProfileData = async () => {
      try {
        const response = await apiClient.post("/auth/Get_profile_det_match/", {
          profile_id: loginuser_profileId,
          user_profile_id: idparam,
        });
        if (response.data.status === "failure" && response.data.message) {
          setGenderRestrictionMessage(response.data.message);
          setShowGenderRestrictionPopup(true);
          setProfileData(null); // Ensure profile data is cleared if this error occurs
          return; // Stop processing the rest of the success logic
        }
        // Store the response data for Vys Assist
        setVysAssistData(response.data);

        await apiClient.post("/auth/Create_profile_visit/", {
          profile_id: loginuser_profileId,
          viewed_profile: idparam,
        });

        setProfileData(response.data);
        sessionStorage.setItem("photolock", JSON.stringify(response.data.photo_protection));
        const storedPhotoProtectionVal = sessionStorage.getItem("photolock");
        const parsedPhotoProtectionVal = storedPhotoProtectionVal ? JSON.parse(storedPhotoProtectionVal) : "0";
        setPhotoPasswordlock(parsedPhotoProtectionVal);

        if (response.data.basic_details.express_int === "1") {
          setIsHeartMarked(true);
        }
        setIsBookmarked(response.data.basic_details.wish_list === 1);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Declaration for Bookmarking Profile
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<ProfileData[]>(
    () => {
      const savedBookmarks = localStorage.getItem("bookmarkedProfiles");
      return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    }
  );
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileData[]>(
    () => {
      const savedSelectedProfiles = localStorage.getItem("selectedProfiles");
      return savedSelectedProfiles ? JSON.parse(savedSelectedProfiles) : [];
    }
  );

  useEffect(() => {
    // setLoading(true);
    const fetchProfileData = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_profile_det_match/",
          {
            profile_id: loginuser_profileId,
            user_profile_id: idparam,
          }
        );
        setProfileData(response.data);
        if (response.data.basic_details.express_int === "1") {
          setIsHeartMarked(true);
        }

        const isAlreadyBookmarked = bookmarkedProfiles.some(
          (profile) =>
            profile.basic_details.profile_id ===
            response.data.basic_details.profile_id
        );
        setIsBookmarked(isAlreadyBookmarked);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [idparam, loginuser_profileId, bookmarkedProfiles]);

  useEffect(() => {
    localStorage.setItem(
      "bookmarkedProfiles",
      JSON.stringify(bookmarkedProfiles)
    );
  }, [bookmarkedProfiles]);

  useEffect(() => {
    localStorage.setItem("selectedProfiles", JSON.stringify(selectedProfiles));
  }, [selectedProfiles]);

  const addBookmark = async (profile: ProfileData) => {
    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: idparam,
          status: "1",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Show toast based on API response
      if (response.data.Status === 1) {
        // toast.success(response.data.message || "Profile added to Bookmark Successfully");
        toast.success("Profile added to Bookmark Successfully");
        setBookmarkedProfiles((prev) => [...prev, profile]);
        setSelectedProfiles((prev) => [...prev, profile]);
        setIsBookmarked(true);
      } else {
        toast.error(response.data.message || "Failed to bookmark profile");
      }
    } catch (error) {
      console.error("Error bookmarking profile:", error);
      toast.error("Error bookmarking profile");
    }
  };

  const removeBookmark = async (profile_id: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: idparam,
          status: "0",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Show toast based on API response
      if (response.data.Status === 1) {
        toast.success(response.data.Message || "Profile removed from Bookmark Successfully");
        setBookmarkedProfiles((prev) => {
          return prev.filter((profile) => {
            if (!profile || !profile.basic_details) {
              console.error("Malformed profile object:", profile);
              return false;
            }
            return profile.basic_details.profile_id !== profile_id;
          });
        });
        setSelectedProfiles((prev) => {
          return prev.filter((profile) => {
            if (!profile || !profile.basic_details) {
              console.error("Malformed profile object:", profile);
              return false;
            }
            return profile.basic_details.profile_id !== profile_id;
          });
        });
        setIsBookmarked(false);
      } else {
        toast.error(response.data.Message || "Failed to remove bookmark");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Error removing bookmark");
    }
  };

  const handleBookmark = () => {
    if (isBookmarked && profileData) {
      removeBookmark(profileData.basic_details.profile_id);
    } else if (profileData) {
      addBookmark(profileData);
    }
  };

  // Declaration for Heart State
  const [isHeartMarked, setIsHeartMarked] = useState(false);
  const [openCustomMsgShow, setOpenCustomMsgShow] = useState<boolean>(false);
  const [openCustomMsg, setOpenCustomMsg] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [apimsgExpressInt, setApiMsgExpressInt] = useState("");

  const handleHeartMark = async () => {
    try {
      const isAdding = !isHeartMarked;
      const response = await apiClient.post(
        "/auth/Send_profile_intrests/",
        {
          profile_id: loginuser_profileId,
          profile_to: idparam,
          status: isAdding ? "1" : "0",
          to_express_message: openCustomMsg || selectValue,
        }
      );

      // Only show upgrade popup if trying to ADD interest and upgrade is required
      if (isAdding && response.data.Status === 0 && response.data.message) {
        setApiMsgExpressInt(response.data.message);
        setExpressPopup(true);
        return;
      }

      if (response.status === 200) {
        setIsHeartMarked(!isHeartMarked);

        if (isAdding) {
          toast.success("Your express interest has been sent successfully!");
        } else {
          toast.success("Your express interest has been removed successfully!");
        }
      } else {
        toast.error("Failed to update express interest");
      }
    } catch (error) {
      NotifyError("Error updating express interest");
      console.error("Error updating express interest:", error);
    } finally {
      setOpenCustomMsg("");
      setSelectValue("");
    }
  };

  useEffect(() => {
    if (openCustomMsg || selectValue) {
      handleHeartMark();
    }
  }, [openCustomMsg, selectValue]);

  const openMsgPopUp = () => {
    setOpenCustomMsgShow(true);
  };

  // Declaration for Horoscope State

  //  const [, setSelectedLanguage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [apimsgPhotoReq, setApimsgPhotoReq] = useState("");
  const [apimsgMatchingScore, setApimsgMatchingScore] = useState("");
  //console.log('apimsgMatchingScore', apimsgMatchingScore)

  const sendPhotoRequest = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Send_photo_request/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileData?.basic_details.profile_id,
          status: 1,
        }
      );
      if (response.data.Status === 0 && response.data.message) {
        setApimsgPhotoReq(response.data.message);
        setBookMarkPopup(true);
        return;
      }
      if (response.status >= 200 || response.status >= 204) {
        NotifySuccess("Your photo interest request has been sent successfully!");
      } else {
        NotifyError("Something went wrong, please try again later");
      }

      return response.data;
    } catch (error: any) {
      console.error(
        "Error sending photo request:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const generatePoruthamPDF = async () => {
    try {
      const response = await axios.get(
        `https://app.vysyamala.com/auth/generate-porutham-pdf-mobile/${loginuser_profileId}/${idparam}/`,
        // const response = await apiClient.get(
        //   `/auth/generate-porutham-pdf-mobile/${loginuser_profileId}/${idparam}/`,
        {
          responseType: "blob", // Needed for PDF download
        }
      );

      const contentType = response.headers["content-type"];

      // 📌 Case 1: Server returned JSON (error)
      if (contentType && contentType.includes("application/json")) {
        const text = await response.data.text(); // Convert blob to text
        const json = JSON.parse(text);
        if (json.status === "failure" && json.message) {
          setApimsgMatchingScore(json.message);
          setMatchingScorePopup(true);
          return;
        }
        NotifyError(json.message || "Unexpected error from server.");
        return;
      }

      // 📌 Case 2: Server returned PDF
      if (response.status === 200 && contentType.includes("application/pdf")) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");

        // Optional: revoke URL later to free memory
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        NotifyError("Failed to generate compatibility report.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          if (typeof errorData === "object" && errorData !== null) {
            setApimsgMatchingScore(
              errorData.message || "No access to see the compatibility report"
            );
          } else {
            setApimsgMatchingScore("No access to see the compatibility report");
          }
        } else {
          setApimsgMatchingScore("Failed to generate compatibility report");
        }
      } else {
        setApimsgMatchingScore("An unexpected error occurred");
      }
      setMatchingScorePopup(true);
    }
  };


  useEffect(() => {
    const fetchProfileData = async () => {

      try {
        const response = await apiClient.post('/auth/Get_prof_list_match/', {
          profile_id: loginuser_profileId,
        });
        // Assuming the response data is in response.data
        // setArrayValues(response.data);
        console.log("profileids", response.data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [loginuser_profileId]);

  // const handleSelectLanguage = (language: string) => {
  //   setSelectedLanguage(language);
  //   handleDownloadPdf();
  //   setIsOpen(false);
  // };

  // Personal Notes Popup
  const [showPersonalNotes, setShowPersonalNotes] = useState(false);
  const handlePersonalNotesPopup = () => {
    setShowPersonalNotes(!showPersonalNotes);

  };

  const closePersonalNotesPopup = () => {
    setShowPersonalNotes(false);
  };

  // Personal Notes Popup
  const [showVysassist, setShowVysassist] = useState(false);

  // const navigate = useNavigate();
  // const handleVysassistpopup = () => {
  //   setShowVysassist(!showVysassist);
  // };
  const handleVysassistpopup = () => {
    try {
      setLoading(true);
      console.log("VysAssit LOading------------")
      setShowVysassist(true);
    } finally {
      setLoading(false);
    }

  };

  const closeVysassistpopup = () => {
    setShowVysassist(false);
  };


  // const [isShareVisible, setIsShareVisible] = useState(false);

  // const toggleShareVisibility = () => {
  //   setIsShareVisible(!isShareVisible);
  // };

  // const closeShareModal = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if ((e.target as HTMLElement).className.includes("modal-overlay")) {
  //     setIsShareVisible(false);
  //   }
  // };

  useEffect(() => {
    if (storedPlanId === "0") {
      navigate("/MembershipPlan");
    }
  }, [storedPlanId]);

  // Horoscope Download Function
  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.target = '_blank'; // Open in a new tab
    // link.href = `https://app.vysyamala.com/auth/generate-pdf/${loginuser_profileId}/${idparam}`;
    link.href = `https://app.vysyamala.com/auth/New_horoscope_black/${idparam}/${loginuser_profileId}/`;
    // link.href = `http://103.214.132.20:8000/auth/generate-pdf/${loginuser_profileId}/${idparam}`;
    link.download = `pdf_${idparam}.pdf`; // Customize the file name
    link.click();
  };
  const handleDownloadColorPdf = () => {
    const link = document.createElement("a");
    link.target = '_blank'; // Open in a new tab
    // link.href = `https://app.vysyamala.com/auth/generate-pdf/${loginuser_profileId}/${idparam}`;
    link.href = `https://app.vysyamala.com/auth/New_horoscope_color/${idparam}/${loginuser_profileId}/`;
    // link.href = `http://103.214.132.20:8000/auth/generate-pdf/${loginuser_profileId}/${idparam}`;
    link.download = `pdf_${idparam}.pdf`; // Customize the file name
    link.click();
  };
  const horoscopeLink = profileData?.basic_details?.horoscope_link
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // const handleSelectLanguage = (language: SetStateAction<string | null>) => {
  //   setSelectedLanguage(language);
  //   setIsOpen(false); // Close the language dropdown
  //   if (language === "Tamil" || language === "English") {
  //     setIsPdfMenuOpen(true); // Open the PDF menu if Tamil is selected
  //   } else {
  //     setIsPdfMenuOpen(false); // Close the PDF menu for other languages
  //   }
  // };

  const handleViewPdf = () => {
    handleDownloadPdf();
    // console.log(`Viewing PDF in ${selectedLanguage}`);
    // Add your logic to view the PDF in the selected language
  };

  const handleColorViewPdf = () => {
    handleDownloadColorPdf();
    // console.log(`Viewing PDF in ${selectedLanguage}`);
    // Add your logic to view the PDF in the selected language
  };

  // if (loading) {
  //   return <div>Loading Divya...</div>;
  // }

  // // Get the 'from' parameter from the URL
  // const fromView = queryParams.get("from");
  //  const location = useLocation();
  // const navigate = useNavigate();

  // Get the navigation state with default values
  const navigationState = location.state || {};
  //const { from = '', pageNumber = 1 } = navigationState;
  const { from = '', pageNumber = 1, searchState = {}, sortBy = 'datetime' } = navigationState;

  const handleBackClick = () => {

    const queryParams = new URLSearchParams(location.search);
    const orderBy = queryParams.get('order_by') || '1';

    if (from === 'MatchingProfiles' && searchState) {
      // Restore all search state to sessionStorage
      Object.entries(searchState).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
      });

      // Navigate back with order_by preserved (but hidden in display)
      navigate(`/LoginHome/MatchingProfiles?page=${pageNumber}&orderBy=${orderBy}`, {
        state: {
          from,
          pageNumber,
          searchState: {
            ...searchState,
            sortOrder: orderBy // Ensure sortOrder is preserved
          }
        },
        replace: true
      });
      return;
    }

    if (from === 'LoginHome' && searchState) {
      Object.entries(searchState).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
      });

      navigate(`/LoginHome?page=${pageNumber}&orderBy=${orderBy}`, {
        state: {
          from,
          pageNumber,
          searchState: {
            ...searchState,
            sortOrder: orderBy
          }
        },
        replace: true
      });
      return;
    }
    // Handle navigation based on where we came from
    switch (from) {
      case 'dashboard':
        navigate('/Dashboard');
        break;
      case 'viewedProfiles':
        navigate(`/Dashboard/viewedprofiles?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      // case 'LoginHome':
      //   navigate(`/LoginHome/MatchingProfiles?page=${pageNumber}`);
      //   break;

      case 'MutualInterest':
        navigate(`/Dashboard/MutualInterest?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'Wishlisting':
        navigate(`/Dashboard/Wishlisting?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'interestSent':
        navigate(`/Dashboard/interestsent?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'myVisitors':
        navigate(`/Dashboard/myvisitors?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'ViewAllFeaturedProfiles':
        navigate(`/Dashboard/ViewAllFeaturedProfiles?page=${pageNumber}`);
        break;
      case 'Search':
        navigate(`/Search?page=${pageNumber}`);
        break;
      case 'SearchProfiles':
        navigate('/Search/SearchProfiles');
        break;
      // case 'LoginHome':
      //   navigate(`/LoginHome?page=${pageNumber}`);
      //   break;
      case 'suggestedProfiles':
        navigate('/suggestedprofiles');
        break;
      case 'Gallery':
        navigate(`/Dashboard/Gallery?page=${pageNumber}`);
        break;
      case 'PhotoRequest':
        navigate(`/Dashboard/PhotoRequest?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'PersonalNotes':
        navigate(`/Dashboard/PersonalNotes?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'VysAssit':
        navigate(`/Dashboard/VysAssit?page=${pageNumber}&sortBy=${sortBy}`);
        break;
      case 'OtherSettings':
        navigate(`/Dashboard/OtherSettings?page=${pageNumber}`);
        break;
      default:
        navigate(-1); // Fallback: go back in history
    }
  };

  return (
    <div>
      <div className="bg-grayBg pt-[40px] pb-[54px] max-md:py-16 max-sm:py-10">
        <div className="container mx-auto">
          {/* <div className="flex items-start mb-5">
            {/* <IoArrowBackOutline onClick={handleBackClick} className="text-[24px] mr-2 cursor-pointer" /> */}
          {/* <h4 className="text-[24px] text-vysyamalaBlackSecondary font-bold max-sm:text-[20px]">
              {" "}
              Profile Details
              <span className="text-sm text-primary"> (234)</span>
            </h4> 
          </div> */}
          <div className="flex items-start mb-5">
            <IoArrowBackOutline
              // onClick={() => {
              //   if (fromView) {
              //     navigate(`/Dashboard?key=${fromView}`);
              //   } else {
              //     navigate(-1);
              //   }
              // }}
              onClick={handleBackClick}
              className="text-[24px] mr-2 cursor-pointer text-vysyamalaBlackSecondary"
              title="Go back"
            />
          </div>

          {loading ? (
            <div className="w-fit mx-auto py-40">
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
          ) : showGenderRestrictionPopup ? (
            // Show ONLY the popup when there's a restriction
            <GenderRestrictionPopup
              text={genderRestrictionMessage}
            // closePopup={() => {
            //   setShowGenderRestrictionPopup(false);
            //   handleBackClick(); // Navigate back after closing
            // }}
            />
          ) : profileData ? (
            <div className="grid grid-rows-1 grid-cols-3 justify-start items-start space-x-10 max-lg:grid-cols-1 max-lg:space-x-0">
              <div>
                <ProfileSlickView
                  // GetProfileDetMatch={GetProfileDetMatch}
                  profileId={profileData?.basic_details.profile_id}
                  photoLock={PhotoPasswordlock}
                />
              </div>

              {/* Profile Details */}
              <div className="col-span-2">
                <div className="flex justify-between items-center mt-5 gap-2 max-sm:flex-col-reverse max-sm:items-start max-sm:mb-2">
                  <div className="">
                    <h4 className="flex items-center text-[30px] text-secondary font-bold mb-3 max-lg:text-[28px] max-md:text-[24px] max-sm:text-[20px]">
                      {profileData?.basic_details.profile_name}
                      {profileData?.basic_details.verified === 1 && (
                        <MdVerifiedUser className="text-checkGreen ml-2" />
                      )}
                    </h4>
                  </div>

                  {/* Icons */}
                  <div className="flex justify-center items-center space-x-10 max-sm:flex-wrap max-sm:w-full max-sm:justify-evenly">
                    {/* <div>
                    <IoShareSocialSharp
                      title="Share Profile"
                      className="text-[22px] text-vysyamalaBlack cursor-pointer"
                      onClick={toggleShareVisibility}
                    />

                    Share Component here
                    {isShareVisible && (
                      // <Share closePopup={toggleShareVisibility} />
                      <Share
                        closePopup={toggleShareVisibility}
                        profileId={profileData?.basic_details.profile_id}
                        profileName={profileData?.basic_details.profile_name}
                        age={profileData?.personal_details.age}
                        starName={profileData?.horoscope_details.star_name}
                      />
                    )}
                  </div> */}

                    <div>
                      {/* <MdBookmarkBorder title="Bookmark Profile" className="text-[22px] text-vysyamalaBlack cursor-pointer" /> */}
                      {isBookmarked ? (
                        <MdBookmark
                          title="Wishlist this Profile"
                          onClick={handleBookmark}
                          className="text-[22px] text-vysyamalaBlack cursor-pointer"
                        />
                      ) : (
                        <MdBookmarkBorder
                          title="Wishlist this Profile"
                          onClick={handleBookmark}
                          className="text-[22px] text-vysyamalaBlack cursor-pointer"
                        />
                      )}
                    </div>

                    <div>
                      <img
                        src={PersonalNotes}
                        onClick={handlePersonalNotesPopup}
                        title="Personal Notes"
                        className="text-[22px] text-vysyamalaBlack cursor-pointer"
                      />
                      {showPersonalNotes && (
                        <PersonalNotesPopup
                          closePopup={closePersonalNotesPopup}
                          profileId={""}
                          profileTo={""}
                        />
                      )}
                    </div>
                    {profileData?.photo_request !== 0 && !isPlan16 && (
                      <div>
                        <TbPhotoHeart
                          onClick={() => sendPhotoRequest()}
                          title="Send Photo Request"
                          className="text-[22px] text-vysyamalaBlack cursor-pointer"
                        />
                      </div>
                    )}
                    {!isPlan16 && (
                      <div>
                        <img
                          src={SupportAgent}
                          onClick={handleVysassistpopup}
                          title="Vys Assist"
                          className="text-[22px] text-vysyamalaBlack cursor-pointer"
                        />
                        {showVysassist && (
                          <VysAssistPopup
                            profileData={vysAssistData}
                            closePopup={closeVysassistpopup} />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[20px] text-primary font-bold mb-3 max-md:text-[16px]">
                  {profileData?.basic_details.profile_id}
                </p>

                <div className="flex justify-between items-center relative max-sm:flex-col max-sm:items-start">
                  {/* Profile Details Content */}
                  <div>
                    {/* Age & height */}
                    <div className="flex justify-start gap-4 items-center mb-3  max-lg:flex-wrap max-sm:gap-3 max-sm:flex-col max-sm:items-start">
                      {/* {profileData?.personal_details?.age&& profileData.personal_details.age == "" && profileData.personal_details.age == null && ( */}
                      {profileData?.personal_details?.age && profileData.personal_details.age !== null && (
                        <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px]">
                          Age :
                          <span className="font-normal">
                            {" "}
                            {profileData?.personal_details.age} years
                          </span>
                        </h5>
                      )}
                      {/* )} */}


                      {profileData?.personal_details?.height && profileData.personal_details.height !== "" && profileData.personal_details.height !== null && (
                        <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px]">
                          Height :
                          <span className="font-normal">
                            {" "}
                            {profileData?.personal_details.height} cms
                          </span>
                        </h5>
                      )}
                    </div>

                    {/* <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                    Weight :
                    <span className="font-normal">
                      {" "}
                      {profileData?.personal_details.weight} kg
                    </span>
                  </h5> */}

                    {profileData?.personal_details?.weight && profileData.personal_details.weight !== "" && profileData.personal_details.weight !== null && Number(profileData.personal_details.weight) !== 0 && (
                      <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                        Weight:
                        <span className="font-normal">
                          {profileData.personal_details.weight} kg
                        </span>
                      </h5>
                    )}

                    
                    {/* Star & Gothram */}
                    <div className="flex justify-start gap-4 items-center mb-3 max-lg:flex-wrap max-sm:gap-3 max-sm:flex-col max-sm:items-start">
                      {profileData?.horoscope_details?.star_name &&
                        profileData.horoscope_details.star_name !== "" &&
                        profileData.horoscope_details.star_name !== null && (
                          <>
                            {(() => {
                              const padham = profileData?.horoscope_details?.padham;
                              const showPadham = padham &&
                                padham !== "" &&
                                padham !== null &&
                                padham !== "0" &&
                                padham !== 0;

                              return (
                                <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                                  Star :
                                  <span className="font-normal">
                                    {" "}
                                    {profileData.horoscope_details.star_name}
                                    {showPadham && ` - ${padham}`}
                                  </span>
                                </h5>
                              );
                            })()}
                          </>
                        )}

                      {profileData?.horoscope_details?.surya_gothram &&
                        profileData.horoscope_details.surya_gothram !== "" &&
                        profileData.horoscope_details.surya_gothram !== null && (
                          <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                            Gothram :
                            <span className="font-normal">
                              {" "}
                              {profileData?.horoscope_details.surya_gothram}
                            </span>
                          </h5>
                        )}
                    </div>

                    {profileData?.education_details.profession && profileData.education_details.profession !== "" && profileData.education_details.profession !== null && (
                      <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                        Profession :
                        <span className="font-normal">
                          {" "}
                          {profileData?.education_details.profession}
                        </span>
                      </h5>
                    )}

                    {profileData?.education_details.education_level && profileData.education_details.education_level !== "" && profileData.education_details.education_level !== null && (
                      <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                        Education :
                        <span className="font-normal">
                          {" "}
                          {profileData?.education_details.education_level}
                        </span>
                      </h5>)}

                    {profileData?.education_details.degeree && profileData.education_details.degeree !== "" && profileData.education_details.degeree !== null && (
                      <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                        Degree :
                        <span className="font-normal">
                          {" "}
                          {profileData?.education_details.degeree}
                        </span>
                      </h5>)}

                    {profileData?.basic_details.about && profileData.basic_details.about !== "" && profileData.basic_details.about !== null && (
                      <h5 className="text-[18px] text-ash font-semibold max-sm:text-[16px] mb-3">
                        About :
                        <span className="font-normal">
                          {" "}
                          {profileData?.basic_details.about}
                        </span>
                      </h5>)}

                    <div className="flex justify-start items-center gap-3 mt-3 max-2xl:flex-wrap max-sm:hidden">
                      {/* Horoscope Available */}
                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-[4px] text-sm text-ashSecondary font-medium">
                          <MdOutlineGrid3X3 className="mr-2" />  {profileData?.basic_details.horoscope_available_text}

                        </p>
                      </div>

                      {/*  Active User */}
                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-[4px] text-sm text-ashSecondary font-medium">
                          <FaUser className="mr-2" /> {profileData?.basic_details.user_status}
                        </p>
                      </div>

                      {/* Last Visit */}
                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-[4px] text-sm text-ashSecondary font-medium">
                          <img src={AgeIcon} className="w-4 mr-2" /> Last visited on {profileData?.basic_details.last_visit}                      </p>
                      </div>

                      {/* views */}
                      <div>
                        <p className="flex items-center bg-gray px-2 py-0.5 rounded-[4px] text-sm text-ashSecondary font-medium">
                          <IoEye className="mr-2" />{" "}
                          {profileData?.basic_details.user_profile_views} views
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* {profileData?.basic_details?.matching_score !== undefined &&
                    profileData.basic_details.matching_score > 50 && ( */}
                  {profileData?.basic_details?.matching_score !== undefined && profileData.basic_details?.matching_score > 50 &&
                    profileData.basic_details?.matching_score !== 100 && (
                      <div onClick={() => generatePoruthamPDF()} title="Matching Score pdf" className="max-sm:absolute max-sm:-top-[100px] max-sm:-right-[45px] max-sm:scale-[0.6]">
                        {/* <div title="Matching Score" className="max-sm:absolute max-sm:-top-[100px] max-sm:-right-[45px] max-sm:scale-[0.6]"> */}
                        <MatchingScore
                          scorePercentage={profileData?.basic_details?.matching_score}
                        />
                      </div>
                    )}
                </div>
                {openCustomMsgShow ? (
                  <CustomMessagePopUp
                    custom_message={custom_message}
                    setOpenCustomMsgShow={setOpenCustomMsgShow}
                    setOpenCustomMsg={setOpenCustomMsg}
                    setSelect={setSelectValue}
                  />
                ) : (
                  ""
                )}
                <div className="flex justify-between items-center mt-20 max-sm:flex-wrap max-sm:gap-3  max-sm:mt-3">
                  <div>
                    {/* Buttons */}
                    {interestParam !== "1" && status !== 2 && status !== 3 && loginuser_profileId && (

                      <div className="flex justify-start gap-4 items-end">
                        {!isPlan16 && (
                          <button
                            // onClick={
                            //   custom_message && !isHeartMarked
                            //     ? openMsgPopUp
                            //     : handleHeartMark
                            // }
                            onClick={() => {
                              if (custom_message && !isHeartMarked) {
                                openMsgPopUp();
                              } else {
                                handleHeartMark();
                              }
                            }}
                            className="bg-gradient text-white flex items-center rounded-md px-5 py-3 cursor-pointer"
                          >
                            <FaHeart
                              className={`text-[22px] mr-2 ${isHeartMarked ? "text-red-500" : "text-gray-400"
                                }`}
                            />
                            {
                              isHeartMarked
                                ? "Remove from Interest"
                                : "Express Interest"
                            }

                            {/* Toast Notifications */}
                          </button>
                        )}
                        {profileData?.basic_details.horoscope_available === 1 && (
                          <a

                            href={horoscopeLink}  // Replace with your actual URL
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="bg-white text-main flex items-center rounded-md border-2 px-5 py-2.5 cursor-pointer">
                              <FaTableList className="text-[22px] mr-2" /> Horoscope
                            </button>
                          </a>
                        )}
                      </div>
                    )}

                    {status === 2 ? (
                      // Show message button if numericStatus >= 2
                      // <Link to="/Messages">
                      <button onClick={handleMessageClick} className="text-main flex items-center rounded-lg px-5 py-2.5 cursor-pointer">
                        <MdMessage className="text-[26px] mr-2" /> Message
                      </button>
                      // </Link>
                    ) : (
                      // Show the interest buttons and message button if numericStatus < 2
                      interestParam === "1" && loginuser_profileId && status !== 3 && status !== 2 && (
                        <div className="flex justify-start items-center space-x-5 my-5 max-sm:my-0 ">
                          {/* Accept button */}
                          {hideExpresButton ? (
                            <>
                              <button
                                onClick={() => handleUpdateInterest(idparam, "2")}
                                className="bg-checkGreen text-white flex items-center rounded-lg px-5 py-3 cursor-pointer"
                              >
                                <FaCheckCircle className="text-[22px] mr-2" /> Accept
                              </button>
                              {/* Decline button */}
                              <button
                                onClick={() => handleUpdateInterest(idparam, "3")}
                                className="bg-white text-main flex items-center rounded-lg border-2 px-5 py-2.5 cursor-pointer"
                              >
                                <IoMdCloseCircle className="text-[26px] mr-2" /> Decline
                              </button>
                            </>
                          ) : null}
                          {/* Message button */}
                        </div>
                      )
                    )}

                    {status === 3 && (
                      <p>Your Interest has been rejected</p>
                    )}

                    {/* <div>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0 || loading}
                        className="text-main flex items-center rounded-lg px-5 py-2.5 cursor-pointer bg-gray-200"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={currentIndex === profileIds.length - 1 || loading}
                        className="text-main flex items-center rounded-lg px-5 py-2.5 cursor-pointer bg-gray-200"
                      >
                        Next
                      </button>
                    </div>

                    {loading && <p>Loading...</p>}
                    {error && <p>{error}</p>}
                  </div> */}
                  </div>
                  <div
                    className="flex justify-center items-center space-x-10"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {/* <div className="relative">
                    <p className="flex items-center text-ash cursor-pointer">
                      <MdLocalPrintshop className="text-[22px] mr-2" />
                      Print Horoscope
                      <MdArrowDropDown className="text-[22px] ml-2" />
                    </p>

                    {(isHovered || isOpen) && (
                      <div
                        className="absolute top-4 right-0 mt-2 w-40 bg-white rounded-md shadow-lg"
                        onMouseEnter={() => setIsOpen(true)}
                        onMouseLeave={() => setIsOpen(false)}
                      >
                        <ul>
                          <li
                            className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                            onClick={() => handleSelectLanguage("Tamil")}
                          >
                            Tamil
                          </li>
                          <li
                            className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                            onClick={() => handleSelectLanguage("English")}
                          >
                            English
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {selectedLanguage && (
                    <p className="ml-4 text-ash">
                      Selected: {selectedLanguage}
                    </p>
                  )} */}


                    <div className="relative">
                      <p className="flex items-center text-ash cursor-pointer">
                        <MdLocalPrintshop className="text-[22px] mr-2" />
                        Print Horoscope
                        <MdArrowDropDown className="text-[22px] ml-2" />
                      </p>

                      {(isHovered || isOpen) && (
                        <div
                          className="absolute top-4 right-0 mt-2 w-40 bg-white rounded-md shadow-lg"
                          onMouseEnter={() => setIsOpen(true)}
                          onMouseLeave={() => setIsOpen(false)}
                        >
                          <ul>
                            {/* <li
                              className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                              onClick={() => {
                                handleSelectLanguage("Tamil")
                                { selectedLanguage }
                              }}
                            >
                              Tamil
                            </li> */}
                            {/* <li
                              className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                              onClick={() => {
                                handleSelectLanguage("English")
                                { selectedLanguage }
                              }

                              }
                            >
                              English
                            </li> */}
                            <li
                              className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                              // onClick={handleViewPdf}
                              onClick={handleColorViewPdf}
                            >
                              Download PDF
                            </li>
                            <li
                              className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                              // onClick={handleColorViewPdf}
                              onClick={handleViewPdf}
                            >
                              Print PDF
                            </li>
                          </ul>
                        </div>
                      )}
                      {/* PDF Menu Dropdown */}
                      {(isPdfMenuOpen) && (
                        <div
                          className="absolute top-14 -left-32 mt-2 w-40 bg-white rounded-md shadow-lg"
                          onMouseEnter={() => setIsPdfMenuOpen(true)}
                          onMouseLeave={() => setIsPdfMenuOpen(false)}
                        >
                          <ul>
                            <li
                              className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                              onClick={handleViewPdf}
                            >
                              Download PDF
                            </li>
                            <li
                              className="block px-4 py-2 text-gray-800 hover:bg-gray cursor-pointer"
                              onClick={handleColorViewPdf}
                            >
                              Print PDF
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fallback for unexpected null state
            <div className="text-center py-20">
              <p className="text-gray-500">Profile not available</p>
            </div>
          )}
        </div>
      </div>

      {/* <ProfileDetailsSettingsView />
            <FeaturedProfiles />
            <VysyaBazaar />
            <SuggestedProfiles /> */}
      {
        expressPopup && (
          <ReUseUpGradePopup closePopup={() => setExpressPopup(false)} text={apimsgExpressInt} />
        )
      }
      {
        bookMarkPopup && (
          <ReUseUpGradePopup closePopup={() => setBookMarkPopup(false)} text={apimsgPhotoReq} />
        )
      }
      {
        matchingScorePopup && (
          <ReUseUpGradePopup closePopup={() => setMatchingScorePopup(false)} text={apimsgMatchingScore} />
        )
      }
      {showGenderRestrictionPopup && (
        <GenderRestrictionPopup
          text={genderRestrictionMessage}
        // closePopup={() => setShowGenderRestrictionPopup(false)}
        />
      )
      }
    </div >
  );
};

