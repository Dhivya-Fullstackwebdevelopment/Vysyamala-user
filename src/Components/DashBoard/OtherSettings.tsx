import React, { useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaBell } from "react-icons/fa6";
import { MdImage } from "react-icons/md";
import { MdManageAccounts } from "react-icons/md";
// import { BiSolidUserCircle } from "react-icons/bi";
// import { IoMdLock } from "react-icons/io";
import { AlertSettings } from "./OtherSettings/AlertSettings";
import { PhotoSettings } from "./OtherSettings/PhotoSettings";
import { PartnerSettings } from "./OtherSettings/PartnerSettings";
import { BiSolidUserCircle } from "react-icons/bi";
import { ProfileVisibility } from "./OtherSettings/ProfileVisibility";
import { useNavigate } from "react-router-dom";
// import { ChangePassword } from "./OtherSettings/ChangePassword";
// import { ProfileVisibility } from "./OtherSettings/ProfileVisibility";

interface OtherSettingsProps {
  dashBoardAgain: () => void;
}

export const OtherSettings: React.FC<OtherSettingsProps> = ({
  dashBoardAgain,
}) => {
  // Corresponding Component State Declaration
  const [activeSection, setActiveSection] = useState<string>("AlertSettings");
  const planID = localStorage.getItem("userplanid");

  const renderSection = () => {
    switch (activeSection) {
      case "Personal":
        return <AlertSettings />;
      case "PhotoSettings":
        return <PhotoSettings />;
      case "PartnerSettings":
        return <PartnerSettings />;
      // case 'ChangePassword':
      //     return <ChangePassword />;
      case "ProfileVisibility":
        return <ProfileVisibility />;
      default:
        return <AlertSettings />;
    }
  };
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    if (location.pathname === "/Dashboard") {
      // 👈 If already on Dashboard → call prop function
      dashBoardAgain();
    } else {
      // 👈 Else navigate to Dashboard
      navigate("/Dashboard");
    }
  };

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex items-center mb-5">
          <IoArrowBackOutline
            onClick={handleBackToDashboard}
            className="text-[24px] mr-2 cursor-pointer"
          />
          <h4 className="text-[24px] text-vysyamalaBlackSecondary font-bold max-sm:text-[20px]">
            {" "}
            Other Settings
            {/* <span className="text-sm text-primary"> (234)</span> */}
          </h4>
        </div>
      </div>

      <div className="bg-ash">
        <div className="container mx-auto py-20 max-sm:py-8">
          <div className="w-full flex justify-between items-start space-x-5 max-lg:flex-col max-lg:space-x-0">
            {/* Side Bar */}
            <div className="sidebar max-sm:w-full">
              <ul className="w-full space-y-10 max-lg:flex max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-10 max-lg:justify-between max-lg:space-y-0 max-lg:mb-8 max-md:gap-x-0 max-sm:flex-col max-sm:gap-0 max-sm:divide-y-[1px] max-sm:divide-ashBorder max-sm:w-full ">
                <li
                  className={`flex items-center text-[20px] text-white cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                                 ${activeSection === "AlertSettings"
                      ? "active"
                      : ""
                    }`}
                  onClick={() => setActiveSection("AlertSettings")}
                >
                  <FaBell className="text-[22px] mr-2 max-sm:text-base " />
                  Alert Settings
                </li>

                <li
                  className={`flex items-center text-[20px] text-white cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px]  
                            ${activeSection === "PhotoSettings" ? "active" : ""
                    }`}
                  onClick={() => setActiveSection("PhotoSettings")}
                >
                  <MdImage className="text-[22px] mr-2 max-sm:text-base " />
                  Photo / ID Settings
                </li>

                <li
                  className={`flex items-center text-[20px] text-white cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                                 ${activeSection === "PartnerSettings"
                      ? "active"
                      : ""
                    }`}
                  onClick={() => setActiveSection("PartnerSettings")}
                >
                  <MdManageAccounts className="text-[22px] mr-2 max-sm:text-base " />
                  Partner Settings
                </li>
                {/* 
                <li
                  className={`flex items-center text-[20px] text-white cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                                 ${
                                   activeSection === "ChangePassword"
                                     ? "active"
                                     : ""
                                 }`}
                  onClick={() => setActiveSection("ChangePassword")}
                >
                  <IoMdLock className="text-[22px] mr-2 max-sm:text-base " />
                  Change Password
                </li> */}
                {/* {planID === "3" && (
                  <li
                    className={`flex items-center text-[20px] text-white cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                                 ${activeSection === "ProfileVisibility"
                        ? "active"
                        : ""
                      }`}
                    onClick={() => setActiveSection("ProfileVisibility")}
                  >
                    <BiSolidUserCircle className="text-[22px] mr-2 max-sm:text-base " />
                    Profile Visibility
                  </li>)} */}
               {(planID === "3" || planID === "17") && (
                  <li
                    className={`flex items-center text-[20px] text-white cursor-pointer max-xl:text-[18px] max-lg:w-2/5 max-md:w-2/4 max-sm:w-full max-sm:text-[16px] 
                                 ${activeSection === "ProfileVisibility"
                        ? "active"
                        : ""
                      }`}
                    onClick={() => setActiveSection("ProfileVisibility")}
                  >
                    <BiSolidUserCircle className="text-[22px] mr-2 max-sm:text-base " />
                    Profile Visibility
                  </li>
                )}
              </ul>
            </div>

            {/* Content */}
            <div className="w-3/4 bg-white rounded-lg max-lg:w-full">
              <div className="p-10 max-md:p-5">{renderSection()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
