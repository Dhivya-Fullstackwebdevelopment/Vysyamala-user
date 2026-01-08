import { useState, useEffect } from "react";
import HeartMsg from "../../../assets/icons/HeartMsg.png";
import ProfileImgSlider from "../../../assets/images/ProfileImgSlider.png";
import { IoCalendar } from "react-icons/io5";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";
//import axios from "axios";
import Slider from "react-slick";
import apiClient from "../../../API";
import { Hearts } from "react-loader-spinner";
import { encryptId } from "../../../utils/cryptoUtils";

// Define interface for profile data



interface Profile {
  int_profileid: string;
  int_profile_name: string;
  int_Profile_img: string;
  int_profile_age: number;
  int_profile_notes: string;
  int_status: number;
}

const settings = {
  dots: true,
  infinite: false,
  speed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  initialSlide: 0,
  autoplay: true,
  cssEase: "linear",
  pauseOnHover: true,
  arrows: true,
  rtl: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        infinite: false,
        dots: true,
      },
    },
    {
      breakpoint: 1023,
      settings: {
        slidesToShow: 1,
        autoplay: true,

      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        autoplay: true,
        arrows: false,
      },
    },

    {
      breakpoint: 639,
      settings: {
        slidesToShow: 1,
        autoplay: true,
        arrows: false,

      },
    },
  ],
};
// Define props interface for settings
// interface HeroSliderContentProps {
//   settings: object; // Accept slider settings as props
// }

export const HeroSliderContent = () => {
  const [profileData, setProfileData] = useState<Profile[]>([]); // Use an array to hold multiple profiles
  const [loading, setLoading] = useState(true);
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post<{ Status: number, message: string, data: { profiles: Profile[] } }>(
          '/auth/Get_profile_intrests_list/',
          { profile_id: loginuser_profileId }
        );

        if (response.data.Status === 1 && response.data.data.profiles.length > 0) {
          setProfileData(response.data.data.profiles);
        } else {
          setProfileData([]);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
        setProfileData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [loginuser_profileId]);


  
  const handleClick = (profileId: string) => {
    const secureId = encryptId(profileId);
    const url = `/profiledetails?id=${secureId}&interest=1`;
    // window.open(url, '_blank');
    window.location.href = url; // Navigate to the URL in the same tab
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32">
        <Hearts
          height="100"
          width="100"
          color="#FF6666"
          ariaLabel="hearts-loading"
          visible={true}
        />
        <p className="text-white text-lg mt-4">Please wait...</p>
      </div>
    );
  }


  return (
    <div>
      <Slider {...settings}>
        {profileData.length > 0 ? (
          profileData.map(profile => (
            <div>
              <div key={profile.int_profileid} className="w-9/12 mx-auto flex justify-between items-center py-36 overflow-hidden max-lg:flex-col max-lg:items-start max-lg:gap-8 max-md:items-center max-md:w-[70%] max-sm:w-[100%] max-sm:px-0  max-sm:py-14 ">
                {/* New Interest Received */}
                <div className="max-md:self-start ">
                  <div className="mb-3">
                    <img src={HeartMsg} alt="" />
                  </div>
                  <h4 className="text-4xl text-white font-semibold max-lg:text-3xl max-md:text-2xl">
                    New Interest <br /> Received
                  </h4>
                </div>

                <div className="max-md:w-full rounded-lg bg-white">
                  <div className="rounded-lg flex justify-end items-center max-md:flex-col max-md:items-start">

                    {/* Slick Card Image */}
                    <div className="relative fade-bottom after:!left-0 after:!rounded-lg max-md:w-full">
                      <img
                        src={profile.int_Profile_img || ProfileImgSlider}
                        alt=""
                        className="w-[250px] h-[250px]  rounded-lg   max-md:w-full"
                      />

                      {/* Slick Image Fade Effect */}
                      <div className="w-full flex flex-col justify-end absolute bottom-0 top-0 left-0 right-0 h-full px-2 py-3 z-10  max-md:px-5 ">
                        <h5 className="text-white font-semibold max-xl:text-sm">
                          {profile.int_profile_name} <span>({profile.int_profileid})</span>
                        </h5>
                        <div className="flex justify-between items-center max-xl:flex-col max-xl:items-start max-xl:gap-y-1">
                          <p className="text-white font-normal flex items-center  max-xl:text-sm">
                            {" "}
                            <IoCalendar className="mr-2" /> {profile.int_profile_age} yrs
                          </p>
                          <p className="text-white font-normal flex items-center max-xl:text-sm">
                            <FaPersonArrowUpFromLine className="mr-2" /> 5ft 10in (177
                            cms)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Slick Card Content */}
                    <div className="w-96 bg-white px-10 py-[3.39em] rounded-lg max-md:w-full max-sm:px-4 max-sm:py-8">
                      <h5 className="text-md vysyamalaBlack font-semibold mb-5">
                        {profile.int_profile_notes}
                      </h5>

                      <div className="space-x-5">

                        {/* <Link to="/ProfileDetails" target="_blank"> */}
                        <button
                          onClick={() => handleClick(profile.int_profileid)}
                          className="bg-gradient text-white rounded-[6px] font-semibold px-4 py-3 max-xl:py-3 max-xl:p-4 max-sm:px-3">
                          View Profile
                        </button>
                        {/* </Link> */}

                        <button className="bg-white text-main rounded-[6px] border-2 border-main font-semibold px-4 py-2.5 max-sm:px-4">
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )
          :
          (
            <div>
              <div className="w-9/12 mx-auto flex justify-center items-center py-36">
                <h4 className="w-fit mx-auto text-4xl text-white font-semibold">No New Interest Received</h4>
              </div>
            </div>
          )
        }
      </Slider >
    </div >
  );
};
