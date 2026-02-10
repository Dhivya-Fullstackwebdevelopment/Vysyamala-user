

import { useState, useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { HeroSliderContent } from "../LoginHome/HeroSlider/HeroSliderContent";
import "./HeroSlider/HeroSlickStyle.css";
import config from "../../Config";

export const HeroSlider = () => {
  const [profileCount, setProfileCount] = useState<number>(0); // State to track the profile count

  useEffect(() => {
    // Fetch the profile count from the server
    const fetchProfileCount = async () => {
      try {
        const response = await fetch(
           `${config.apiUrl}/auth/Get_profile_intrests_list/`,
          //"http://103.214.132.20:8000/auth/Get_profile_intrests_list/",
          {
            method: "POST",
            body: JSON.stringify({
              profile_id: localStorage.getItem("loginuser_profile_id") ,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        //console.log(data, "data");
        if (data.Status !== 0) {
          setProfileCount(data.data.profiles.length); // Set profile count if profiles are found
        }
      } catch (error) {
        console.error("Error fetching profile count:", error);
      }
    };

    fetchProfileCount();
  }, []);

  // Only render HeroSliderContent if profileCount is greater than 0
  return (
    <section className="bg-heroSliderBgImg bg-no-repeat bg-cover w-full overflow-hidden">
      <div className="container mx-auto heroSlickStyle">
        <div className="slider-container">
          {profileCount > 0 ? (
            <HeroSliderContent /> // Render only if there are interests
          ) : 
          ""
          // (
          //   <div className="text-white text-center py-10">
          //     <h4>No new interests received.</h4>
          //   </div>
          // )
          }
        </div>
      </div>
    </section>
  );
};