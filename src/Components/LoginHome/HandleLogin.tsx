import { HeroSlider } from "./HeroSlider";
import { MatchingProfiles } from "./MatchingProfiles";
// import { SuggestedProfiles } from "./SuggestedProfiles";
// import { FeaturedProfiles } from "./FeaturedProfiles";
// import { VysyamalaStore } from './VysyamalaStore';
// import { VysyaBazaar } from './VysyaBazaar';
// import {OfferNotification} from "../../Components/OfferToast/OfferNotification";
// import { NotifySuccess } from "../../Components/OfferToast/OfferNotification";
// import { useEffect } from "react";
// import { FaXmark } from "react-icons/fa6";
// import { UpgradeToView } from "../../Components/UpgradeToView/UpgradeToView";

export const HandleLogin = () => {


  // useEffect(() => {
  //   const timeoutOffer = setTimeout(() => {
  //     NotifySuccess(
  //       <div className="p-[6px] pt-0 space-y-5 relative">
  //         <FaXmark className="w-6 h-6 text-footer-text-gray absolute right-2 top-[-5px]" />
  //         <h4 className="text-[16px] font-bold leading-5"><span className="font-[13px]">🎁</span> New Offer</h4>
  //         <p className="text-[14px] font-med leading-6">
  //           We have introduced a new offer blah blah blah. Check our new offer
  //         </p>
  //         <button className="bg-white text-[14px] font-medium text-main py-2 px-4 rounded-md">
  //           Check offer
  //         </button>
  //       </div>,
  //       {
  //         autoClose: 5000, // Notification duration
  //         style: {
  //           backgroundImage: 'linear-gradient(92.08deg, #BD1225 0.6%, #FF4050 103.08%)', 
  //           borderRadius: '8px',
  //         },
  //       }
  //     );
  //   }, 3000); // Delay of 1 second

  //   // Cleanup function to avoid memory leaks
  //   return () => clearTimeout(timeoutOffer);
  // }, []);




  return (
    <div>
      <HeroSlider />
      <MatchingProfiles />
      {/* <FeaturedProfiles />
      <SuggestedProfiles /> */}
      {/* <VysyamalaStore /> */}
      
      {/* <VysyaBazaar /> */}
      {/* <UpgradeToView
        upgardeHeader="Contact details"
        unlockTitle="Unlock Contact Details"
        unlockDesc="Upgrade to paid plan to view contact details"
      /> */}
    </div>
  );
};
