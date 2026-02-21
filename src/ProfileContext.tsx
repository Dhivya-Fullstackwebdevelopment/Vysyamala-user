import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
// import axios from "axios";
import { toast } from "react-toastify";
import apiClient from "./API";

export interface Profile {
  photo_protection: number;
  // matching_score: number | undefined;
  verified: number;
  profile: any;
  profile_id: string;
  profile_name: string;
  profile_img: string;
  profile_age: number;
  profile_gender?: string; // Optional properties
  height?: string;
  weight?: string;
  degree?: string;
  profession?: string;
  location?: string;
  profile_image?: string;
  wish_list?: number;
  user_profile_views?: string;
  star?: string
  matching_score?: string;
  visited_marriage_check: boolean;
  visited_marriage_badge: string | null;
}
export interface DashboardDetails {
  matching_profile_count?: number;  // Optional field
  mutual_int_count: number;
  wishlist_count: number;
  personal_notes_count: number;
  received_int_count: number;
  sent_int_count: number;
  myvisitor_count: number;
  viewed_profile_count: number;
  gallery_count: number;
  photo_int_count: number;
  profile_details: {
    profile_id: string;
    profile_name: string;
    package_name: string | null;
    package_validity: string | null;
    completion_per: string;
    profile_image: string;
  };
  profile_verified: number;
  image_data: { [key: string]: string }[];  // Array of objects with dynamic keys
}
interface ImageDataItem {
  [key: string]: string; // Each item is an object with string keys and string values
}

interface ProfileContextType {
  // Existing properties...
  profileImages?: string[];
  resetAdvancedSearchFilters: () => void;

  // Add this line
  // Remaining properties...
}

export interface Image {
  id: number | null;
  imageUrl: string;
  url: string;
  alt: string;
}


interface ProfileContextType {
  key: boolean;
  setKey: Dispatch<SetStateAction<boolean>>;
  bookmarkedProfiles: Profile[];
  selectedProfiles: Profile[];
  error: string | null;
  selectedProfile: Profile | null;
  setSelectedProfile: (profile: Profile | null) => void;
  addBookmark: (profile: Profile) => void;
  removeBookmark: (profileId: string) => void;
  setSelectedProfiles: (profiles: Profile[]) => void;
  dashboardDetails: DashboardDetails;
  fetchDashboardDetails: () => void;
  perPage: number;
  pageNumber: number;
  totalCount: number;
  setPerPage: Dispatch<SetStateAction<number>>;
  setPageNumber: Dispatch<SetStateAction<number>>;
  setTotalCount: Dispatch<SetStateAction<number>>;
  fromAge: number;
  fromHeight: number;
  toHeight: number;
  ToAge: number;
  setFromAge: Dispatch<SetStateAction<number>>;
  setToAge: Dispatch<SetStateAction<number>>;
  setFromHeight: Dispatch<SetStateAction<number>>;
  setToHeight: Dispatch<SetStateAction<number>>;
  MatchingProfileperPage: number;
  MatchingProfilepageNumber: number;
  MatchingProfiletotalCount: number;
  setMatchingProfilePerPage: Dispatch<SetStateAction<number>>;
  setMatchingProfilePageNumber: Dispatch<SetStateAction<number>>;
  setMatchingProfileTotalCount: Dispatch<SetStateAction<number>>;
  sortOrder: any;
  toggleSortOrder: () => void;
  setSearchProfileData: Dispatch<SetStateAction<string>>;
  searchProfileData: any;
  setMatchingProfileSearchId: Dispatch<SetStateAction<string>>;
  matchingProfileSearchId: string;
  matchingProfile_profession: string;
  matchingProfile_search_age: string;
  matichingSearch_location: string;
  set_MatchingProfile_profession: Dispatch<SetStateAction<string>>;
  set_MatchingProfile_search_age: Dispatch<SetStateAction<string>>;
  Set_Search_location: Dispatch<SetStateAction<string>>;
  userProfile: string;
  setUserProfile: Dispatch<SetStateAction<string>>;
  maritial_Status: number[];
  Set_Maritial_Status: Dispatch<SetStateAction<number[]>>;
  fieldofstudy: number[];
  setfieldofstudy: Dispatch<SetStateAction<number[]>>

  AdvanceselectedProfessions: number[];
  setAdvanceSelectedProfessions: Dispatch<SetStateAction<number[]>>;
  setAdvanceSelectedEducation: Dispatch<SetStateAction<string>>;
  selectedAdvanceEducation: string;
  setSelectedIncomes: Dispatch<SetStateAction<string>>;
  selectedIncomes: string;
  setSelectedMaxIncomes: Dispatch<SetStateAction<string>>;
  selectedMaxIncomes: string;
  setChevvai_dhosam: Dispatch<SetStateAction<string>>;
  chevvai_dhosam: string;
  setRehuDhosam: Dispatch<SetStateAction<string>>;
  rehuDhosam: string;
  advanceSelectedBirthStar: string;
  setAdvanceSelectedBirthStar: Dispatch<SetStateAction<string>>;
  nativeState: string[];
  setNativeState: Dispatch<SetStateAction<string[]>>;
  workLocation: string;
  setWorkLocation: Dispatch<SetStateAction<string>>;
  setPeopleOnlyWithPhoto: Dispatch<SetStateAction<number>>;
  peopleOnlyWithPhoto: number;
  advanceSearchData: Profile[];
  setAdvanceSearchData: Dispatch<SetStateAction<Profile[]>>;
  gridListCardData: Profile[];
  setGridListCardData: Dispatch<SetStateAction<Profile[]>>;
  setTotalRecords: Dispatch<SetStateAction<number>>;
  TotalRecords: number;
  totalPage: number;
  setTotalPage: Dispatch<SetStateAction<number>>;
  perWhistListPage: number;
  setWhistListPerpage: Dispatch<SetStateAction<number>>;
  images: Image[];
  setImages: Dispatch<SetStateAction<Image[]>>;
  zoomImage: string | null;
  handleMouseEnter: (imageUrl: string | null) => void;
  handleMouseLeave: () => void;
  fetchImages: () => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState<Profile[]>(
    () => {
      const savedBookmarks = localStorage.getItem("bookmarkedProfiles");
      return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    }
  );

  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>(() => {
    const savedSelectedProfiles = localStorage.getItem("selectedProfiles");
    return savedSelectedProfiles ? JSON.parse(savedSelectedProfiles) : [];
  });


  //viewedProfile

  const [sortOrder, setSortOrder] = useState<string>("1");

  // Function to toggle the sort order
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "1" ? "2" : "1"));
  };

  //whistlist
  const [TotalRecords, setTotalRecords] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [perWhistListPage, setWhistListPerpage] = useState<number>(0);

  const [searchProfileData, setSearchProfileData] = useState<any>([]); //advance search page search by id
  const [chevvai_dhosam, setChevvai_dhosam] = useState<string>("No");
  const [perPage, setPerPage] = useState<number>(10);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [fromAge, setFromAge] = useState<number>(0);
  const [ToAge, setToAge] = useState<number>(0);
  const [fromHeight, setFromHeight] = useState<number>(0);
  const [toHeight, setToHeight] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<string>("");
  //matching profile
  const [MatchingProfileperPage, setMatchingProfilePerPage] =
    useState<number>(20);
  const [MatchingProfilepageNumber, setMatchingProfilePageNumber] =
    useState<number>(1);
  const [MatchingProfiletotalCount, setMatchingProfileTotalCount] =
    useState<number>(0);
  const [matchingProfileSearchId, setMatchingProfileSearchId] =
    useState<string>("");
  const [matchingProfile_profession, set_MatchingProfile_profession] =
    useState<string>("");
  const [matchingProfile_search_age, set_MatchingProfile_search_age] =
    useState<string>("");
  const [matichingSearch_location, Set_Search_location] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [dashboardDetails, setDashboardDetails] =
    useState<DashboardDetails | any>();
  const [profileImages, setProfileImages] = useState<string[]>([]);

  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const [AdvanceselectedProfessions, setAdvanceSelectedProfessions] = useState<
    number[]
  >([]);
  const [nativeState, setNativeState] = useState<string[]>([]);
  const [selectedAdvanceEducation, setAdvanceSelectedEducation] =
    useState<string>("");
  const [workLocation, setWorkLocation] = useState<string>("");
  const [selectedIncomes, setSelectedIncomes] = useState<string>("");
  const [selectedMaxIncomes, setSelectedMaxIncomes] = useState<string>("");
  const [advanceSearchData, setAdvanceSearchData] = useState<Profile[]>([]);
  const [gridListCardData, setGridListCardData] = useState<Profile[]>([]);
  const [peopleOnlyWithPhoto, setPeopleOnlyWithPhoto] = useState<number>(0);
  //advance search
  const [advanceSelectedBirthStar, setAdvanceSelectedBirthStar] =
    useState<string>("");
  const [maritial_Status, Set_Maritial_Status] = useState<number[]>([]);
  const [fieldofstudy, setfieldofstudy] = useState<number[]>([]);
  const [rehuDhosam, setRehuDhosam] = useState<string>("No");
  const [images, setImages] = useState<Image[]>([])
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [key, setKey] = useState<boolean>(false);

  // const defaultImageUrl =
  // "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg";

  const handleMouseEnter = (imageUrl: string | null) => {
    if (imageUrl) setZoomImage(imageUrl);
  };

  const handleMouseLeave = () => {
    setZoomImage(null);
  };

  // const fetchImages = async () => {
  //   try {
  //     const loginUserProfileId = localStorage.getItem("loginuser_profile_id");
  //     if (!loginUserProfileId) throw new Error('Profile ID not found');

  //     const response = await apiClient.post(
  //       '/auth/Get_profile_images/',
  //       { profile_id: loginUserProfileId }
  //     );

  //     console.log('Fetched images response:', response.data.data);

  //     if (response.data.Status === 1) {
  //       const imageObjects: Image[] = response.data.data.map((img: any) => ({
  //         id: img.id,
  //         imageUrl: `${img.image}?t=${new Date().getTime()}`, // Add timestamp to avoid caching
  //       }));

  //       // Fill up to 10 images with default if fewer than 10
  //       const filledImages = [
  //         ...imageObjects,
  //         ...Array(Math.max(0, 10 - imageObjects.length))
  //         .fill({
  //           id: null,
  //           imageUrl: defaultImageUrl,
  //         }),
  //       ];

  //       console.log('Processed images:', filledImages);
  //       setImages(filledImages);
  //     } else {
  //       console.error('Failed to fetch images:', response.data.message);
  //       setImages(Array(10).fill({ id: null, imageUrl: defaultImageUrl }));
  //     }
  //   } catch (error) {
  //     console.error('Error fetching images:', error);
  //     setImages(Array(10).fill({ id: null, imageUrl: defaultImageUrl }));
  //   }
  // };


  // const fetchImages = async () => {
  //   try {
  //     const loginUserProfileId = localStorage.getItem("loginuser_profile_id");
  //     if (!loginUserProfileId) throw new Error('Profile ID not found');

  //     const cacheKey = `images_${loginUserProfileId}`;
  //     const cached = localStorage.getItem(cacheKey);

  //     if (cached) {
  //       setImages(JSON.parse(cached));
  //       return;
  //     }

  //     const response = await apiClient.post(
  //       '/auth/Get_profile_images/',
  //       { profile_id: loginUserProfileId }
  //     );

  //     //console.log('Fetched images response:', response.data.data);

  //     if (response.data.Status === 1) {
  //       // Process the actual images from the response
  //       const imageObjects: Image[] = response.data.data.map((img: any) => ({
  //         id: img.id,
  //         imageUrl: `${img.image}?t=${new Date().getTime()}`, // Add timestamp to avoid caching
  //         url: img.image, // Assuming this is needed for your Image interface
  //         alt: "Profile image" // Add alt text as needed
  //       }));

  //       // Only set the actual images, don't fill with defaults
  //       localStorage.setItem(cacheKey, JSON.stringify(images));
  //       setImages(imageObjects);
  //     } else {
  //       console.error('Failed to fetch images:', response.data.message);
  //       setImages([]); // Set empty array if no images are available
  //     }
  //   } catch (error) {
  //     console.error('Error fetching images:', error);
  //     setImages([]); // Set empty array on error
  //   }
  // };

  const fetchImages = async () => {
    try {
      const loginUserProfileId = localStorage.getItem("loginuser_profile_id");
      if (!loginUserProfileId) throw new Error('Profile ID not found');

      const response = await apiClient.post(
        '/auth/Get_profile_images/',
        { profile_id: loginUserProfileId }
      );

      if (response.data.Status === 1) {
        // Process the actual images from the response
        const imageObjects: Image[] = response.data.data.map((img: any) => ({
          id: img.id,
          imageUrl: img.image, // Use the direct URL from response
          url: img.image,
          alt: "Profile image"
        }));

        setImages(imageObjects);
      } else {
        console.error('Failed to fetch images:', response.data.message);
        setImages([]); // Set empty array if no images are available
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]); // Set empty array on error
    }
  };

  // Fetch images when the component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchDashboardDetails = async () => {
    if (!loginuser_profileId) {
      setError("No profile ID found in session.");
      return;
    }
    try {
      const response = await apiClient.post(
        "/auth/Get_dashboard_details/",
        {
          profile_id: loginuser_profileId,
        }
      );

      if (response.data.Status === 1) {
        const data = response.data.data;
        setDashboardDetails(data);

        // Map image_data to an array of image URLs
        const images = data.image_data.map((item: ImageDataItem) => {
          const imageUrl = Object.values(item)[0]; // Extract URL from object
          return imageUrl;
        });
        setProfileImages(images);
      } else {
        setError(`Error fetching dashboard details: ${response.data.Message}`);
      }
    } catch (error) {
      setError("Error fetching dashboard details. Please try again.");
      console.error("Error fetching dashboard details:", error);
    }
  };



  useEffect(() => {
    localStorage.setItem(
      "bookmarkedProfiles",
      JSON.stringify(bookmarkedProfiles)
    );
  }, [bookmarkedProfiles]);

  useEffect(() => {
    localStorage.setItem("selectedProfiles", JSON.stringify(selectedProfiles));
  }, [selectedProfiles]);

  const addBookmark = async (profile: Profile) => {
    if (!loginuser_profileId) {
      setError("No profile ID found in session.");
      toast.error("No profile ID found in session.");
      return;
    }

    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profile.profile_id,
          status: "1",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Status === 1) {
        setBookmarkedProfiles((prev) => [...prev, profile]);
        toast.success(`Profile ${profile.profile_id} bookmarked successfully!`);
        //console.log(`Profile ${profile.profile_id} bookmarked successfully.`);
      } else {
        setError(`Failed to bookmark profile: ${response.data.Message}`);
        // toast.error(`Failed to bookmark profile: ${response.data.Message}`);
      }
    } catch (error) {
      setError("Error bookmarking profile. Please try again.");
      // toast.error("Error bookmarking profile. Please try again.");
      console.error("Error bookmarking profile:", error);
    }
  };

  const removeBookmark = async (profileId: string) => {
    if (!loginuser_profileId) {
      setError("No profile ID found in session.");
      toast.error("No profile ID found in session.");
      return;
    }

    try {
      const response = await apiClient.post(
        "/auth/Mark_profile_wishlist/",
        {
          profile_id: loginuser_profileId,
          profile_to: profileId,
          status: "0",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Status === 1) {
        setBookmarkedProfiles((prev) =>
          prev.filter((profile) => profile.profile_id !== profileId)
        );
        setSelectedProfiles((prev) =>
          prev.filter((profile) => profile.profile_id !== profileId)
        );
        toast.success(`Profile ${profileId} removed from bookmarks successfully!`);
        //console.log(
        //   `Profile ${profileId} removed from bookmarks successfully.`
        // );
      } else {
        setError(`Failed to remove bookmark: ${response.data.Message}`);
        // toast.error(`Failed to remove bookmark: ${response.data.Message}`);
      }
    } catch (error) {
      setError("Error removing bookmark. Please try again.");
      // toast.error("Error removing bookmark. Please try again.");
      console.error("Error removing bookmark:", error);
    }
  };

  const resetAdvancedSearchFilters = () => {
    setFromAge(0);
    setToAge(0);
    setFromHeight(0);
    setToHeight(0);
    setWorkLocation("");
    setAdvanceSelectedProfessions([]);
    Set_Maritial_Status([]);
    setfieldofstudy([]);
    setAdvanceSelectedEducation("");
    setSelectedIncomes("");
    setSelectedMaxIncomes("");
    setChevvai_dhosam("No");
    setRehuDhosam("No");
    setAdvanceSelectedBirthStar("");
    setNativeState([]);
    setPeopleOnlyWithPhoto(0);
    setAdvanceSearchData([]);
  };

  return (
    <ProfileContext.Provider
      value={{
        key,
        setKey,
        bookmarkedProfiles,
        selectedProfiles,
        error,
        selectedProfile,
        setSelectedProfile,
        addBookmark,
        removeBookmark,
        setSelectedProfiles,
        dashboardDetails,
        profileImages,
        fetchDashboardDetails,
        perPage,
        pageNumber,
        totalCount,
        setPerPage,
        setPageNumber,
        setTotalCount,
        fromAge,
        fromHeight,
        toHeight,
        ToAge,
        setFromAge,
        setToAge,
        setFromHeight,
        setToHeight,
        MatchingProfileperPage,
        MatchingProfilepageNumber,
        MatchingProfiletotalCount,
        setMatchingProfilePerPage,
        setMatchingProfilePageNumber,
        setMatchingProfileTotalCount,
        sortOrder,
        toggleSortOrder,
        searchProfileData,
        setSearchProfileData,
        setMatchingProfileSearchId,
        matchingProfileSearchId,
        matchingProfile_profession,
        matchingProfile_search_age,
        matichingSearch_location,
        set_MatchingProfile_profession,
        set_MatchingProfile_search_age,
        Set_Search_location,
        userProfile,
        setUserProfile,
        Set_Maritial_Status,
        maritial_Status,
        fieldofstudy,
        setfieldofstudy,
        AdvanceselectedProfessions,
        setAdvanceSelectedProfessions,
        selectedAdvanceEducation,
        setAdvanceSelectedEducation,
        setSelectedIncomes,
        selectedIncomes,
        selectedMaxIncomes,
        setSelectedMaxIncomes,
        chevvai_dhosam,
        setChevvai_dhosam,
        rehuDhosam,
        setRehuDhosam,
        advanceSelectedBirthStar,
        setAdvanceSelectedBirthStar,
        nativeState,
        setNativeState,
        workLocation,
        setWorkLocation,
        peopleOnlyWithPhoto,
        setPeopleOnlyWithPhoto,
        advanceSearchData,
        setAdvanceSearchData,
        gridListCardData,
        setGridListCardData,
        TotalRecords,
        setTotalRecords,
        totalPage,
        setTotalPage,
        perWhistListPage,
        setWhistListPerpage,
        images,
        setImages,
        zoomImage,
        handleMouseEnter,
        handleMouseLeave,
        fetchImages,
        resetAdvancedSearchFilters,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
