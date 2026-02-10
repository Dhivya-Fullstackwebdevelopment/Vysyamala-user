/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
// import { IoEye, IoEyeOff } from "react-icons/io5";
import ContentBlackCard from "../Components/RegistrationForm/ContentBlackCard";
import UploadFile from "../Components/UploadImages/UploadFile";
// import uploadfile from "../assets/icons/uploadfile.png";
import closebtn from "../assets/icons/closebtn.png";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SideContent from "../Components/RegistrationForm/SideContent";
import arrow from "../assets/icons/arrow.png";
import { ToastNotification, NotifySuccess, NotifyError } from "../Components/Toast/ToastNotification";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { update_photo_password } from "../commonapicall";
import apiClient from "../API";
import config from "../Config";
interface UploadImagesProps { }

// Define an interface for uploaded images
interface UploadedImage {
  image_id: number;
  image_file: string;
  image_name: string;
}

// type Image = {
//   image_id: string;
//   // Add other properties if needed, e.g., url: string;
// };

const UploadImages: React.FC<UploadImagesProps> = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedHoroscopeFiles, setSelectedHoroscopeFiles] = useState<File[]>(
    []
  );
  const [url, setUrl] = useState<string>("");
  // const [password, setPassword] = useState<string>("");

  const [selectedIDProofFiles, setSelectedIDProofFiles] = useState<File[]>([]);
  const [selectedDivorceProofFiles, setSelectedDivorceProofFiles] = useState<
    File[]
  >([]);
  // const [showPassword, setShowPassword] = useState(false);
  const [profileOwner, setProfileOwner] = useState<string | null>(null);
  // const [showPassWordNumber, setShowPassWordNumber] = useState<number>(0);
  const navigate = useNavigate();
  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setShowPassWordNumber(event.target.checked ? 1 : 0);
  // };
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const Param = queryParams.get("quick") || 0;

  // Inside your component
  // const [uploadedImages, setUploadedImages] = useState([]);

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [uploadedHoroscopeFile, setUploadedHoroscopeFile] = useState("");
  const [uploadedDivorceProof, setUploadedDivorceProof] = useState("");
  const [uploadedIDProof, setUploadedIDProof] = useState("");
  // State to track if the checkbox is checked
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPassword, setPhotoPassword] = useState("");
  const loginuser_profile_id = localStorage.getItem("loginuser_profile_id");


  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle checkbox change event
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    // If unchecking, clear the password
    if (isChecked) {
      setPhotoPassword("");
    }
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoPassword(e.target.value);
  };

  // const handle_Update_photo_password = async (password: string) => {
  //   try {
  //     const response = await axios.post(update_photo_password, {
  //       profile_id: loginuser_profile_id,
  //       photo_password: password,
  //       photo_protection: isChecked ? 1 : 0,
  //     });

  //     if (response.status === 200) {
  //       // Handle the successful update here
  //       NotifySuccess("Photo password updated successfully.");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     NotifyError("Something went wrong");
  //   }
  // };

  //const [uploadedFiles, setUploadedFiles] = useState(images);

  // //console.log("ppppppppppppppppp",Param);
  const fileInputRefs = {
    images: useRef<HTMLInputElement>(null),
    horoscope: useRef<HTMLInputElement>(null),
    idProof: useRef<HTMLInputElement>(null),
    divorceProof: useRef<HTMLInputElement>(null),
  };
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const owner = sessionStorage.getItem("profile_owner");
    setProfileOwner(owner);
    window.scrollTo(0, 0);
  }, []);
  const profileName = profileOwner === "Ownself" ? "Your" : profileOwner;
  const handleButtonClick = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.click();
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files, setFiles);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(files, setFiles);
    }
    dropAreaRef.current?.classList.remove("border-blue-500");
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dropAreaRef.current?.classList.add("border-blue-500");
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dropAreaRef.current?.classList.add("border-blue-500");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dropAreaRef.current?.classList.remove("border-blue-500");
  };

  const removeFile = (
    index: number,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };

  // const handleShowPassword = () => {
  //   setShowPassword((prev) => !prev);
  // };

  const handleFiles = (
    files: FileList,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    const newFiles: File[] = Array.from(files);

    // Handle Images/Family Images differently
    if (setFiles === setSelectedFiles) {
      // Allow adding up to 10 files in total, including already selected ones
      const remainingSpace = 10 - selectedFiles.length;
      if (remainingSpace > 0) {
        setFiles((prevFiles) => [
          ...prevFiles,
          ...newFiles.slice(0, remainingSpace),
        ]);
      }
    } else {
      // For other file types, only allow one file at a time
      setFiles([newFiles[0]]);
    }
  };
  const maritalStatus = localStorage.getItem("maritalStatus");

  const saveImageDetails = async (profileId: string, fileType: string) => {
    try {
      const formData = new FormData();
      formData.append("profile_id", profileId);
      formData.append("file_type", fileType); // e.g., "image_files", "horoscope_file", etc.
      formData.append("page_id", "2"); // Adding page_id with value "2"

      const response = await apiClient.post(
        "/auth/Get_save_details/",
        formData
      );
      ////console.log("saveImageDetails", response);

      if (response.status === 200) {
        ////console.log("Image details saved successfully", response.data);
        NotifySuccess("Image details saved successfully");
      }
    } catch (error) {
      console.error("Error saving image details:", error);
    }
  };

  const handleSubmit = async () => {
    const quick_reg = Param === "1" ? "1" : "0";
    const profileId = localStorage.getItem("profile_id_new");

    // Determine photo password and protection status
    // const photoPassword = isChecked ? document.getElementById('password').value : ''; // Get the password if checkbox is checked
    const photoProtection = isChecked ? 1 : 0; // Set photo protection based on checkbox
    const passwordElement = document.getElementById('password') as HTMLInputElement | null;
    const photoPassword = isChecked && passwordElement ? passwordElement.value : '';




    const uploadImages = async (
      files: File[],
      endpoint: string,
      fieldName: string
    ) => {
      try {
        const formData = new FormData();
        formData.append("profile_id", profileId as string);
        files.forEach((file) => formData.append(fieldName, file));
        formData.append("quick_reg", quick_reg);
        // formData.append("photo_protection", "0");
        formData.append("photo_protection", photoProtection.toString()); // Set photo protection status

        formData.append("video_url", url);

        const response = await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status === 200) {
          NotifySuccess("Files uploaded successfully");

          // Call saveImageDetails after each successful upload
          await saveImageDetails(profileId as string, fieldName);
        }

        ////console.log("UploadImageResponse", response.data);
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    };

    await uploadImages(
      selectedFiles,
      `${config.apiUrl}/auth/ImageSetUpload/`,
      //"http://103.214.132.20:8000/auth/ImageSetUpload/",
      "image_files"
    );
    await uploadImages(
      selectedHoroscopeFiles,
      `${config.apiUrl}/auth/Horoscope_upload/`,
      // "http://103.214.132.20:8000/auth/Horoscope_upload/",
      "horoscope_file"
    );
    await uploadImages(
      selectedDivorceProofFiles,
      `${config.apiUrl}/auth/Divorceproof_upload/`,
      //"http://103.214.132.20:8000/auth/Divorceproof_upload/",
      "divorcepf_file"
    );
    await uploadImages(
      selectedIDProofFiles,
      `${config.apiUrl}/auth/Idproof_upload/`,
      // "http://103.214.132.20:8000/auth/Idproof_upload/",
      "idproof_file"
    );

    // Update photo password if checkbox is checked
    if (isChecked) {
      await handle_Update_photo_password(photoPassword); // Call photo password update function
    }
    else {
      await handle_Update_photo_password("");
    }

    setTimeout(() => {
      if (Param === "1") {
        navigate("/MembershipPlan");
      } else {
        navigate("/FamilyDetails");
      }
    }, 2000);
  };

  const handle_Update_photo_password = async (password: string) => {
    try {
      const response = await apiClient.post(update_photo_password, {
        profile_id: loginuser_profile_id,
        photo_password: password,
        photo_protection: isChecked ? 1 : 0,
      });

      if (response.status === 200) {
        // Handle the successful update here
        // NotifySuccess("Photo password updated successfully.");
        console.log("Photo password updated successfully.");
      }
    } catch (error) {
      //console.log(error);
      NotifyError("Something went wrong");
    }
  };

  // Fetch the uploaded images from the API
  const fetchUploadedImages = async () => {
    try {
      const response = await apiClient.post(
        "/auth/Get_save_details/",
        {
          profile_id: localStorage.getItem("profile_id_new"),
          page_id: "2",
        }
      );

      ////console.log("fetchUploadedImages", response);

      if (response.data.Status === 1) {
        const data = response.data.data;
        setUploadedImages(data.images || []);
        setUploadedHoroscopeFile(data.horoscope_file || "");
        setUploadedDivorceProof(data.Profile_divorceproof || "");
        setUploadedIDProof(data.Profile_idproof || "");
        // Set the video URL from the API response
        setUrl(data.Video_url || ""); // Set the video URL in the state

        if (data.Photo_protection === "1") {
          setIsChecked(true);
          setPhotoPassword(data.Photo_password || "");
        } else {
          setIsChecked(false);
          setPhotoPassword("");
        }
      }
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const handleRemoveImage = async (imageId: number) => {
    const profileId = localStorage.getItem("profile_id_new");
    // //console.log("Retrieved profileId:", profileId);
    // //console.log("imageId:", imageId);

    // Validate the required values
    if (!profileId) {
      console.error("Profile ID is missing in sessionStorage");
      return;
    }
    if (!imageId) {
      console.error("Image ID is missing");
      return;
    }

    try {
      // //console.log("Attempting to remove image with the following details:", {
      //   profile_id: profileId,
      //   image_id: imageId,
      // });

      // Set up the data to be sent
      const formData = new FormData();
      formData.append("profile_id", profileId);
      formData.append("image_id", imageId.toString());

      // Send the request
      const response = await apiClient.post(
        "/auth/Remove_profile_img/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      ////console.log("Server response:", response.data);

      // Check if the image removal was successful
      if (response.data.success === 1) {
        NotifySuccess("Image removed successfully");

        // Update the images state
        setUploadedImages((prevImages) =>
          prevImages.filter((image) => image.image_id !== imageId)
        );
      } else {
        console.error("Failed to remove image:", response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data || error.message);
        alert("Error removing image. Please try again.");
      } else {
        console.error("Unexpected Error:", error);
        alert("Unexpected error occurred. Please try again.");
      }
    }
  };

  const renderFileUploadSection = (
    title: string,
    fileInputRef: React.RefObject<HTMLInputElement>,
    selectedFiles: File[],
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>,
    fieldName: string,
    description: string,
    maxFiles: number, // Add a parameter to specify the maximum file limit
    showCount: boolean // New parameter to control count display
  ) => (
    <div className="">
      <h1 className="font-bold text-primary text-xl mb-4  max-md:font-semibold max-md:text-lg">
        {title}
      </h1>
      <div
        onClick={() => handleButtonClick(fileInputRef)}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={(event) => handleDrop(event, setSelectedFiles)}
        ref={dropAreaRef}
      >
        <UploadFile
          heading="Select a file or drag and drop here"
          desc={description}
          name={fieldName}
          onChange={(event) => handleFileUpload(event, setSelectedFiles)}
          onClick={() => handleButtonClick(fileInputRef)}
          // multiple={title === `Upload ${profileName} Images/Family Images`}
          //  multiple={title === `Upload ${profileName} Images/Family Images`}
          multiple={maxFiles > 1} // Allow multiple file uploads only when maxFiles > 1
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="">
          <div className="flex justify-between items-center">
            <h1 className="font-semibold text-primary text-xl mb-4 flex items-center">
              Files Uploaded
              {showCount && (
                <span className="text-base font-semibold ml-2">
                  {" "}
                  ({selectedFiles.length}/{maxFiles})
                </span>
              )}
            </h1>
          </div>
          <div className="space-y-6">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200 py-2 gap-10"
              >
                <div className="flex items-center space-x-5 w-full">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="uploadfile"
                    className="h-16 w-16"
                  />
                  <div className="w-full">
                    <div className="flex justify-between w-full">
                      <h1 className="text-xs font-normal text-black">
                        {file.name}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="w-full h-[3px] bg-gray mt-3">
                      <p className="w-full h-[3px] bg-[#4472C4]"></p>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFile(index, setSelectedFiles)}>
                  <img src={closebtn} alt="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Rendering fetched images with a remove button
  const renderFetchedImages = (images: any[]) => (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        {/* <h1 className="text-primary text-xl font-semibold">
        Files Uploaded1 ({images.length}/10)
      </h1> */}
      </div>
      <div className="">
        {images.map((img, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b mb-2 border-gray-200 py-2"
          >
            <div className="flex items-center space-x-3">
              <img src={img.image_file} alt="uploaded" className="h-16 w-16" />
              <div>
                <h1 className="text-lg font-semibold">
                  {img.image_name.split("/").pop()}
                </h1>
              </div>
            </div>
            <button onClick={() => handleRemoveImage(img.image_id)}>
              <img src={closebtn} alt="remove" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSingleFileUpload = (fileUrl: string, title: string) => {
    return fileUrl ? (
      <div className="mb-4">
        <h1 className="text-primary text-xl font-semibold">{title} Uploaded</h1>
        <div className="flex items-center justify-between border-b border-gray-200 py-2">
          <div className="flex items-center space-x-4">
            <img src={fileUrl} alt={title} className="h-16 w-16" />
            <h1 className="text-lg font-semibold">
              {fileUrl.split("/").pop()}
            </h1>
          </div>
        </div>
        {/* <button onClick={() => handleRemoveImage(img.image_id)}>
            <img src={closebtn} alt="remove" className="h-4 w-4" />
          </button> */}
      </div>
    ) : null;
  };


  return (
    <div className="mt-24 max-lg:mt-20">
      <ContentBlackCard
        link="/ContactDetails"
        heading="Upload Images"
        desc="Profile picture and family pictures. Maximum of 10 MB Size. Format: png, jpg."
      />

      <div className="mx-auto w-[60%]  my-10  max-2xl:w-[60%] max-xl:w-[80%] max-lg:w-full max-md:w-full max-md:my-5">
        <div className="container flex justify-between space-x-24  max-lg:flex-col max-lg:space-x-0 max-lg:gap-y-8">
          <div className="w-full">
            {renderFileUploadSection(
              `Upload Profile Pictures and Family Images`,
              fileInputRefs.images,
              selectedFiles,
              setSelectedFiles,
              "uploadImg",
              "JPG, PNG file size no more than 10MB",
              10,
              true // Show count for this section
            )}

            <hr className="my-5 text-gray" />
            <div className="my-5 text-lg flex items-start">
              <input
                type="checkbox"
                name="passwordCheckbox"
                id="passwordCheckbox"
                className="accent-main w-4 h-4 mt-1 mr-2"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <label
                htmlFor="passwordCheckbox"
                className="text-base text-primary"
              >
                Protect my images with password (only people you share the
                password can view the images)
              </label>
            </div>
            {isChecked && (
              <div className="mt-5">
                <label htmlFor="password" className="block text-lg mb-2">
                  Enter Password
                </label>
                {/* <div className="w-fit relative"> */}
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={photoPassword} // Use the state here
                    onChange={handlePasswordChange} // Add onChange handler
                    className="outline-none w-full px-5 py-1.5 border border-ashSecondary rounded"
                    placeholder="Enter password"
                  />
                  <div
                    onClick={handleShowPassword}
                    // className="absolute inset-y-0 right-0 pr-3 flex items-center text-ash text-[18px] cursor-pointer"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ash text-[18px] cursor-pointer"

                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </div>
                </div>
              </div>
            )}

            {/* Render fetched images */}
            {renderFetchedImages(uploadedImages)}

            {maritalStatus === "2" &&
              renderFileUploadSection(
                `Upload ${profileName} Divorce Proof`,
                fileInputRefs.divorceProof,
                selectedDivorceProofFiles,
                setSelectedDivorceProofFiles,
                "uploadDivorceProof",
                "",
                1,
                false
              )}

            {renderSingleFileUpload(uploadedDivorceProof, "Divorce Proof")}

            {renderFileUploadSection(
              // `Upload ${profileName} Horoscope Image`,
              `Upload  Horoscope Image`,
              fileInputRefs.horoscope,
              selectedHoroscopeFiles,
              setSelectedHoroscopeFiles,
              "uploadHoroscope",
              "JPG, PNG, PDF, DOC file size no more than 10 MB",
              1,
              false
            )}

            {/* Render uploaded horoscope file */}
            {renderSingleFileUpload(uploadedHoroscopeFile, "Horoscope File")}

            {renderFileUploadSection(
              `Upload ${profileName} ID Proof `,
              fileInputRefs.idProof,
              selectedIDProofFiles,
              setSelectedIDProofFiles,
              "uploadIDProof",
              "Any Govt ID Proof is must. This will not be displayed on the portal. This is only for Admin Purposes.",
              1,
              false
            )}

            {/* Render uploaded ID proof file */}
            {renderSingleFileUpload(uploadedIDProof, "ID Proof")}

            <div className="">
              <h1 className="font-semibold text-primary text-xl mb-4 flex items-center">
                Upload {profileName} Videos, if any
                <div className="relative inline-block ml-2 group">
                  <AiOutlineInfoCircle className="text-primary align-middle" />
                  {/* Tooltip */}
                  <div className="absolute hidden group-hover:flex flex-col bg-white border border-ashSecondary rounded shadow-md p-2 w-48 z-10">
                    <p className="text-sm text-black mb-1">Portfolio videos</p>
                    <p className="text-sm text-black mb-1">Business videos</p>
                    <p className="text-sm text-black">Family videos</p>
                    <p className="text-sm text-black">Self-intro videos</p>
                  </div>
                </div>
              </h1>

              <div>
                <label
                  htmlFor="youtubeurl"
                  className="block mb-2 text-base text-primary font-medium"
                >
                  Upload Video Link
                </label>

                <input
                  type="text"
                  onChange={(e) => setUrl(e.target.value)}
                  name="youtubeurl"
                  id="youtubeurl"
                  value={url} // Set the input value to the fetched video_url
                  placeholder="URL"
                  className="outline-none w-full text-sm text-placeHolderColor px-3 py-[13px] border border-ashBorder rounded"
                />
              </div>
              <p className="mt-3 text-ash text-xs ">
                Note: If video URL is not available, you can share the videos to
                Vysyamala's admin WhatsApp No.9043085524
              </p>
            </div>
            <div className=" flex justify-end max-sm:flex-row">
              {/* <div className="">
                <Link to={"/ContactDetails"}>
                  <button className="py-[10px] px-14 bg-white text-main font-semibold border-2 rounded-[6px] mt-2 max-sm:px-8">
                    Back
                  </button>
                </Link>
              </div> */}

              <div className="flex space-x-4">
                {Param !== "1" && (
                  <Link to="/FamilyDetails">
                    <button className="py-[10px] px-14 bg-white text-main font-semibold rounded-[6px] mt-2  max-sm:hidden">
                      Skip
                    </button>
                  </Link>
                )}
                {/* <Link to="/FamilyDetails"> */}
                <button
                  className="flex items-center py-[10px] px-14 bg-gradient text-white shadow-redboxshadow rounded-[6px] mt-2 max-sm:px-8"
                  onClick={handleSubmit}
                >
                  Next
                  <span>
                    <img src={arrow} alt="next arrow" className="ml-2" />
                  </span>
                </button>
                {/* </Link> */}
              </div>
            </div>
          </div>
          <SideContent />
        </div>
      </div>
      <ToastNotification />
    </div>
  );
};

export default UploadImages;
