import React, { useState, useEffect } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import axios from "axios";
import apiClient from "../../../API";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { fetchFooterContent } from "../../../commonapicall";
import { useLocation, useNavigate } from "react-router-dom";
//import { data } from "currency-codes";

// ZOD Schema with updated regex validations
const schema = zod
  .object({
    profileFor: zod.string().min(1, "Profile for is required"),
    //mobile: zod.string().min(1,"Mobile Number is Required"),
    agreeToTerms: zod.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
    email: zod
      .string()
      .email("Invalid email address")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      ),
    password: zod
      .string()
      .min(
        8,
        "Password must be at least 8 characters with an uppercase letter and special character"
      )
      .regex(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
        "Password must be at least 8 characters with an uppercase letter and special character"
      ),
    // mobile: zod
    //   .string()
    //   .regex(/^\d{12}$/, "Mobile number must be exactly 10 digits"),
    mobile: zod.string().refine(
      (value) => {
        // Retrieve country information from sessionStorage
        const isIndia = sessionStorage.getItem("isIndia") === "true";
        return !isIndia || /^\d{12}$/.test(value); // Only validate for India
      },
      {
        message: "Mobile number must be exactly 10 digits",
      }
    ),
    Profile_country: zod.string().optional(),
    Profile_state: zod.string().optional(),
  })
  .required();

interface AccountSetupProps {
  onNext: (mobile: string) => void;
  onClose: () => void;
  handleLoginClick: () => void;
}

interface FormInputs {
  profileFor: string;
  mobile: string;
  email: string;
  password: string;
  gender: string;
  agreeToTerms: boolean;
  Profile_country?: string;
  Profile_state?: string;
}

export const AccountSetup: React.FC<AccountSetupProps> = ({
  onNext,
  onClose,
  handleLoginClick,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [profileOptions, setProfileOptions] = useState<
    { owner_id: number; owner_description: string }[]
  >([]);
  const [gender, setGender] = useState<string>("");
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status
  const [selectedProfile, setSelectedProfile] = useState<string>(""); // State to track selected profile
  const [showFooterContent, setShowFooterContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();
  const [countries] = useState([
    { id: "1", name: "India" },
    { id: "", name: "NRI" },
  ]);

  const [statesList, setStatesList] = useState<{ state_id: number; state_name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("1");

  // const [mobile, setMobileNumber] = useState("");

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const [mobile, setMobileNumber] = useState("");
  useEffect(() => {
    const fetchProfileOptions = async () => {
      try {
        const response = await apiClient.post(`/auth/Get_Profileholder/`);
        const data = response.data;

        const options = Object.values(data).map((item: (typeof data)[0]) => ({
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

  // const handleMobileNumberChang = (value: string) => {
  //   setMobileNumber(value);
  //   sessionStorage.setItem("mobile", value);
  // };

  const [countryCode, setCountryCode] = useState<string>("");
  const [showLabel, setShowLabel] = useState(true);


  // const handleMobileNumberChang = (value: string, country: CountryData) => {
  //   setMobileNumber(value);          // Set full mobile number including country code
  //   setCountryCode(country.dialCode); // Set the country code separately
  //   sessionStorage.setItem("mobile", value);

  //   // Show label only if the country code is "in" (India)
  //   setShowLabel(country.countryCode === "in");
  // };

  const handleMobileNumberChang = (value: string, country: CountryData) => {
    setMobileNumber(value);
    setCountryCode(country.dialCode);
    sessionStorage.setItem("mobile", value);
    setValue("mobile", value, { shouldValidate: true }); // Update mobile field in react-hook-form context

    // Check if the country is India and set flag in sessionStorage
    if (country.countryCode === "in") {
      sessionStorage.setItem("isIndia", "true");
    } else {
      sessionStorage.setItem("isIndia", "false");
    }

    setShowLabel(country.countryCode === "in");
  };

  useEffect(() => {
    if (selectedProfile === "2") {
      setGender("Male");
    } else if (selectedProfile === "1") {
      setGender("Female");
    }
  }, [selectedProfile]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      Profile_country: "1",  // Default India
    },
  });

  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGender(event.target.value);
  };

  // const handleMobileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue("mobile", event.target.value);
  // };

  useEffect(() => {
    const savedProfileFor = sessionStorage.getItem("profileFor");
    const savedEmail = sessionStorage.getItem("email");
    const savedPassword = sessionStorage.getItem("password");
    const savedMobile = sessionStorage.getItem("mobile");
    const savedCountryCode = sessionStorage.getItem("countryCode");
    const savedAgreeToTerms = sessionStorage.getItem("agreeToTerms");
    // const savedGender = sessionStorage.getItem("gender"); // or localStorage
    const savedGender = localStorage.getItem("gender"); // or localStorage


    // if (savedProfileFor) setSelectedProfile(savedProfileFor);    
    if (savedProfileFor) setSelectedProfile(savedProfileFor);
    if (savedProfileFor) setValue("profileFor", savedProfileFor);
    if (savedEmail) setValue("email", savedEmail);
    if (savedPassword) setValue("password", savedPassword);
    if (savedMobile) setMobileNumber("");
    if (savedCountryCode) setCountryCode(savedCountryCode);
    if (savedAgreeToTerms) setValue("agreeToTerms", savedAgreeToTerms === "true");
    if (savedGender) setGender(savedGender);

  }, [setValue]);


  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    sessionStorage.setItem("profileFor", data.profileFor);
    sessionStorage.setItem("email", data.email);
    sessionStorage.setItem("password", data.password);
    sessionStorage.setItem("mobile", mobile);
    sessionStorage.setItem("agreeToTerms", String(data.agreeToTerms));

    sessionStorage.setItem("email", data.email.trim()); // Save email to sessionStorage
    setIsSubmitting(true); // Set isSubmitting to true when form submission starts



    const registrationData = {
      Profile_for: data.profileFor,
      Gender: gender,
      Mobile_no: mobile,
      EmailId: data.email.trim(),
      Password: data.password.trim(),
      mobile_country: countryCode, // Add the country code here
      Profile_country: selectedCountry, // India = "1", NRI = ""
      Profile_state: data.Profile_state || "",
    };
    console.log(registrationData);
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
      }
    } catch (error: unknown) {
      setIsSubmitting(false); // Reset isSubmitting to false if there's an error

      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        error.response.data.Mobile_no
      ) {
        console.error("Error registering user:", error);
        // alert(error.response.data.Mobile_no[0]);
        // setErrorMessage(error.response.data.Mobile_no[0]);
      } else {
        console.error("Error registering user:", error);
        // setError('An error occurred. Please try again.');
        // setErrorMessage("An error occurred. Please try again.");
      }

      // if (mobile === "") {
      //   setError("mobile", {
      //     type: "manual",
      //     message: "Mobile number is required",
      //   });
      // }
    } finally {
      setIsSubmitting(false);
    }
  };
  const EmailValue = watch("email", "");
  // const mobileValue = watch("mobile", "");
  const passwordValue = watch("password", "");
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    value: any
  ) => {
    // Prevent space if input is empty
    if (e.key === " " && value.trim() === "") {
      e.preventDefault();
    }
  };

  console.log(errors.email, errors.mobile, "kjhkjhkjjk");

  const handleFooterContent = async (pageId?: string) => {
    try {
      setLoading(true); // Start loading
      const data = await fetchFooterContent(pageId); // Call the API to fetch FAQ data

      if (data) {
        setLoading(false);
      }

      setShowFooterContent(!showFooterContent);

      console.log(data);

      // navigate("/FooterPages", { state: { faqData: data } }); // Navigate to the FAQ page and pass the fetched data
      navigate("/FooterPages", { state: { faqData: data, hidePopup: true } });
    } catch (error: any) {
      console.log(error.message || "Failed to fetch footer content");
    } finally {
      setLoading(false); // End loading
    }
  };

  const location = useLocation();
  useEffect(() => {
    if (location.state?.hidePopup) {
      onClose();
    }
  }, [location]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setValue("Profile_country", value);
    setValue("Profile_state", ""); // Reset state always

    if (value === "1") {
      fetchStates("1");
    } else {
      setStatesList([]);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await apiClient.post(
        `/auth/Get_State/`,
        { country_id: countryId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      // Convert object to array properly
      const states = Object.values(data) as {
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
    if (selectedCountry === "1") {
      fetchStates("1");
    }
  }, []);



  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (

    <form onSubmit={handleSubmit(onSubmit)} >
      <div className="max-h-[75vh] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
        <div>
          <p className="text-[16px] text-primary">
            While we find matches for you
          </p>
          <h5 className="text-[24px] text-primary font-semibold mb-5">
            Let's set up your profile
          </h5>
        </div>

        <div className="mb-5">
          <select
            id="profileFor"
            className="text-ash font-medium block w-full px-3 py-2 border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
            {...register("profileFor", { required: true })}
            onChange={(e) => {
              setValue("profileFor", e.target.value);
              setSelectedProfile(e.target.value); // Set the selected profile option
            }}
            value={selectedProfile} // Bind value to selectedProfile
          >
            <option value="" hidden>
              Select profile for
            </option>
            {profileOptions.map((option) => (
              <option key={option.owner_id} value={option.owner_id}>
                {option.owner_description}
              </option>
            ))}
          </select>

          {errors.profileFor && (
            <span className="text-red-500 mx-1" >{errors.profileFor.message}</span>
          )}
        </div>

        <div className="mb-5">
          <div className="w-36 flex justify-between items-center ">
            <div>
              <input
                type="radio"
                id="Male"
                {...register("gender", { required: true })}
                name="gender"
                value="Male"
                checked={gender === "Male"}
                disabled={selectedProfile === "1"} // Disable "Male" if profile is "Daughter"
                onChange={handleGenderChange}
              />
              <label htmlFor="Male" className="text-ash ml-1">
                Male
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="Female"
                {...register("gender", { required: true })}
                name="gender"
                value="Female"
                checked={gender === "Female"}
                disabled={selectedProfile === "2"} // Disable "Female" if profile is "Son"
                onChange={handleGenderChange}
              />
              <label htmlFor="Female" className="text-ash ml-1">
                Female
              </label>
            </div>
          </div>

          {errors.gender && (
            <span className="text-red-500 mx-1">{errors.gender.message}</span>
          )}
        </div>

        <div className="mb-5">
          {/* <label className=" text-primary">OTP will be sent to this number</label> */}



          <PhoneInput
            value={mobile} // Dynamically set value from state
            {...register("mobile", { required: true })}
            inputProps={{
              autoFocus: true,
              autoFormat: true,
              className: "input-style",
            }}
            country={"in"}
            preferredCountries={["in", "sg", "my", "ae", "us", "gb"]}
            onChange={handleMobileNumberChang}
          />

          {showLabel && (
            <label className="text-primary">
              OTP will be sent to this number
            </label>
          )}
          <br />
          {errors.mobile && (
            <span className="text-red-500 mx-1">{errors.mobile.message}</span>
          )}

        </div>

        <div className="mb-5">
          {!showLabel && (
            <label className="text-primary">OTP will be sent to this email</label>
          )}
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 text-ash border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
            placeholder="Email"
            {...register("email", {
              required: true,
              setValueAs: (value) => value.trim(),
            })}
            onKeyDown={(e) => handleKeyDown(e, EmailValue)}
          />
          {errors.email && (
            <span className="text-red-500 mx-1">{errors.email.message}</span>
          )}
        </div>

        <div className="mb-5">
          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-3 py-2 text-ash border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
              placeholder="Create Password"
              {...register("password", {
                required: true,
                setValueAs: (value) => value.trim(),
              })}
              onKeyDown={(e) => handleKeyDown(e, passwordValue)}
            />
            <div
              onClick={handleShowPassword}
              className="absolute inset-y-2.5 right-0 pr-3 flex items-center text-ash text-[18px] cursor-pointer"
            // className="absolute inset-y-0 right-0 pr-3 flex items-center text-ash text-[18px] cursor-pointer mt-6"
            //className="absolute inset-y-0.511111111111111 right-0  pr-5 flex items-center text-ash text-[18px] cursor-pointer"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </div>
          </div>
          {errors.password && (
            <span className="text-red-500 mx-1">{errors.password.message}</span>
          )}
        </div>

        <div className="mb-5">
          <select
            className="w-full px-3 py-2 border border-footer-text-gray rounded text-ash focus:outline-none"
            {...register("Profile_country")}
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            {/* <option value="" hidden>Select Country</option> */}
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCountry === "1" && (
          <div className="mb-5">
            <select
              className="w-full px-3 py-2 border border-footer-text-gray rounded text-ash focus:outline-none"
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

        <div className="flex flex-col  items-center">
          <div className="flex flex-row justify-center gap-1 max-sm:items-center">
            <input type="checkbox" {...register("agreeToTerms")} />
            {/* <p onClick={() => { handleFooterContent("2") }} className="text-red-500 cursor-pointer hover:underline ">I agree to the T&C and Privacy Policy</p> */}
            <p className="text-gray-800 cursor-pointer max-sm:text-[14px]">
              I agree to the
              <a
                // href="/terms"
                onClick={() => handleFooterContent("2")}
                className="hover:underline text-blue-800 mx-1"
              >
                terms
              </a>
              and
              <a
                // href="/privacy-policy"
                onClick={() => handleFooterContent("2")}
                className="hover:underline text-blue-800 mx-1"
              >
                privacy policy
              </a>
              .
            </p>
          </div>
          {errors.agreeToTerms && (
            <span className="text-red-500 mx-1">{errors.agreeToTerms.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-[10px] px-[24px] bg-gradient text-white shadow-redboxshadow rounded-[6px] mt-2"
          disabled={isSubmitting} // Disable the button when form is submitting
        >
          {isSubmitting ? "Submitting..." : "Register"}
        </button>

        <p className="text-center text-[16px] text-ash mt-5">
          Existing user?{" "}
          <button
            type="button"
            onClick={handleLoginClick}
            className="text-secondary hover:underline"
          >
            Login
          </button>
        </p>

        <IoIosCloseCircle
          onClick={onClose}
          className="absolute top-[-15px] right-[-15px] text-[30px] text-black bg-white rounded-full flex items-center cursor-pointer hover:text-white hover:bg-black"
        />
      </div>
    </form>

  );
};
