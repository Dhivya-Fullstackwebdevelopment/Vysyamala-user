/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
//import axios from "axios";
import RasiGridnew from "../../HoroDetails/RasiGridnew";
import AmsamGridnew from "../../HoroDetails/AmsamGridnew";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../API";

// Define the interface for the horoscope details

interface HoroscopeDetails {
  personal_bthstar_id: number;
  personal_bthstar_name: string;
  personal_bth_rasi_id: number;
  personal_bth_rasi_name: string;
  personal_lagnam_didi_name: string;
  personal_didi: string;
  personal_chevvai_dos: string;
  personal_ragu_dos: string;
  personal_nalikai: string;
  personal_surya_goth: string;
  personal_dasa: string;
  personal_dasa_bal: string;
  personal_rasi_katt: string;
  personal_amsa_katt: string;
  personal_horoscope_hints: string;
  personal_madulamn: string;
  personal_padham?: string | number | null;
}

// Define the interface for Lagnam data
interface Lagnam {
  didi_id: number;
  didi_description: string;
}

interface BirthStar {
  birth_id: number;
  birth_star: string;
}

interface Rasi {
  rasi_id: number;
  rasi_name: string;
}

export const Horoscope = () => {
  const [horoscopeDetails, setHoroscopeDetails] =
    useState<HoroscopeDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<HoroscopeDetails>>({});
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
  const [birthStars, setBirthStars] = useState<BirthStar[]>([]);
  const [selectedBirthStarId, setSelectedBirthStarId] = useState<
    number | string>("");
  const [lagnams, setLagnams] = useState<Lagnam[]>([]);
  const [selectedLagnamId, setSelectedLagnamId] = useState<number | string>("");
  const [rasiList, setRasiList] = useState<Rasi[]>([]);
  const [selectedRasiId, setSelectedRasiId] = useState<number | string>("");
  const [refreshData, setRefreshData] = useState(false);
  const [dasaBalanceDay, setDasaBalanceDay] = useState("");
  const [dasaBalanceMonth, setDasaBalanceMonth] = useState("");
  const [dasaBalanceYear, setDasaBalanceYear] = useState("");
  const [errors, setErrors] = useState({
    selectedBirthStarId: "",
    selectedRasiId: "",
    personal_surya_goth: ""
    // selectedLagnamId: "",
    // personal_chevvai_dos: "",
    // personal_didi: "",
    // personal_ragu_dos: "",
    // personal_nalikai: "",
    // personal_dasa: "",
    // personal_dasa_bal: "",
    // personal_rasi_katt: "",
    // personal_amsa_katt: "",
    // personal_horoscope_hints: "",
  });

  // useEffect(() => {
  //   const fetchHoroscopeDetails = async () => {
  //     try {
  //       const response = await apiClient.post(
  //         "/auth/get_myprofile_horoscope/",
  //         {
  //           profile_id: loginuser_profileId,
  //         }
  //       );
  //       const data = response.data.data;
  //       ////console.log("horoscope", response.data.data);
  //       setHoroscopeDetails(data);

  //       const matchedLagnam = lagnams.find((lagnam) =>
  //         lagnam.didi_description.includes(data.personal_lagnam_didi_name)
  //       );
  //       if (matchedLagnam) {
  //         setSelectedLagnamId(matchedLagnam.didi_id);
  //       }

  //       setSelectedBirthStarId(data.personal_bthstar_id || "");
  //       setSelectedRasiId(data.personal_bth_rasi_id || "");
  //       sessionStorage.setItem("formattedDatarasi", data.personal_rasi_katt);
  //       sessionStorage.setItem("formattedDatamsam", data.personal_amsa_katt);
  //     } catch (error) {
  //       console.error("Error fetching horoscope details:", error);
  //     }
  //   };

  //   fetchHoroscopeDetails();
  // }, [loginuser_profileId, lagnams, refreshData]);


  // Add this useEffect after your existing useEffect that fetches horoscope details
  // Replace the existing dasa balance parsing section with this:

  useEffect(() => {
    const fetchHoroscopeDetails = async () => {
      try {
        const response = await apiClient.post(
          "/auth/get_myprofile_horoscope/",
          {
            profile_id: loginuser_profileId,
          }
        );
        const data = response.data.data;
        setHoroscopeDetails(data);

        // Parse dasa_balance - handle both new and old formats
        const dasaBalance1 = data.personal_dasa_bal;
        if (dasaBalance1 && typeof dasaBalance1 === 'string') {
          // Check for the new format first: "Y Years, M Months, D Days"
          const yearMatch = dasaBalance1.match(/(\d+)\s*Years/);
          const monthMatch = dasaBalance1.match(/(\d+)\s*Months/);
          const dayMatch = dasaBalance1.match(/(\d+)\s*Days/);

          if (yearMatch || monthMatch || dayMatch) {
            const year = yearMatch ? yearMatch[1] : "";
            const month = monthMatch ? monthMatch[1] : "";
            const day = dayMatch ? dayMatch[1] : "";

            setDasaBalanceYear(year);
            setDasaBalanceMonth(month);
            setDasaBalanceDay(day);
          } else {
            // Fallback to original parsing logic for old data formats
            try {
              const parsedBalance = JSON.parse(dasaBalance1);
              if (parsedBalance && typeof parsedBalance === 'object') {
                setDasaBalanceYear(parsedBalance.year?.toString() || "");
                setDasaBalanceMonth(parsedBalance.month?.toString() || "");
                setDasaBalanceDay(parsedBalance.day?.toString() || "");
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
                setDasaBalanceYear(year);
                setDasaBalanceMonth(month);
                setDasaBalanceDay(day);
              } else {
                setDasaBalanceYear('');
                setDasaBalanceMonth('');
                setDasaBalanceDay('');
              }
            }
          }
        } else {
          setDasaBalanceYear('');
          setDasaBalanceMonth('');
          setDasaBalanceDay('');
        }

        // ... rest of your existing code for other fields
        const matchedLagnam = lagnams.find((lagnam) =>
          lagnam.didi_description.includes(data.personal_lagnam_didi_name)
        );
        if (matchedLagnam) {
          setSelectedLagnamId(matchedLagnam.didi_id);
        }

        setSelectedBirthStarId(data.personal_bthstar_id || "");
        setSelectedRasiId(data.personal_bth_rasi_id || "");
        sessionStorage.setItem("formattedDatarasi", data.personal_rasi_katt);
        sessionStorage.setItem("formattedDatamsam", data.personal_amsa_katt);
      } catch (error) {
        console.error("Error fetching horoscope details:", error);
      }
    };

    fetchHoroscopeDetails();
  }, [loginuser_profileId, lagnams, refreshData]);

  useEffect(() => {
    console.log("Padham value debug:", {
      formData_padham: formData.personal_padham,
      type: typeof formData.personal_padham,
      isNull: formData.personal_padham === null,
      isUndefined: formData.personal_padham === undefined,
      isString: typeof formData.personal_padham === 'string',
      isEmptyString: formData.personal_padham === ''
    });
  }, [formData.personal_padham]);

  // Add these useEffects to handle dasa balance formatting
  useEffect(() => {
    const parts = [];

    // Only include non-zero and non-empty values
    if (dasaBalanceYear) {
      parts.push(`${dasaBalanceYear} Years`);
    }
    if (dasaBalanceMonth) {
      parts.push(`${dasaBalanceMonth} Months`);
    }
    if (dasaBalanceDay) {
      parts.push(`${dasaBalanceDay} Days`);
    }

    const formattedBalance = parts.join(', ');
    setFormData(prev => ({ ...prev, personal_dasa_bal: formattedBalance }));
  }, [dasaBalanceYear, dasaBalanceMonth, dasaBalanceDay]);

  // Update the dropdown change handlers
  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDasaBalanceDay(value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDasaBalanceMonth(value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDasaBalanceYear(value);
  };

  useEffect(() => {
    const fetchBirthStars = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_Birth_Star/",
          {
            personal_bthstar_name: "",
          }
        );
        const birthStarsData = Object.values(response.data) as BirthStar[];
        setBirthStars(birthStarsData);
      } catch (error) {
        console.error("Error fetching Birth Star data:", error);
      }
    };
    const fetchLagnams = async () => {
      try {
        const response = await apiClient.post(
          "/auth/Get_Lagnam_Didi/",
          {}
        );
        const lagnamsData = Object.values(response.data) as Lagnam[];
        setLagnams(lagnamsData);
      } catch (error) {
        console.error("Error fetching Lagnam data:", error);
      }
    };

    fetchLagnams();
    fetchBirthStars();
  }, [refreshData]);

  useEffect(() => {
    const fetchRasis = async () => {
      // if (!selectedRasiId) return;

      try {
        const response = await apiClient.post(
          "/auth/Get_Rasi/",
          {
            birth_id: selectedBirthStarId.toString(),
          }
        );
        const rasiData = Object.values(response.data) as Rasi[];
        setRasiList(rasiData);
      } catch (error) {
        console.error("Error fetching Rasi data:", error);
      }
    };

    fetchRasis();
  }, [selectedBirthStarId, refreshData]);

  // const handleBirthStarChange = (
  //   event: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //   const selectedId = event.target.value;
  //   setSelectedBirthStarId(selectedId);
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     personal_bthstar_name:
  //       event.target.options[event.target.selectedIndex].text,
  //   }));
  // };
  const handleBirthStarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const selectedStar = birthStars.find(star => star.birth_id.toString() === selectedId);

    setSelectedBirthStarId(selectedId);
    setFormData(prevState => ({
      ...prevState,
      personal_bthstar_id: Number(selectedId),
      personal_bthstar_name: selectedStar?.birth_star || ""
    }));
  };

  // const handleLagnamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedLagnamId(e.target.value);
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     personal_lagnam_didi_name: e.target.value,
  //   }));
  // };
  const handleLagnamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedLagnam = lagnams.find(lagnam => lagnam.didi_id.toString() === selectedId);

    setSelectedLagnamId(selectedId);
    setFormData(prevState => ({
      ...prevState,
      personal_lagnam_didi_name: selectedLagnam?.didi_description || ""
    }));
  };

  // const handleRasiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedRasiId(e.target.value);
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     personal_bth_rasi_name: e.target.value,
  //   }));
  // };

  const handleRasiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedRasi = rasiList.find(rasi => rasi.rasi_id.toString() === selectedId);

    setSelectedRasiId(selectedId);
    setFormData(prevState => ({
      ...prevState,
      personal_bth_rasi_id: Number(selectedId),
      personal_bth_rasi_name: selectedRasi?.rasi_name || ""
    }));
  };

  const handleRasiGridChange = (newData: string) => {
    setFormData((prevState) => ({
      ...prevState,
      personal_rasi_katt: newData,
    }));
  };

  const handleAmsamGridChange = (newData: string) => {
    setFormData((prevState) => ({
      ...prevState,
      personal_amsa_katt: newData,
    }));
  };

  // const handleEditClick = () => {
  //   if (isEditing) {
  //     setFormData({});
  //   } else {
  //     if (horoscopeDetails) {
  //       setFormData(horoscopeDetails);
  //     }
  //   }
  //   setIsEditing(!isEditing);
  // };


  // Replace your existing useEffect that handles dasa balance formatting
  useEffect(() => {
    const parts = [];

    // Only include non-zero and non-empty values
    if (dasaBalanceYear) {
      parts.push(`${dasaBalanceYear} Years`);
    }
    if (dasaBalanceMonth) {
      parts.push(`${dasaBalanceMonth} Months`);
    }
    if (dasaBalanceDay) {
      parts.push(`${dasaBalanceDay} Days`);
    }

    const formattedBalance = parts.join(', ');
    setFormData(prev => ({ ...prev, personal_dasa_bal: formattedBalance }));
  }, [dasaBalanceYear, dasaBalanceMonth, dasaBalanceDay]);

  // Add this useEffect to handle the "0" default logic
  useEffect(() => {
    // Check if any field has a meaningful value (not '' or '0')
    const isAnyFieldSet =
      (dasaBalanceYear && dasaBalanceYear !== '0') ||
      (dasaBalanceMonth && dasaBalanceMonth !== '0') ||
      (dasaBalanceDay && dasaBalanceDay !== '0');

    // Prevent this logic from running on initial load before values are set
    if (dasaBalanceYear === undefined || dasaBalanceMonth === undefined || dasaBalanceDay === undefined) {
      return;
    }

    if (isAnyFieldSet) {
      // If at least one field is set, ensure others default to '0' instead of ''
      if (!dasaBalanceYear || dasaBalanceYear === '') setDasaBalanceYear('0');
      if (!dasaBalanceMonth || dasaBalanceMonth === '') setDasaBalanceMonth('0');
      if (!dasaBalanceDay || dasaBalanceDay === '') setDasaBalanceDay('0');
    } else {
      // If all fields have been cleared by the user, reset any '0' values back to ''
      if (dasaBalanceYear === '0') setDasaBalanceYear('');
      if (dasaBalanceMonth === '0') setDasaBalanceMonth('');
      if (dasaBalanceDay === '0') setDasaBalanceDay('');
    }
  }, [dasaBalanceYear, dasaBalanceMonth, dasaBalanceDay]);

  // Update the handleEditClick function to properly initialize dasa balance
  const handleEditClick = () => {
    if (isEditing) {
      setFormData({});
      setDasaBalanceYear("");
      setDasaBalanceMonth("");
      setDasaBalanceDay("");
    } else {
      if (horoscopeDetails) {
        setFormData({
          ...horoscopeDetails,
          personal_bthstar_id: horoscopeDetails.personal_bthstar_id,
          personal_bth_rasi_id: horoscopeDetails.personal_bth_rasi_id,
          personal_padham: horoscopeDetails.personal_padham === null ? "" : horoscopeDetails.personal_padham,
        });

        setSelectedBirthStarId(horoscopeDetails.personal_bthstar_id?.toString() || "");
        setSelectedRasiId(horoscopeDetails.personal_bth_rasi_id?.toString() || "");

        const matchedLagnam = lagnams.find(lagnam =>
          horoscopeDetails.personal_lagnam_didi_name?.includes(lagnam.didi_description)
        );
        setSelectedLagnamId(matchedLagnam?.didi_id.toString() || "");

        // Parse dasa balance for editing with proper "0" handling
        if (horoscopeDetails.personal_dasa_bal) {
          const yearMatch = horoscopeDetails.personal_dasa_bal.match(/(\d+)\s*Years/);
          const monthMatch = horoscopeDetails.personal_dasa_bal.match(/(\d+)\s*Months/);
          const dayMatch = horoscopeDetails.personal_dasa_bal.match(/(\d+)\s*Days/);

          if (yearMatch || monthMatch || dayMatch) {
            const year = yearMatch ? yearMatch[1] : "0";
            const month = monthMatch ? monthMatch[1] : "0";
            const day = dayMatch ? dayMatch[1] : "0";

            setDasaBalanceYear(year);
            setDasaBalanceMonth(month);
            setDasaBalanceDay(day);
          } else {
            // Fallback for old data formats
            setDasaBalanceYear("0");
            setDasaBalanceMonth("0");
            setDasaBalanceDay("0");
          }
        } else {
          // Initialize with zeros when no existing data
          setDasaBalanceYear("0");
          setDasaBalanceMonth("0");
          setDasaBalanceDay("0");
        }
      }
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    console.log("Current formData:", formData);
    console.log("Selected IDs:", {
      birthStar: selectedBirthStarId,
      rasi: selectedRasiId,
      lagnam: selectedLagnamId
    });
    console.log("Dasa Balance States:", {
      day: dasaBalanceDay,
      month: dasaBalanceMonth,
      year: dasaBalanceYear
    });
  }, [formData, selectedBirthStarId, selectedRasiId, selectedLagnamId, dasaBalanceDay, dasaBalanceMonth, dasaBalanceYear]);

  const navigate = useNavigate();
  const handleEditClick1 = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      navigate(-1);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      selectedBirthStarId: !selectedBirthStarId
        ? "Birth Star is required."
        : "",
      selectedRasiId: !selectedRasiId ? "Rasi is required." : "",
      personal_surya_goth: !formData.personal_surya_goth ? "Suya Gothram is required" : "",
      // selectedLagnamId: !selectedLagnamId ? "Lagnam is required." : "",
      // personal_didi: !formData.personal_didi ? "Didi is required" : "",
      // personal_chevvai_dos: !formData.personal_chevvai_dos
      //   ? "Chevvai Dosham is required."
      //   : "",
      // personal_ragu_dos: !formData.personal_ragu_dos
      //   ? "Ragu Dosham is required."
      //   : "",
      // personal_nalikai: !formData.personal_nalikai
      //   ? "Nalikai is required."
      //   : "",
      // personal_dasa: !formData.personal_dasa ? "Dasa is required." : "",
      // personal_dasa_bal: !formData.personal_dasa_bal
      //   ? "Dasa Balance is required."
      //   : "",
      // personal_rasi_katt: !formData.personal_rasi_katt
      //   ? "Rasi Katt is required."
      //   : "",
      // personal_amsa_katt: !formData.personal_amsa_katt
      //   ? "Amsa Katt is required."
      //   : "",
      // personal_horoscope_hints: !formData.personal_horoscope_hints
      //   ? "Horoscope Hints is required."
      //   : "",
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
        "/auth/update_myprofile_horoscope/",
        {
          profile_id: loginuser_profileId,
          birthstar_name: selectedBirthStarId,
          birth_rasi_name: selectedRasiId,
          lagnam_didi: selectedLagnamId,
          didi: formData.personal_didi,
          chevvai_dosaham: formData.personal_chevvai_dos,
          ragu_dosham: formData.personal_ragu_dos,
          nalikai: formData.personal_nalikai,
          suya_gothram: formData.personal_surya_goth,
          madulamn: formData.personal_madulamn,
          dasa_name: formData.personal_dasa,
          dasa_balance: formData.personal_dasa_bal,
          rasi_kattam: formData.personal_rasi_katt,
          amsa_kattam: formData.personal_amsa_katt,
          horoscope_hints: formData.personal_horoscope_hints, // Add this line
          padham: formData.personal_padham,
        }
      );

      if (response.data.status === "success") {
        // Show success alert
        toast.success("Horoscope details updated successfully!");
        setRefreshData((prev) => !prev); // Trigger re-fetch of data

        // Reload the page or update the state with the new data
        // window.location.reload(); // Or use state to update without reloading

        // Update the local state with the new details
        setHoroscopeDetails((prevState) => ({
          ...prevState!,
          ...formData,
        }));

        // Close editing mode
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating horoscope details:", error);
      toast.error("Failed to update horoscope details. Please try again.");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRaguSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };



  if (!horoscopeDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="flex items-center text-[30px] text-vysyamalaBlack font-bold mb-5  max-xl:text-[26px] max-md:text-[24px] max-sm:text-[18px] max-sm:justify-between max-sm:mb-2 ">
        Horoscope Details
        <MdModeEdit
          className="text-2xl text-main ml-2 cursor-pointer  max-sm:text-base"
          onClick={handleEditClick}
        />
      </h2>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-rows-1 grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-0">
            <div>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Birthstar Name:
                <select
                  name="personal_bthstar_name"
                  value={selectedBirthStarId}
                  onChange={(e) => {
                    handleBirthStarChange(e);
                    setErrors((prev) => ({ ...prev, selectedBirthStarId: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder
                                        ${errors.selectedBirthStarId
                      ? "border-red-500"
                      : "focus:outline-none"
                    }`}
                >
                  <option value="">Select Birth Star</option>
                  {birthStars.map((star) => (
                    <option key={star.birth_id} value={star.birth_id}>
                      {star.birth_star}
                    </option>
                  ))}
                </select>
                {errors.selectedBirthStarId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedBirthStarId}
                  </p>
                )}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Rasi Name:
                <select
                  name="personal_bth_rasi_name"
                  value={selectedRasiId}
                  onChange={(e) => {
                    handleRasiChange(e);
                    setErrors((prev) => ({ ...prev, selectedRasiId: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder
                                        ${errors.selectedRasiId
                      ? "border-red-500"
                      : "focus:outline-none"
                    }`}
                >
                  <option value="">Select Rasi</option>
                  {rasiList.map((rasi) => (
                    <option key={rasi.rasi_id} value={rasi.rasi_id}>
                      {rasi.rasi_name}
                    </option>
                  ))}
                </select>
                {errors.selectedRasiId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedRasiId}
                  </p>
                )}
              </label>

              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Lagnam:
                <select
                  name="personal_lagnam_didi_name"
                  value={selectedLagnamId}
                  onChange={(e) => {
                    handleLagnamChange(e);
                    setErrors((prev) => ({ ...prev, selectedLagnamId: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none  border-ashBorder
                                      `}
                >
                  <option value="">Select Lagnam</option>
                  {lagnams.map((lagnam) => (
                    <option key={lagnam.didi_id} value={lagnam.didi_id}>
                      {lagnam.didi_description}
                    </option>
                  ))}
                </select>

              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Dasa Name:
                <input
                  type="text"
                  name="personal_dasa"
                  value={formData.personal_dasa || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, personal_dasa: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                                     `}
                />

              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Dasa Balance:
                <div className="flex space-x-2">
                  <div className="relative w-full">
                    <select
                      value={dasaBalanceYear}
                      // onChange={(e) => {
                      //   const newYear = e.target.value;
                      //   setDasaBalanceYear(newYear);
                      //   const balance = ` ${newYear} Years, ${dasaBalanceMonth} Months, ${dasaBalanceDay} Days`;
                      //   setFormData(prev => ({ ...prev, personal_dasa_bal: balance }));
                      // }}
                      onChange={handleYearChange}
                      className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none border-ashBorder
                       `}
                    >
                      <option value="">Years</option>
                      <option value="">0</option>
                      {dasaBalanceYear && !Array.from({ length: 50 }, (_, i) => i + 1).includes(Number(dasaBalanceYear)) && (
                        <option value={dasaBalanceYear}>{dasaBalanceYear}</option>
                      )}
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-full">
                    <select
                      value={dasaBalanceMonth}
                      // onChange={(e) => {
                      //   const newMonth = e.target.value;
                      //   setDasaBalanceMonth(newMonth);
                      //   const balance = ` ${dasaBalanceYear} Years, ${newMonth} Months, ${dasaBalanceDay} Days`;
                      //   setFormData(prev => ({ ...prev, personal_dasa_bal: balance }));
                      // }}
                      onChange={handleMonthChange}
                      className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none border-ashBorder
                        `}
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
                  </div>

                  <div className="relative w-full">
                    <select
                      value={dasaBalanceDay}
                      // onChange={(e) => {
                      //   const newDay = e.target.value;
                      //   setDasaBalanceDay(newDay);
                      //   const balance = `${dasaBalanceYear} Years,  ${dasaBalanceMonth} Months, ${newDay} Days,`;
                      //   setFormData(prev => ({ ...prev, personal_dasa_bal: balance }));
                      // }}
                      onChange={handleDayChange}
                      className={`font-normal border rounded px-3 py-[10px] w-full focus:outline-none border-ashBorder
                       `}
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
                  </div>
                </div>
              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Nalikai:
                <input
                  type="text"
                  name="personal_nalikai"
                  value={formData.personal_nalikai || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, personal_nalikai: "" })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                                     `}
                />

              </label>
            </div>
            <div>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Padham:
                <select
                  name="personal_padham"
                  value={formData.personal_padham === null || formData.personal_padham === undefined ? "" : String(formData.personal_padham)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const finalValue = value === "" ? null : Number(value);
                    setFormData(prev => ({ ...prev, personal_padham: finalValue }));
                  }}
                  className="font-normal border rounded px-3 py-[10px] w-full focus:outline-none border-ashBorder"
                >
                  <option value="">Select Padham</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Didi
                <input
                  type="text"
                  name="personal_didi"
                  value={formData.personal_didi || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({
                      ...prev,
                      personal_didi: "",
                    })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                                       `}
                />

              </label>
              <label className={`block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium  
              `}>
                Suya Gothram:
                <input
                  type="text"
                  name="personal_surya_goth"
                  value={formData.personal_surya_goth || ""}
                  onChange={handleInputChange}
                  className={`font-normal border rounded px-3 py-[8px] w-full focus:outline-none  border-ashBorder  ${errors.personal_surya_goth
                    ? "border-red-500"
                    : "focus:outline-none"
                    }`}
                />
                {errors.personal_surya_goth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.personal_surya_goth}
                  </p>
                )}
              </label>
              <label className={`block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium  
              `}>
                Madhulam:
                <input
                  type="text"
                  name="personal_madulamn"
                  value={formData.personal_madulamn || ""}
                  onChange={handleInputChange}
                  className={`font-normal border rounded px-3 py-[8px] w-full focus:outline-none  border-ashBorder`}
                />

              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Ragu Dosham:
                <select
                  name="personal_ragu_dos"
                  value={formData.personal_ragu_dos || ""}
                  onChange={handleRaguSelectChange}
                  className={`font-normal border rounded px-3 py-3 w-full focus:outline-none border-ashBorder `}
                >
                  <option value="">Select</option>
                  <option value="Unknown">Unknown</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>

              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Chevvai Dosham:
                <select
                  name="personal_chevvai_dos"
                  value={formData.personal_chevvai_dos || ""}
                  onChange={handleSelectChange}
                  className={`font-normal border rounded px-3 py-3 w-full focus:outline-none border-ashBorder]`}
                >
                  <option value="">Select</option>
                  <option value="Unknown">Unknown</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>


              </label>
              <label className="block mb-2 text-[20px] text-ash font-semibold max-xl:text-[18px] max-lg:text-[16px] max-lg:font-medium">
                Horoscope Hints:
                <input
                  type="text"
                  name="personal_horoscope_hints"
                  value={formData.personal_horoscope_hints || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({
                      ...prev,
                      personal_horoscope_hints: "",
                    })); // Clear error on change
                  }}
                  className={`font-normal border rounded px-3 py-2 w-full focus:outline-none  border-ashBorder
                                      `}
                />

              </label>
            </div>
          </div>

          <div className="space-y-10 my-10">
            <div>
              <RasiGridnew
                data={horoscopeDetails.personal_rasi_katt || ""}
                centerLabel={"Rasi"}
                onChange={handleRasiGridChange}
                isEditing={isEditing} // Pass isEditing state
              />

            </div>
            <div>
              <AmsamGridnew
                data={formData.personal_amsa_katt || ""}
                onChange={handleAmsamGridChange}
                centerLabel={"Amsam"}
                isEditing={isEditing}
              />

            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end items-center space-x-5 max-sm:flex-wrap-reverse">
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
          <div className="grid grid-rows-1 grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-0">
            <div>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Birth Star:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_bthstar_name || "N/A"}
                  {horoscopeDetails?.personal_padham &&
                    horoscopeDetails.personal_padham !== "" &&
                    horoscopeDetails.personal_padham !== null &&
                    horoscopeDetails.personal_padham !== "0" &&
                    horoscopeDetails.personal_padham !== 0 &&
                    ` - ${horoscopeDetails.personal_padham}`}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Rasi:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_bth_rasi_name || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Lagnam:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_lagnam_didi_name || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Dasa Name:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_dasa || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Dasa Balance:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_dasa_bal || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Nallikai:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_nalikai || "N/A"}
                </span>
              </h5>
            </div>
            <div>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Didi:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_didi || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Suya Gothram:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_surya_goth || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Madhulam:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_madulamn || "N/A"}
                </span>
              </h5>

              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Ragu Dosham:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_ragu_dos || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Chevai Dosham:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_chevvai_dos || "N/A"}
                </span>
              </h5>
              <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                Horoscope Hints:
                <span className="font-normal">
                  {" "}
                  {horoscopeDetails.personal_horoscope_hints || "N/A"}
                </span>
              </h5>
            </div>
          </div>
          <div className="flex justify-between mt-5 max-md:flex-col  max-md:hidden">
            <h2 className="text-[30px] text-vysyamalaBlack font-bold mb-5  max-xl:text-[26px] max-md:text-[24px] max-sm:text-[18px] max-sm:justify-between max-sm:mb-2 ">Rasi & Amsam Grid</h2>
            {/* <div className="flex gap-3">
            <label htmlFor="mz-switch-rounded" className=" text-[12px] font-medium">English</label>
              <div>
                <input className="mz-switch-rounded" type="checkbox" name="" id="mz-switch-rounded" />
                <label htmlFor="mz-switch-rounded"></label>
              </div>
              <label htmlFor="mz-switch-rounded"  className=" text-[12px] font-medium">tamil</label>
            </div> */}

          </div>

          <div className="space-y-10 my-10 max-md:my-5 max-md:hidden">
            <div>
              <RasiGridnew
                data={horoscopeDetails.personal_rasi_katt || ""}
                centerLabel={"Rasi"}
                onChange={handleRasiGridChange}
                isEditing={isEditing} // Pass isEditing state
              />
            </div>
            <div>
              <AmsamGridnew
                data={horoscopeDetails.personal_amsa_katt || ""}
                centerLabel={"Amsam"}
                onChange={handleAmsamGridChange}
                isEditing={isEditing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};