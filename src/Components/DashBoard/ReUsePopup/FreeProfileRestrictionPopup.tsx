import React from "react";
import { IoClose } from "react-icons/io5";
import { MdLockOutline } from "react-icons/md";

interface FreeProfileRestrictionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FreeProfileRestrictionPopup: React.FC<
  FreeProfileRestrictionPopupProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          <IoClose />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <MdLockOutline className="text-red-600 text-2xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-secondary mb-2">
          Viewing Limit Reached
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6 text-sm leading-relaxed">
          You have reached your profile viewing limit.
          <br />
          Upgrade your plan to continue viewing more profiles.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              window.location.href = "/UpgradePlan"; // change route if needed
            }}
            className="bg-gradient rounded-[6px] py-[6px] px-[24px] text-white text-sm font-semibold cursor-pointer max-lg:text-[14px]"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeProfileRestrictionPopup;
