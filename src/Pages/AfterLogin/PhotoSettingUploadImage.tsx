

import React, { useState, useRef, useEffect } from "react";
// import { IoEye, IoEyeOff } from "react-icons/io5";

// import uploadfile from "../assets/icons/uploadfile.png";

import axios from "axios";
import { useLocation } from "react-router-dom";
import closebtn from "../../assets/icons/closebtn.png";



import { AiOutlineInfoCircle } from "react-icons/ai";
import { NotifySuccess, ToastNotification } from "../../Components/Toast/ToastNotification";

//import closebtn from "@/assets/icons/closebtn.png";
import UploadFile from "../../Components/UploadImages/UploadFile";
import apiClient from "../../API";
import config from "../../Config";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDivorceProofFiles, _setSelectedDivorceProofFiles] = useState<
    File[]
  >([]);
  // const [showPassword, setShowPassword] = useState(false);
  const [profileOwner, setProfileOwner] = useState<string | null>(null);
  // const [showPassWordNumber, setShowPassWordNumber] = useState<number>(0);
  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setShowPassWordNumber(event.target.checked ? 1 : 0);
  // };
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const Param = queryParams.get("quick") || 0;

  // Inside your component
  // const [uploadedImages, setUploadedImages] = useState([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  //const [loading,setLoading]=useState<boolean>(true)
  const [uploadedHoroscopeFile, setUploadedHoroscopeFile] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_uploadedDivorceProof, setUploadedDivorceProof] = useState("");
  const [uploadedIDProof, setUploadedIDProof] = useState("");

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
      //console.log("saveImageDetails", response);

      if (response.status === 200) {
        //console.log("Image details saved successfully", response.data);
        NotifySuccess("Image details saved successfully");
      }
    } catch (error) {
      console.error("Error saving image details:", error);
    }
  };

  const handleSubmit = async () => {
    // setLoading(true)
    const quick_reg = Param === "1" ? "1" : "0";
    const profileId = localStorage.getItem("profile_id_new");

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
        formData.append("photo_protection", "0");
        formData.append("video_url", url);

        const response = await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status === 200) {
          NotifySuccess("Files uploaded successfully");

          // Call saveImageDetails after each successful upload
          await saveImageDetails(profileId as string, fieldName);
        }

        //console.log("UploadImageResponse", response.data);
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
      //"http://103.214.132.20:8000/auth/Horoscope_upload/",
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
      //"http://103.214.132.20:8000/auth/Idproof_upload/",
      "idproof_file"
    );
    // setLoading(false)
    // setTimeout(() => {
    //   if (Param === "1") {
    //     navigate("/MembershipPlan");
    //   } else {
    //     navigate("/FamilyDetails");
    //   }
    // }, 2000);
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

      //console.log("fetchUploadedImages", response);

      if (response.data.Status === 1) {
        const data = response.data.data;
        setUploadedImages(data.images || []);
        setUploadedHoroscopeFile((data.horoscope_file) || "");
        setUploadedDivorceProof(data.Profile_divorceproof || "");
        setUploadedIDProof(data.Profile_idproof || "");
      }
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);


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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(event, setSelectedFiles)}
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
                      <h1 className="text-xs font-normal text-black">{file.name}</h1>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="w-full h-[3px] bg-gray mt-3">
                      <p className="w-full h-[3px] bg-[#4472C4]"></p>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFile(index, setSelectedFiles)} className="text-red-700 font-semibold text-xl">
                  <img src={closebtn} alt="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );


  // const renderSingleFileUpload = (fileUrl: string, title: string) => {
  //   return fileUrl ? (
  //     <div className="mb-4">
  //       <h1 className="text-primary text-xl font-semibold">{title} Uploaded</h1>
  //       <div className="flex items-center justify-between border-b border-gray-200 py-2">
  //         <div className="flex items-center space-x-4">
  //           <img src={fileUrl} alt={title} className="h-16 w-16" />
  //           <h1 className="text-xs font-normal text-black">
  //             {fileUrl.split("/").pop()}
  //           </h1>
  //         </div>
  //       </div>
  //        {/* <button onClick={() => handleRemoveImage(img.image_id)}>
  //         <img src={closebtn} alt="remove" className="h-4 w-4" />
  //       </button>  */}
  //     </div>
  //   ) : null;
  // };
  const renderSingleFileUpload = (
    fileUrl: string,
    title: string,
    removeFile: () => void
  ) => {
    return fileUrl ? (
      <div className="mb-4">
        <h1 className="text-primary text-xl font-semibold">{title} Uploaded</h1>
        <div className="flex items-center justify-between border-b border-gray-200 py-2">
          <div className="flex items-center space-x-4">
            <img src={fileUrl} alt={title} className="h-16 w-16" />
            <h1 className="text-xs font-normal text-black">
              {fileUrl.split("/").pop()}
            </h1>
          </div>
          <button
            onClick={removeFile}
          // className="text-red-500 hover:underline"
          >
            <img src={closebtn} alt="close" className="h-4 w-4" />
          </button>
        </div>
      </div>
    ) : null;
  };
  const handleRemoveHoroscopeFile = () => {
    setUploadedHoroscopeFile(""); // Replace with the state update logic you're using for file removal
    // Additional logic can go here if necessary
  };


  const handleRemoveIdProof = () => {
    setUploadedIDProof(""); // Replace with the state update logic you're using for file removal
    // Additional logic can go here if necessary
  };
  return (
    <div className="mt-2 max-lg:mt-20">


      <div className="mx-auto w-[80%]  my-10 ml-7 max-2xl:w-[80%] max-xl:w-[80%] max-lg:w-full max-md:w-full max-md:my-5">
        <div className="container flex justify-start space-x-24  max-lg:flex-col max-lg:space-x-0 max-lg:gap-y-8">
          <div className="w-full">




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


            {renderSingleFileUpload(uploadedHoroscopeFile, "Horoscope File", handleRemoveHoroscopeFile)}

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


            {renderSingleFileUpload(uploadedIDProof, "ID Proof", handleRemoveIdProof)}

            <div className="">
              <h1 className="font-semibold text-primary text-xl mb-4 flex items-center">
                Upload {profileName} Videos, if any
                <div className="relative inline-block ml-2 group">
                  <AiOutlineInfoCircle className="text-primary align-middle" />

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


              <div className="flex space-x-4">

                <button
                  className="flex items-center py-[10px] px-14 bg-gradient text-white shadow-redboxshadow rounded-[6px] mt-2 max-sm:px-8"
                  onClick={handleSubmit}
                >
                  {/* {loading ? (
                    <div className="animate-spin h-5 w-5 border-4 border-t-4 border-white rounded-full mr-2"></div>
                  ) : null}
                  {loading ? "Uploading..." : "Submit"} */}
                  submit
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
      <ToastNotification />
    </div>
  );
};

export default UploadImages;
