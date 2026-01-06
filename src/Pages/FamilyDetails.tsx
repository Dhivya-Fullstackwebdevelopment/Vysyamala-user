/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import ContentBlackCard from "../Components/RegistrationForm/ContentBlackCard";
import InputField from "../Components/RegistrationForm/InputField";
import SideContent from "../Components/RegistrationForm/SideContent";
import arrow from "../assets/icons/arrow.png";
import apiClient from "../API";
import { ToastNotification, NotifyError, NotifySuccess, } from "../Components/Toast/ToastNotification";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";

// Define validation schema with zod
const schema = zod.object({
  fathername: zod.string().min(3, "Father name is required"),
  fatherOccupation: zod.string().optional(),
  mothername: zod.string().optional(),
  // familyname: zod.string().min(3, "Family name is required"),
  aboutmyself: zod.string().optional(),
  myhobbies: zod.string().optional(),
  // Modify the weight validation to allow only 3-digit numbers
  // weight: zod.string().optional(),
  weight: zod.string().nullable().optional(),
  bloodGroup: zod.string().optional(),
  no_of_children: zod.string().optional(),
  motherOccupation: zod.string().optional(),
  // brother: zod.number().optional(),
  // marriedBrother: zod.number().optional(),
  // sister: zod.number().optional(),
  // marriedSister: zod.number().optional(),
  familyType: zod.string().optional(),
  familyValue: zod.string().optional(),
  familyStatus: zod.string().optional(),
  propertyDetails: zod.string().optional(),
  propertyWorth: zod.string().optional(),
  // suyaGothram: zod.string().optional(),
  suyaGothram: zod.string().min(1, "SuyaGothram is required"),
  uncle_gothram: zod.string().optional(),
  ancestor_origin: zod.string().optional(),
  aboutMyFamily: zod.string().optional(),
  mother_alive: zod.string().optional(),
  father_alive: zod.string().optional(),
  physicallyChallenged: zod.string().optional(),
  defectDetails: zod.string().optional().nullable(),
});


interface FamilyDetailsInputs {
  fathername: string;
  fatherOccupation: string;
  mothername?: string;
  familyname?: string;
  aboutmyself?: string;
  myhobbies?: string;
  weight?: string;
  body_type?: string;
  eye_wear?: string;
  motherOccupation?: string;
  familyType?: string;
  familyValue?: string;
  familyStatus?: string;
  propertyDetails?: string;
  propertyWorth?: string;
  suyaGothram?: string;
  uncle_gothram?: string;
  ancestor_origin?: string;
  aboutMyFamily?: string;
  no_of_children: string;
  brother: number;
  marriedBrother: number;
  sister: number;
  marriedSister: number;
  bloodGroup?: string;
  physicallyChallenged?: string;
  defectDetails?: string;
  father_alive?: string;
  mother_alive?: string;
}

interface Occupation {
  occupation_id: number;
  occupation_description: string;
}

interface PropertyWorth {
  property_id: number;
  property_description: string;
}

// interface FamilyType {
//   family_id: number;
//   family_description: string;
// }

interface FamilyStatus {
  family_status_id: number;
  family_status_name: string;
  family_status_description: string;
}

interface FamilyValue {
  family_value_id: number;
  family_value_name: string;
}

interface FamilyType {
  family_id: number;
  family_description: string;
}

const FamilyDetails: React.FC = () => {
  const bloodGroups = [
    { type: "A+", abbreviation: "A positive" },
    { type: "A-", abbreviation: "A negative" },
    { type: "B+", abbreviation: "B positive" },
    { type: "B-", abbreviation: "B negative" },
    { type: "AB+", abbreviation: "AB positive" },
    { type: "AB-", abbreviation: "AB negative" },
    { type: "O+", abbreviation: "O positive" },
    { type: "O-", abbreviation: "O negative" },
  ];

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FamilyDetailsInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      physicallyChallenged: "no", // Set "no" as the default value
      father_alive: "Yes",
      mother_alive: "Yes",
    },
  });

  const [selectedBrother, setSelectedBrother] = useState<number | null>(null);
  const [selectedMarriedBrother, setSelectedMarriedBrother] = useState<
    number | null
  >(null);
  const [selectedSister, setSelectedSister] = useState<number | null>(null);
  const [selectedMarriedSister, setSelectedMarriedSister] = useState<
    number | null
  >(null);
  // const [selectedFamilyValue, setSelectedFamilyValue] = useState<string | null>(
  //   null
  // );
  // const [selectedFamilyStatus, setSelectedFamilyStatus] = useState<
  //   string | null
  // >(null);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  console.log(occupations);
  const [, setPropertyworth] = useState<PropertyWorth[]>([]);
  // const [familyTypes, setFamilyTypes] = useState<FamilyType[]>([]);
  // const [familyStatus, setFamilyStatus] = useState<FamilyStatus[]>([]);
  // const [familyValue, setFamilyValue] = useState<FamilyValue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const marriedBrotherContainerRef = useRef<HTMLDivElement>(null);
  const sisterContainerRef = useRef<HTMLDivElement>(null);
  const familyTypeRef = useRef<HTMLDivElement>(null);
  const familyValueRef = useRef<HTMLDivElement>(null);
  const familyStatusRef = useRef<HTMLDivElement>(null);
  const [familyType, setfamilyType] = useState<FamilyType[]>([]);
  const [selectedfamilyTypeId, setSelectedfamilyTypeId] = useState<number | null>(null);
  const [, setSelectedFamilyType] = useState<string | null>(null);
  const [familyValue, setfamilyValue] = useState<FamilyValue[]>([]);
  const [selectedfamilyValueId, setSelectedfamilyValueId] = useState<number | null>(null);
  const [, setSelectedfamilyValue] = useState<string | null>(null);
  const [familyStatus, setfamilyStatus] = useState<FamilyStatus[]>([]);
  const [selectedfamilyStatusId, setSelectedfamilyStatusId] = useState<number | null>(null);
  const [, setSelectedfamilyStatus] = useState<string | null>(null);
  const [bodytyoe, setBodytype] = useState("");
  const [bodywear, setBodyWear] = useState("");
  const maritalStatus = localStorage.getItem("maritalStatus");
  const showChildrenField = maritalStatus && ['2', '3', '5'].includes(maritalStatus);

  const handleFamilyTypeChange = (id: number, name: string) => {
    setSelectedFamilyType(name); // Update the displayed family type description
    setSelectedfamilyTypeId(id); // Store the family type ID in state
    setValue("familyType", id.toString(), { shouldValidate: true }); // Update form value as a string
  };

  const handleFamilyValueChange = (id: number, name: string) => {
    setSelectedfamilyValue(name);
    setSelectedfamilyValueId(id); // Store the Profes_Pref_id in state
    setValue("familyValue", id.toString(), { shouldValidate: true });
  };

  const handleFamilyStatusChange = (id: number, name: string) => {
    setSelectedfamilyStatus(name);
    setSelectedfamilyStatusId(id); // Store the Profes_Pref_id in state
    setValue("familyStatus", id.toString(), { shouldValidate: true });
  };

  useEffect(() => {
    const fetchFamilyTypeData = async () => {
      try {
        const response = await apiClient.post("/auth/Get_FamilyType/");
        setfamilyType(Object.values(response.data));
        //console.log("Get_FamilyType", response.data);
      } catch (error) {
        console.error("Error fetching familytype :", error);
      }
    };

    fetchFamilyTypeData();
  }, []);

  useEffect(() => {
    const fetchFamilyValue = async () => {
      try {
        const response = await apiClient.post("/auth/Get_FamilyValue/");
        setfamilyValue(Object.values(response.data));
        //console.log("Get_FamilyValue", response.data);
      } catch (error) {
        console.error("Error fetching familytype :", error);
      }
    };

    fetchFamilyValue();
  }, []);

  useEffect(() => {
    const fetchFamilyStatus = async () => {
      try {
        const response = await apiClient.post("/auth/Get_FamilyStatus/");
        setfamilyStatus(Object.values(response.data));
        //console.log("Get_FamilyStatus", response.data);
      } catch (error) {
        console.error("Error fetching familytype :", error);
      }
    };

    fetchFamilyStatus();
  }, []);

  useEffect(() => {
    // Function to handle scrolling and focusing
    const handleFocus = (ref: React.RefObject<HTMLDivElement>, error: any) => {
      if (error && ref.current) {
        ref.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        const firstButton = ref.current.querySelector("button");
        if (firstButton) {
          firstButton.focus();
        }
      }
    };

    // Handle focus for each error condition
    handleFocus(marriedBrotherContainerRef, errors.marriedBrother);
    handleFocus(buttonContainerRef, errors.brother);
    handleFocus(sisterContainerRef, errors.sister);
    handleFocus(familyTypeRef, errors.familyType);
    handleFocus(familyValueRef, errors.familyValue);
    handleFocus(familyStatusRef, errors.familyStatus);
  }, [errors.brother, errors.marriedBrother, errors.sister, errors.familyType, errors.familyValue, errors.familyStatus]);

  const physicallyChallengedValue = watch("physicallyChallenged");
  const profileId = localStorage.getItem("profile_id_new");
  const [weight, setWeight] = useState<string>("");
  const [familyName, setFamilyName] = useState<string>("");

  useEffect(() => {
    const fetchFamilyData = async () => {
      if (profileId) {
        try {
          const requestData = {
            profile_id: profileId,
            page_id: 3,
          };

          const response = await apiClient.post(
            `/auth/Get_save_details/`,
            requestData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          //console.log("API Response:", response.data);
          const profileData = response.data.data;
          //console.log("Profile Data:", profileData);

          // Set form values here after fetching data
          setValue("fathername", profileData.father_name);
          setValue("fatherOccupation", profileData.father_occupation);
          setValue("mothername", profileData.mother_name);
          setValue("motherOccupation", profileData.mother_occupation);
          setFamilyName(profileData.family_name);
          setValue("aboutmyself", profileData.about_self);
          setValue("myhobbies", profileData.hobbies);
          setWeight(profileData.weight || "");
          setValue("weight", profileData.weight ?? "");
          setValue("body_type", profileData.body_type);
          setValue("eye_wear", profileData.eye_wear);
          setValue("bloodGroup", profileData.blood_group);
          // setValue("no_of_children", profileData.no_of_children || 0);
          if (['2', '3', '5'].includes((maritalStatus) as string)) {
            setValue("no_of_children", profileData.no_of_children || 0);
          }

          // Handle radio button for physically challenged
          setValue(
            "physicallyChallenged",
            profileData.Pysically_changed === "yes" ? "yes" : "no"
          );
          setValue(
            "mother_alive",
            profileData.mother_alive === "yes" ? "yes" : "no"
          );
          setValue(
            "father_alive",
            profileData.father_alive === "yes" ? "yes" : "no"
          );

          // Set brother and sister values based on the fetched data

          const numberOfBrothers = parseInt(profileData.no_of_brother);
          const numberOfSisters = parseInt(profileData.no_of_sister);
          const numberOfMarriedSisters = parseInt(
            profileData.no_of_sis_married
          );
          const numberOfMarriedBrother = parseInt(
            profileData.no_of_bro_married
          );

          setValue("brother", numberOfBrothers);
          setValue("sister", numberOfSisters);
          setValue("marriedSister", numberOfMarriedSisters);
          setValue("marriedBrother", numberOfMarriedBrother);

          setSelectedBrother(numberOfBrothers);
          setSelectedSister(numberOfSisters);
          setSelectedMarriedSister(numberOfMarriedSisters);
          setSelectedMarriedBrother(numberOfMarriedBrother);

          // Assuming profileData.family_type is coming in as a string
          const familyTypeId = parseInt(profileData.family_type); // Convert family_type to a number

          setSelectedfamilyTypeId(familyTypeId); // Store the family type ID in state

          // Find the corresponding family type description based on the ID
          const selectedFamilyTypeDescription =
            familyType.find((option) => option.family_id === familyTypeId)
              ?.family_description || null;

          setSelectedFamilyType(selectedFamilyTypeDescription); // Set the selected family type description
          setValue("familyType", familyTypeId.toString(), {
            shouldValidate: true,
          }); // Update the form value as a string

          const familyValueId = parseInt(profileData.family_value); // Convert family_type to a number

          setSelectedfamilyValueId(familyValueId); // Store the family type ID in state

          // Find the corresponding family type description based on the ID
          const selectedFamilyValueDescription =
            familyValue.find(
              (option) => option.family_value_id === familyValueId
            )?.family_value_name || null;

          setSelectedfamilyValue(selectedFamilyValueDescription); // Set the selected family type description
          setValue("familyValue", familyValueId.toString(), {
            shouldValidate: true,
          }); // Update the form value as a string

          const familyStatusId = parseInt(profileData.family_status); // Convert family_type to a number

          setSelectedfamilyStatusId(familyStatusId); // Store the family type ID in state

          // Find the corresponding family type description based on the ID
          const selectedFamilyStatusDescription =
            familyStatus.find(
              (option) => option.family_status_id === familyTypeId
            )?.family_status_name || null;

          setSelectedfamilyStatus(selectedFamilyStatusDescription); // Set the selected family type description
          setValue("familyStatus", familyStatusId.toString(), {
            shouldValidate: true,
          }); // Update the form value as a string

          // Set property details, suya gothram, uncle gothram, ancestor origin, about family
          setValue("propertyDetails", profileData.property_details);
          setValue("propertyWorth", profileData.property_worth);
          setValue("suyaGothram", profileData.suya_gothram);
          setValue("uncle_gothram", profileData.uncle_gothram);
          setValue("ancestor_origin", profileData.ancestor_origin);
          setValue("aboutMyFamily", profileData.about_family);
          setValue("body_type", profileData.body_type);
          setValue("eye_wear", profileData.eye_wear);
          setValue("defectDetails", profileData.Physically_challenged_details || "");

        } catch (error) {
          console.error("Error fetching family data:", error);
        }
      } else {
        console.warn("Profile ID not found in sessionStorage");
      }
    };

    fetchFamilyData();
  }, [profileId, setValue]);

  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const response = await apiClient.post(`/auth/Get_Parent_Occupation/`);
        const options = Object.values(response.data) as Occupation[];
        setOccupations(options);
      } catch (error) {
        console.error("Error fetching marital status options:", error);
      }
    };
    fetchOccupations();
  }, []);

  useEffect(() => {
    const fetchPropertyworth = async () => {
      try {
        const response = await apiClient.post(`/auth/Get_Property_Worth/`);
        const options = Object.values(response.data) as PropertyWorth[];
        setPropertyworth(options);
      } catch (error) {
        console.error("Error fetching property worth options:", error);
      }
    };
    fetchPropertyworth();
  }, []);

  const buttonClass = (isSelected: boolean) =>
    isSelected
      ? "bg-secondary text-white"
      : "border-gray hover:bg-secondary hover:text-white";

  const handleBrotherChange = (value: number) => {
    setSelectedBrother(value);
    setValue("brother", value, { shouldValidate: true });
    setSelectedMarriedBrother(null); // Reset married brother selection when brother selection changes
  };

  const handleMarriedBrotherChange = (value: number) => {
    setSelectedMarriedBrother(value);
    setValue("marriedBrother", value, { shouldValidate: true });
  };

  const handleSisterChange = (value: number) => {
    setSelectedSister(value);
    setValue("sister", value, { shouldValidate: true });
    setSelectedMarriedSister(null); // Reset married sister selection when sister selection changes
  };

  const handleMarriedSisterChange = (value: number) => {
    setSelectedMarriedSister(value);
    setValue("marriedSister", value, { shouldValidate: true });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Backspace" ||
      event.key === "Tab" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "Delete" ||
      /^[0-9]$/.test(event.key) // Only allow numbers 0-9
    ) {
      return; // Allow the key event
    }

    // Prevent all other keys
    event.preventDefault();
  };


  const onSubmit: SubmitHandler<FamilyDetailsInputs> = async (data) => {
    try {
      // Format the data as expected by the backend
      const profileId =
        localStorage.getItem("profile_id_new") ||
        localStorage.getItem("loginuser_profile_id");
      if (!profileId) {
        throw new Error("ProfileId not found in sessionStorage");
      }
      const formattedData = {
        profile_id: profileId, // Replace with actual profile ID
        father_name: data.fathername,
        father_occupation: data.fatherOccupation,
        mother_name: data.mothername,
        mother_occupation: data.motherOccupation,
        family_name: familyName.trim(),
        about_self: data.aboutmyself,
        hobbies: data.myhobbies,
        weight: weight,
        // body_type: data.body_type || "",
        // eye_wear: data.eye_wear || "",
        body_type: bodytyoe || "",
        eye_wear: bodywear || "",
        blood_group: data.bloodGroup,
        // no_of_children: data.no_of_children || 0 ,
        ...(maritalStatus && ['2', '3', '5'].includes(maritalStatus) && {
          no_of_children: data.no_of_children || 0,
        }),
        Pysically_changed: physicallyChallengedValue,
        Physically_challenged_details: data.physicallyChallenged === "yes" ? data.defectDetails : "",
        no_of_brother: selectedBrother ?? 0,
        no_of_bro_married: selectedMarriedBrother ?? 0,
        no_of_sister: selectedSister ?? 0,
        no_of_sis_married: selectedMarriedSister ?? 0,
        // family_type: selectedfamilyTypeId,
        // family_value: selectedfamilyValueId,
        // family_status: selectedfamilyStatusId,
        family_type: selectedfamilyTypeId ?? undefined,
        family_value: selectedfamilyValueId ?? undefined,
        family_status: selectedfamilyStatusId ?? undefined,
        about_family: data.aboutMyFamily,
        property_worth: data.propertyWorth,
        property_details: data.propertyDetails,
        uncle_gothram: data.uncle_gothram,
        ancestor_origin: data.ancestor_origin,
        suya_gothram: data.suyaGothram,
        father_alive: data.father_alive,
        mother_alive: data.mother_alive
        // Include other fields as necessary
      };

      //console.log("FamilyDetails:", formattedData);

      // //console.log("Formatted Data:", formattedData);
      console.log("family Submitting data:", data);
      setIsSubmitting(true);
      const response = await apiClient.post(
        `/auth/Family_registration/`,
        formattedData
      );
      setIsSubmitting(false);

      if (response.data.Status === 1) {
        NotifySuccess("Family details saved successfully");

        setTimeout(() => {
          navigate("/EduDetails");
        }, 2000);
      } else {
        // Handle error or show message to the user
        console.error("Error: Response status is not 1", response.data);
      }
    } catch (error) {
      NotifyError("Failed to upload Family details");
      console.error("Error submitting form data:", error);
      setIsSubmitting(false);
    } finally {
      setWeight("");
      setFamilyName("");
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const owner = sessionStorage.getItem("profile_owner");
  const ProfileName = owner === "Ownself" ? "MySelf" : owner;
  console.log(owner, "owner");

  const aboutmyselfValue = watch("aboutmyself", "");

  const myhobbiesValue = watch("myhobbies", "");

  const aboutMyFamilyValue = watch("aboutMyFamily", "");


  const handleKeyDownTextArea = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    value: any
  ) => {
    // Prevent space if input is empty
    if (e.key === " " && value.trim() === "") {
      e.preventDefault();
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = event.target;
    if (id === "body_type") {
      setBodytype(value);
    } else if (id === "eye_wear") {
      setBodyWear(value);
    }
  };

  return (
    <div className="mt-24 max-lg:mt-20">
      <ContentBlackCard
        link="/UploadImages"
        heading="Family Details"
        desc="Please provide details about your family to help potential matches understand your values and lifestyle"
      />
      <div className="mx-auto w-[60%]  my-10  max-2xl:w-[60%] max-xl:w-[80%] max-lg:w-full max-md:w-full max-md:my-5">
        <div className="container mt-5 flex justify-between space-x-24 max-lg:flex-col max-lg:space-x-0 max-lg:gap-y-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-5 mb-5"
          >
            <div className="w-full space-y-5 ">
              {/* Input fields for Father and Mother details */}
              <div>
                <InputField
                  label="Father name"
                  required
                  {...register("fathername", {
                    setValueAs: (value) => value.trim(),
                  })}
                />
                {errors.fathername && (
                  <span className="text-red-500">
                    {errors.fathername.message}
                  </span>
                )}
              </div>

              <div>
                <InputField
                  label="Father Occupation"
                  {...register("fatherOccupation", {
                    setValueAs: (value) => value.trim(),
                  })}
                />
              </div>

              <div>
                <InputField
                  label="Mother name"

                  {...register("mothername", {
                    setValueAs: (value) => value.trim(),
                  })}
                />
                {errors.mothername && (
                  <span className="text-red-500">
                    {errors.mothername.message}
                  </span>
                )}
              </div>

              <div>
                <InputField
                  label=" Mother Occupation"
                  {...register("motherOccupation", {
                    setValueAs: (value) => value.trim(),
                  })}
                />
              </div>

              <div className="col-span-2">
                <InputField
                  label="Family name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="aboutmyself"
                className="block mb-2 text-base text-primary font-medium "
              >
                About {ProfileName}
              </label>
              <textarea
                id="aboutmyself"
                className="outline-none px-3 py-2 w-full text-primary border border-ashBorder rounded"
                {...register("aboutmyself", {
                  setValueAs: (value) => value.trim(),
                })}
                onKeyDown={(e) => handleKeyDownTextArea(e, aboutmyselfValue)}
              />
            </div>

            <div>
              <label
                htmlFor="myhobbies"
                className="block mb-2 text-base text-primary font-medium "
              >
                {owner === "Ownself" ? "My Hobbies" : `${owner} Hobbies`}{" "}
              </label>
              <textarea
                id="myhobbies"
                className="outline-none px-3 py-2 w-full text-primary border border-ashBorder rounded"
                {...register("myhobbies")}
                onKeyDown={(e) => handleKeyDownTextArea(e, myhobbiesValue)}
                placeholder="E.g., Music, Trekking, Cricket, Reading" // Add the placeholder here
              />
            </div>

            <div className="w-full space-y-5">
              <div>
                <InputField
                  label="Weight (kg)"
                  max={3}
                  onKeyDown={handleKeyDown}
                  {...register("weight", {
                    onChange: (e) => setWeight(e.target.value), // Update the weight state
                    validate: (value) => {
                      if (!value) return true; // Allow optional
                      if (String(value).length > 3)
                        return "Weight can only be up to 3 digits";
                      if (Number(value) > 150)
                        return "Weight must be below 150";
                      return true;
                    },
                  })}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm">
                    {errors.weight.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="body_type"
                  className="block mb-2 text-base text-primary font-medium"
                >
                  Body Type{" "}
                </label>
                <div className="relative">
                  <select
                    id="body_type"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    {...register("body_type")}
                    //  value={watch("body_type")} // Ensure the selected value is shown
                    onChange={handleSelectChange}
                  >
                    <option value="">Select Body Type</option>
                    <option value="Slim">Slim</option>
                    <option value="Fat">Fat</option>
                    <option value="Normal">Normal</option>
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="eye_wear"
                  className="block mb-2 text-base text-primary font-medium "
                >
                  Eye Wear{" "}
                </label>
                <div className="relative">
                  <select
                    id="eye_wear"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    // {...register("eye_wear", {
                    //   setValueAs: (value) => value.trim(),
                    // })}
                    {...register("eye_wear")}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select Eye Wear</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bloodGroup"
                  className="block mb-2 text-base text-primary font-medium "
                >
                  Blood Group
                </label>
                <div className="relative">
                  <select
                    id="bloodGroup"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    {...register("bloodGroup", {
                      setValueAs: (value) => value.trim(), // Ensure the value is trimmed
                    })}
                  >
                    <option value="" disabled selected>
                      Select your Blood Group
                    </option>
                    {bloodGroups.map((group, index) => (
                      <option key={index} value={group.abbreviation}>
                        {group.abbreviation}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>
            </div>
            {showChildrenField && (
              <div>
                <label className="block mb-2 text-base text-primary font-medium ">
                  Number of Children
                </label>
                <div className="relative">
                  <select
                    id="no_of_children"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    {...register("no_of_children", {
                      setValueAs: (value) => value.trim(), // Ensure the value is trimmed
                    })}
                  >
                    <option value="" disabled selected>Select Number of Children</option>
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block mb-2 text-base text-primary font-medium ">
                Physically Challenged
              </label>
              <div style={{ marginTop: "8px" }}>
                <label style={{ marginRight: "16px" }}>
                  <input
                    type="radio"
                    value="yes"
                    {...register("physicallyChallenged", { required: true })}
                    className="mr-3"
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    value="no"
                    {...register("physicallyChallenged")}
                    className="mr-3"
                  />
                  No
                </label>
              </div>
            </div>
            {physicallyChallengedValue === "yes" && (
              <div>
                <InputField label="please explain the physically challenged in detail"
                  {...register("defectDetails")} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Father Alive</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="yes"
                    {...register("father_alive")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Yes</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="no"
                    {...register("father_alive")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mother Alive</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="yes"
                    {...register("mother_alive")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Yes</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="no"
                    {...register("mother_alive")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Brother and Sister selection */}
            <div className="mt-3 grid grid-cols-2 gap-x-5 max-md:block max-md:space-y-4">
              <div className="w-full">
                <h1 className="block mb-3 text-primary font-medium ">
                  Brother
                </h1>

                <div ref={buttonContainerRef} className="flex rounded">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`w-[20%] px-0 py-3 text-primary text-sm font-medium border max-sm:px-0 ${buttonClass(
                        selectedBrother === num
                      )}`}
                      onClick={() => handleBrotherChange(num)}
                    >
                      {num === 5 ? "5+" : num}
                    </button>
                  ))}
                </div>
              </div>

              {selectedBrother !== null && selectedBrother > 0 && (
                <div className="w-full">
                  <h1 className="block mb-3 text-primary font-medium ">
                    Married
                  </h1>

                  <div
                    ref={marriedBrotherContainerRef}
                    className="flex rounded"
                  >
                    {[...Array(Math.min(selectedBrother + 1, 6)).keys()].map(
                      (num) => (
                        <button
                          key={num}
                          type="button"
                          className={`w-[16.6%] px-0 py-3 text-primary text-sm font-medium border max-sm:px-0 ${buttonClass(
                            selectedMarriedBrother === num
                          )}`}
                          onClick={() => handleMarriedBrotherChange(num)}
                        >
                          {num === 5 ? "5+" : num}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-5 max-md:block max-md:space-y-4">
              <div className="w-full">
                <h1 className="block mb-3 text-primary font-medium ">Sister</h1>

                <div ref={sisterContainerRef} className="flex rounded">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`w-[20%]  py-3 text-primary text-sm font-medium border ${buttonClass(
                        selectedSister === num
                      )}`}
                      onClick={() => handleSisterChange(num)}
                    >
                      {num === 5 ? "5+" : num}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSister !== null && selectedSister > 0 && (
                <div className="w-full">
                  <h1 className="block mb-3 text-primary font-medium ">
                    Married
                  </h1>

                  <div className="flex rounded">
                    {[...Array(Math.min(selectedSister + 1, 6)).keys()].map(
                      (num) => (
                        <button
                          key={num}
                          type="button"
                          className={`w-[16.6%]  py-3 text-primary text-sm font-medium border ${buttonClass(
                            selectedMarriedSister === num
                          )}`}
                          onClick={() => handleMarriedSisterChange(num)}
                        >
                          {num === 5 ? "5+" : num}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Family Type Section */}
            <div className="flex flex-col">
              <h1 className="mb-3 block  text-primary font-medium ">
                Family Type
              </h1>
              <div
                ref={familyTypeRef}
                className="w-full inline-flex rounded max-sm:flex-col"
              >
                {familyType.map((option) => (
                  <button
                    key={option.family_id}
                    type="button"
                    title={option.family_description}
                    className={`w-full px-5 py-3 text-primary text-sm font-medium border ${buttonClass(
                      selectedfamilyTypeId === option.family_id // Compare against the ID, not the description
                    )}`}
                    onClick={() =>
                      handleFamilyTypeChange(
                        option.family_id,
                        option.family_description
                      )
                    }
                    {...register("familyType")}
                  >
                    {option.family_description}
                  </button>
                ))}
              </div>
            </div>

            {/* Family Value Section */}
            <div className="mt-3">
              <h1 className="mb-3 block  text-primary font-medium ">
                Family Value
              </h1>
              <div className="flex flex-col max-sm:flex-col">
                <div
                  ref={familyValueRef}
                  className="w-full inline-flex rounded max-sm:flex-col"
                >
                  {familyValue.map((option) => (
                    <button
                      key={option.family_value_id}
                      type="button"
                      title={option.family_value_name}
                      className={`w-full px-5 py-3 text-primary text-sm font-medium border ${buttonClass(
                        selectedfamilyValueId === option.family_value_id
                      )}`}
                      onClick={() =>
                        handleFamilyValueChange(
                          option.family_value_id,
                          option.family_value_name
                        )
                      }
                      {...register("familyType")}
                    >
                      {option.family_value_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Family Status Section */}
            <div className="mt-3">
              <h1 className="mb-3 block  text-primary font-medium ">
                Family Status
              </h1>
              <div className="flex flex-col max-sm:flex-col">
                <div
                  ref={familyStatusRef}
                  className="w-full grid grid-cols-3 max-md:grid-cols-2 ma"
                >
                  {familyStatus.map((option) => (
                    <button
                      key={option.family_status_id} // Use the unique family_status_id as the key
                      type="button"
                      // title={option.family_status_description}
                      className={`w-full px-0 py-3 text-primary text-xs font-medium border ${buttonClass(
                        selectedfamilyStatusId === option.family_status_id
                      )}`}
                      onClick={() =>
                        handleFamilyStatusChange(
                          option.family_status_id,
                          option.family_status_name
                        )
                      }
                    >
                      <div className="flex flex-col items-center">
                        <span>{option.family_status_name}</span>{" "}
                        {/* Display the family status name */}
                        <span className="text-[10px] text-balance text-gray-500">
                          ({option.family_status_description})
                        </span>{" "}
                        {/* Display description below in brackets */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Input Fields */}
            {/* <div>
              <InputField
                label="Property Details"
                {...register("propertyDetails", {
                  setValueAs: (value) => value.trim(),
                })}
                title="Enter details about the property here."
              />
            </div> */}


            <div className="mt-7">
              <div className="flex items-center">
                <label
                  htmlFor="propertyDetails"
                  className="block mb-2 text-base text-primary font-medium"
                >
                  Property Details
                </label>
                <div className="relative inline-block ml-2 group">
                  <AiOutlineInfoCircle className="text-primary align-middle" />
                  {/* Tooltip */}
                  <div className="absolute hidden group-hover:flex flex-col bg-white border border-ashSecondary rounded shadow-md p-2 w-48 z-10">
                    <p className="text-sm text-black">Residential,</p>
                    <p className="text-sm text-black">Commercial,</p>
                    <p className="text-sm text-black">Shopping Complex,</p>
                    <p className="text-sm text-black">Farm house,,</p>
                    <p className="text-sm text-black">Shop,</p>
                    <p className="text-sm text-black">Agriculture land,</p>
                    <p className="text-sm text-black">
                      Multistorage building etc.,
                    </p>
                  </div>
                </div>
              </div>

              {/* <select
                id="propertyDetails"
                className="outline-none w-full text-placeHolderColor px-4 py-[8.5px] border border-ashBorder rounded"
                defaultValue=""
                {...register("propertyDetails", {
                  setValueAs: (value) => value.trim(),
                })}
              >
                <option value="" disabled>
                  Select Property Details
                </option>

                {propertyworth.map((property) => (
                  <option
                    key={property.property_id}
                    value={property.property_id}
                  >
                    {property.property_description}
                  </option>
                ))}
              </select> */}

              <input
                id="propertyDetails"
                className="outline-none w-full text-placeHolderColor px-4 py-[8.5px] border border-ashBorder rounded"
                type="text"
                //placeholder="Enter Property Details"
                {...register("propertyDetails", {
                  setValueAs: (value) => value.trim(),
                })}
              />
            </div>

            <div className="mt-7">
              <div className="flex items-center">
                <label
                  htmlFor="propertyWorth"
                  className="block mb-2 text-primary font-medium"
                >
                  Property Worth
                </label>
                <div className="relative inline-block ml-2 group">
                  <AiOutlineInfoCircle className="text-primary align-middle" />
                  {/* Tooltip */}
                  <div className="absolute hidden group-hover:flex flex-col bg-white border border-ashSecondary rounded shadow-md p-2 w-48 z-10">
                    <p className="text-sm text-black">
                      Approx 1c, 5c, 50c, 30L, 80L, etc.,
                    </p>
                  </div>
                </div>
              </div>

              <InputField
                label={""}
                id="propertyWorth"
                {...register("propertyWorth", {
                  setValueAs: (value) => value.trim(),
                })}
              />
            </div>

            <div>
              <InputField
                label="Suya Gothram"
                required
                {...register("suyaGothram", {
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.suyaGothram && (
                <p style={{ color: "red" }}>{errors.suyaGothram.message}</p>
              )}
            </div>

            <div>
              <InputField
                label="Uncle Gothram"
                {...register("uncle_gothram", {
                  setValueAs: (value) => value.trim(),
                })}
              />
            </div>

            <div>
              <InputField
                label="Ancestor Origin"
                {...register("ancestor_origin", {
                  setValueAs: (value) => value.trim(),
                })}
                title="Enter details about the ancestorOrgin here."
              />
            </div>

            <div>
              <label
                htmlFor="aboutMyFamily"
                className="block mb-2 text-base text-primary font-medium"
              >
                About my Family
              </label>
              <textarea
                id="aboutMyFamily"
                rows={5}
                className="outline-none w-full  text-placeHolderColor  px-4 py-[8.5px] border border-ashBorder rounded"
                {...register("aboutMyFamily", {
                  setValueAs: (value) => value.trim(),
                })}
                onKeyDown={(e) => handleKeyDownTextArea(e, aboutMyFamilyValue)}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="mt-7 flex justify-end">
              {/* <div className="">
                <Link to="/ContactDetails">
                  <button className="py-[10px] px-14 bg-white text-main font-semibold border-2 rounded-[6px] mt-2 max-sm:px-8">
                    Back
                  </button>
                </Link>
              </div> */}
              <div className="flex space-x-4">
                <Link to="/EduDetails">
                  <button className="py-[10px] px-14 bg-white text-main font-semibold rounded-[6px] mt-2  max-sm:hidden">
                    Skip
                  </button>
                </Link>

                <button
                  type="submit"
                  className="flex items-center py-[10px] px-14 bg-gradient text-white rounded-[6px] shadow-redboxshadow mt-2 max-sm:px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Next"}
                  <span>
                    <img src={arrow} alt="next arrow" className="ml-2" />
                  </span>
                </button>
              </div>
            </div>
          </form>
          <SideContent />
        </div>
      </div>
      <ToastNotification />
    </div>
  );
};

export default FamilyDetails;
