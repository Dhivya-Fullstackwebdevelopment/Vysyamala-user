/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import HeroBanner from "../../assets/images/HeroBanner.webp";
import HeroBanner from "../../assets/images/HeroBanner.webp";
import { FaArrowRightLong } from "react-icons/fa6";
import axios, { AxiosResponse } from "axios";
import { PopupModal } from "./PopupModal";
import apiClient from "../../API";
import PhoneInput from "react-phone-input-2";
import { IoMdArrowDropdown } from "react-icons/io";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
//import PhoneInput from 'react-phone-input-2';

// Define the validation schema using Zod
const schema = z.object({
  profileFor: z.string().nonempty("Profile selection is required"),
  gender: z.string().nonempty("Gender is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "Password must contain at least one uppercase letter and one special character"
    ),
  Profile_country: z.string().optional(),
  Profile_state: z.string().optional(),
});

type ProfileOption = {
  owner_id: number;
  owner_description: string;
};

interface HeroSectionProps {
  onNext: (mobile: string) => void;
  onEditNumber?: () => void; // Add new prop for edit number functionality
}

type FormData = z.infer<typeof schema>;

export const HeroSection: React.FC<HeroSectionProps> = ({ onNext, onEditNumber }) => {
  const {
    register,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      Profile_country: "1", // Default India
    },
  });

  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status
  // const [gender, setGender] = useState<string>("");
  const [mobile, setMobileNumber] = useState("");
  const [countries] = useState([
    { id: "1", name: "India" },
    { id: "", name: "NRI" },
  ]);

  const [statesList, setStatesList] = useState<
    { state_id: number; state_name: string }[]
  >([]);

  const [selectedCountry, setSelectedCountry] = useState("1"); // Default India

  // Fetch the profile options from the API
  useEffect(() => {
    const fetchProfileOptions = async () => {
      try {
        const response: AxiosResponse<{ [key: string]: ProfileOption }> =
          await apiClient.post(`/auth/Get_Profileholder/`);
        const data = response.data;
        const options = Object.values(data).map((item) => ({
          owner_id: item.owner_id,
          owner_description: item.owner_description,
        }));
        setProfileOptions(options);
      } catch (error) {
        console.error("Error fetching profile options:", error);
        setProfileOptions([]);
      }
    };

    fetchProfileOptions();
  }, []);

  // //Handle mobile number change and save it to sessionStorage
  // const handleMobileNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value;
  //   setMobileNumber(value);
  //   setValue("mobile", value); // Update the form state
  //   sessionStorage.setItem("mobile", value); // Save to sessionStorage
  // };

  // Handle mobile number change and save it to sessionStorage
  // In HeroSection.tsx, modify the handleMobileNumberChange function:
  const handleMobileNumberChange = (value: string, country: any) => {
    setMobileNumber(value);
    setValue("mobile", value);
    localStorage.setItem("mobile", value);
    sessionStorage.setItem("mobile", value);

    // Set flag for India
    const isIndia = country.countryCode === 'in';
    sessionStorage.setItem("isIndia", isIndia.toString());
  };

  // const handleMobileNumberChange =(value:string)=>{
  //   setMobileNumber(value)
  //   sessionStorage.setItem("mobile",value)
  // }

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true); // Set isSubmitting to true when form submission starts

    const registrationData = {
      Profile_for: data.profileFor,
      Gender: data.gender,
      Mobile_no: data.mobile,
      EmailId: data.email.trim(),
      Password: data.password.trim(),
      Profile_country: selectedCountry,
      Profile_state: data.Profile_state || "",
    };
    sessionStorage.setItem("email", data.email);
    try {
      const response = await apiClient.post(
        `/auth/Registrationstep1/`,
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Status === 0) {
        // Set errors returned by the API
        if (response.data.errors?.EmailId) {
          setError("email", {
            type: "manual",
            message: response.data.errors.EmailId[0],
          });
        }
        if (response.data.errors?.Mobile_no) {
          setError("mobile", {
            type: "manual",
            message: response.data.errors.Mobile_no[0],
          });
        }
      } else {
        const { profile_id, profile_owner, Gender } = response.data;

        localStorage.setItem("profile_id", profile_id);

        sessionStorage.setItem("profile_id", profile_id);

        sessionStorage.setItem("profile_owner", profile_owner);

        sessionStorage.setItem("gender", Gender);
        localStorage.setItem("gender", Gender);

        onNext(data.mobile);
        setShowOtpPopup(true); // Show OTP popup after successful registration
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        error.response.data.Mobile_no
      ) {
        console.error("Error registering user:", error);
      } else {
        console.error("Error registering user:", error);
      }
    } finally {
      setIsSubmitting(false); // Reset isSubmitting to false after submission
    }
  };

  // Add handler to clear mobile number and close popup
  const handleEditNumber = () => {
    setMobileNumber("");
    setValue("mobile", "");
    localStorage.removeItem("mobile");
    sessionStorage.removeItem("mobile");
    setShowOtpPopup(false);
    if (onEditNumber) onEditNumber();
  };


  const controls = useAnimation(); // Controls for the animation
  const [ref, inView] = useInView({
    triggerOnce: true, // Trigger animation only once
    threshold: 0.2, // Trigger when 20% of the element is visible
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible"); // Start animation when in view
    }
  }, [controls, inView]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setValue("Profile_country", value);
    setValue("Profile_state", "");

    if (value === "1") {
      fetchStates("1");
    } else {
      setStatesList([]);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//code.tidio.co/0ddzgwb7jku0kpejkcqvuplsouyvgqhw.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchStates = async (countryId: string) => {
    try {
      const response = await apiClient.post(
        `/auth/Get_State/`,
        { country_id: countryId },
        { headers: { "Content-Type": "application/json" } }
      );

      const states = Object.values(response.data) as {
        state_id: number;
        state_name: string;
      }[];

      setStatesList(states);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStatesList([]);
    }
  };

  useEffect(() => {
    fetchStates("1"); // Load India states by default
  }, []);


  return (
    <div>
      <section
        className="h-[120vh] bg-cover  flex items-end justify-center bg-top pb-[70px] max-sm:pb-6 "
        style={{ backgroundImage: `url(${HeroBanner})` }}
      >
        <motion.div
          ref={ref} // Attach the ref to the element
          initial="hidden" // Initial state
          animate={controls} // Control animations with `controls`
          variants={{
            hidden: { opacity: 0, translateY: 150 }, // Hidden state
            visible: { opacity: 1, translateY: 0 }, // Visible state
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mx-auto p-[24px] bg-white rounded-[8px] w-[95%] 2xl:w-[1300px] xl:w-[1200px] max-sm:bottom-[25px]">
            <h5 className="text-[20px] font-semibold text-vysyamalaBlack pb-2 max-md:text-[18px] max-sm:text-[16px]">
              A platform to
            </h5>
            <h3 className="text-[36px] font-bold text-[#ed1e24] pb-8 leading-[40px] max-xl:text-[34px] max-lg:text-[30px] max-md:text-[28px] max-sm:text-[24px] max-sm:leading-7 max-sm:font-semibold">
              Find your <br className="max-sm:hidden" /> perfect partner and
              family
            </h3>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="banner-form flex items-start justify-between  gap-4 max-xl:flex-wrap  max-lg:justify-start max-lg:gap-x-7"
            >
              <div className="w-full inline-flex  flex-row gap-4 max-lg:grid max-lg:grid-cols-3 max-sm:grid-cols-1">
                <div className="w-[175px] flex-shrink-0 max-lg:w-full">
                  <div className="w-full relative">
                    <select
                      className="w-full bg-transparent text-[16px] text-vysyamalaBlack font-normal py-[17px] px-[12px] border-[1px] border-[#282c3f80] rounded-[5px] focus-visible:outline-0 appearance-none  max-xl:px-2 max-lg:py-[12px] max-sm:font-normal max-sm:border-[1px]"
                      {...register("profileFor")}
                    >
                      <option value="" hidden>
                        Create profile for
                      </option>
                      {profileOptions.map((option) => (
                        <option
                          key={option.owner_id}
                          value={option.owner_id}
                          className="text-black"
                        >
                          {option.owner_description}
                        </option>
                      ))}
                    </select>
                    <IoMdArrowDropdown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vysyamalaBlack pointer-events-none"
                      size={20}
                    />
                  </div>

                  {errors.profileFor && (
                    <p className="text-red-500">{errors.profileFor.message}</p>
                  )}
                </div>

                <div className="w-[120px] flex-shrink-0  max-lg:w-full">
                  <div className="w-full relative">
                    <select
                      className="w-full bg-transparent text-[16px] text-vysyamalaBlack font-normal py-[17px] px-[12px] border-[1px] border-[#282c3f80] rounded-[5px] focus-visible:outline-0 appearance-none  max-xl:px-2 max-lg:py-[12px] max-sm:font-normal max-sm:border-[1px]"
                      {...register("gender")}
                    >
                      <option value="" hidden>
                        Gender
                      </option>
                      <option value="male" className="text-black">
                        Male
                      </option>
                      <option value="female" className="text-black">
                        Female
                      </option>
                    </select>
                    <IoMdArrowDropdown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vysyamalaBlack pointer-events-none"
                      size={20}
                    />
                  </div>
                  {errors.gender && (
                    <p className="text-red-500">{errors.gender.message}</p>
                  )}
                </div>

                <div className="w-full">
                  {/* <input
           
                type="tel"
                {...register("mobile")}
                placeholder="Mobile Number"
                className="w-full bg-transparent text-[16px] text-white font-normal py-[18px] px-[12px] border-[1px] border-black rounded-[5px] focus-visible:outline-0 placeholder:text-[16px] placeholder:text-white placeholder:font-normal max-xl:px-2 max-lg:py-[12px] max-sm:placeholder:font-normal max-sm:font-normal max-sm:border-[1px]"
                onChange={handleMobileNumberChange}
              /> */}

                  <PhoneInput
                    inputStyle={{
                      width: "100%",
                      background: "transparent",
                      color: "#282c3f",
                      fontSize: "16px",
                      fontWeight: "400",
                      border: "1px solid #282c3f80",
                      height: "60px", // Adjust the height as needed
                      paddingLeft: "50px",
                      paddingTop: "2px"

                    }}
                    buttonStyle={{
                      backgroundColor: "transparent",
                    }}
                    value={mobile}
                    country={"in"} // Default country
                    preferredCountries={["us", "in", "gb"]}
                    {...register("mobile")}
                    onChange={handleMobileNumberChange}

                  />
                  {errors.mobile && (
                    <p className="text-red-500">{errors.mobile.message}</p>
                  )}
                </div>
                {/* <div className="w-full bg-transparent text-[16px] text-white font-normal py-[18px] px-[12px] border-[1px] border-black rounded-[5px] focus-visible:outline-0 placeholder:text-[16px] placeholder:text-white placeholder:font-normal max-xl:px-2 max-lg:py-[12px] max-sm:placeholder:font-normal max-sm:font-normal max-sm:border-[1px]">
<PhoneInput
          value=""
          inputProps={{
            autoFocus: true,
            autoFormat: true,
            className: "input-style",
          }}
          country={"in"}
          // preferredCountries={["in"]} // India will be shown at the top
          {...register("mobile")}
          preferredCountries={['us', 'in', 'gb']} 
          onChange={handleMobileNumberChange}
        /> */}

                <div className="w-full">
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Email"
                    className="w-full bg-transparent text-[16px] text-vysyamalaBlack font-normal py-[17px] px-[12px] border-[1px] border-[#282c3f80] rounded-[5px] focus-visible:outline-0 placeholder:text-[16px] placeholder:text-vysyamalaBlack placeholder:font-normal max-xl:px-2 max-lg:py-[12px] max-sm:font-normal max-sm:border-[1px]"


                  />
                  {errors.email && (
                    <p className="text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="w-full">
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Create Password"
                    className="w-full bg-transparent text-[16px] text-vysyamalaBlack font-normal py-[17px] px-[12px] border-[1px] border-[#282c3f80] rounded-[5px] focus-visible:outline-0 placeholder:text-[16px] placeholder:text-vysyamalaBlack placeholder:font-normal max-xl:px-2 max-lg:py-[12px] max-sm:placeholder:font-medium max-sm:font-normal max-sm:border-[1px]"


                  />
                  {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                  )}
                </div>

                
                <div className="w-full">
                  <select
                    className="w-full bg-transparent text-[16px] text-vysyamalaBlack font-normal py-[17px] px-[12px] border-[1px] border-[#282c3f80] rounded-[5px]"
                    {...register("Profile_country")}
                    value={selectedCountry}
                    onChange={handleCountryChange}
                  >
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedCountry === "1" && (
                  <div className="w-full">
                    <select
                      className="w-full bg-transparent text-[16px] text-vysyamalaBlack font-normal py-[17px] px-[12px] border-[1px] border-[#282c3f80] rounded-[5px]"
                      {...register("Profile_state")}
                    >
                      <option value="">Select State</option>
                      {statesList.map((state) => (
                        <option key={state.state_id} value={state.state_id}>
                          {state.state_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="max-lg:w-[30%] max-sm:w-full bg-gradient flex justify-center items-center py-[18px] px-[35px] shadow-redboxshadow rounded-[6px] space-x-2">
                <button
                  type="submit"
                  className="text-[16px] text-white font-semibold "
                  disabled={isSubmitting} // Disable the button when form is submitting
                >
                  {isSubmitting ? "Submitting..." : "Register"}
                </button>
                <FaArrowRightLong className="text-white text-[22px]" />
              </div>
            </form>

          </div>
        </motion.div>

      </section>

      {/* Render PopupModal conditionally */}
      {showOtpPopup && (
        <PopupModal
          mobileNumber={mobile}
          onClose={() => setShowOtpPopup(false)}
          onEditNumber={handleEditNumber}
        />
      )}
    </div>
  );
};