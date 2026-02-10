/* eslint-disable @typescript-eslint/no-explicit-any */
//import axios from "axios";
import apiClient from "./API"; // Ensure correct import

export const fetchProfiles = async (
  profileId: string | null,

  pageNo?: number,
  perPage?: number,
  sortOrder?: string,

): Promise<any> => {
  try {
    const response = await apiClient.post(
      "/auth/Get_prof_list_match/",
      {
        profile_id: profileId,
        per_page: perPage,
        page_number: pageNo,
        order_by: sortOrder,
      }
    );
    if (response.data.Status !== 1) {
      throw new Error("Failed to fetch profiles");
    }
    return response.data; // Adjust based on the actual response structure
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
};

export const fetchProfilesDetails = async (profileId: string, PageID: string): Promise<any> => {
  try {
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    const response = await apiClient.post("/auth/Get_profile_det_match/", {
      profile_id: loginuser_profileId,
      user_profile_id: profileId, // Adjust as needed based on your API requirements
      Page_id: PageID,
    });

    // if (response.data.Status !== 1) {
    //   throw new Error(`Failed to fetch profiles: ${response.data.message || 'Unknown error'}`);
    // }

    return response.data; // Adjust based on actual response structure
  } catch (error: any) {
    console.error(
      "Error fetching profiles:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const Update_photo_request =
  "/auth/Update_photo_request/";
// "http://103.214.132.20:8000/auth/Update_photo_request/";
export const Get_profile_det_match =
  "/auth/Get_profile_det_match/";
// "http://103.214.132.20:8000/auth/Get_profile_det_match/";
export const Get_photo_bypassword =
  "/auth/Get_photo_bypassword/";
//"http://103.214.132.20:8000/auth/Get_photo_bypassword/";
export const Get_addon_packages =
  "/auth/Get_addon_packages/";
//"http://103.214.132.20:8000/auth/Get_addon_packages/";
export const Save_plan_package =
  "/auth/Save_plan_package/";
// "http://103.214.132.20:8000/auth/Save_plan_package/";
export const update_photo_password =
  "/auth/Update_photo_password/";
//"http://103.214.132.20:8000/auth/Update_photo_password/";
export const photo_protection =
  "/auth/Get_photo_protection/";
//"http://103.214.132.20:8000/auth/Get_photo_protection/";
export const Get_advance_search =
  "/auth/Get_advance_search/";
//"http://103.214.132.20:8000/auth/Get_advance_search/";

export const fetchSearchProfiles = async (searchId: string, profession: string, age: string, location: string, pageNo: number, sortOrder: number): Promise<any> => {
  try {
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    const response = await apiClient.post("/auth/Get_prof_list_match/", {
      profile_id: loginuser_profileId,
      search_profile_id: searchId, // Adjust as needed based on your API requirements
      search_profession: profession,
      search_age: age,
      search_location: location,
      page_number: pageNo,
      per_page: 20,
      order_by: sortOrder
    });

    // if (response.data.Status !== 1) {
    //   throw new Error(`Failed to fetch profiles: ${response.data.message || 'Unknown error'}`);
    // }
    //console.log(response.data);
    if (response.data.Status === 1) {
      return response.data; // Adjust based on actual response structure
    } else {
      return response.data; // Adjust based on actual response structure

    }
  } catch (error: any) {
    console.error(
      "Error fetching profiles:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};


// Footer pages Content API
export const fetchFooterContent = async (pageId?: string) => {
  try {
    const response = await apiClient.post("/auth/Get_page_details/", {
      page_id: pageId,
    });
    ////console.log("fetchFooterContent response", response.data);

    // Assuming the API returns an object with a `status` field and a `data` field
    if (!response.data || response.status !== 200) {
      throw new Error("Failed to fetch FooterContent response");
    }

    return response.data; // Adjust based on the actual response structure
  }
  catch (error) {
    console.error("Error fetching fetchFooterContent response:", error || error);
    throw new Error("Unable to fetch FooterContent response. Please try again later.");
  }
}




// // Footer pages Content API
// export const supportcontent = async () => {
//   try {
//     const response = await apiClient.get("/auth/Get_footer/");
//     //console.log("fetchFooterContent response", response.data);

//     // Assuming the API returns an object with a `status` field and a `data` field
//     if (!response.data || response.status !== 200) {
//       throw new Error("Failed to fetch FooterContent response");
//     }

//     return response.data; // Adjust based on the actual response structure
//   }
//   catch (error) {
//     console.error("Error fetching fetchFooterContent response:", error);
//     throw new Error("Unable to fetch FooterContent response. Please try again later.");
//   }
// };

export const getGallerylists = async (pageNumber: number) => {
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

  try {
    const response = await apiClient.post(
      "/auth/Get_Gallery_lists/",
      {
        profile_id: loginuser_profileId,
        page_number: pageNumber,

      }
    );
    return response;
  } catch (error) {
    ////console.log("gallery commonapi call error",error);
  }
};


export const justRegistered = async () => {
  try {
    const response = await apiClient.post(
      "/auth/Just_registered/"
    );

    return response;
  } catch (error) {
    //console.log(error);
  }
};
export const GetProfession = async () => {
  try {
    const response = await apiClient.post(
      "/auth/Get_Profes_Pref/"
    );
    return response;
  } catch (error) {
    // console.log(error);
  }
};

export const GetState = async () => {
  try {
    const response = await apiClient.post(
      "/auth/Get_State_Pref/",
      {}
    );

    return response;
  } catch (error) {
    //console.log(error);
  }
};


export const GetCity = async () => {
  try {
    const response = await apiClient.post(
      "/auth/Get_district_pref/",
      {

      }
    );

    return response.data;
  } catch (error) {
    //console.log(error);
  }
};

export const searchBeforeLoging = async () => {
  try {
    const response = await apiClient.post(
      "/auth/Searchbeforelogin/"
    );
    return response;
  } catch (error) {
    //console.log(error);
  }
};

export const createOrder = async (amount: number, profileID: string, planID: number, AddonPackageID: string) => {
  try {

    // Sending the POST request with the required params
    const response = await apiClient.post('/auth/create-orderid/', {
      amount: amount,
      profile_id: profileID,
      plan_id: planID,
      addon_package_id: AddonPackageID
    });

    // Log the response data
    ////console.log("Create Order response:", response.data);

    // Check if the response is successful (status code 200 or 201)
    if (!response.data || (response.status !== 200)) {
      throw new Error("Failed to create order. Unexpected response.");
    }

    // If successful, return the order details (response.data)
    return response.data;
    //   } catch (error: any) {
    //     console.error("Error creating order:", error.message || error);

    //     // Provide a user-friendly message only for actual errors
    //     const errorMessage = error.message || "Unable to create order. Please try again later.";
    //     throw new Error(errorMessage);
    //   }
    // };
  } catch (error: any) {
    console.error("Error creating order:", error.response?.data?.error || error.message || error);

    // Pass the backend error message to the caller
    const backendError = error.response?.data?.error;
    if (backendError) {
      throw new Error(backendError);
    } else {
      throw new Error("Unable to create order. Please try again later.");
    }
  }
};

export const verifyPayment = async (
  profileID: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,

) => {
  try {
    // Sending the POST request with the required params
    const response = await apiClient.post('/auth/razorpay-webhook/', {
      profile_id: profileID,
      order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
      signature: razorpaySignature,

    });

    // Log the response data
    ////console.log("Verify Payment response:", response.data);

    // Check if the response is successful (status code 200 or 201)
    if (!response.data || (response.status !== 200 && response.status !== 201)) {
      throw new Error("Failed to verify payment. Unexpected response.");
    }

    // If successful, return the verification result (response.data)
    return response.data;
  } catch (error: any) {
    console.error("Error verifying payment:", error.message || error);

    // Provide a user-friendly message only for actual errors
    const errorMessage = error.response?.data?.message || "Unable to verify payment. Please try again later.";
    throw new Error(errorMessage);
  }
};

export const cancelPayment = async (profileID: string, orderId: string, Status: number) => {
  try {
    // Sending the POST request with the required params
    const response = await apiClient.post('/auth/update-payment-status/', {
      profile_id: profileID,
      order_id: orderId,
      status: Status,
    });

    ////console.log("Cancel Payment response:", response.data);

    if (!response.data || (response.status !== 200)) {
      throw new Error("Failed to cancel payment. Unexpected response.");
    }

    // If successful, return the result
    return response.data;
  } catch (error: any) {
    console.error("Error canceling payment:", error.message || error);

    const errorMessage = error.response?.data?.message || "Unable to cancel payment. Please try again later.";
    throw new Error(errorMessage);
  }
};


// export const savePlanPackage = async (
//   profile_id: string,
//   plan_id: string,
//   addon_package_ids: string,
//   total_amount: number
// ) => {
//   try {
//     const response = await apiClient.post(
//       "/auth/Save_plan_package/",
//       {
//         profile_id: profile_id,
//         plan_id: plan_id,
//         addon_package_id: addon_package_ids,
//         total_amount: total_amount,
//       }

//     );
// ////console.log("response",response)
//     return response.data;
//   } catch (error) {
//     console.error("Error saving the package:", error);
//     throw new Error("Error saving the package");
//   }
// };
export const savePlanPackage = async (
  profile_id: string,
  plan_id: string,
  addon_package_ids: string,
  total_amount: number,
  gpay_online?: number // Make it optional
) => {
  try {
    const requestBody: any = {
      profile_id: profile_id,
      plan_id: plan_id,
      addon_package_id: addon_package_ids,
      total_amount: total_amount
    };

    // Only add gpay_online to request if it's provided
    if (gpay_online !== undefined) {
      requestBody.gpay_online = gpay_online;
    }

    const response = await apiClient.post(
      "/auth/Save_plan_package/",
      requestBody
    );

    return response.data;
  } catch (error) {
    console.error("Error saving the package:", error);
    throw new Error("Error saving the package");
  }
};
