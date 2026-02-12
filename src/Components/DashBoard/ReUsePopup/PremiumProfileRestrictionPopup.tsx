import React from "react";
import { IoClose } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";

interface PremiumProfileRestrictionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumProfileRestrictionPopup: React.FC<
  PremiumProfileRestrictionPopupProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fadeIn"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          <IoClose />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-4 rounded-full">
            <IoWarningOutline className="text-yellow-600 text-2xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-secondary mb-2">
          Daily View Limit Reached
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6 text-sm leading-relaxed">
          Today’s view limit has been reached.
          <br />
          Please log in tomorrow to view more new profiles.
          <br />
          You can still revisit profiles you’ve already viewed.
        </p>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gradient rounded-[6px] py-[6px] px-[24px] text-white text-sm font-semibold cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumProfileRestrictionPopup;
