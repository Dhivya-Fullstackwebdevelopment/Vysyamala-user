/* eslint-disable @typescript-eslint/no-explicit-any */
//import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { Notification } from "../../Components/LoginHeader";
import { ProfileContext } from "../../ProfileContext";
import Spinner from "../../Components/Spinner";
import { useNavigate } from "react-router-dom";
import apiClient from "../../API";
import { toast } from "react-toastify";
import { encryptId } from "../../utils/cryptoUtils";

export const Notifications = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("MyComponent must be used within a ProfileProvider");
  }

  const {
    setFromAge,
    setToAge,
    setFromHeight,
    setToHeight,
    setWorkLocation,
    setAdvanceSelectedProfessions,
    Set_Maritial_Status,
    setAdvanceSelectedEducation,
    setSelectedIncomes,
    setChevvai_dhosam,
    setRehuDhosam,
    setAdvanceSelectedBirthStar,
    setNativeState,
    setPeopleOnlyWithPhoto,
    setAdvanceSearchData
  } = context;

  useEffect(() => {
    setFromAge(0);
    setToAge(0);
    setFromHeight(0);
    setToHeight(0);
    setWorkLocation("");
    setAdvanceSelectedProfessions([]);
    Set_Maritial_Status([]);
    setAdvanceSelectedEducation("");
    setSelectedIncomes("");
    setChevvai_dhosam("no");
    setRehuDhosam("no");
    setAdvanceSelectedBirthStar("");
    setNativeState([]);
    setPeopleOnlyWithPhoto(0);
    setAdvanceSearchData([]);
  }, []);

  const [NotificationData, setNotificationData] = useState<Notification[]>([]);
  const userId = localStorage.getItem("loginuser_profile_id");
  const [dataPerPage, setDataPerPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(5);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalpages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  console.log(totalPages, totalRecords, currentPage, dataPerPage, "ffffffff");
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  // const queryParams = new URLSearchParams(location.search);
  // const idparam = queryParams.get("id") || "";
  const [roomId, setRoomId] = useState("");
  const [isRedirect, setIsRedirect] = useState(false);
  const [userName] = useState("");
  const [showClearAllConfirmation, setShowClearAllConfirmation] = useState(false);

  // Added state to capture the selected from_profile_id for messaging
  //const [, setSelectedFromProfileId] = useState<string | null>(null);
  //console.log("setSelectedFromProfileId", setSelectedFromProfileId)


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
          console.log(selectedProfileData, "selectedProfileData");

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


  const getNotification = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        "/auth/Get_notification_list/",
        {
          profile_id: userId,
          per_page: currentPage,
        }
      );


      setNotificationData(response.data.data);
      setDataPerPage(response.data.per_page);
      setTotalRecords(response.data.total_records);
      setTotalpages(response.data.total_pages);
      console.log(response.data.data, ".....");
      // console.log(notifications, ".....");

    } catch (error: any) {
      console.error(
        "Error fetching notifications:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, userId]);

  useEffect(() => {
    getNotification();
  }, [getNotification]);

  const hasMore = totalRecords > NotificationData.length;

  const handleLoadData = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prevPage) => prevPage + 5);
    }
  }, [hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const windowHeight = document.body.offsetHeight;

      if (scrollPosition >= windowHeight && hasMore) {
        handleLoadData();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleLoadData, hasMore]);

  console.log(currentPage, "currentpage");


  const navigate = useNavigate();

  // const handleUpdatePhoto = () => {
  //   // Perform any necessary actions here, such as updating the photo
  //   navigate('/MyProfile'); // Navigates to the MyProfile page
  // };

  //READ INDIVIDUAL NOTIFICATION (View Profile)
  const markNotificationRead = async (notificationId: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Read_notifications_induvidual/",
        {
          profile_id: userId,
          notification_id: notificationId,
        }
      );

      console.log("Read Individual Notification:", response.data);

      // refresh list
      getNotification();
    } catch (error) {
      console.error("Read Individual Notification Error:", error);
    }
  };

  // CLEAR ALL NOTIFICATIONS
  const handleClearNotifications = async () => {
    setShowClearAllConfirmation(false);
    try {
      const response = await apiClient.post(
        "/auth/Clear_notifications/",
        {
          profile_id: userId,
        }
      );

      console.log("Clear All Response:", response.data);

      if (response.data.Status === 1) {
        toast.success("All Notifications cleared successfully");
        getNotification();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Clear All Notifications Error:", error);
      toast.error("Unable to clear notifications");
    }
  };


  return (
    <>
      <div className="bg-grayBg py-10">
        <div className="container mx-auto">
          <div className="notification-dropdown bg-white rounded-lg shadow-profileCardShadow py-1 z-20">
            <div className="flex justify-between items-center px-3 py-3">
              <h4 className="text-[24px] text-vysyamalaBlack font-bold max-md:text-[18px]">
                Notifications ({totalRecords})
              </h4>
              <button
                className="bg-main text-white text-sm font-semibold px-3 py-2 rounded-md shadow hover:opacity-90"
                //onClick={handleClearNotifications}
                onClick={() => setShowClearAllConfirmation(true)}
              >
                Clear All
              </button>
            </div>

            <div className="">
              {NotificationData.map((data) => (
                <div
                  key={data.id}
                  className="bg-lightFade-pink flex items-start border-b-[1px]  border-gray px-3 py-3 gap-5 max-sm:flex-col"
                >
                  <div>
                    <img
                      src={data.profile_image}
                      alt="Image"
                      className="rounded-full w-[70px] h-auto"
                    />
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-base font-semibold text-vysyamalaBlack ">
                      {/* {data.from_profile_id} {data.message_titile} */}
                      {data.message_titile}
                    </h5>


                    {/* {data.notification_type === "express_interests" ? (
                      // <button className="text-main rounded-md border-[2px] border-main px-2 py-1"
                      // onClick={handleMessage}
                      // >
                      //   Message
                      // </button>
                      <button className="text-main text-[14px]  rounded-md border-[2px] border-main px-2 py-1"
                        onClick={() => {
                          setSelectedFromProfileId(data.from_profile_id); // Set the selected profile ID
                          handleMessage(data.from_profile_id); // Pass the ID to the handler
                        }}
                      >
                        Message
                      </button>

                
                   
                    ) : (
                      <button className="text-main text-[14px]  rounded-md border-[2px] border-main px-2 py-1"
                      onClick={handleUpdatePhoto}
                      >
                        Update my photo
                      </button>
                    )} */}
                    {data.notification_type ===
                      "express_interests_accept" ? (
                      <button className="text-main text-[14px]  rounded-md border-[2px] border-main px-2 py-1"
                        onClick={() => handleMessage(data.from_profile_id)} // Wrap in arrow function

                      >
                        Message
                      </button>
                    ) : (data.notification_type === "Profile_update" || data.notification_type === "express_interests") ? (
                      <button
                        className="text-main rounded-md border-[2px] border-main px-2 py-1"
                        // onClick={() => navigate(`/ProfileDetails?id=${data.from_profile_id}`)}
                        onClick={() => {
                          markNotificationRead(data.id);
                          const secureId = encryptId(data.from_profile_id);
                          navigate(`/ProfileDetails?id=${secureId}`);
                        }}
                      >
                        View Profile
                      </button>
                    ) : (data.notification_type === "Call_request" || data.notification_type === "Vys_assists") ? (
                      // Hide the button for Call_request and Vys_assists
                      null
                    ) : (
                      // <button className="text-main text-[14px]  rounded-md border-[2px] border-main px-2 py-1">
                      //   Update my photo
                      // </button>
                      <button
                        className="text-main text-[14px]  rounded-md border-[2px] border-main px-2 py-1"
                        onClick={() => navigate("/MyProfile")} // Use navigate instead of window.location
                      >
                        Update my photo
                      </button>
                    )}


                    <h5 className="text-[12px] font-normal text-vysyamalaBlack">
                      {data.from_profile_id} {data.to_message}
                    </h5>
                    <p className="text-[12px] font-semibold text-ashSecondary mt-3">
                      {data.time_ago}
                    </p>
                  </div>
                </div>
              ))}

              {loading ? (
                <div className="flex justify-center items-center">
                  <Spinner />
                </div>
              ) : (
                NotificationData.length !== totalRecords && (
                  <button
                    onClick={handleLoadData}
                    className="w-full rounded-md text-main py-3 font-semibold hover:bg-gradient hover:text-white max-md:text-[16px]"
                  >
                    {/* {NotificationData.length === totalRecords
                    ? "You have reached the maximum number of records"
                    : "Load more"} */}
                    Load more
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      {showClearAllConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-100 shadow-2xl">
            <h3 className="text-xl font-bold text-vysyamalaBlack mb-4">
              Clear All Notifications?
            </h3>
            <p className="text-ashSecondary mb-6">
              Are you sure you want to clear all notifications?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearAllConfirmation(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleClearNotifications} // This calls the function to clear notifications AND closes the popup
                className="px-4 py-2 bg-main text-white rounded-md font-semibold hover:bg-red-700 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
