/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { AddOns } from "../Components/PayNow/AddOns";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cancelPayment, createOrder, Get_addon_packages, savePlanPackage, verifyPayment } from "../commonapicall";
import { ToastNotification, NotifyError, NotifySuccess, } from "../Components/Toast/ToastNotification";
import { GPayPopup } from "./PayNowRegistration/GPayPopup";
import { ConfirmationPopup } from "./PayNowRegistration/ConfirmationPopup";
import apiClient from "../API";

interface Package {
  package_id: number;
  name: string;
  description: string;
  amount: number;
}

export const PayNowRegistration: React.FC = () => {
  const location = useLocation();
  // Destructure the state data passed via navigate
  const { packageName } = location.state || {};
  console.log("packageName", packageName);

  const [membershipPlane, setMemberShipPlane] = useState<Package[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const response = await apiClient.post(Get_addon_packages);
    try {
      if (response.status === 200) {
        setMemberShipPlane(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const price = queryParams.get("price");
  const profile_id = localStorage.getItem("profile_id_new");
  const planName = queryParams.get("planName");
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false);
  const [gpayPaymentSuccessful, setgpayPaymentSuccessful] = useState(false);
  const [isGPayClicked, setIsGPayClicked] = useState(false);
  const [isOnlinePaymentClicked, setIsOnlinePaymentClicked] = useState(false);
  const [showGPayPopup, setShowGPayPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupHeading, setPopupHeading] = useState("Thank You");
  // const [isPaymentCancelled, setIsPaymentCancelled] = useState(false);
  // const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [, setIsPaymentCancelled] = useState(false);
  const [, setCurrentOrderId] = useState<string | null>(null);
  const hasShownCancelToast = useRef(false);
  // useEffect(() => {
  //   if (id) {
  //     localStorage.setItem("userplanid", id);
  //   }
  // }, [id]);


  const handleAddOnChange = (
    rate: number,
    checked: boolean,
    packageId: number
  ) => {
    if (checked) {
      // Add the rate and packageId to the state
      setSelectedValues((prevValues) => [...prevValues, rate]);
      setSelectedPackageIds((prevIds) => [...prevIds, packageId]);
    } else {
      // Remove the rate and packageId from the state
      setSelectedValues((prevValues) => {
        const index = prevValues.indexOf(rate);
        return index > -1
          ? prevValues.filter((_, i) => i !== index)
          : prevValues;
      });

      setSelectedPackageIds((prevIds) => {
        const index = prevIds.indexOf(packageId);
        return index > -1 ? prevIds.filter((_, i) => i !== index) : prevIds;
      });
    }
  };

  const totalAmount = selectedValues.reduce(
    (acc, val) => acc + val,
    Number(price)
  );
  // This function is responsible for creating the payment order.
  const createPaymentOrder = async () => {
    try {
      const amountInPaise = totalAmount;
      const addonPackageIdsString = selectedPackageIds.join(",");

      const orderResponse = await createOrder(
        amountInPaise,
        String(profile_id),
        Number(id),
        addonPackageIdsString
      );

      if (orderResponse && orderResponse.order && orderResponse.order.id) {
        const order_id = orderResponse.order.id; // The order_id returned from createOrder API

        // Proceed with Razorpay payment flow
        return order_id; // Return the order_id to be used for Razorpay
      } else {
        NotifyError("Failed to create the order. Please try again.");
        throw new Error("Failed to create order.");
      }
    } catch (error) {
      NotifyError("Failed to create order. Please try again.");
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const verifyPaymentFunction = async (profile_id: string, razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string
  ) => {
    try {
      // Call the verifyPayment API (assuming verifyPayment is already defined in your common API file)
      const verificationResponse = await verifyPayment(profile_id, razorpay_order_id, razorpay_payment_id, razorpay_signature);
      // Log the response for debugging
      //console.log("Payment Verification Response:", verificationResponse);
      // Handle the verification response
      if (verificationResponse.status === "success") {
        NotifySuccess("Payment verified successfully!");
        if (id) {
          localStorage.setItem("userplanid", id);
        }
        // Proceed with further actions after successful verification
        await Save_plan_package(); // After verification, save the plan
        setIsOnlinePaymentClicked(true);
        setIsPaymentSuccessful(true);
      } else {
        NotifyError("Payment verification failed!");
      }
    } catch (error: any) {
      console.error("Error during payment verification:", error.message);
      NotifyError("Error during payment verification. Please try again.");
    }
  };

  const cancelPaymentFunction = async (order_id: string) => {
    try {
      const cancelResponse = await cancelPayment(
        String(profile_id),
        order_id,
        3
      );
      if (cancelResponse.status === "success" && hasShownCancelToast.current) {
        NotifyError("Payment cancelled successfully!");
        hasShownCancelToast.current = true; // prevent duplicate toast
      } else {
        console.log("Failed to cancel the payment. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during payment cancellation:", error.message);
      NotifyError("Error during payment cancellation. Please try again.");
    }
  };

  const handlePaymentCancelled = async (orderId: string) => {
    try {
      // First call the cancel payment API
      await cancelPaymentFunction(orderId);

      // Then show the popup with the message
      const message = "It looks like your payment was not completed. Please retry, or share your transaction screenshot with us on WhatsApp 9944851550 for assistance.";
      setPopupMessage(message);
      setShowConfirmationPopup(true);
      setIsPaymentCancelled(true);
      setCurrentOrderId(orderId);
      setPopupHeading("Payment Incompleted");
    } catch (error) {
      console.error("Error handling payment cancellation:", error);
      NotifyError("Error processing payment cancellation.");
    }
  };

  const Save_plan_package = async (isGPay?: boolean) => {
    try {
      const addonPackageIdsString = selectedPackageIds.join(",");

      let response;

      if (isGPay) {
        // For GPay: pass gpay_online=1
        response = await savePlanPackage(
          String(profile_id),
          String(id),
          addonPackageIdsString,
          totalAmount,
          1
        );
      } else {
        // For other payments: don't pass gpay_online parameter
        response = await savePlanPackage(
          String(profile_id),
          String(id),
          addonPackageIdsString,
          totalAmount
        );
      }

      // Check if the response and status exist before accessing them
      if (response && response.status === "success") {
        // Since 'data_message' is directly in the response object, we can check for it directly
        if (response.data_message) {
          NotifySuccess("Plans and packages updated successfully");
          sessionStorage.setItem(
            "Save_plan_package_message",
            response.data_message
          );
          sessionStorage.setItem("register_token", response.token);
          localStorage.setItem("user_profile_image", response.profile_image);
          localStorage.setItem("custom_message", response.custom_message);
          localStorage.setItem("register_token", response.token);
          localStorage.setItem("Save_plan_package_message", response.data_message);
          localStorage.setItem("plan_id", response.cur_plan_id);
          localStorage.setItem("valid_till", response.valid_till);
          //console.log("Save_plan_package", response);

          // Navigate to the next page
          setTimeout(() => {
            navigate("/ThankYouReg");
          }, 5000);
        } else {
          // Handle the case where data_message is missing
          console.error("data_message is missing in the response.");
          NotifyError(
            "Failed to update plans and packages. Missing data_message."
          );
        }
      } else {
        // Handle the case when status is not 'success'
        console.error("Response status is not 'success':", response);
        NotifyError("Failed to update plans and packages. Please try again.");
      }
    } catch (error) {
      console.error("Error saving the package:", error);
      NotifyError("Something went wrong.");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("razorpay-script")) {
        return resolve(true); // Razorpay script already loaded
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.id = "razorpay-script";
      script.onload = () => resolve(true);
      script.onerror = () =>
        reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  };
  useEffect(() => {
    // Load Razorpay script when component mounts
    loadRazorpayScript().catch((error) => {
      console.error(error.message);
    });
  }, []);


  const handlePayNow = async () => {
    try {
      // Convert total amount to paise (since Razorpay expects amount in paise)
      const amountInPaise = totalAmount;
      const order_id = await createPaymentOrder();
      // Proceed with Razorpay payment flow
      const options = {
        // key: "rzp_test_bR07kHwjYrmOHm", // Your Razorpay Key ID
        key: "rzp_live_HYCeDsho3jhHRt", // Your Razorpay Key ID
        amount: amountInPaise, // Amount in paise
        currency: "INR",
        name: "Vysyamala", // Your company or name
        image: "https://vysyamat.blob.core.windows.net/vysyamala/VysyamalaLogo-i_e8O9Ou.png",
        description: "Purchase Credits",
        order_id: order_id, // The order_id from createOrder API
        handler: async function (response: {
          razorpay_payment_id: any;
          razorpay_order_id: any;
          razorpay_signature: any;
        }) {
          //console.log("Payment Response:", response);

          // After successful payment, call verifyPayment
          await verifyPaymentFunction(
            String(profile_id),
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          // Set the payment as successful
          // setIsPaymentSuccessful(true);
          setIsOnlinePaymentClicked(true); // Disable GPay button
          // Simulate payment success
          setTimeout(() => {
            setIsPaymentSuccessful(false); // Re-enable if payment fails
          }, 2000);
        },
        prefill: {
          name: "User", // User's name
          email: "user@example.com", // User's email
          contact: "1234567890", // User's contact number
        },
        notes: {
          address: "Razorpay Corporate Office", // Add any additional notes if needed
        },
        theme: {
          color: "#3399cc", // Customize the theme color
        },
      };
      const rzp1 = new (window as any).Razorpay(options);

      // Add a payment.failed event listener
      rzp1.on('modal.close', async function () {
        console.log("Razorpay modal was closed by the user.");
        await handlePaymentCancelled(order_id);
      });

      // Add a payment.failed event listener
      rzp1.on(
        "payment.failed",
        async function (response: { error: { metadata: any; reason: any } }) {
          try {
            await handlePaymentCancelled(response.error.metadata.order_id);
          } catch (error: any) {
            console.error(
              "Error during payment cancellation:",
              error.message || error
            );
            NotifyError("Error during payment cancellation. Please try again.");
          }
        }
      );

      // Open the Razorpay payment window
      rzp1.open();
    } catch (error) {
      // Handle any error that occurred during the order creation or payment process
      NotifyError("Failed to create order. Please try again.");
      console.error("Error creating order or opening Razorpay:", error);
    }
  };

  const handleGPay = async () => {
    setIsGPayClicked(true);
    setShowGPayPopup(true);
  };

  const handleGPaySubmit = async () => {
    try {
      // Call the API to save the package with GPay flag
      await Save_plan_package(true);
      setgpayPaymentSuccessful(true);
      // Close GPay popup and show confirmation popup
      setShowGPayPopup(false);
      setShowConfirmationPopup(true);
      setPopupHeading("Thank You");
      setPopupMessage("Thank you for choosing Vysyamala for your soulmate search. Our customer support team will connect with you shortly. In the meantime, please share your payment screenshot via WhatsApp at 9944851550.");
    } catch (error) {
      console.error("Error saving package:", error);
      NotifyError("Failed to process payment. Please try again.");
      setShowGPayPopup(false); // Close GPay popup on error
    }
  };

  return (
    <div className="bg-grayBg">
      <div className="container  mx-auto pt-32 pb-16 max-lg:pt-28 max-lg:pb-16 max-md:pt-20 max-md:pb-10 ">
        <div className="w-[482px] mx-auto font-semibold rounded-xl shadow-profileCardShadow p-8 mt-10 max-md:mt-10 max-sm:w-[100%] max-sm:p-4">
          <h5 className="text-footer-gray text-sm font-semibold mb-[10px]">
            Selected Plan
          </h5>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-[24px] text-[#333333] font-semibold leading-9 mb-2">
                {planName}
              </h4>
              <Link to="/MembershipPlan">
                <p className="text-secondary text-xs leading-3 underline font-normal">
                  Change Plan
                </p>
              </Link>
            </div>

            <div>
              <p className="text-primary text-sm ">&#8377; {price}</p>
            </div>
          </div>

          <hr className="text-footer-text-gray my-5" />

          <h5 className="text-footer-gray font-sm font-semibold mb-2">
            Add-On Packages
          </h5>

          {membershipPlane.map((packageItem) => (
            <AddOns
              key={packageItem.package_id}
              label={packageItem.name}
              desc={packageItem.description}
              name={packageItem.name}
              rate={packageItem.amount}
              onChange={(rate, checked) =>
                handleAddOnChange(rate, checked, packageItem.package_id)
              }
            />
          ))}
          <hr className="text-footer-text-gray my-5" />

          <div className="flex justify-between items-center">
            <p className="text-[#333333] text-sm">Total</p>
            <p className="text-[24px] text-primary font-bold">
              &#8377; {totalAmount}
            </p>
          </div>
          <div className="flex flex-row gap-x-4 mt-4">
            <button
              onClick={() => handleGPay()}
              type="button"
              className="w-full py-[10px] px-[24px] bg-main text-sm font-medium text-white leading-7 rounded-[6px] mt-10"
              disabled={gpayPaymentSuccessful || isOnlinePaymentClicked}
              style={{ cursor: (gpayPaymentSuccessful || isOnlinePaymentClicked) ? 'not-allowed' : 'pointer' }} // Change cursor on disabled state
            >
              {gpayPaymentSuccessful ? "Payment Successful" : "GPay"}
            </button>

            <button
              // onClick={() => Save_plan_package()}
              onClick={() => handlePayNow()}
              type="submit"
              className="w-full py-[10px] px-[24px] bg-main text-sm font-medium text-white leading-7 rounded-[6px] mt-10"
              disabled={isPaymentSuccessful || isGPayClicked} // Disable if payment is successful
              style={{ cursor: (isPaymentSuccessful || isGPayClicked) ? 'not-allowed' : 'pointer' }} // Change cursor on disabled state
            >
              {isPaymentSuccessful ? "Payment Successful" : "Online Payment"}
            </button>
          </div>
        </div>
      </div>
      {/* <GPayPopup isOpen={showGPayPopup} onClose={() => {
        setShowGPayPopup(false);
        setIsGPayClicked(false);
      }}
      /> */}
      <GPayPopup
        isOpen={showGPayPopup}
        onClose={() => {
          setShowGPayPopup(false);
          setIsGPayClicked(false);
        }}
        // onConfirm={async () => {
        //   try {
        //     await Save_plan_package(true);
        //     setgpayPaymentSuccessful(true); // Mark GPay payment as successful
        //   } catch (error) {
        //     console.error("Error saving package:", error);
        //   }
        // }}
        onConfirm={handleGPaySubmit}
      />
      <ConfirmationPopup
        isOpen={showConfirmationPopup}
        onClose={() => {
          setShowConfirmationPopup(false);
        }}
        message={popupMessage}
        heading={popupHeading}
      />
      <ToastNotification />
    </div>
  );
};
