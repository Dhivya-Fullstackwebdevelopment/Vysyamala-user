import { useState, useEffect, useRef, useCallback } from "react";
import { IoMdLock } from "react-icons/io";
import Slider from "react-slick";
import {
  fetchProfilesDetails,
  Get_photo_bypassword,
} from "../../../commonapicall";
import "./ProfileSlickStyleView.css";
import axios from "axios";
import { GoAlertFill } from "react-icons/go";
import {
  ToastNotification,
  NotifyError,
  NotifySuccess,
} from "../../Toast/ToastNotification";
import { RotatingSquare } from "react-loader-spinner";
import { decryptId } from "../../../utils/cryptoUtils";
import { useSearchParams } from "react-router-dom";

interface UserImages {
  [key: string]: string;
}

interface ProfileSlickViewProps {
  profileId?: string;
  photoLock: number;
}

// interface PhotoPasswordResponse {
//   data: {
//     user_images: UserImages;
//   };
//   photo_protection: number;
// }

const SLIDER_SETTINGS = {
  dots: false,
  infinite: true,
  speed: 1400,
  slidesToShow: 4,
  slidesToScroll: 1,
  initialSlide: 0,
  autoplay: true,
  cssEase: "linear",
  pauseOnHover: true,
  rtl: false,
  arrows: false,
  responsive: [
    {
      breakpoint: 1536,
      settings: {
        slidesToShow: 4,
        infinite: true,
        dots: false,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        infinite: true,
        dots: false,
      },
    },
    {
      breakpoint: 1023,
      settings: {
        slidesToShow: 4,
        autoplay: true,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 4,
        autoplay: true,
        arrows: true,
      },
    },
    {
      breakpoint: 639,
      settings: {
        slidesToShow: 3,
        autoplay: true,
        arrows: true,
      },
    },
  ],
};

const PasswordPopup: React.FC<{
  onClose: () => void;
  onSubmit: (password: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(password);
  };

  return (
    <div className="absolute left-10 top-40 w-10/12 rounded-lg">
      <div aria-labelledby="modal-headline" role="dialog" aria-modal="true">
        <div className="w-full bg-white rounded-lg px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <GoAlertFill className="text-[22px] text-secondary" />
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Enter Password to View Photo
              </label>
            </div>
            <div>
              <input
                required
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter The Password"
                className="w-full bg-gray rounded-md px-2 py-2 focus-within:outline-none"
                aria-label="Photo password"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-secondary flex items-center rounded-lg font-semibold px-5 py-2.5 cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-white font-semibold bg-secondary rounded-md px-5 py-2.5 cursor-pointer"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ZoomedImage: React.FC<{ image: string | null }> = ({ image }) => {
  if (!image) return null;

  return (
    <div className="zoomed-image-container zoomed-visible">
      <img src={image} className="zoomed-image object-top object-contain" alt="Zoomed" />
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="w-fit h-96 flex flex-col items-center justify-center mx-auto">
    <RotatingSquare
      visible={true}
      height="100"
      width="100"
      color="#FF6666"
      ariaLabel="rotating-square-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
    <p className="text-sm">Loading images...</p>
  </div>
);

const LockOverlay: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="text-center lock-style"
    role="button"
    aria-label="Request password to view photo"
    tabIndex={0}
  >
    <IoMdLock className="w-fit mx-auto text-secondary text-[50px]" />
    <p className="text-sm text-white font-semibold">
      Click here to request password to view profile photo
    </p>
  </div>
);

export const ProfileSlickView: React.FC<ProfileSlickViewProps> = ({
  profileId,
  photoLock,
}) => {
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id") || "";
  const [userImages, setUserImages] = useState<UserImages>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nav1, setNav1] = useState<Slider | null>(null);
  const [nav2, setNav2] = useState<Slider | null>(null);
  const [popupPassword, setPopPassword] = useState<boolean>(false);
  // const [photoPassword, _setPhotoPassword] = useState<string>("");
  const [, _setPhotoPassword] = useState<string>("");
  const [PhotoPasswordlock, setPhotoPasswordlock] = useState<number>(1);
  const sliderRef1 = useRef<Slider | null>(null);
  const sliderRef2 = useRef<Slider | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // const queryParams = new URLSearchParams(location.search);
  // const id = queryParams.get("id");
  // Decrypt the ID from search params
  const [searchParams] = useSearchParams();
  const encryptedId = searchParams.get("id") || "";
  const id = decryptId(encryptedId);

  const storedProtectedImg = sessionStorage.getItem(`userImages_${id}`);
  const sessionImage: UserImages = storedProtectedImg
    ? JSON.parse(storedProtectedImg)
    : {};

  //const gender = localStorage.getItem("gender");

  // const defaultImgUrl =
  //   gender?.toLowerCase() === "male"
  //     ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
  //     : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

  const defaultImgUrl = profileId?.startsWith("VF")
    ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
    : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";


  const getSafeImage = (imageUrl: string, profileId?: string): string => {
    // Determine if FEMALE profile (profile ID starts with "VF")
    const isFemaleProfile = profileId?.startsWith("VF");

    // Set default image based on profile gender prefix
    const defaultImgUrl = isFemaleProfile
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

    // Return default image if missing or empty
    if (!imageUrl || imageUrl.trim() === "") {
      return defaultImgUrl;
    }

    return imageUrl;
  };


  const handleMouseEnter = useCallback((image: string) => {
    setTimeout(() => setZoomImage(image), 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => setZoomImage(null), 100);
  }, []);

  // Convert single image string to an object with a default key if needed
  // const normalizeImages = (images: UserImages | string): UserImages => {
  //   if (typeof images === 'string') {
  //     return { 'default': images };
  //   }
  //   return images;
  // };
  const normalizeImages = (images: UserImages | string): UserImages => {
    if (typeof images === 'string') {
      // If it's a string, check if it's empty
      const safeImage = getSafeImage(images, profileId);
      return { 'default': safeImage };
    }

    // If it's an object, check if it's empty or has empty values
    if (Object.keys(images).length === 0) {
      return { 'default': defaultImgUrl };
    }

    // Filter out empty image URLs and replace with defaults
    const normalizedImages: UserImages = {};
    Object.entries(images).forEach(([key, value]) => {
      normalizedImages[key] = getSafeImage(value, profileId);
    });

    // If all images were empty, return default
    return Object.keys(normalizedImages).length > 0
      ? normalizedImages
      : { 'default': defaultImgUrl };
  };
  // const images = Object.values(storedProtectedImg ? sessionImage : userImages);

  // In your component, use it like this:
  const images = Object.values(
    storedProtectedImg
      ? sessionImage
      : normalizeImages(userImages) // Normalize the images here
  );

  const fetchProfileData = useCallback(async () => {
    setLoading(true);

    let page_id = "2"; // Default
    if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
      page_id = "1";
    }

    try {
      if (profileId) {
        const data = await fetchProfilesDetails(profileId, page_id);
        // const normalizedImages = typeof data.user_images === 'string'
        //   ? { 'default': data.user_images }
        //   : data.user_images;
        // setUserImages(normalizedImages);
        if (!data.user_images ||
          (typeof data.user_images === 'object' && Object.keys(data.user_images).length === 0) ||
          (typeof data.user_images === 'string' && data.user_images.trim() === '')) {
          // Set default image based on profile ID
          setUserImages({ 'default': defaultImgUrl });
        } else {
          const normalizedImages = typeof data.user_images === 'string'
            ? { 'default': getSafeImage(data.user_images, profileId) }
            : data.user_images;
          setUserImages(normalizedImages);
        }
        //setUserImages(data.user_images);
        setError(null);
      }
    } catch (error: any) {
      setError("Error fetching profiles");
      console.error(
        "Error fetching profiles:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  }, [profileId, defaultImgUrl]);

  useEffect(() => {
    const storedLockVal = sessionStorage.getItem("photolock");
    if (storedLockVal !== null) {
      setPhotoPasswordlock(Number(storedLockVal));
    } else {
      // Default to 1 if not in session storage
      setPhotoPasswordlock(1);
    }

    const storedImages = sessionStorage.getItem(`userImages_${id}`);
    if (storedImages) {
      setUserImages(JSON.parse(storedImages));
    }
  }, [id]);

  const GetPhotoByPassword = useCallback(
    async (Password: string) => {
      try {
        // Front-end validation for empty password
        if (!Password.trim()) {
          NotifyError("Please Enter Password");
          return;
        }

        const response = await axios.post<{
          status: string;
          message?: string;
          data?: {
            user_images: UserImages;
          };
          photo_protection?: number;
          errors?: {
            non_field_errors?: string;
            photo_password?: string;
          };
        }>(
          Get_photo_bypassword,
          {
            profile_id: loginuser_profileId,
            profile_to: id,
            photo_password: Password,
          }
        );

        // Handle successful response
        if (response.data.status === "success") {
          const { data, photo_protection, message } = response.data;

          // Store the unlocked images in session storage
          if (data?.user_images) {
            sessionStorage.setItem(
              `userImages_${id}`,
              JSON.stringify(data.user_images)
            );
            // Update local state with new images
            setUserImages(data.user_images);
          }
          // if (typeof photo_protection !== 'undefined') {
          //   // Store consistently as "photolock"
          //   sessionStorage.setItem(
          //     "photolock",
          //     JSON.stringify(photo_protection)
          //   );
          //   setPhotoPasswordlock(photo_protection);
          // }
          // Show success message from API or default
          NotifySuccess(message || "Photo fetched successfully");

          // Update photo protection status
          if (typeof photo_protection !== 'undefined') {
            sessionStorage.removeItem("photolock");
            sessionStorage.setItem(
              "photolockval",
              JSON.stringify(photo_protection)
            );
            setPhotoPasswordlock(Number(photo_protection));
          }
        }
        // Handle failed response
        else if (response.data.status === "Failed") {
          NotifyError("Please Enter Correct Password");
        }
        else {
          // Handle cases where status isn't "success"
          NotifyError(response.data.message || "Failed to fetch photos");
        }
      } catch (error: any) {
        // Handle axios error response
        if (error.response) {
          const { data } = error.response;

          // Check for specific error messages
          if (data.errors?.non_field_errors) {
            // Handle "Invalid photo password" error
            NotifyError(data.errors.non_field_errors);
          } else if (data.errors?.photo_password) {
            // Handle other field-specific errors
            NotifyError(data.errors.photo_password);
          } else if (data.message) {
            // Use server-provided error message
            NotifyError(data.message);
          } else {
            // Generic error message
            NotifyError("Please enter correct password");
          }
        } else {
          // Network or other errors
          NotifyError("An error occurred. Please try again.");
        }
        console.error("Password error:", error);
      } finally {
        setPopPassword(false);
      }
    },
    [id, loginuser_profileId]
  );
  // const handleSubmitPassword = useCallback(async () => {
  //   await GetPhotoByPassword(photoPassword);
  // }, [GetPhotoByPassword, photoPassword]);

  useEffect(() => {
    if (loginuser_profileId) {
      fetchProfileData();
    }
  }, [profileId, loginuser_profileId, fetchProfileData]);

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <div className="relative profileSliderStyle">
        {images.length === 1 ? (
          <div className="profile-slider-img-container">
            <img
              src={images[0] || defaultImgUrl}
              className="w-full h-[450px] rounded-lg profile-slider-img max-lg:w-full max-sm:w-full  max-sm:h-[300px] object-cover object-top"
              alt="Profile"
              onError={(e) => {
                e.currentTarget.onerror = null; // Prevent infinite loop
                e.currentTarget.src = defaultImgUrl; // Set default image
              }}
              onMouseEnter={() => handleMouseEnter(images[0])}
              onMouseLeave={handleMouseLeave}
            />
            {photoLock === 1 && PhotoPasswordlock === 1 && (
              <LockOverlay onClick={() => setPopPassword(true)} />
            )}
          </div>
        ) : (
          <>
            <Slider
              customPaging={(i: number) => (
                <a>
                  <img
                    src={images[i] || defaultImgUrl}
                    alt={`Thumbnail ${i + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Prevent infinite loop
                      e.currentTarget.src = defaultImgUrl; // Set default image
                    }}
                    className="w-full h-[420px] rounded-lg"
                  />
                </a>
              )}
              dots={false}
              arrows={false}
              dotsClass="slick-dots slick-thumb"
              infinite={true}
              // autoplay={true}
              speed={1400}
              slidesToShow={1}
              slidesToScroll={1}
              asNavFor={nav2 as Slider}
              ref={(slider) => (sliderRef1.current = slider)}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`profile-slider-img-container ${photoLock === 0 || PhotoPasswordlock === 0
                    ? ""
                    : !storedProtectedImg
                      ? "fade-img-effect"
                      : ""
                    }`}
                  onMouseEnter={() => handleMouseEnter(image)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={image}
                    className="w-full h-[450px] rounded-lg profile-slider-img max-lg:w-full max-sm:w-full  max-sm:h-[300px] object-cover object-top"
                    alt={`Slide ${index + 1}`}
                  />
                  {photoLock === 1 &&
                    PhotoPasswordlock === 1 &&
                    !storedProtectedImg && (
                      <LockOverlay onClick={() => setPopPassword(true)} />
                    )}
                </div>
              ))}
            </Slider>

            <Slider
              swipeToSlide={true}
              focusOnSelect={true}
              asNavFor={nav1 as never}
              ref={(slider) => setNav2(slider)}
              {...SLIDER_SETTINGS}
              className="connectingSlick"
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="profile-slider-img-container"
                  onMouseEnter={() => handleMouseEnter(image)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={image}
                    className="w-[90px] h-[90px] mx-auto my-5 rounded-lg object-top object-cover"
                    alt={`Thumbnail ${index + 1}`}
                  />
                </div>
              ))}
            </Slider>
          </>
        )}

        {/* {popupPassword && (
          <PasswordPopup
            onClose={() => setPopPassword(false)}
            onSubmit={handleSubmitPassword}
          />
        )} */}
        {popupPassword && (
          <PasswordPopup
            onClose={() => setPopPassword(false)}
            onSubmit={GetPhotoByPassword}
          />
        )}
      </div>
      <ZoomedImage image={zoomImage} />
      <ToastNotification />
    </div>
  );
};
