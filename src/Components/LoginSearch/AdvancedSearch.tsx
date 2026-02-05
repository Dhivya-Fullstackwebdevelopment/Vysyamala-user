import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { HiOutlineSearch } from "react-icons/hi";
import { ProfileContext } from "../../ProfileContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { IoMdArrowDropdown } from "react-icons/io";
import apiClient from "../../API";

// --- Schemas ---
const profileIdSchema = z.object({
  profile_id: z
    .string()
    .min(1, "Profile ID or Profile Name is required")
    .refine((val) => {
      const currentUserGender = localStorage.getItem("gender")?.toLowerCase();
      const input = val.toUpperCase();
      if (currentUserGender === "male" && input.startsWith("VM")) return false;
      if (currentUserGender === "female" && input.startsWith("VF")) return false;
      return true;
    }, {
      message: "This profile does not match your gender preference.",
    }),
});

const advancedSearchSchema = z.object({
  fromAge: z.coerce.number().optional(),
  toAge: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
  const myGender = localStorage.getItem("gender")?.toLowerCase();
  const myAge = Number(localStorage.getItem("age")) || 0;

  if (myGender === "male" && data.toAge && data.toAge > (myAge + 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      // message: `As a ${myAge}yr old male, you can search up to age ${myAge + 1} only.`,
      message: `Your age preference does not match this profile.`,
      path: ["toAge"],
    });
  }

  if (myGender === "female" && data.fromAge && data.fromAge < (myAge - 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      // message: `As a ${myAge}yr old female, you cannot search below age ${myAge - 1}.`,
      message: `Your age preference does not match this profile.`,
      path: ["fromAge"],
    });
  }

  if (data.fromAge && data.toAge && data.fromAge > data.toAge) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "From Age cannot be greater than To Age",
      path: ["fromAge"],
    });
  }
});

type ProfileIdForm = z.infer<typeof profileIdSchema>;
type AdvancedSearchForm = z.infer<typeof advancedSearchSchema>;

// --- Interfaces ---
interface MaritalStatus { marital_sts_id: number; marital_sts_name: string; }
interface Profession { Profes_Pref_id: number; Profes_name: string; }
interface Education { education_id: number; education_description: string; }
interface BirthStar { birth_id: number; birth_star: string; }
interface Income { income_id: number; income_description: string; }
interface FieldOfStudy { study_id: number; study_description: string; }
interface StateOption { State_Pref_id: number; State_name: string; }
interface AdvancedSearchProps { onFindMatch: () => void; handle_Get_advance_search?: () => void; }

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onFindMatch }) => {
  const context = useContext(ProfileContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!context) throw new Error("MyComponent must be used within a ProfileProvider");

  const {
    fromAge, ToAge, setFromAge, setToAge, setFromHeight, setToHeight,
    setWorkLocation, setAdvanceSelectedProfessions, Set_Maritial_Status,
    setfieldofstudy, setAdvanceSelectedEducation, setSelectedIncomes,
    setSelectedMaxIncomes, setChevvai_dhosam, setRehuDhosam,
    setAdvanceSelectedBirthStar, setNativeState, setPeopleOnlyWithPhoto,
    fromHeight, toHeight, selectedIncomes, setAdvanceSearchData,
    chevvai_dhosam, rehuDhosam, peopleOnlyWithPhoto, resetAdvancedSearchFilters
  } = context;

  // --- Form Hooks ---
  const idForm = useForm<ProfileIdForm>({
    resolver: zodResolver(profileIdSchema),
    defaultValues: { profile_id: "" }
  });

  const advancedForm = useForm<AdvancedSearchForm>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: { fromAge: fromAge || undefined, toAge: ToAge || undefined }
  });

  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [educationOptions, setEducationOptions] = useState<Education[]>([]);
  const [birthStars, setBirthStars] = useState<BirthStar[]>([]);
  const [incomeOptions, setIncomeOptions] = useState<Income[]>([]);
  const [fieldofstudyOptions, setfieldofstudyOptions] = useState<FieldOfStudy[]>([]);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const loginuser_profile_id = localStorage.getItem("loginuser_profile_id");

  // --- Search Logic ---
  const Search_By_profileId = async (searchProfile: string) => {
    try {
      const response = await apiClient.post("/auth/Search_byprofile_id/", {
        profile_id: loginuser_profile_id,
        search_profile_id: searchProfile,
      });

      if (response.status === 200 && (response.data.status === 'failure' || !response.data.data || response.data.data.length === 0)) {
        idForm.setError("profile_id", { type: "manual", message: "No profile found with that ID or name." });
        return;
      }

      sessionStorage.setItem("searchProfile", searchProfile);
      setAdvanceSearchData(response.data.data);
      setTimeout(() => onFindMatch(), 1000);
    } catch (error) {
      idForm.setError("profile_id", { type: "manual", message: "An error occurred. Please try again." });
    }
  };

  const onProfileIdSearch = (data: ProfileIdForm) => {
    Search_By_profileId(data.profile_id);
    navigate('/Search/SearchProfiles');
  };

  const onFindMatchSubmit = (data: AdvancedSearchForm) => {
    setFromAge(data.fromAge || 0);
    setToAge(data.toAge || 0);
    navigate('/Search/FindMatch');
  };

  // --- Effects ---
  useEffect(() => {
    fetchStateOptions(); fetchFieldofStudyOptions(); fetchIncomeOptions();
    fetchBirthStars(); fetchEducationOptions(); fetchMaritalStatuses(); fetchProfessions();
  }, []);

  useEffect(() => {
    const storedGender = localStorage.getItem("gender");
    const storedHeight = sessionStorage.getItem("userheightfromapi") || "0";
    if (storedGender === 'male') setToHeight(Number(storedHeight));
    else if (storedGender === 'female') setFromHeight(Number(storedHeight));
  }, [setFromHeight, setToHeight]);

  useEffect(() => {
    resetAdvancedSearchFilters();
    sessionStorage.removeItem("searchProfile");
  }, [location.pathname, resetAdvancedSearchFilters]);

  // --- Handlers ---
  const handleEducationChange = (e: React.ChangeEvent<HTMLSelectElement>) => setAdvanceSelectedEducation(e.target.value);
  const handlePeopleWithPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => setPeopleOnlyWithPhoto(e.target.checked ? 1 : 0);
  const handleMaritalStatusChange = (id: number, checked: boolean) => {
    Set_Maritial_Status(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };
  const handleCheckboxChange = (id: number) => {
    setAdvanceSelectedProfessions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };
  const handleBirthStarChange = (e: React.ChangeEvent<HTMLSelectElement>) => setAdvanceSelectedBirthStar(e.target.value);
  const handleIncomeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedIncomes(e.target.value);
  const handleMaxIncomeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMaxIncomes(e.target.value);
  const handleWorkLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => setWorkLocation(e.target.value);
  const handleCancelClick = () => { resetAdvancedSearchFilters(); navigate('/Dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setNativeState(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
  };

  const handlefieldofstudyChange = (studyId: number, isChecked: boolean) => {
    setfieldofstudy(prev => isChecked ? [...prev, studyId] : prev.filter(id => id !== studyId));
  };

  // --- API Fetches (Condensed for brevity) ---
  const fetchMaritalStatuses = async () => { try { const res = await apiClient.post("/auth/Get_Marital_Status/"); setMaritalStatuses(Object.values(res.data)); } catch (e) { } };
  const fetchProfessions = async () => { try { const res = await apiClient.post("/auth/Get_Profes_Pref/"); setProfessions(Object.values(res.data)); } catch (e) { } };
  const fetchEducationOptions = async () => { try { const res = await apiClient.post("/auth/Get_Highest_Education/"); setEducationOptions(Object.values(res.data)); } catch (e) { } };
  const fetchBirthStars = async () => { try { const res = await apiClient.post("/auth/Get_Birth_Star/", { state_id: "" }); setBirthStars(Object.values(res.data)); } catch (e) { } };
  const fetchIncomeOptions = async () => { try { const res = await apiClient.post("/auth/Get_Annual_Income/"); setIncomeOptions(Object.values(res.data)); } catch (e) { } };
  const fetchFieldofStudyOptions = async () => { try { const res = await apiClient.post("/auth/Get_Field_ofstudy/"); setfieldofstudyOptions(Object.values(res.data)); } catch (e) { } };
  const fetchStateOptions = async () => { try { const res = await apiClient.post("/auth/Get_State_Pref/", {}); setStateOptions(Object.values(res.data)); } catch (e) { } };

  return (
    <div>
      <div className="container mx-auto py-10 max-md:px-3">
        <div className="w-8/12 mx-auto rounded-lg p-10 bg-white shadow-lg max-lg:w-4/5 max-md:w-full max-sm:p-5">
          {/* Profile ID Search Form */}
          <form onSubmit={idForm.handleSubmit(onProfileIdSearch)} className="relative flex justify-center items-center rounded-lg p-1 border-2 border-footer-text-gray max-sm:flex-col">
            <input {...idForm.register("profile_id")} type="text" placeholder="Search by Profile ID or Profile Name" className="w-full px-10 focus-visible:outline-none max-sm:p-4 max-sm:pl-10" />
            <HiOutlineSearch className="absolute left-3 top-4 text-[22px] text-primary" />
            <button type="submit" className="w-fit bg-gradient text-sm text-white px-8 py-3 rounded-md">Search</button>
          </form>
          {idForm.formState.errors.profile_id && <p className="text-red-500 text-sm mt-1">{idForm.formState.errors.profile_id.message}</p>}

          <hr className="text-footer-text-gray mt-10 mb-5 max-md:my-8" />
          <h4 className="text-[24px] text-vysyamalaBlackSecondary font-bold mb-5 max-md:text-[20px]">Advanced Search</h4>

          {/* Advanced Search Form */}
          <form onSubmit={advancedForm.handleSubmit(onFindMatchSubmit)} className="space-y-5">
            <div className="flex justify-between items-center gap-4 max-sm:flex-col max-sm:items-start">
              {/* Age Inputs */}
              <div className="w-full">
                <label className="text-secondary text-lg font-semibold mb-2">Age</label>
                <div className="w-full flex justify-between items-center space-x-5 mt-2 max-sm:flex-col max-sm:gap-4 max-sm:space-x-0">
                  <div className="w-full">
                    <input
                      {...advancedForm.register("fromAge")}
                      type="text"
                      placeholder="From"
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
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : Number(e.target.value);
                        setFromAge(val || 0);
                        advancedForm.setValue("fromAge", val, { shouldValidate: true });
                      }}
                      className={`outline-none w-full px-3 py-[13px] border rounded ${advancedForm.formState.errors.fromAge ? 'border-red-500' : 'border-footer-text-gray'}`}
                    />
                    {advancedForm.formState.errors.fromAge && <p className="text-red-500 text-xs mt-1">{advancedForm.formState.errors.fromAge.message}</p>}
                  </div>
                  <div className="w-full">
                    <input
                      {...advancedForm.register("toAge")}
                      type="text"
                      placeholder="To"
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
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : Number(e.target.value);
                        setToAge(val || 0);
                        advancedForm.setValue("toAge", val, { shouldValidate: true });
                      }}
                      className={`outline-none w-full px-3 py-[13px] border rounded ${advancedForm.formState.errors.toAge ? 'border-red-500' : 'border-footer-text-gray'}`}
                    />
                    {advancedForm.formState.errors.toAge && <p className="text-red-500 text-xs mt-1">{advancedForm.formState.errors.toAge.message}</p>}
                  </div>
                </div>
              </div>

              {/* Height Inputs */}
              <div className="w-full">
                <label className="text-secondary text-lg font-semibold mb-2">Height</label>
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

            {/* Marital Status */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">Marital Status</h5>
              <div className="flex flex-wrap gap-4">
                {maritalStatuses.map((status) => (
                  <div key={status.marital_sts_id}>
                    <input onChange={(e) => handleMaritalStatusChange(status.marital_sts_id, e.target.checked)} type="checkbox" id={`ms-${status.marital_sts_id}`} />
                    <label htmlFor={`ms-${status.marital_sts_id}`} className="pl-1">{status.marital_sts_name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Profession */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">Profession</h5>
              <div className="flex flex-wrap gap-4">
                {professions.map((p) => (
                  <div key={p.Profes_Pref_id}>
                    <input type="checkbox" id={`p-${p.Profes_Pref_id}`} onChange={() => handleCheckboxChange(p.Profes_Pref_id)} />
                    <label htmlFor={`p-${p.Profes_Pref_id}`} className="pl-1">{p.Profes_name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Field of Study */}
            <div>
              <label className="block text-secondary text-lg font-semibold mb-2">Education</label>
              <div className="relative">
                <select className="outline-none w-full px-3 py-[13px] border border-footer-text-gray rounded appearance-none" onChange={handleEducationChange}>
                  <option value="">-- Select Education --</option>
                  {educationOptions.map((o) => <option key={o.education_id} value={o.education_id}>{o.education_description}</option>)}
                </select>
                <IoMdArrowDropdown className="absolute right-2 top-4 text-ashSecondary" />
              </div>
              <h5 className="text-secondary text-lg font-semibold mt-4 mb-2">Field of Study</h5>
              <div className="flex flex-wrap gap-4">
                {fieldofstudyOptions.map((f) => (
                  <div key={f.study_id}>
                    <input type="checkbox" id={`fs-${f.study_id}`} onChange={(e) => handlefieldofstudyChange(f.study_id, e.target.checked)} />
                    <label htmlFor={`fs-${f.study_id}`} className="pl-1">{f.study_description}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Income Range */}
            <div>
              <label className="block text-secondary text-lg font-semibold mb-2">Income</label>
              <div className="flex gap-4 max-lg:flex-col">
                <div className="relative w-full">
                  <select className="outline-none w-full px-3 py-[13px] border border-footer-text-gray rounded appearance-none" onChange={handleIncomeChange}>
                    <option value="">Min Income</option>
                    {incomeOptions.map((o) => <option key={o.income_id} value={o.income_id}>{o.income_description}</option>)}
                  </select>
                  <IoMdArrowDropdown className="absolute right-2 top-4 text-ashSecondary" />
                </div>
                <div className="relative w-full">
                  <select className="outline-none w-full px-3 py-[13px] border border-footer-text-gray rounded appearance-none" onChange={handleMaxIncomeChange}>
                    <option value="">Max Income</option>
                    {incomeOptions.map((o) => <option key={o.income_id} value={o.income_id}>{o.income_description}</option>)}
                  </select>
                  <IoMdArrowDropdown className="absolute right-2 top-4 text-ashSecondary" />
                </div>
              </div>
            </div>

            {/* Dhosam Radios */}
            {/* Chevvai Dhosam - Full Width */}
            <div className="w-full">
              <h5 className="text-secondary text-lg font-semibold mb-2 mt-5">Chevvai Dhosam</h5>
              <div className="flex space-x-4">
                {["Yes", "No", "Both"].map(val => (
                  <label key={val} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="chevvai"
                      value={val}
                      checked={chevvai_dhosam === val}
                      onChange={(e) => setChevvai_dhosam(e.target.value)}
                    />
                    <span className="pl-1">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rahu / Ketu Dhosam - Full Width in next line */}
            <div className="w-full">
              <h5 className="text-secondary text-lg font-semibold mb-2 mt-5">Rahu / Ketu Dhosam</h5>
              <div className="flex space-x-4">
                {["Yes", "No", "Both"].map(val => (
                  <label key={val} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rahu"
                      value={val}
                      checked={rehuDhosam === val}
                      onChange={(e) => setRehuDhosam(e.target.value)}
                    />
                    <span className="pl-1">{val}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Birth Star & Work Location */}
            {/* Birth Star - Full Width */}
            <div className="w-full">
              <label className="block text-secondary text-lg font-semibold mb-2">Birth Star</label>
              <div className="relative">
                <select
                  className="outline-none w-full px-3 py-[13px] border border-footer-text-gray rounded appearance-none"
                  onChange={handleBirthStarChange}
                >
                  <option value="">Select Birth Star</option>
                  {birthStars.map((s) => (
                    <option key={s.birth_id} value={s.birth_id}>{s.birth_star}</option>
                  ))}
                </select>
                <IoMdArrowDropdown className="absolute right-2 top-4 text-ashSecondary" />
              </div>
            </div>

            {/* Native State - Full Width in next line */}
            {/* Native State - Styled like Field of Study */}
            <div className="w-full">
              <h5 className="text-secondary text-lg font-semibold mb-2 mt-5">
                Native State
              </h5>
              <div className="flex flex-wrap gap-4">
                {stateOptions.map((state) => (
                  <div key={state.State_Pref_id}>
                    <input
                      onChange={handleStateChange}
                      type="checkbox"
                      id={`nativeState-${state.State_Pref_id}`}
                      name="nativeState"
                      value={state.State_Pref_id}
                    />
                    <label
                      htmlFor={`nativeState-${state.State_Pref_id}`}
                      className="pl-1"
                    >
                      {state.State_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Location - Full Width in next line */}
            <div className="w-full">
              <label className="block text-secondary text-lg font-semibold mb-2 mt-5">Work Location</label>
              <div className="relative w-full">
                <select
                  className="outline-none w-full px-3 py-[13px] border border-footer-text-gray rounded appearance-none"
                  onChange={handleWorkLocationChange}
                >
                  <option value="">Select Location</option>
                  {stateOptions.map((s) => (
                    <option key={s.State_Pref_id} value={s.State_Pref_id}>
                      {s.State_name}
                    </option>
                  ))}
                </select>
                <IoMdArrowDropdown className="absolute right-2 top-4 text-ashSecondary" />
              </div>
            </div>

            {/* Photo Filter */}
            <div>
              <h5 className="text-secondary text-lg font-semibold mb-2">Profile Photo</h5>
              <input type="checkbox" id="photo" onChange={handlePeopleWithPhotoChange} />
              <label htmlFor="photo" className="pl-1">People only with photo</label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 max-sm:flex-col-reverse max-sm:items-end">
              <button type="button" onClick={handleCancelClick} className="py-[10px] px-6 bg-white text-main font-semibold border border-main rounded-[6px]">Cancel</button>
              <button type="submit" className="py-[10px] px-6 bg-gradient text-white rounded-[6px]">Find Match</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};