import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
//import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../API";

interface PersonalDetails {
  personal_profile_name: string;
  personal_gender: string;
  personal_age: number;
  personal_profile_dob: string;
  personal_place_of_birth: string;
  personal_time_of_birth_str: string;
  personal_profile_height: string;
  personal_profile_marital_status_id: number;
  personal_profile_marital_status_name: string;
  personal_blood_group: string;
  personal_about_self: string;
  personal_about_self_original: string;
  personal_profile_complexion_name: string;
  personal_hobbies: string;
  personal_pysically_changed: string;
  Physically_challenged_details: string;
  personal_profile_for_name: string;
  marital_sts_id: number;
  height_id: number;
  complexion_id: number;
  owner_id: number;
  personal_weight: number;
  personal_body_type: string;
  personal_eye_wear: string;
  mobile_no: string;
}

interface MaritalStatus {
  marital_sts_id: number;
  marital_sts_name: string;
}

interface Height {
  height_id: number;
  height_description: string;
}

interface Complexion {
  complexion_id: number;
  complexion_description: string;
}

interface ProfileHolder {
  owner_id: number;
  owner_description: string;
}

export const Personal = () => {
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonalDetails>>({});
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [selectedMaritalStatusId, setSelectedMaritalStatusId] = useState<
    number | string
  >("");

  const [heights, setHeights] = useState<Height[]>([]);
  const [selectedHeight, setSelectedHeight] = useState<number | string>("");
  const [complexions, setComplexions] = useState<Complexion[]>([]);
  const [selectedComplexion, setSelectedComplexion] = useState<number | string>(
    ""
  );

  const [profileHolders, setProfileHolders] = useState<ProfileHolder[]>([]);
  const [selectedProfileHolder, setSelectedProfileHolder] = useState<
    number | string
  >("");

  const [error, setError] = useState<string | null>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [errors, setErrors] = useState({
    personal_profile_name: "",
    // personal_gender: "",
    // personal_age: "",
    personal_profile_dob: "",
    personal_place_of_birth: "",
    // personal_time_of_birth: "",
    selectedHeight: "",
    // personal_weight: "",
    // personal_eye_wear: "",
    // personal_body_type: "",
    selectedMaritalStatusId: "",
    // personal_blood_group: "",
    // personal_about_self: "",
    selectedComplexion: "",
    // personal_hobbies: "",
    // personal_pysically_changed: "",
    // selectedProfileHolder: "",
  });
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [physicallyChallengedDetails, setPhysicallyChallengedDetails] = useState("");


  useEffect(() => {
    if (personalDetails?.personal_time_of_birth_str) {
      const [time, period] = personalDetails.personal_time_of_birth_str.split(" ");
      const [hours, minutes] = time.split(":");
      setHour(hours);
      setMinute(minutes);
      setPeriod(period && (period === "AM" || period === "PM") ? period : "AM");
    }
  }, [personalDetails]);

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        const response = await apiClient.post(
          "/auth/get_myprofile_personal/",
          {
            profile_id: loginuser_profileId,
          }
        );

        const data = response.data.data;
        setPersonalDetails(data);

        const matchedHeight = heights.find((height) =>
          height.height_description.includes(data.personal_profile_height)
        );
        if (matchedHeight) {
          setSelectedHeight(matchedHeight.height_id);
        }

        const matchedStatus = maritalStatuses.find((status) =>
          status.marital_sts_name.includes(
            data.personal_profile_marital_status_name
          )
        );
        if (matchedStatus) {
          setSelectedMaritalStatusId(matchedStatus.marital_sts_id);
        }

        const matchedComplexion = complexions.find((complexion) =>
          complexion.complexion_description.includes(
            data.personal_profile_complexion_name
          )
        );
        if (matchedComplexion) {
          setSelectedComplexion(matchedComplexion.complexion_id);
        }

        const matchedProfileHolder = profileHolders.find((holder) =>
          holder.owner_description.includes(data.personal_profile_for_name)
        );
        if (matchedProfileHolder) {
          setSelectedProfileHolder(matchedProfileHolder.owner_id);
        }
      } catch (error) {
        console.error("Error fetching personal details:", error);
      }
    };
    fetchPersonalDetails();
  }, [
    loginuser_profileId,
    heights,
    maritalStatuses,
    complexions,
    profileHolders,
    refreshData,
  ]);

  useEffect(() => {
    const fetchMaritalStatuses = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_Marital_Status/"
        );
        const statuses = Object.values(response.data) as MaritalStatus[];
        setMaritalStatuses(statuses);
      } catch (error) {
        console.error("Error fetching marital statuses:", error);
      }
    };
    const fetchHeights = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_Height/"
        );
        const heightsData = Object.values(response.data) as Height[];
        setHeights(heightsData);
      } catch (error) {
        console.error("Error fetching heights:", error);
      }
    };
    const fetchComplexions = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_Complexion/"
        );
        const complexionsData = Object.values(response.data) as Complexion[];
        setComplexions(complexionsData);
      } catch (error) {
        console.error("Error fetching complexions:", error);
      }
    };
    const fetchProfileHolders = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_Profileholder/"
        );
        const profileHoldersData = Object.values(
          response.data
        ) as ProfileHolder[];
        setProfileHolders(profileHoldersData);
      } catch (error) {
        console.error("Error fetching profile holders:", error);
      }
    };

    fetchProfileHolders();
    fetchComplexions();
    fetchHeights();
    fetchMaritalStatuses();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedMaritalStatusId(selectedValue);
    setFormData((prevState) => ({
      ...prevState,
      personal_profile_marital_status_name: selectedValue,
    }));
    localStorage.setItem("maritalStatus", selectedValue);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHeight(e.target.value);
    setFormData((prevState) => ({
      ...prevState,
      personal_profile_height: e.target.value,
    }));
  };

  const handleComplexionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedComplexion(e.target.value);
    setFormData((prevState) => ({
      ...prevState,
      personal_profile_complexion_name: e.target.value,
    }));
  };

  // const handleProfileHolderChange = (
  //   e: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //   setSelectedProfileHolder(e.target.value);
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     personal_profile_for_name: e.target.value,
  //   }));
  // };

  const handleEditClick = () => {
    if (isEditing) {
      setFormData({});
      setPhysicallyChallengedDetails("");
    } else {
      if (personalDetails) {
        // 📝 FIX: Use personal_about_self_original here to set the form data.
        setFormData({
          ...personalDetails,
          personal_about_self: personalDetails.personal_about_self_original,
        });
        setPhysicallyChallengedDetails(
          (personalDetails as any).Physically_challenged_details || ""
        );
      }
    }
    setIsEditing(!isEditing);
  };

  const navigate = useNavigate(); // Initialize navigate
  const handleEditClick1 = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      navigate(-1); // Navigate back to the previous page
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (formData.personal_profile_dob) {
      const age = calculateAge(formData.personal_profile_dob);
      if (age >= 18 && age <= 45) {
        setError(null);
        setFormData((prevState) => ({
          ...prevState,
          personal_age: age,
        }));
      } else if (age < 18) {
        setError("Age must be 18 years or older.");
        setFormData((prevState) => ({
          ...prevState,
          personal_profile_dob: "",
          personal_age: undefined,
        }));
      } else if (age > 45) {
        setError("Age must be 45 years or younger.");
        setFormData((prevState) => ({
          ...prevState,
          personal_profile_dob: "",
          personal_age: undefined,
        }));
      }
    }
  }, [formData.personal_profile_dob]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Initialize timeOfBirth as an empty string.
    let timeOfBirth = "";

    // Check if both 'hour' and 'minute' have values.
    if (hour && minute) {
      // If they do, construct the time string using the selected hour, minute, and period.
      // The 'period' state defaults to "AM" if not explicitly changed.
      const finalPeriod = period || "AM";
      timeOfBirth = `${hour}:${minute} ${finalPeriod}`;
    }

    // Validate time
    // if (!hour || !minute || !period) {
    //   setErrors(prev => ({
    //     ...prev,
    //     personal_time_of_birth: "Time of birth is required"
    //   }));
    //   return;
    // }
    // Validate each field and store errors
    const newErrors = {
      personal_profile_name: !formData.personal_profile_name
        ? "Name is required."
        : "",
      // personal_gender: !formData.personal_gender ? "Gender is required." : "",
      // personal_age: !formData.personal_age ? "Age is required." : "",
      personal_profile_dob: !formData.personal_profile_dob
        ? "Date of birth is required."
        : "",
      personal_place_of_birth: !formData.personal_place_of_birth
        ? "Place of birth is required."
        : "",
      // personal_time_of_birth: !formData.personal_time_of_birth
      //   ? "Time of birth is required."
      //   : "",
      // personal_time_of_birth: !timeOfBirth ? "Time of birth is required." : "",
      selectedHeight: !selectedHeight ? "Height is required." : "",
      // personal_weight: !formData.personal_weight ? "Weight is required." : "",
      // personal_eye_wear: !formData.personal_eye_wear
      //   ? "Eye wear is required."
      //   : "",
      // personal_body_type: !formData.personal_body_type
      //   ? "Body type is required."
      //   : "",
      selectedMaritalStatusId: !selectedMaritalStatusId
        ? "Marital status is required."
        : "",
      // personal_blood_group: !formData.personal_blood_group
      //   ? "Blood group is required."
      //   : "",
      // personal_about_self: !formData.personal_about_self
      //   ? "About self is required."
      //   : "",
      selectedComplexion: !selectedComplexion ? "Complexion is required." : "",
      // personal_hobbies: !formData.personal_hobbies
      //   ? "Hobbies are required."
      //   : "",
      // personal_pysically_changed: !formData.personal_pysically_changed
      //   ? "Physical changes information is required."
      //   : "",
      // selectedProfileHolder: !selectedProfileHolder
      //   ? "Profile holder is required."
      //   : "",
      error: error ? "Please fill all fields correctly." : "", // Assuming 'error' is defined somewhere in your logic
    };

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) {
      setErrors(newErrors); // Update the error state
      toast.error("Please fill all fields correctly.");
      return;
    }

    try {
      const response = await apiClient.post(
        "/auth/update_myprofile_personal/",
        {
          profile_id: loginuser_profileId,
          Profile_name: formData.personal_profile_name,
          Gender: formData.personal_gender,
          personal_age: formData.personal_age,
          Profile_dob: formData.personal_profile_dob,
          place_of_birth: formData.personal_place_of_birth,
          time_of_birth: timeOfBirth,
          Profile_height: selectedHeight,
          weight: formData.personal_weight,
          eye_wear: formData.personal_eye_wear,
          body_type: formData.personal_body_type,
          Profile_marital_status: selectedMaritalStatusId,
          blood_group: formData.personal_blood_group,
          about_self: formData.personal_about_self,
          Profile_complexion: selectedComplexion,
          hobbies: formData.personal_hobbies,
          Pysically_changed: formData.personal_pysically_changed,
          Physically_challenged_details:
            formData.personal_pysically_changed === "yes"
              ? physicallyChallengedDetails
              : "",
          Profile_for: selectedProfileHolder,
          Mobile_no: formData.mobile_no,
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.message);
        setRefreshData((prev) => !prev); // Trigger re-fetch of data

        const getResponse = await apiClient.post(
          "/auth/get_myprofile_personal/",
          {
            profile_id: loginuser_profileId,
          }
        );

        const updatedDetails = getResponse.data.data;

        setPersonalDetails((prevState) => ({
          ...prevState!,
          personal_profile_name: updatedDetails.personal_profile_name,
          personal_gender: updatedDetails.personal_gender,
          personal_age: updatedDetails.personal_age,
          personal_profile_dob: updatedDetails.personal_profile_dob,
          personal_place_of_birth: updatedDetails.personal_place_of_birth,
          personal_time_of_birth: updatedDetails.personal_time_of_birth_str,
          personal_profile_height: updatedDetails.personal_profile_height,
          personal_weight: updatedDetails.personal_weight,
          personal_body_type: updatedDetails.personal_body_type,
          personal_eye_wear: updatedDetails.personal_eye_wear,
          marital_sts_id: updatedDetails.marital_sts_id,
          personal_blood_group: updatedDetails.personal_blood_group,
          personal_about_self: updatedDetails.personal_about_self,
          personal_hobbies: updatedDetails.personal_hobbies,
          personal_pysically_changed: updatedDetails.personal_pysically_changed,
          personal_profile_complexion_name:
            updatedDetails.personal_profile_complexion_name,
          owner_id: updatedDetails.owner_id,
          mobile_no: updatedDetails.mobile_no,
        }));

        setIsEditing(false);
      } else {
        toast.error(
          response.data.message || "Failed to update personal details."
        );
      }
    } catch (error) {
      console.error("Error updating personal details:", error);
      toast.error("Failed to update personal details. Please try again.");
    }
  };

  if (!personalDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="flex items-center text-[30px] text-vysyamalaBlack font-bold mb-5 max-xl:text-[26px] max-md:text-[24px] max-sm:text-[18px] max-sm:justify-between max-sm:mb-2 ">
        Personal Details
        <MdModeEdit
          className="text-2xl text-main ml-2 cursor-pointer max-sm:text-base"
          onClick={handleEditClick}
        />
      </h2>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-rows-1 grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Name:
                <input
                  type="text"
                  name="personal_profile_name"
                  value={formData.personal_profile_name || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only alphabetic characters and spaces
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      handleInputChange(e); // Call your input change handler
                      setErrors((prev) => ({
                        ...prev,
                        personal_profile_name: "",
                      })); // Clear error on valid input
                    }
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                    ${errors.personal_profile_name
                      ? "border-red-500"
                      : "focus:outline-none"
                    }`}
                />
                {errors.personal_profile_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal_profile_name}
                  </p>
                )}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                DOB:
                <input
                  type="date"
                  name="personal_profile_dob"
                  value={formData.personal_profile_dob || ""}
                  onChange={(e) => {
                    handleInputChange(e); // Handle input change
                    // Clear error on change
                    setErrors((prev) => ({
                      ...prev,
                      personal_profile_dob: "",
                    }));
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
      ${errors.personal_profile_dob
                      ? "border-red-500"
                      : "focus:outline-none"
                    }`}
                  // Prevent future dates and ensure date is 18 years ago
                  min="1975-01-01"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                />
                {errors.personal_profile_dob && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal_profile_dob}
                  </p>
                )}
              </label>


              {error && <p className="text-red-500 text-sm">{error}</p>}

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Age:
                <input
                  type="text"
                  name="personal_age"
                  value={formData.personal_age || ""}
                  // onChange={handleInputChange}
                  // className="font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorderfocus:border-blue-500"
                  // disabled
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numeric values
                    if (/^\d*$/.test(value)) {
                      handleInputChange(e);
                      setErrors((prev) => ({ ...prev, personal_age: "" })); // Clear error on change
                    }
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                   `}
                  disabled
                />
                {/* {errors.personal_age && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal_age}
                  </p>
                )} */}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Place of Birth:
                <input
                  type="text"
                  name="personal_place_of_birth"
                  value={formData.personal_place_of_birth || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only alphabetic characters and spaces
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      handleInputChange(e); // Call your input change handler
                      setErrors((prev) => ({
                        ...prev,
                        personal_place_of_birth: "",
                      })); // Clear error on valid input
                    } else {
                      // Set error if input contains invalid characters
                      setErrors((prev) => ({
                        ...prev,
                        personal_place_of_birth:
                          "Only alphabetic characters and spaces are allowed.",
                      }));
                    }
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                   ${errors.personal_place_of_birth
                      ? "border-red-500"
                      : "focus:outline-none"
                    }
                    `}
                />
                {errors.personal_place_of_birth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal_place_of_birth}
                  </p>
                )}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Time of Birth :
                <div className="flex items-center space-x-2">
                  <div className="relative w-full">
                    <select
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className={`font-normal border  px-3 py-3 text-sm border-ashBorder rounded appearance-none w-full focus:outline-none
                      
                        `}
                    >
                      <option value="">Select hour</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h.toString().padStart(2, "0")}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span>:</span>
                  <div className="relative w-full">
                    <select
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      className={`font-normal border px-3 py-3 text-sm border-ashBorder rounded appearance-none w-full focus:outline-none
                       
                        `}
                    >
                      <option value="">Select minute</option>
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <option key={m} value={m.toString().padStart(2, "0")}>
                          {m.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-full">
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
                      className={`font-normal border px-3 py-3 text-sm border-ashBorder rounded appearance-none w-full focus:outline-none 
                       
                        `}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Height:
                <select
                  name="personal_profile_height"
                  value={selectedHeight}
                  onChange={(e) => {
                    handleHeightChange(e);
                    setErrors((prev) => ({ ...prev, selectedHeight: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder
                    ${errors.selectedHeight
                      ? "border-red-500"
                      : "focus:outline-none"
                    }
                  `}
                >
                  <option value="">Select Height</option>
                  {heights.map((height) => (
                    <option key={height.height_id} value={height.height_id}>
                      {height.height_description}
                    </option>
                  ))}
                </select>
                {errors.selectedHeight && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedHeight}
                  </p>
                )}
              </label>

              {/* <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Weight:
                <input
                  type="number"
                  name="personal_weight"
                  value={formData.personal_weight || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, personal_weight: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                    ${
                      errors.personal_weight
                        ? "border-red-500"
                        : "focus:border-blue-500"
                    }
                  `}
                  maxLength={3} // Limit input length to 3 characters
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    if (value.length > 3) {
                      e.currentTarget.value = value.slice(0, 3); // Restrict to max 3 characters
                    }
                  }}
                />
              </label>
              {errors.personal_weight && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.personal_weight}
                </p> // Display error message
              )} */}
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Weight:
                <input
                  type="number"
                  name="personal_weight"
                  value={formData.personal_weight || ""}
                  onChange={handleInputChange}
                  className="font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder focus:border-blue-500"
                  maxLength={3} // Limit input length to 3 characters
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    if (value.length > 3) {
                      e.currentTarget.value = value.slice(0, 3); // Restrict to max 3 characters
                    }
                  }}
                />
              </label>

              {/* <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Body Type:
                <select
                  name="personal_body_type"
                  value={formData.personal_body_type || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, personal_body_type: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                    ${
                      errors.personal_body_type
                        ? "border-red-500"
                        : "focus:border-blue-500"
                    }
                  `}
                >
                  <option value="" disabled>
                    Select Body Type
                  </option>
                  <option value="Slim">Slim</option>
                  <option value="Fat">Fat</option>
                  <option value="Normal">Normal</option>
                </select>
                {errors.personal_body_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal_body_type}
                  </p>
                )}
              </label> */}


              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Body Type:
                <select
                  name="personal_body_type"
                  value={formData.personal_body_type || ""}
                  onChange={handleInputChange}
                  className="font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder"
                >
                  <option value="" disabled>Select Body Type</option>
                  <option value="Slim">Slim</option>
                  <option value="Fat">Fat</option>
                  <option value="Normal">Normal</option>
                </select>
              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Eye Wear:
                <select
                  name="personal_eye_wear"
                  value={formData.personal_eye_wear || ""}
                  onChange={handleInputChange}
                  className="font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder"
                >
                  <option value="" disabled>Select Eye Wear</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>

                </select>
              </label>
            </div>

            <div>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Marital Status:
                <select
                  name="personal_profile_marital_status"
                  value={selectedMaritalStatusId ?? ""}
                  // onChange={handleSelectChange}
                  // className="font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorderfocus:border-blue-500"
                  onChange={(e) => {
                    handleSelectChange(e);
                    setErrors((prev) => ({
                      ...prev,
                      selectedMaritalStatusId: "",
                    })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder
                    ${errors.selectedMaritalStatusId
                      ? "border-red-500"
                      : "focus:border-blue-500"
                    }
                  `}
                >
                  <option value="">Select Marital Status</option>
                  {maritalStatuses.map((status) => (
                    <option
                      key={status.marital_sts_id}
                      value={status.marital_sts_id}
                    >
                      {status.marital_sts_name}
                    </option>
                  ))}
                </select>
                {errors.selectedMaritalStatusId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedMaritalStatusId}
                  </p>
                )}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Blood Group:
                <input
                  type="text"
                  name="personal_blood_group"
                  value={formData.personal_blood_group || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({
                      ...prev,
                      personal_blood_group: "",
                    })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                  `}
                />
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                About Myself:
                <input
                  name="personal_about_self"
                  value={formData.personal_about_self || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, personal_about_self: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                  `}
                />
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Complexion:
                <select
                  value={selectedComplexion}
                  onChange={(e) => {
                    handleComplexionChange(e);
                    setErrors((prev) => ({ ...prev, selectedComplexion: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder
                    ${errors.selectedComplexion
                      ? "border-red-500"
                      : "focus:outline-none"
                    }
                  `}
                >
                  <option value="">Select Complexion</option>
                  {complexions.map((complexion) => (
                    <option
                      key={complexion.complexion_id}
                      value={complexion.complexion_id}
                    >
                      {complexion.complexion_description}
                    </option>
                  ))}
                </select>
                {errors.selectedComplexion && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedComplexion}
                  </p>
                )}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Hobbies:
                <input
                  type="text"
                  name="personal_hobbies"
                  value={formData.personal_hobbies || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, personal_hobbies: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                  `}
                />
              </label>

              <label className="block mb-2 mt-4 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Physical Status:
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="personal_pysically_changed"
                      value="yes"
                      checked={formData.personal_pysically_changed === "yes"}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors((prev) => ({
                          ...prev,
                          personal_pysically_changed: "",
                        })); // Clear error on change
                      }}
                      className="form-radio text-blue-500"
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="personal_pysically_changed"
                      value="no"
                      checked={formData.personal_pysically_changed === "no"}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors((prev) => ({
                          ...prev,
                          personal_pysically_changed: "",
                        })); // Clear error on change
                      }}
                      className="form-radio text-blue-500"
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </label>

              {formData.personal_pysically_changed === "yes" && (
                // <label className="block mb-2 text-[20px] text-ash font-semibold">
                //   Challenged Detail:
                //   <textarea
                //     value={physicallyChallengedDetails}
                //     onChange={(e) => setPhysicallyChallengedDetails(e.target.value)}
                //     // placeholder="Enter challenged details"
                //     className="font-normal border rounded px-3 py-2 w-full focus:outline-none border-ashBorder"
                //     rows={1 }
                //   />
                // </label>
                <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                  Challenged Detail:
                  <input
                    type="text"
                    // name="personal_hobbies"
                    value={physicallyChallengedDetails}
                    onChange={(e) => setPhysicallyChallengedDetails(e.target.value)}
                    className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                  `}
                  />
                </label>
              )}

              {/* <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Profile For:
                <select
                  value={selectedProfileHolder}
                  onChange={(e) => {
                    handleProfileHolderChange(e);
                    setErrors((prev) => ({
                      ...prev,
                      selectedProfileHolder: "",
                    })); // Clear error on change
                  }}
                  className="font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder"
                >
                  <option value="">Select Profile Holder</option>
                  {profileHolders.map((holder) => (
                    <option key={holder.owner_id} value={holder.owner_id}>
                      {holder.owner_description}
                    </option>
                  ))}
                </select>
              </label> */}

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Registered Mobile:
                <input
                  type="text"
                  name="mobile_no"
                  value={formData.mobile_no || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only up to 10 numeric digits
                    if (/^\d{0,10}$/.test(value)) {
                      handleInputChange(e);
                      setErrors((prev) => ({ ...prev, mobile_no: "" }));
                    }
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                  `}
                />
              </label>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end items-center space-x-5 max-sm:flex-col max-sm:flex-wrap-reverse">
              <button
                type="button"
                onClick={handleEditClick1}
                className="text-main flex items-center rounded-lg font-semibold px-5 py-2.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-white text-main flex items-center rounded-lg font-semibold border-2 px-5 py-2.5 cursor-pointer"
              >
                Update Changes
              </button>
            </div>
          )}
        </form>
      ) : (
        <div>
          <div className="grid grid-rows-1 grid-cols-2 max-sm:grid-cols-1">
            <div>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Name :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_profile_name}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Gender :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_gender}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Age :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_age} yrs
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                DOB :
                {/* <span className="font-normal"> {new Date(personalDetails.personal_profile_dob).toLocaleDateString()}</span></h5> */}
                {/* <span className="font-normal"> {personalDetails.personal_profile_dob}</span></h5> */}
                <span className="font-normal">
                  {personalDetails.personal_profile_dob
                    ? new Date(
                      personalDetails.personal_profile_dob
                    ).toLocaleDateString("en-GB")
                    : "Invalid Date"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Place of Birth :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_place_of_birth || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Time of Birth :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_time_of_birth_str || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Height :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_profile_height} cm
                </span>
              </h5>

              {/* <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Weight :
                <span className="font-normal">
                  {personalDetails.personal_weight !== null &&
                    personalDetails.personal_weight !== undefined &&
                    personalDetails.personal_weight === 0
                    ? `${personalDetails.personal_weight} kg`
                    : "N/A"}
                </span>
              </h5> */}
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Weight :
                <span className="font-normal">
                  {personalDetails.personal_weight !== null &&
                    personalDetails.personal_weight !== undefined && personalDetails.personal_weight > 0
                    ? `${personalDetails.personal_weight} kg`
                    : "N/A"}
                </span>
              </h5>




              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Body Type :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_body_type || "N/A"}{" "}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Eye Wear :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_eye_wear || "N/A"}{" "}
                </span>
              </h5>

            </div>
            <div>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Marital Status :
                <span className="font-normal">
                  {personalDetails.personal_profile_marital_status_name || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Blood Group :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_blood_group || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                About Myself :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_about_self || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Complexion :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_profile_complexion_name || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Hobbies :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_hobbies || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Physical Status :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_pysically_changed || "N/A"}
                </span>
              </h5>
              {personalDetails.Physically_challenged_details && (
                <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                  Challenged Detail :
                  <span className="font-normal">
                    {" "}
                    {personalDetails.Physically_challenged_details || "N/A"}
                  </span>
                </h5>
              )}

              {/* <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Profile Created By :
                <span className="font-normal">
                  {" "}
                  {personalDetails.personal_profile_for_name || "N/A"}
                </span>
              </h5> */}

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Registered Mobile :
                <span className="font-normal">
                  {" "}
                  {personalDetails.mobile_no || "N/A"}
                </span>
              </h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
