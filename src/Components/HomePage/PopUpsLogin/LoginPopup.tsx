/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
// import axios from 'axios';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
// import config from '../../../API'; // Import the configuration file
import apiClient from "./../../../API";
import { ProfileContext } from "../../../ProfileContext";

// ZOD Schema with updated regex validations
const schema = zod
  .object({
    profileID: zod.string().min(1, "Profile ID is required"),
    password: zod.string().min(1, "Password is required"),
  })
  .required();

// const schema = zod.object({
//   profileID: zod
//     .string()
//     .min(1, "Profile ID is required")
//     .regex(/^[A-Z0-9]+$/, "This Profile ID is not allowed"), // ✅ only uppercase + numbers
//   password: zod.string().min(1, "Password is required"),
// });

interface LoginPopUpProps {
  onNext: () => void;
  onPhoneLogin: () => void; // Add this prop to handle phone login
  onClose: () => void;
  onForgetPassword: () => void; // Add this prop to handle forget password
  registerPopup: () => void;
}

interface FormInputs {
  profileID: string;
  password: string;
}

export const LoginPopup: React.FC<LoginPopUpProps> = ({
  onNext,
  onPhoneLogin,
  onForgetPassword,
  onClose,
  registerPopup,
}) => {
  // Toggle the Password field
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // React Hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
  });
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("MyComponent must be used within a ProfileProvider");
  }

  // const { setUserProfile } = context;

  // Load profileID and password from local storage if remember me was checked
  useEffect(() => {
    const savedProfileID = localStorage.getItem("rememberMeProfileID");
    const savedPassword = localStorage.getItem("password");
    if (savedProfileID) {
      setValue("profileID", savedProfileID);
      setRememberMe(true);
    }
    if (savedPassword) {
      setValue("password", savedPassword);
    }
  }, [setValue]);

  // Handle form submission

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    //console.log("Login pressed!!");
    const trimmedData = {
      profileID: data.profileID.trim(),
      password: data.password.trim(),
    };

    try {
      const response = await apiClient.post(`/auth/login/`, {
        username: trimmedData.profileID,
        password: trimmedData.password,
      });
      localStorage.setItem(
        "profile_completion",
        response.data.profile_completion
      );
      //console.log("Login Response:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_profile_image", response.data.profile_image);
      localStorage.setItem("selectedstar", response.data.birth_star_id);
      //console.log("selectedstar", selectedstar)
      localStorage.setItem("selectedRasi", response.data.birth_rasi_id);
      //console.log("selectedRasi", selectedRasi)
      localStorage.setItem("gender", response.data.gender);
      localStorage.setItem("maritalStatus", response.data.marital_status);
      localStorage.setItem("ProfileId", response.data.profile_id);
      localStorage.setItem("profile_id", response.data.profile_id);
      localStorage.setItem("profile_id_new", response.data.profile_id);
      localStorage.setItem("loginuser_profile_id", response.data.profile_id);
      localStorage.setItem("age", response.data.age);
      // localStorage.setItem("ProfileId", response.data.profile_id);
      // localStorage.setItem("profile_id", response.data.profile_id);
      // localStorage.setItem("profile_id_new", response.data.profile_id);
      // localStorage.setItem("loginuser_profile_id", response.data.profile_id);

      localStorage.setItem("valid_till", response.data.valid_till);
      localStorage.setItem("plan_id", response.data.cur_plan_id);
      localStorage.setItem("profile_owner", response.data.profile_owner);
      localStorage.setItem("quick_reg", response.data.quick_reg);
      localStorage.setItem("userHeight", response.data.height);
      localStorage.setItem("userplanid", response.data.plan_limits?.[0]?.plan_id,);
      if (response.data.status === 1) {
        sessionStorage.setItem("loggedInProfileId", response.data.profile_id);
        localStorage.setItem("custom_message", response.data.custom_message);
        setErrorMessage(null); // Clear error message on success
        if (rememberMe) {
          localStorage.setItem("rememberMeProfileID", data.profileID);
          localStorage.setItem("password", data.password); // Store password in localStorage
        } else {
          localStorage.removeItem("rememberMeProfileID");
          localStorage.removeItem("password"); // Remove password from localStorage
        }
        const intendedUrl = sessionStorage.getItem("intendedUrl");

        if (intendedUrl) {
          // Clear the intended URL from storage
          sessionStorage.removeItem("intendedUrl");
          // Redirect to the intended URL
          window.location.href = intendedUrl;
        } else {
          // Proceed with the normal onNext() flow
          onNext();
        }
      } else {
        setErrorMessage("Please Enter the Correct Username and Password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage(
        "An error occurred while logging in. Please try again later."
      );
    }
  };
  const profileIDValue = watch("profileID", "");
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <p className="text-[16px] text-primary">Welcome Back</p>
        <h5 className="text-[24px] text-primary font-semibold mb-5 max-sm:text-[20px]">
          Login to your account
        </h5>
      </div>

      <div className="mb-5">
        <input
          type="text"
          id="profileID"
          className="w-full px-3 py-2 text-ash border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
          placeholder="Profile ID"
          {...register("profileID", {
            required: true,
            setValueAs: (value) => value.trim(),
          })}
          onKeyDown={(e) => handleKeyDown(e, profileIDValue)}
        />
        {errors.profileID && (
          <span className="text-red-500">{errors.profileID.message}</span>
        )}
      </div>

      <div className="mb-5">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="w-full px-3 py-2 text-ash border-[1px] border-footer-text-gray rounded-[4px] focus-visible:outline-none"
            placeholder="Enter Password"
            {...register("password", {
              required: true,
              setValueAs: (value) => value.trim(),
            })}
            onKeyDown={(e) => handleKeyDown(e, passwordValue)}
          />
          <div
            onClick={handleShowPassword}
            className="absolute inset-y-1.5 right-0 pr-3 flex items-center text-ash text-[18px] cursor-pointer"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </div>
        </div>
        {errors.password && (
          <span className="text-red-500 ">{errors.password.message}</span>
        )}
      </div>

      <div className="flex justify-between items-center mb-5 max-sm:flex-col max-sm:mb-2 max-sm:gap-1">
        <div>
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="text-ash ml-2">
            Remember Me
          </label>
        </div>

        <div>
          <p
            onClick={onForgetPassword}
            className="text-secondary hover:underline cursor-pointer"
          >
            Forgot Password?
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient flex justify-center items-center py-[10px] px-[24px] rounded-[6px] space-x-2 shadow-redboxshadow  cursor-pointer"
      >
        <div className="text-[16px] text-white font-semibold max-sm:font-medium">Login</div>
        <FaArrowRightLong className="text-white text-[22px]" />
      </button>

      {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}

      <p className="text-ash font-semibold text-center my-5 max-sm:my-1">or</p>

      <button
        onClick={onPhoneLogin}
        className="w-full py-[10px] px-[24px] bg-white text-main font-semibold border-2 rounded-[6px] mt-2 max-sm:px-[10px] max-sm:mt-0 max-sm:font-medium"
      >
        Login with Phone Number
      </button>

      <p className="text-center text-[16px] text-ash mt-5  max-sm:mt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={registerPopup}
          className="text-secondary hover:underline max-sm:mb-3"
        >
          Register Now
        </button>
      </p>

      <IoIosCloseCircle
        onClick={onClose}
        className="absolute top-[-15px] right-[-15px] text-[30px] text-black bg-white rounded-full flex items-center cursor-pointer hover:text-white hover:bg-black"
      />
    </form>
  );
};
