import React, { useState, useEffect, useRef, useCallback } from "react";
import { IoMdLock } from "react-icons/io";
import Slider from "react-slick";
import {
  fetchProfilesDetails,
  Get_photo_bypassword,
} from "../../../commonapicall";
import "./ProfileSlickStyleView.css";
import { GoAlertFill } from "react-icons/go";
import {
  ToastNotification,
  NotifyError,
  NotifySuccess,
} from "../../Toast/ToastNotification";
import { RotatingSquare } from "react-loader-spinner";
import { decryptId } from "../../../utils/cryptoUtils";
import { useSearchParams } from "react-router-dom";
import apiClient from "../../../API";

interface UserImages {
  [key: string]: string;
}

interface ProfileSlickViewProps {
  profileId?: string;
  photoLock: number;
}

const SLIDER_SETTINGS = {
  dots: false,
  infinite: true,
  speed: 1400,
  slidesToShow: 4,
  slidesToScroll: 1,
  initialSlide: 0,
  autoplay: false, // Changed to false for better manual control
  cssEase: "linear",
  pauseOnHover: true,
  rtl: false,
  arrows: false,
  responsive: [
    { breakpoint: 1536, settings: { slidesToShow: 4 } },
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 4, arrows: true } },
    { breakpoint: 639, settings: { slidesToShow: 3, arrows: true } },
  ],
};

const PasswordPopup: React.FC<{
  onClose: () => void;
  onSubmit: (password: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState("");
  return (
    <div className="absolute left-10 top-40 w-10/12 rounded-lg z-50">
      <div className="w-full bg-white rounded-lg px-4 py-4 shadow-2xl border border-gray-200">
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
            <button onClick={onClose} className="text-secondary font-semibold px-5 py-2.5">Cancel</button>
            <button onClick={() => onSubmit(password)} className="text-white bg-secondary rounded-md px-5 py-2.5">Submit</button>
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
    <RotatingSquare visible={true} height="100" width="100" color="#FF6666" />
    <p className="text-sm">Loading images...</p>
  </div>
);

const LockOverlay: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div onClick={onClick} className="text-center lock-style cursor-pointer" role="button">
    <IoMdLock className="w-fit mx-auto text-secondary text-[50px]" />
    <p className="text-sm text-white font-semibold">Click here to request password to view profile photo</p>
  </div>
);

export const ProfileSlickView: React.FC<ProfileSlickViewProps> = ({ profileId, photoLock }) => {
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id") || "";
  const [userImages, setUserImages] = useState<UserImages>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [popupPassword, setPopPassword] = useState<boolean>(false);
  const [PhotoPasswordlock, setPhotoPasswordlock] = useState<number>(1);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // --- REFS FOR SYNCING ---
  const [nav1, setNav1] = useState<Slider | null>(null);
  const [nav2, setNav2] = useState<Slider | null>(null);
  const sliderRef1 = useRef<Slider | null>(null);
  const sliderRef2 = useRef<Slider | null>(null);

  const [searchParams] = useSearchParams();
  const encryptedId = searchParams.get("id") || "";
  const id = decryptId(encryptedId);

  const storedProtectedImg = sessionStorage.getItem(`userImages_${id}`);
  const sessionImage: UserImages = storedProtectedImg ? JSON.parse(storedProtectedImg) : {};

  const defaultImgUrl = profileId?.startsWith("VF")
    ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
    : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";

  const getSafeImage = (imageUrl: string, pId?: string): string => {
    const isFemale = pId?.startsWith("VF");
    const fallback = isFemale
      ? "https://vysyamat.blob.core.windows.net/vysyamala/default_bride.png"
      : "https://vysyamat.blob.core.windows.net/vysyamala/default_groom.png";
    return !imageUrl || imageUrl.trim() === "" ? fallback : imageUrl;
  };

  const normalizeImages = (images: UserImages | string): UserImages => {
    if (typeof images === "string") return { default: getSafeImage(images, profileId) };
    if (Object.keys(images).length === 0) return { default: defaultImgUrl };
    const normalized: UserImages = {};
    Object.entries(images).forEach(([key, value]) => {
      normalized[key] = getSafeImage(value, profileId);
    });
    return normalized;
  };

  const images = Object.values(storedProtectedImg ? sessionImage : normalizeImages(userImages));

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    let page_id = location.pathname === "/LoginHome" || location.pathname === "/Search" ? "1" : "2";
    try {
      if (profileId) {
        const data = await fetchProfilesDetails(profileId, page_id);
        if (!data.user_images || (typeof data.user_images === "object" && Object.keys(data.user_images).length === 0)) {
          setUserImages({ default: defaultImgUrl });
        } else {
          setUserImages(typeof data.user_images === "string" ? { default: getSafeImage(data.user_images, profileId) } : data.user_images);
        }
      }
    } catch (err) {
      setError("Error fetching profiles");
    } finally {
      setLoading(false);
    }
  }, [profileId, defaultImgUrl]);

  useEffect(() => {
    const storedLockVal = sessionStorage.getItem("photolock");
    setPhotoPasswordlock(storedLockVal !== null ? Number(storedLockVal) : 1);
    const storedImg = sessionStorage.getItem(`userImages_${id}`);
    if (storedImg) setUserImages(JSON.parse(storedImg));
  }, [id]);

  useEffect(() => {
    if (loginuser_profileId) fetchProfileData();
  }, [profileId, loginuser_profileId, fetchProfileData]);

  // Sync refs to state for asNavFor
  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, [loading, images]);

  const GetPhotoByPassword = async (Password: string) => {
    try {
      if (!Password.trim()) { NotifyError("Please Enter Password"); return; }
      const response = await apiClient.post(Get_photo_bypassword, {
        profile_id: loginuser_profileId,
        profile_to: id,
        photo_password: Password,
      });

      if (response.data.status === "success") {
        const { data, photo_protection, message } = response.data;
        if (data?.user_images) {
          sessionStorage.setItem(`userImages_${id}`, JSON.stringify(data.user_images));
          setUserImages(data.user_images);
        }
        NotifySuccess(message || "Photo fetched successfully");
        if (typeof photo_protection !== "undefined") {
          sessionStorage.setItem("photolockval", JSON.stringify(photo_protection));
          setPhotoPasswordlock(Number(photo_protection));
        }
      } else {
        NotifyError("Please Enter Correct Password");
      }
    } catch (error) {
      NotifyError("An error occurred. Please try again.");
    } finally {
      setPopPassword(false);
    }
  };

  const handleMouseEnter = useCallback((image: string) => { setZoomImage(image); }, []);
  const handleMouseLeave = useCallback(() => { setZoomImage(null); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <div className="relative profileSliderStyle">
        {images.length === 1 ? (
          <div className="profile-slider-img-container">
            <img
              src={images[0] || defaultImgUrl}
              className="w-full h-[450px] rounded-lg profile-slider-img object-cover object-top"
              alt="Profile"
              onError={(e) => (e.currentTarget.src = defaultImgUrl)}
              onMouseEnter={() => handleMouseEnter(images[0])}
              onMouseLeave={handleMouseLeave}
            />
            {photoLock === 1 && PhotoPasswordlock === 1 && <LockOverlay onClick={() => setPopPassword(true)} />}
          </div>
        ) : (
          <>
            {/* TOP SLIDER */}
            <Slider
              asNavFor={nav2 as Slider}
              ref={(slider) => (sliderRef1.current = slider)}
              dots={false}
              arrows={false}
              infinite={true}
              speed={1400}
              slidesToShow={1}
              slidesToScroll={1}
            >
              {images.map((image, index) => (
                <div key={index}
                  className={`profile-slider-img-container ${photoLock === 1 && PhotoPasswordlock === 1 && !storedProtectedImg ? "fade-img-effect" : ""}`}
                  onMouseEnter={() => handleMouseEnter(image)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img src={image} className="w-full h-[450px] rounded-lg profile-slider-img object-cover object-top" alt={`Slide ${index}`} />
                  {photoLock === 1 && PhotoPasswordlock === 1 && !storedProtectedImg && <LockOverlay onClick={() => setPopPassword(true)} />}
                </div>
              ))}
            </Slider>

            {/* BOTTOM THUMBNAIL SLIDER */}
            <Slider
              asNavFor={nav1 as Slider}
              ref={(slider) => (sliderRef2.current = slider)}
              {...SLIDER_SETTINGS}
              focusOnSelect={true}
              swipeToSlide={true}
              className="connectingSlick"
            >
              {images.map((image, index) => (
                <div key={index} className="profile-slider-img-container outline-none">
                  <img src={image} className="w-[90px] h-[90px] mx-auto my-5 rounded-lg object-top object-cover cursor-pointer " alt={`Thumb ${index}`} />
                </div>
              ))}
            </Slider>
          </>
        )}

        {popupPassword && <PasswordPopup onClose={() => setPopPassword(false)} onSubmit={GetPhotoByPassword} />}
      </div>
      <ZoomedImage image={zoomImage} />
      <ToastNotification />
    </div>
  );
};