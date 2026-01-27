/* eslint-disable @typescript-eslint/no-explicit-any */
import ContentBlackCard from "../Components/RegistrationForm/ContentBlackCard";
import InputField from "../Components/RegistrationForm/InputField";
import SideContent from "../Components/RegistrationForm/SideContent";
import arrow from "../assets/icons/arrow.png";
import RasiGrid from "../Components/HoroDetails/RasiGrid";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AmsamGrid from "../Components/HoroDetails/AmsamGrid";
import apiClient from "../API";
import { ToastNotification, NotifyError, NotifySuccess } from "../Components/Toast/ToastNotification";
//import axios from "axios";
import { IoMdArrowDropdown } from "react-icons/io";

// Define validation schema with zod
const schema = zod.object({
  placeOfBirth: zod.string().min(3, "Place of birth is required"),
  birthStar: zod.string().min(1, "Birth star is required"),
  rasi: zod.string().min(1, "Rasi is required"),
  padham: zod.string().nullable().optional(),
});

interface HoroDetailsInputs {
  day: string;
  month: string;
  year: string;
  timeOfBirth: string;
  placeOfBirth: string;
  birthStar: string;
  rasi: string;
  lagnam: string;
  dosham: string;
  naalikai: string;
  dasaName: string;
  dasaBalance: string;
  horoscopeHints: string;
  chevvaiDhosam: string;
  sarpaDhosham: string;
  period: "AM" | "PM" | "";
  hour: string;
  minute: string;
  padham: string | null;
}

interface HoroDetailsProps { }

interface BirthStar {
  birth_id: number;
  birth_star: string;
}

interface Rasi {
  rasi_id: number;
  rasi_name: string;
}

interface Lagnam {
  didi_id: number;
  didi_description: string;
}

const HoroDetails: React.FC<HoroDetailsProps> = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [padham, setPadham] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<HoroDetailsInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      day: "",
      month: "",
      year: "",
    },
  });

  const [birthPlace, setBirthPlace] = useState("");
  const [birthStarId, setBirthStarId] = useState("");
  const [rasiId, setRasiId] = useState("");
  const [didi, setDidi] = useState("");
  const [nalikai, setNalikai] = useState("");
  const [horoHint, setHoroHint] = useState("");
  useEffect(() => {
    const fetchProfileData = async () => {
      const profileId =
        localStorage.getItem("profile_id_new") ||
        localStorage.getItem("loginuser_profile_id");
      if (profileId) {
        try {
          const requestData = {
            profile_id: profileId,
            page_id: 5,
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

          const profileData = response.data.data; // Access the 'data' object directly

          // Set other form values here after fetching data
          setBirthPlace(profileData.place_of_birth);
          setBirthStarId(profileData.birthstar_name);
          setRasiId(profileData.birth_rasi_name);
          setDidi(profileData.lagnam_didi);
          setValue("placeOfBirth", profileData.place_of_birth);
          setValue("birthStar", profileData.birthstar_name);
          setValue("rasi", profileData.birth_rasi_name);
          setValue("lagnam", profileData.lagnam_didi);
          setValue("chevvaiDhosam", profileData.chevvai_dosaham);
          setValue("sarpaDhosham", profileData.ragu_dosham);
          setValue("naalikai", profileData.nalikai);
          setValue("dasaName", profileData.dasa_name);
          setValue("horoscopeHints", profileData.horoscope_hints);
          setValue("padham", profileData.padham);
          setPadham(profileData.padham || null);
          setChevvaiDhosam(profileData.chevvai_dosaham);
          setSarpaDhosham(profileData.ragu_dosham);
          setSelectedDasa(profileData.dasa_name);
          setHoroHint(profileData.horoscope_hints);
          setNalikai(profileData.nalikai);

          // Parse and set dasa_balance values
          const dasaBalance1 = profileData.dasa_balance;
          if (dasaBalance1 && typeof dasaBalance1 === 'string') {
            // Check for the new format first: "Y Years, M Months, D Days"
            const yearMatch = dasaBalance1.match(/(\d+)\s*Years/);
            const monthMatch = dasaBalance1.match(/(\d+)\s*Months/);
            const dayMatch = dasaBalance1.match(/(\d+)\s*Days/);

            if (yearMatch || monthMatch || dayMatch) {
              const year = yearMatch ? yearMatch[1] : "";
              const month = monthMatch ? monthMatch[1] : "";
              const day = dayMatch ? dayMatch[1] : "";

              setDasaYear(year);
              setDasaMonth(month);
              setDasaDay(day);
              setValue("day", day);
              setValue("month", month);
              setValue("year", year);
            } else {
              // Fallback to original parsing logic for old data formats
              try {
                const parsedBalance = JSON.parse(dasaBalance1);
                if (parsedBalance && typeof parsedBalance === 'object') {
                  setValue("day", parsedBalance.day?.toString() || "");
                  setValue("month", parsedBalance.month?.toString() || "");
                  setValue("year", parsedBalance.year?.toString() || "");
                }
              } catch (e) {
                // Fallback for "day:x,month:y,year:z" format
                const balanceParts = dasaBalance1.split(',');
                if (balanceParts.length === 3) {
                  const dayPart = balanceParts.find(part => part.includes('day:')) || 'day:';
                  const monthPart = balanceParts.find(part => part.includes('month:')) || 'month:';
                  const yearPart = balanceParts.find(part => part.includes('year:')) || 'year:';
                  const day = dayPart.split(':')[1] || '';
                  const month = monthPart.split(':')[1] || '';
                  const year = yearPart.split(':')[1] || '';
                  setValue("day", day);
                  setValue("month", month);
                  setValue("year", year);
                } else {
                  setValue("day", '');
                  setValue("month", '');
                  setValue("year", '');
                }
              }
            }
          } else {
            setDasaYear('');
            setDasaMonth('');
            setDasaDay('');
            setValue("day", '');
            setValue("month", '');
            setValue("year", '');
          }

          // In the fetchProfileData function, replace the timeOfBirth handling with this:
          const timeOfBirth = profileData.time_of_birth;
          if (timeOfBirth) {
            const [time, period] = timeOfBirth.split(" ");
            const [hours, minutes] = time.split(":");
            setValue("hour", hours);
            setValue("minute", minutes);
            setValue("period", period as "AM" | "PM" | "");
            sethour(hours);
            setminute(minutes);
            setperiod(period);
          } else {
            // Set empty values if timeOfBirth is null
            setValue("hour", "");
            setValue("minute", "");
            setValue("period", "");
            sethour("");
            setminute("");
            setperiod("");
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      } else {
        console.warn("Profile ID not found in sessionStorage");
      }
    };

    fetchProfileData();
  }, [setValue]);

  const [selectedDasa, setSelectedDasa] = useState<string>(""); // State to hold selected dasa
  const [hours, sethour] = useState("");
  const [minutes, setminute] = useState("");
  const [periods, setperiod] = useState("");
  const [dasa, getDasa] = useState<any>([]);

  const getDasaName = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_Dasa_Name/"
      );
      const dasaValue = Array.isArray(response.data)
        ? response.data
        : Object.values(response.data);

      getDasa(dasaValue);
    } catch (error) {
      console.error("Error in posting data:", error);
      throw error;
    }
  };
  useEffect(() => {
    getDasaName();
  }, []);

  const onSubmit: SubmitHandler<HoroDetailsInputs> = async () => {
    let storedData: any = "";
    let storedData1: any = "";

    try {
      const storedDataString = sessionStorage.getItem("formattedData");
      if (storedDataString) {
        try {
          storedData = JSON.parse(storedDataString);
        } catch (e) {
          storedData = storedDataString;
        }
      }
    } catch (error) {
      console.error("Error retrieving formattedData:", error);
    }

    try {
      const storedDataString1 = sessionStorage.getItem("formattedData1");
      if (storedDataString1) {
        try {
          storedData1 = JSON.parse(storedDataString1);
        } catch (e) {
          storedData1 = storedDataString1;
        }
      }
    } catch (error) {
      console.error("Error retrieving formattedData1:", error);
    }

    let combinedTime = "";
    if (hours && minutes && periods) {
      let formattedHour = parseInt(hours, 10);
      if (periods === "PM" && formattedHour < 12) {
        formattedHour += 12;
      } else if (periods === "AM" && formattedHour === 12) {
        formattedHour = 0;
      }
      combinedTime = `${formattedHour.toString().padStart(2, "0")}:${minutes} ${periods}`;
    }

    try {
      const profileId = localStorage.getItem("profile_id_new");
      if (!profileId) {
        throw new Error("ProfileId not found in sessionStorage");
      }

      const formattedData = {
        profile_id: profileId,
        time_of_birth: combinedTime,
        place_of_birth: birthPlace,
        birthstar_name: birthStarId,
        birth_rasi_name: rasiId,
        lagnam_didi: didi,
        chevvai_dosaham: chevvaiDhosam,
        ragu_dosham: sarpaDhosham,
        nalikai: nalikai,
        dasa_name: selectedDasa,
        dasa_balance: dasaBalance, // This now holds the formatted string
        horoscope_hints: horoHint,
        rasi_kattam: storedData,
        amsa_kattam: storedData1,
        padham: padham,
      };
      sessionStorage.setItem('birth_rasi_name', rasiId);
      setIsSubmitting(true);
      const response = await apiClient.post(
        `/auth/Horoscope_registration/`,
        formattedData
      );
      setIsSubmitting(false);

      if (response.data.Status === 1) {
        NotifySuccess("Horoscope details saved successfully");

        setTimeout(() => {
          navigate("/PartnerSettings");
        }, 2000);
        sessionStorage.removeItem("formattedDatarasi");
        sessionStorage.removeItem("formattedDatamsam");
      } else {
        NotifyError("Failed to upload Horoscope details");
        console.error("Error: Response status is not 1", response.data);
      }
    } catch (error) {
      console.error("Error submitting form data:", error);
      setIsSubmitting(false);
    }
  };

  const [birthStar, setBirthStar] = useState<BirthStar[]>([]);
  const [rasi, setRasiOptions] = useState<Rasi[]>([]);
  const [lagnam, setLagnamOptions] = useState<Lagnam[]>([]);
  const [chevvaiDhosam, setChevvaiDhosam] = useState("");
  const [sarpaDhosham, setSarpaDhosham] = useState("");
  const [dasaBalance, setDasaBalance] = useState<string>("");

  sessionStorage.setItem("selectedstar", birthStarId);
  localStorage.setItem("selectedstar", birthStarId);

  sessionStorage.setItem("selectedRasi", rasiId);
  localStorage.setItem("selectedRasi", rasiId);

  useEffect(() => {
    const fetchBirthStar = async () => {
      try {
        const response = await apiClient.post(`/auth/Get_Birth_Star/`, {
          state_id: " ",
        });
        const options = Object.values(response.data) as BirthStar[];
        setBirthStar(options);
      } catch (error) {
        console.error("Error fetching birth star options:", error);
      }
    };
    fetchBirthStar();
  }, []);

  useEffect(() => {
    if (birthStarId) {
      const fetchStateStatus = async () => {
        try {
          const response = await apiClient.post(`/auth/Get_Rasi/`, {
            birth_id: birthStarId,
          });
          const options = Object.values(response.data) as Rasi[];
          setRasiOptions(options);
        } catch (error) {
          console.error("Error fetching state options:", error);
        }
      };
      fetchStateStatus();
    }
  }, [birthStarId]);

  useEffect(() => {
    const fetchLagnam = async () => {
      try {
        const response = await apiClient.post(`/auth/Get_Lagnam_Didi/`);
        const options = Object.values(response.data) as Lagnam[];
        setLagnamOptions(options);
      } catch (error) {
        console.error("Error fetching Laganam options:", error);
      }
    };
    fetchLagnam();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = event.target;
    if (id === "chevvaiDhosam") {
      setChevvaiDhosam(value);
    } else if (id === "sarpaDhosham") {
      setSarpaDhosham(value);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTimeChange = () => {
    const hour = hours;
    const minute = minutes;
    const period = periods;

    if (!hour || !minute || !period) {
      setValue("timeOfBirth", "");
      return;
    }

    let formattedHour = parseInt(hour, 10);
    if (period === "PM" && formattedHour < 12) {
      formattedHour += 12;
    } else if (period === "AM" && formattedHour === 12) {
      formattedHour = 0;
    }

    const formattedTime = `${formattedHour
      .toString()
      .padStart(2, "0")}:${minute}`;
    setValue("timeOfBirth", formattedTime);
  };

  useEffect(() => {
    handleTimeChange();
  }, [hours, minutes, periods, setValue]);


  const [dasaYear, setDasaYear] = useState("");
  const [dasaMonth, setDasaMonth] = useState("");
  const [dasaDay, setDasaDay] = useState("");

  // Replace your current useEffect that handles dasaBalance
  useEffect(() => {
    const parts = [];

    // Only include non-zero and non-empty values
    if (dasaYear) {
      parts.push(`${dasaYear} Years`);
    }
    if (dasaMonth) {
      parts.push(`${dasaMonth} Months`);
    }
    if (dasaDay) {
      parts.push(`${dasaDay} Days`);
    }

    setDasaBalance(parts.join(', '));
  }, [dasaYear, dasaMonth, dasaDay]);

  // Add this useEffect to handle the "0" default logic
  useEffect(() => {
    // Check if any field has a meaningful value (not '' or '0')
    const isAnyFieldSet =
      (dasaYear && dasaYear !== '0') ||
      (dasaMonth && dasaMonth !== '0') ||
      (dasaDay && dasaDay !== '0');

    // Prevent this logic from running on initial load before values are set
    if (dasaYear === undefined || dasaMonth === undefined || dasaDay === undefined) {
      return;
    }

    if (isAnyFieldSet) {
      // If at least one field is set, ensure others default to '0' instead of ''
      if (!dasaYear || dasaYear === '') setDasaYear('0');
      if (!dasaMonth || dasaMonth === '') setDasaMonth('0');
      if (!dasaDay || dasaDay === '') setDasaDay('0');
    } else {
      // If all fields have been cleared by the user, reset any '0' values back to ''
      if (dasaYear === '0') setDasaYear('');
      if (dasaMonth === '0') setDasaMonth('');
      if (dasaDay === '0') setDasaDay('');
    }
  }, [dasaYear, dasaMonth, dasaDay]);

  // const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   setValue("day", value);
  // };

  // const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   setValue("month", value);
  // };

  // const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   setValue("year", value);
  // };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDasaDay(value);
    setValue("day", value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDasaMonth(value);
    setValue("month", value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDasaYear(value);
    setValue("year", value);
  };
  const [rasiKey, setRasiKey] = useState(Date.now());
  const [amsamKey, setAmsamKey] = useState(Date.now());

  useEffect(() => {
    setRasiKey(Date.now());
    setAmsamKey(Date.now());
  }, []);


  return (
    <div className="mt-24 max-lg:mt-20">
      <ContentBlackCard
        link="/EduDetails"
        heading={"Horoscope Details"}
        desc="Please enter your horoscope details to assist in finding a compatible match based on astrological preferences."
      />
      <div className="mx-auto w-[60%]  my-10  max-2xl:w-[60%] max-xl:w-[80%] max-lg:w-full max-md:w-full max-md:my-5">

        <div className="container flex justify-between space-x-24  max-lg:flex-col max-lg:space-x-0 max-lg:gap-y-8 ">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-5"
          >
            <div className="w-full space-y-5">

              <div>
                <label htmlFor="timeOfBirth" className="block mb-1 text-primary font-medium ">
                  Time of Birth
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative w-full">
                    <select
                      value={hours}
                      onChange={(e) => sethour(e.target.value)}
                      className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    >
                      <option value="" disabled>Select hour</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                        <option key={hour} value={hour.toString().padStart(2, "0")}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <IoMdArrowDropdown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={20}
                    />
                  </div>
                  <span>:</span>
                  <div className="relative w-full">
                    <select
                      value={minutes}
                      onChange={(e) => setminute(e.target.value)}
                      className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    >
                      <option value="" disabled>Select minute</option>
                      {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                        <option
                          key={minute}
                          value={minute.toString().padStart(2, "0")}
                        >
                          {minute.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                    <IoMdArrowDropdown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={20}
                    />
                  </div>
                  <div className="relative w-full">
                    <select
                      value={periods}
                      onChange={(e) => setperiod(e.target.value)}
                      className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    >
                      <option value="" disabled>AM or PM</option>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                    <IoMdArrowDropdown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              <div>
                <InputField
                  label={"Place of Birth"}
                  {...register("placeOfBirth", {
                    setValueAs: (value) => value.trim(),
                    required: "Place of Birth is required",
                  })}
                  onChange={(e) => {
                    setBirthPlace(e.target.value);
                    setValue("placeOfBirth", e.target.value);
                  }}
                  required
                />
                {errors.placeOfBirth && (
                  <span className="text-red-500">
                    {errors.placeOfBirth.message}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="birthStar" className="block mb-1 text-primary font-medium ">
                  Birth Star <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="birthStar"
                    value={birthStarId}
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    {...register("birthStar")}
                    onChange={(e) => setBirthStarId(e.target.value)}
                  >
                    <option value="" selected disabled>
                      Select your Birth Star
                    </option>
                    {birthStar.map((option) => (
                      <option key={option.birth_id} value={option.birth_id}>
                        {option.birth_star}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
                {errors.birthStar && (
                  <span className="text-red-500">{errors.birthStar.message}</span>
                )}
              </div>

              <div>
                <label htmlFor="padham" className="block mb-1 text-primary font-medium">
                  Padham
                </label>
                <div className="relative">
                  <select
                    id="padham"
                    value={padham || ""}
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    onChange={(e) => {
                      const value = e.target.value;
                      const padhamValue = value === "" ? null : value;
                      setPadham(padhamValue);
                      setValue("padham", padhamValue);
                    }}
                  >
                    <option value="">Select Padham</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rasi" className="block mb-1 text-primary font-medium ">
                  Rasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={rasiId}
                    id="rasi"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    onChange={(e) => {
                      setRasiId(e.target.value);
                      setValue("rasi", e.target.value, { shouldValidate: true });
                    }}
                    required
                  >
                    <option value="" disabled>Select your Rasi</option>
                    {rasi.map((option) => (
                      <option key={option.rasi_id} value={option.rasi_id}>
                        {option.rasi_name}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
                {errors.rasi && (
                  <span className="text-red-500">{errors.rasi.message}</span>
                )}
              </div>

              <div>
                <label htmlFor="lagnam" className="block mb-1 text-primary font-medium ">
                  lagnam / Didi
                </label>
                <div className="relative">
                  <select
                    value={didi}
                    id="lagnam"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    onChange={(e) => setDidi(e.target.value)}
                  >
                    <option value="" selected disabled>
                      Select your lagnam / Didi
                    </option>
                    {lagnam.map((option) => (
                      <option key={option.didi_id} value={option.didi_id}>
                        {option.didi_description}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lagnam" className="block mb-1 text-primary font-medium">
                  Didi
                </label>
                <input
                  type="text"
                  id="lagnam"
                  className="outline-none w-full text-placeHolderColor px-4 py-[8.5px] border border-ashBorder rounded"
                  placeholder="Enter your Didi"
                />
              </div>

              <div>
                <label htmlFor="chevvaiDhosam" className="block mb-1 text-primary font-medium ">
                  Chevvai Dhosam
                </label>
                <div className="relative">
                  <select
                    id="chevvaiDhosam"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    {...register("chevvaiDhosam")}
                    onChange={handleSelectChange}
                  >
                    <option value="" disabled>
                      Select Chevvai Dhosam
                    </option>
                    {["UnKnown", "Yes", "No"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
                {errors.chevvaiDhosam && (
                  <span className="text-red-500">
                    {errors.chevvaiDhosam.message}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="sarpaDhosham" className="block mb-1 text-primary font-medium ">
                  Ragu/Kethu Dhosham
                </label>
                <div className="relative">
                  <select
                    id="sarpaDhosham"
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    {...register("sarpaDhosham")}
                    onChange={handleSelectChange}
                  >
                    <option value="" disabled>
                      Select Ragu/Kethu Dhosham
                    </option>
                    {["UnKnown", "Yes", "No"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
                {errors.sarpaDhosham && (
                  <span className="text-red-500">
                    {errors.sarpaDhosham.message}
                  </span>
                )}
                <div>
                </div>
              </div>

              <div>
                <InputField
                  label={"Naalikai"}
                  value={nalikai}
                  onChange={(e) => setNalikai(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="dasaDropdown" className="block mb-1 text-primary font-medium ">
                  Dasa Name
                </label>
                <div className="relative">
                  <select
                    className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                    id="dasaDropdown"
                    value={selectedDasa}
                    onChange={(e) => setSelectedDasa(e.target.value)}
                  >
                    <option value="" selected disabled>
                      Select Dasa Name
                    </option>
                    {dasa.map((dasa: any, index: any) => (
                      <option key={index} value={dasa.dasa_description}>
                        {dasa.dasa_description}
                      </option>
                    ))}
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block mb-1 text-primary font-medium ">
                  Dasa Balance
                </label>
                <div className="flex space-x-2">
                  <div className="w-full">
                    <div className="relative">
                      <select
                        id="year"
                        className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                        value={dasaYear}
                        onChange={handleYearChange}
                      >
                        <option value="">Years</option>
                        <option value="0">0</option>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <IoMdArrowDropdown
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                        size={20}
                      />
                    </div>
                    {errors.year && (
                      <span className="text-red-500">{errors.year.message}</span>
                    )}
                  </div>

                  <div className="w-full ">
                    <div className="relative">
                      <select
                        id="month"
                        className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                        value={dasaMonth}
                        onChange={handleMonthChange}
                      >
                        <option value="">Months</option>
                        <option value="0">0</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(1, '0');
                          return (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          );
                        })}
                      </select>
                      <IoMdArrowDropdown
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                        size={20}
                      />
                    </div>
                    {errors.month && (
                      <span className="text-red-500">{errors.month.message}</span>
                    )}
                  </div>
                  <div className=" w-full">
                    <div className="relative">
                      <select
                        id="day"
                        className="outline-none w-full text-placeHolderColor px-3 py-[13px] text-sm border border-ashBorder rounded appearance-none"
                        value={dasaDay}
                        onChange={handleDayChange}
                      >
                        <option value="">Days</option>
                        <option value="0">0</option>
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = (i + 1).toString().padStart(1, '0');
                          return (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          );
                        })}
                      </select>
                      <IoMdArrowDropdown
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                        size={20}
                      />
                    </div>
                    {errors.day && (
                      <span className="text-red-500">{errors.day.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <InputField
                label={"Horoscope Hints"}
                value={horoHint}
                onChange={(e) => setHoroHint(e.target.value)}
              />
            </div>

            <DndProvider backend={HTML5Backend}>
              <RasiGrid key={rasiKey} centerLabel={"Rasi"} rasiTemp={undefined} />
            </DndProvider>

            <DndProvider backend={HTML5Backend}>
              <AmsamGrid key={amsamKey} centerLabel={"Amsam"} rasiTemp={undefined} />
            </DndProvider>

            <div className="mt-7 flex justify-end">
              <div className="flex space-x-4">
                <Link to={"/PartnerSettings"}>
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

export default HoroDetails;
