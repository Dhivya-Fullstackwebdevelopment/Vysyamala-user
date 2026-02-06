import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
//import InputField from "../../Components/RegistrationForm/InputField";
import { HiOutlineSearch } from "react-icons/hi";
import { ProfileContext } from "../../ProfileContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { IoMdArrowDropdown } from "react-icons/io";
import apiClient from "../../API";

const profileIdSchema = z.object({
  // profile_id: z
  //   .string()
  //   .min(1, "Profile ID or Profile Name is required")
  //   // .regex(/^VY\d{6}$/, "Profile ID must start with 'VY' followed by 6 digits"),
  //   .regex(
  //     /^(VY\d{6}|[A-Za-z\s]+)$/,
  //     "Search input must be a Profile ID (e.g., VY123456) or a Profile Name"
  //   ),
  // profile_id: z.string().min(1, "Profile ID or Profile Name is required"),
  profile_id: z
    .string()
    .min(1, "Profile ID or Profile Name is required")
    .refine((val) => {
      const currentUserGender = localStorage.getItem("gender")?.toLowerCase();
      const input = val.toUpperCase();

      // If user is Male, they should not be searching for "VM"
      if (currentUserGender === "male" && input.startsWith("VM")) {
        return false;
      }
      // If user is Female, they should not be searching for "VF"
      if (currentUserGender === "female" && input.startsWith("VF")) {
        return false;
      }
      return true;
    }, {
      // This is the dynamic message that will show up in errors.profile_id
      message: "This profile does not match your gender preference.",
    }),
});

// --- NEW: Advanced Search Schema for Age Validation ---
const advancedSearchSchema = z.object({
  fromAge: z.coerce.number().min(18, "Minimum age is 18").optional().or(z.literal("")),
  toAge: z.coerce.number().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  const myGender = localStorage.getItem("gender")?.toLowerCase();
  const myAge = Number(localStorage.getItem("age")) || 0;

  // Validation: Males cannot search for someone > (My Age + 1)
  if (myGender === "male" && data.toAge && Number(data.toAge) > (myAge + 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Your age preference does not match this profile.`,
      path: ["toAge"],
    });
  }

  // Validation: Females cannot search for someone < (My Age - 1)
  if (myGender === "female" && data.fromAge && Number(data.fromAge) < (myAge - 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Your age preference does not match this profile.`,
      path: ["fromAge"],
    });
  }

  // Basic logical check
  if (data.fromAge && data.toAge && Number(data.fromAge) > Number(data.toAge)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "From Age cannot be greater than To Age",
      path: ["fromAge"],
    });
  }
});

type ProfileIdForm = z.infer<typeof profileIdSchema>;
type AdvancedSearchForm = z.infer<typeof advancedSearchSchema>;

interface MaritalStatus {
  marital_sts_id: number;
  marital_sts_name: string;
}

interface Profession {
  Profes_Pref_id: number;
  Profes_name: string;
}

interface Education {
  education_id: number;
  education_description: string;
}

interface BirthStar {
  birth_id: number;
  birth_star: string;
}

interface Income {
  income_id: number;
  income_description: string;
}

interface FieldOfStudy {
  study_id: number;
  study_description: string;
}

interface AdvancedSearchProps {
  onFindMatch: () => void;
  handle_Get_advance_search: () => void;
}

interface StateOption {
  State_Pref_id: number;
  State_name: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  //handle_Get_advance_search,
  onFindMatch,
}) => {
  const {
    // register,
    setError,
    // handleSubmit,
    // formState: { errors },
    formState: { },
  } = useForm<ProfileIdForm>({
    resolver: zodResolver(profileIdSchema),
  });

  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [educationOptions, setEducationOptions] = useState<Education[]>([]);
  const [birthStars, setBirthStars] = useState<BirthStar[]>([]);
  const [incomeOptions, setIncomeOptions] = useState<Income[]>([]);
  const [fieldofstudyOptions, setfieldofstudyOptions] = useState<FieldOfStudy[]>([]);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const loginuser_profile_id = localStorage.getItem("loginuser_profile_id");
  const context = useContext(ProfileContext);
  const navigate = useNavigate();


  if (!context) {
    throw new Error("MyComponent must be used within a ProfileProvider");
  }

  useEffect(() => {
    resetAdvancedSearchFilters();
  }, [location.pathname]);

  useEffect(() => {
    resetAdvancedSearchFilters();

    // Optional: Clear session storage items if needed
    sessionStorage.removeItem("searchProfile");
  }, []);

  useEffect(() => {
    // Check if this is a navigation (not a refresh)
    const isNavigation = window.performance.navigation.type === 0;

    if (isNavigation) {
      resetAdvancedSearchFilters();
    }
  }, []);

  const { resetAdvancedSearchFilters } = context;

  const {
    // fromAge, ToAge,
    setFromAge,
    setToAge,
    setFromHeight,
    setToHeight,
    setWorkLocation,
    setAdvanceSelectedProfessions,
    Set_Maritial_Status,
    setfieldofstudy,
    setAdvanceSelectedEducation,
    setSelectedIncomes,
    setSelectedMaxIncomes,
    setChevvai_dhosam,
    setRehuDhosam,
    setAdvanceSelectedBirthStar,
    setNativeState,
    setPeopleOnlyWithPhoto,
    //pageNumber,
    fromHeight, toHeight,
    selectedIncomes,
    setAdvanceSearchData,
    chevvai_dhosam,
    rehuDhosam,
    // workLocation,
    peopleOnlyWithPhoto,
  } = context;

  const idForm = useForm<ProfileIdForm>({
    resolver: zodResolver(profileIdSchema),
  });

  const advancedForm = useForm<AdvancedSearchForm>({
    resolver: zodResolver(advancedSearchSchema),
    mode: "onChange" // Validates as the user types
  });

  const onProfileIdSubmit = (data: ProfileIdForm) => {
    Search_By_profileId(data.profile_id);
    navigate('/Search/SearchProfiles');
  };

  const handleAdvancedSearchSubmit = (_data: AdvancedSearchForm) => {
    navigate('/Search/FindMatch');
  };
  // useEffect(() => {
  //   handle_Get_advance_search();
  // }, [pageNumber]); // Add pageNumber as a dependency

  const handleEducationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAdvanceSelectedEducation(event.target.value);
  };

  //   const handleSearch = () => {

  //     handle_Get_advance_search();
  //     onFindMatch();
  //     // navigate('/Search/SearchProfiles');
  // };
  // const handleSearch = () => {
  //   // Just navigate to the new results route.
  //   // The context already holds all the form values.
  //   navigate('/Search/FindMatch');
  // };

  const handlePeopleWithPhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.checked ? 1 : 0;
    setPeopleOnlyWithPhoto(value);
    //console.log("Checked value:", value);
  };

  const handleMaritalStatusChange = (statusId: number, isChecked: boolean) => {
    if (isChecked) {
      Set_Maritial_Status((prev) => [...prev, statusId]);
    } else {
      Set_Maritial_Status((prev) => prev.filter((id) => id !== statusId));
    }
  };

  const handlefieldofstudyChange = (studyId: number, isChecked: boolean) => {
    if (isChecked) {
      setfieldofstudy((prev) => [...prev, studyId]);
    } else {
      setfieldofstudy((prev) => prev.filter((id) => id !== studyId));
    }
  };


  const handleCheckboxChange = (id: number) => {
    setAdvanceSelectedProfessions((prevSelected) => {
      if (prevSelected.includes(id)) {
        // If the ID is already selected, remove it from the array
        return prevSelected.filter((professionId) => professionId !== id);
      } else {
        // If the ID is not selected, add it to the array
        return [...prevSelected, id];
      }
    });
  };

  const handleBirthStarChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAdvanceSelectedBirthStar(event.target.value);
  };
  const handleStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (checked) {
      // Add the selected value to the array
      setNativeState((prevState) => [...prevState, value]);
    } else {
      // Remove the unselected value from the array
      setNativeState((prevState) => prevState.filter((item) => item !== value));
    }
  };

  const handleIncomeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIncomes(event.target.value);
  };

  const handleMaxIncomeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMaxIncomes(event.target.value);
  };

  console.log(selectedIncomes, " selectedIncomes");
  // const Search_By_profileId = async (searchProfile: string) => {
  //   try {
  //     const response = await apiClient.post(
  //       "/auth/Search_byprofile_id/",
  //       {
  //         profile_id: loginuser_profile_id,
  //         search_profile_id: searchProfile,
  //       }
  //     );

  //     if (response.status === 200) {
  //       sessionStorage.setItem("searchProfile", searchProfile);
  //       console.log(response.data.data, "search profile");
  //       // setSearchProfileData(response.data.data);
  //       setAdvanceSearchData(response.data.data);
  //       setTimeout(() => {
  //         onFindMatch();
  //       }, 1000);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     setError("profile_id", {
  //       type: "manual",
  //       message: "Profile not found. Please check the profile ID and Profile Name.",
  //     });
  //   }
  // };


  const Search_By_profileId = async (searchProfile: string) => {
    try {
      const response = await apiClient.post(
        "/auth/Search_byprofile_id/",
        {
          profile_id: loginuser_profile_id,
          search_profile_id: searchProfile,
        }
      );

      if (response.status === 200 && (response.data.status === 'failure' || !response.data.data || response.data.data.length === 0)) {
        setError("profile_id", {
          type: "manual",
          message: "No profile found with that ID or name. Please try again.",
        });
        return; // Stop execution here
      }

      if (response.status === 200) {
        sessionStorage.setItem("searchProfile", searchProfile);
        console.log(response.data.data, "search profile");
        setAdvanceSearchData(response.data.data);
        setTimeout(() => {
          onFindMatch();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      setError("profile_id", {
        type: "manual",
        message: "An error occurred. Please check the profile ID and try again.",
      });
    }
  };

  const fetchMaritalStatuses = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Marital_Status/"
      );
      const status = Object.values(response.data) as MaritalStatus[];
      setMaritalStatuses(status);
    } catch (error) {
      console.error("Error fetching marital statuses", error);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Profes_Pref/"
      );
      const professionList = Object.values(response.data) as Profession[];
      setProfessions(professionList);
    } catch (error) {
      console.error("Error fetching professions", error);
    }
  };

  const fetchEducationOptions = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Highest_Education/"
      );
      const educationList = Object.values(response.data) as Education[];
      setEducationOptions(educationList);
    } catch (error) {
      console.error("Error fetching education options", error);
    }
  };
  const fetchBirthStars = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Birth_Star/",
        {
          state_id: "", // or `null` depending on what the API expects
        }
      );
      const starList = Object.values(response.data) as BirthStar[];
      setBirthStars(starList);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error fetching birth stars:",
          error.response?.data || error.message
        );
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const fetchIncomeOptions = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Annual_Income/"
      );
      const incomeList = Object.values(response.data) as Income[];
      setIncomeOptions(incomeList);
    } catch (error) {
      console.error("Error fetching income options", error);
    }
  };


  const fetchFieldofStudyOptions = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Field_ofstudy/"
      );
      const fieldofstudyList = Object.values(response.data) as FieldOfStudy[];
      setfieldofstudyOptions(fieldofstudyList);
    } catch (error) {
      console.error("Error fetching income options", error);
    }
  };

  const fetchStateOptions = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_State_Pref/",
        {}
      );
      // The response data is an object where keys are indices, and values are StateOption objects.
      // Convert the object values into an array.
      const stateList = Object.values(response.data) as StateOption[];
      setStateOptions(stateList);
    } catch (error) {
      console.error("Error fetching state options", error);
    }
  };

  useEffect(() => {
    fetchStateOptions();
    fetchFieldofStudyOptions();
    fetchIncomeOptions();
    fetchBirthStars();
    fetchEducationOptions();
    fetchMaritalStatuses();
    fetchProfessions();
  }, []);

  const handleWorkLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setWorkLocation(event.target.value);
  };

  // const onSubmit = (data: ProfileIdForm) => {
  //   // Proceed with the search if no errors
  //   Search_By_profileId(data.profile_id);
  //   navigate('/Search/SearchProfiles');
  // };

  const storedGender = localStorage.getItem("gender");
  const storedHeight = sessionStorage.getItem("userheightfromapi") || 0;

  console.log(storedHeight, "adv height");
  console.log(storedGender, "adv gender");
  useEffect(() => {
    // If the stored gender is 'male', set the height as the value to the input
    if (storedGender === 'male') {

      setToHeight(Number(storedHeight));
    }
    if (storedGender === 'female') {
      setFromHeight(Number(storedHeight));
    }
  }, []);



  const handleCancelClick = () => {
    resetAdvancedSearchFilters();
    navigate('/Dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top smoothly
  };

  return (
    <div>
      <div className="container mx-auto py-10 max-md:px-3">
        <div className="w-8/12 mx-auto rounded-lg p-10 bg-white shadow-lg max-lg:w-4/5 max-md:w-full  max-sm:p-5">
          <form
            // onSubmit={handleSubmit(onSubmit)}
            onSubmit={idForm.handleSubmit(onProfileIdSubmit)}
            className="relative flex justify-center items-center rounded-lg p-1 border-2 border-footer-text-gray max-sm:flex-col"
          >
            <input
              // onChange={(e) => setSearchProfile(e.target.value)}
              // {...register("profile_id")}
              {...idForm.register("profile_id")}
              type="text"
              placeholder="Search by Profile ID or Profile Name"
              className="w-full px-10 focus-visible:outline-none max-sm:p-4 max-sm:pl-10"
            />
            <HiOutlineSearch className="absolute left-3 top-4 text-[22px] text-primary max-sm:top-6" />
            <button
              type="submit"
              className="w-fit bg-gradient text-sm text-white rounded-r-[6px] font-semibold px-8 py-3 max-sm:w-full max-sm:rounded-md"
            >
              Search
            </button>
          </form>
          {/* {errors.profile_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.profile_id.message}
            </p>
          )} */}
          {idForm.formState.errors.profile_id && (
            <p className="text-red-500 text-sm mt-1">{idForm.formState.errors.profile_id.message}</p>
          )}

          {/* advance search */}
          <hr className="text-footer-text-gray mt-10 mb-5 max-md:my-8" />
          <h4 className="text-[24px] text-vysyamalaBlackSecondary font-bold mb-5 max-md:text-[20px]">
            Advanced Search
          </h4>
          {/* 
          <form action="" method="post" className="space-y-5"> */}
          <form onSubmit={advancedForm.handleSubmit(handleAdvancedSearchSubmit)} className="space-y-5">
            {/* {/ Age & Height /} */}
            <div className="flex justify-between items-center gap-4 max-2xl:gap-4 max-sm:flex-col max-sm:items-start">
              {/* {/ Age /} */}
              <div className="w-full">
                <label htmlFor="age" className="text-secondary text-lg font-semibold mb-2">
                  Age
                </label>
                <div className="w-full flex justify-between items-center space-x-5 mt-2 max-sm:flex-col max-sm:gap-4 max-sm:space-x-0">
                  <div className="w-full">
                    <input
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          '0',
                          '1',
                          '2',
                          '3',
                          '4',
                          '5',
                          '6',
                          '7',
                          '8',
                          '9',

                          'Backspace',
                          'Tab',
                          'ArrowLeft',
                          'ArrowRight',
                          'Delete',
                        ];

                        // If the key pressed is not allowed, prevent it
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      // name="Profile_pincode"
                      {...advancedForm.register("fromAge")}
                      type="text"
                      // onChange={(e) => {
                      //   const value = e.target.value;
                      //   // Only allow digits
                      //   setFromAge(Number(value));

                      // }}
                      // onChange={(e) => {
                      //   const val = e.target.value;
                      //   // Convert to number for context and form validation
                      //   const numVal = val === "" ? "" : Number(val);

                      //   setFromAge(Number(val)); // Update your Context state

                      //   // Explicitly cast to match the expected Zod type
                      //   advancedForm.setValue("fromAge", numVal as number | "" | undefined, { shouldValidate: true });
                      // }}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numVal = val === "" ? "" : Number(val);
                        setFromAge(Number(val)); // Context update
                        // This tells the form to re-run the superRefine validation
                        advancedForm.setValue("fromAge", numVal as any, { shouldValidate: true });
                      }}
                      id="age"
                      name="age"
                      placeholder="From"
                      className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded"
                    />
                    {advancedForm.formState.errors.fromAge && (
                      <p className="text-red-500 text-xs mt-1">
                        {advancedForm.formState.errors.fromAge.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <input
                      type="text"
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          '0',
                          '1',
                          '2',
                          '3',
                          '4',
                          '5',
                          '6',
                          '7',
                          '8',
                          '9',

                          'Backspace',
                          'Tab',
                          'ArrowLeft',
                          'ArrowRight',
                          'Delete',
                        ];

                        // If the key pressed is not allowed, prevent it
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      // name="Profile_pincode"
                      {...advancedForm.register("toAge")}
                      // onChange={(e) => {

                      //   const value = e.target.value;
                      //   // Only allow digits
                      //   setToAge(Number(value));

                      // }}
                      // onChange={(e) => {
                      //   const val = e.target.value;
                      //   // Convert to number for context and form validation
                      //   const numVal = val === "" ? "" : Number(val);

                      //   setToAge(Number(val)); // Update your Context state

                      //   // Explicitly cast to match the expected Zod type
                      //   advancedForm.setValue("toAge", numVal as number | "" | undefined, { shouldValidate: true });
                      // }}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numVal = val === "" ? "" : Number(val);
                        setToAge(Number(val)); // Context update
                        // This tells the form to re-run the superRefine validation
                        advancedForm.setValue("toAge", numVal as any, { shouldValidate: true });
                      }}
                      placeholder="To"
                      className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded"
                    />
                    {advancedForm.formState.errors.toAge && (
                      <p className="text-red-500 text-xs mt-1">{advancedForm.formState.errors.toAge.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* {/ Height /} */}
              <div className="w-full">
                <label htmlFor="height" className="text-secondary text-lg font-semibold mb-2">Height</label>
                <div className="w-full flex justify-between items-center space-x-5 mt-2  max-sm:flex-col max-sm:gap-4 max-sm:space-x-0">
                  <div className="w-full">
                    <input
                      type="text"
                      id="fromHeight"
                      value={fromHeight}
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          '0',
                          '1',
                          '2',
                          '3',
                          '4',
                          '5',
                          '6',
                          '7',
                          '8',
                          '9',

                          'Backspace',
                          'Tab',
                          'ArrowLeft',
                          'ArrowRight',
                          'Delete',
                        ];

                        // If the key pressed is not allowed, prevent it
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      // name="Profile_pincode"

                      onChange={(e) => {
                        const value = e.target.value; // Allow only digits
                        setFromHeight(Number(value)); // Update context state, default to 0 if empty
                      }}
                      placeholder="From"
                      className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded"
                    />

                  </div>

                  <div className="w-full">
                    <input
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          '0',
                          '1',
                          '2',
                          '3',
                          '4',
                          '5',
                          '6',
                          '7',
                          '8',
                          '9',

                          'Backspace',
                          'Tab',
                          'ArrowLeft',
                          'ArrowRight',
                          'Delete',
                        ];

                        // If the key pressed is not allowed, prevent it
                        if (!allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      // name="Profile_pincode"

                      type="text"
                      id="toHeight"
                      value={toHeight}
                      onChange={(e) => {
                        const value = e.target.value; // Allow only digits
                        setToHeight(Number(value)); // Update context state, default to 0 if empty
                      }}
                      placeholder="To"
                      className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded"
                    />

                  </div>

                </div>
              </div>
            </div>

            {/* {/ Marital Status /} */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2  ">
                Marital Status
              </h5>
              <div className="flex flex-wrap gap-4">
                {maritalStatuses.map((status) => (
                  <div key={status.marital_sts_id}>
                    <input
                      onChange={(e) =>
                        handleMaritalStatusChange(
                          status.marital_sts_id,
                          e.target.checked
                        )
                      }
                      type="checkbox"
                      id={`maritalStatus-${status.marital_sts_id}`}
                      value={status.marital_sts_name}
                    />
                    <label
                      htmlFor={`maritalStatus-${status.marital_sts_id}`}
                      className="pl-1"
                    >
                      {status.marital_sts_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* {/ Profession /} */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2  ">
                Profession
              </h5>
              <div className="flex flex-wrap gap-4">
                {professions.map((profession) => (
                  <div key={profession.Profes_Pref_id}>
                    <input
                      type="checkbox"
                      id={`profession-${profession.Profes_Pref_id}`}
                      value={profession.Profes_name}
                      onChange={() =>
                        handleCheckboxChange(profession.Profes_Pref_id)
                      }
                    />
                    <label
                      htmlFor={`profession-${profession.Profes_Pref_id}`}
                      className="pl-1"
                    >
                      {profession.Profes_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* {/ Education /} */}
            <div>
              <label htmlFor="education" className="block text-secondary text-lg font-semibold mb-2">
                Education
              </label>
              <div className="relative">
                <select
                  id="education"
                  className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded appearance-none"
                  onChange={handleEducationChange}
                >
                  <option value="" disabled selected>
                    -- Select your Education --
                  </option>
                  {educationOptions.map((option) => (
                    <option key={option.education_id} value={option.education_id}>
                      {option.education_description}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1 top-4 ">
                  <IoMdArrowDropdown className="text-ashSecondary" />
                </div>
              </div>

              <br />
              <div>
                <h5 className="text-secondary text-lg font-semibold mb-2  ">
                  Field of Study
                </h5>
                <div className="flex flex-wrap gap-4">
                  {fieldofstudyOptions.map((fieldofstudy) => (
                    <div key={fieldofstudy.study_id}>
                      <input

                        onChange={(e) =>
                          handlefieldofstudyChange(
                            fieldofstudy.study_id,
                            e.target.checked
                          )
                        }
                        type="checkbox"
                        id={`fieldofstudy-${fieldofstudy.study_id}`}
                        value={fieldofstudy.study_id}
                      />
                      <label
                        htmlFor={`fieldofstudy-${fieldofstudy.study_id}`}
                        className="pl-1"
                      >
                        {fieldofstudy.study_description}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* {/ Annual Income /} */}
            <div>
              <label htmlFor="income" className="block text-secondary text-lg font-semibold mb-2">
                Income
              </label>
              {/* <div className="relative"> */}
              <div className="flex  gap-4 max-lg:flex-col">
                <div className="relative w-full ">
                  <select
                    id="minincome"
                    className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded appearance-none"
                    onChange={handleIncomeChange}
                  >
                    <option value="" selected disabled>
                      Select your Min Income
                    </option>
                    {incomeOptions.map((option) => (
                      <option key={option.income_id} value={option.income_id}>
                        {option.income_description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-1 top-4 ">
                    <IoMdArrowDropdown className="text-ashSecondary" />
                  </div>
                </div>


                <div className="relative w-full ">
                  <select
                    id="maxincome"
                    className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded appearance-none"
                    onChange={handleMaxIncomeChange}
                  >
                    <option value="" selected disabled>
                      Select your Max Income
                    </option>
                    {incomeOptions.map((option) => (
                      <option key={option.income_id} value={option.income_id}>
                        {option.income_description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-1 top-4 ">
                    <IoMdArrowDropdown className="text-ashSecondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* {/ Dhosam /} */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">
                Chevvai Dhosam
              </h5>
              <div className="w-full flex justify-start gap-4 items-center max-sm:flex-wrap">
                <div className="flex items-center space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="chevvai_dhosam"
                      value="Yes"
                      checked={chevvai_dhosam === "Yes"}
                      onChange={(e) => setChevvai_dhosam(e.target.value)}
                    />
                    Yes
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="chevvai_dhosam"
                      value="Yes"
                      checked={chevvai_dhosam === "No"}
                      onChange={(e) => setChevvai_dhosam(e.target.value)}
                    />
                    No
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="chevvai_dhosam"
                      value="Both"
                      checked={chevvai_dhosam === "Both"}
                      onChange={(e) => setChevvai_dhosam(e.target.value)}
                    />
                    Both
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">
                Rahu / Ketu Dhosam
              </h5>
              <div className="w-full flex justify-start gap-4 items-center max-sm:flex-wrap">
                <div className="flex items-center space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="rehu_dhosam"
                      value="Yes"
                      checked={rehuDhosam === "Yes"}
                      onChange={(e) => setRehuDhosam(e.target.value)}
                    />
                    Yes
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="rehu_dhosam"
                      value="No"
                      checked={rehuDhosam === "No"}
                      onChange={(e) => setRehuDhosam(e.target.value)}
                    />
                    No
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="rehu_dhosam"
                      value="Both"
                      checked={rehuDhosam === "Both"}
                      onChange={(e) => setRehuDhosam(e.target.value)}
                    />
                    Both
                  </label>
                </div>
              </div>
            </div>



            {/* {/ Birth Star /} */}
            <div>
              <label htmlFor="birthStar" className="block text-secondary text-lg font-semibold mb-2">
                Birth Star
              </label>
              <div className="relative">
                <select
                  onChange={handleBirthStarChange}
                  id="birthStar"
                  className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded appearance-none"
                >
                  <option value="" selected disabled>
                    -- Select your Birth Star --
                  </option>
                  {birthStars.map((star) => (
                    <option key={star.birth_id} value={star.birth_id}>
                      {star.birth_star}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1 top-4 ">
                  <IoMdArrowDropdown className="text-ashSecondary" />
                </div>
              </div>

            </div>

            {/* {/ Native State /} */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">
                Native State
              </h5>
              <div className="flex flex-wrap gap-4">
                <div>
                  <input
                    onChange={handleStateChange}
                    type="checkbox"
                    id="tamilNadu"
                    name="tamilNadu"
                    value="2,7"
                  />
                  <label htmlFor="tamilNadu" className="pl-1">
                    TamilNadu and Pondhicherry
                  </label>
                </div>

                <div>
                  <input
                    onChange={handleStateChange}
                    type="checkbox"
                    id="karnataka"
                    name="karnataka"
                    value="4"
                  />
                  <label htmlFor="karnataka" className="pl-1">
                    Karnataka
                  </label>
                </div>

                <div>
                  <input
                    onChange={handleStateChange}
                    type="checkbox"
                    id="andhraPradesh"
                    name="andhraPradesh"
                    value="1"
                  />
                  <label htmlFor="andhraPradesh" className="pl-1">
                    Andhra Pradesh
                  </label>
                </div>

                <div>
                  <input
                    onChange={handleStateChange}
                    type="checkbox"
                    id="telangana"
                    name="telangana"
                    value="3"
                  />
                  <label htmlFor="telangana" className="pl-1">
                    Telangana
                  </label>
                </div>

                <div>
                  <input
                    onChange={handleStateChange}
                    type="checkbox"
                    id="kerala"
                    name="kerala"
                    value="5"
                  />
                  <label htmlFor="kerala" className="pl-1">
                    Kerala
                  </label>
                </div>

                <div>
                  <input
                    onChange={handleStateChange}
                    type="checkbox"
                    id="others"
                    name="others"
                    value="6"
                  />
                  <label htmlFor="others" className="pl-1">
                    Others
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="workLocation" className="block text-secondary text-lg font-semibold mb-2">
                Work Location (State)
              </label>
              <div className="relative">
                <select
                  id="workLocation"
                  className="outline-none w-full px-3 py-[13px] text-placeHolderColor border border-footer-text-gray rounded appearance-none"
                  onChange={handleWorkLocationChange}
                // You may want to control the value with the context state if needed
                // value={workLocation}
                >
                  <option value="" selected>
                    Select Work Location
                  </option>
                  {stateOptions.map((option) => (
                    <option key={option.State_Pref_id} value={option.State_Pref_id}>
                      {option.State_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1 top-4 ">
                  <IoMdArrowDropdown className="text-ashSecondary" />
                </div>
              </div>
            </div>

            {/* {/ Profile Photo /} */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">
                Profile Photo
              </h5>
              <input
                onChange={handlePeopleWithPhotoChange}
                type="checkbox"
                id="profilePhoto"
                value={peopleOnlyWithPhoto}
              // {...register("profilePhoto")}
              />
              <label htmlFor="profilePhoto" className="pl-1">
                People only with photo
              </label>
            </div>

            {/* {/ Buttons /} */}
            <div className="flex justify-end space-x-4 max-sm:flex-col-reverse max-sm:items-end">
              <button type="button" className="py-[10px] px-6 bg-white text-sm text-main font-semibold  rounded-[6px] mt-2 "
                onClick={handleCancelClick}

              >
                Cancel
              </button>
              <button
                // onClick={() => handleSearch()}
                //onClick={handleSearch}
                // disabled={disableFindMatch}
                type="submit"
                className="flex items-center text-sm py-[10px] px-6 bg-gradient text-white rounded-[6px] mt-2"
              >
                Find Match
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
