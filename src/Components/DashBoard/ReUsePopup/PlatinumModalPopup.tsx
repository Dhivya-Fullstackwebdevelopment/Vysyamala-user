import React from "react";
import { IoClose } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";


interface PlatinumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlatinumModal: React.FC<PlatinumModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header/Icon */}
                <div className="bg-secondary p-1 text-center text-white">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MdOutlineSecurity className="text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Platinum Private Membership</h3>
                </div>

                {/* Body */}
                <div className="p-8 text-center">
                    <p className="text-ashSecondary leading-relaxed mb-6">
                        This profile is secured under <span className="font-semibold text-secondary">Platinum Private Membership</span>.
                        For access and assisted viewing, please contact our Customer Support.
                    </p>

                    {/* <div
                        className="flex items-center justify-center gap-3 bg-primary/10 text-primary py-4 rounded-xl font-bold text-xl border-2 border-dashed border-primary/30"
                    >
                        <FaPhoneAlt className="text-lg" />
                        99448 51550
                    </div> */}
                    <a
                        href="tel:9944851550"
                        className="flex items-center justify-center gap-3 bg-primary/10 text-primary py-4 rounded-xl font-bold text-xl border-2 border-dashed border-primary/30"
                    >
                        <FaPhoneAlt className="text-lg" />
                        99448 51550
                    </a>
                </div>

                {/* Footer */}


                {/* Close Button Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                    <IoClose size={24} />
                </button>
            </div>
        </div>
    );
};

export default PlatinumModal;