import React from 'react';
// import { MdModeEdit } from "react-icons/md";
import RasiGridview from '../../HoroDetails/RasiGridview';
import AmsamGridview from '../../HoroDetails/AmsamGridview';
//import axios from 'axios';
import { useLocation } from "react-router-dom";
// import apiClient from '../../../API';
import { useProfileData } from './ViewApicall/ProfileDataProvider';

// import { useParams } from 'react-router-dom';

// interface HoroscopeDetails {
//     rasi: string;
//     star_name: string;
//     lagnam: string;
//     nallikai: string;
//     didi: string;
//     chevvai_dosham: string;
//     surya_gothram: string;
//     dasa_name: string;
//     dasa_balance: string;
//     chevai_dosham: string;
//     sarpadosham: string;
//     // rasiTemp:string;
//     rasi_kattam: string;
//     amsa_kattam: string;
//     madulamn: string;
// }

export const HoroscopeView: React.FC = () => {
    // const [horoscope_details, setHoroscopeDetails] = useState<HoroscopeDetails | null>(null);
    // const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const queryParams1 = new URLSearchParams(location.search);
    const rasi = queryParams1.get("rasi");
    const { horoscope_details } = useProfileData();
    // const { user_profile_id } = useParams<{ user_profile_id: string }>();
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get('id');
    // const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

    // let page_id = "2"; // Default
    // if (location.pathname === "/LoginHome" || location.pathname === "/Search") {
    //     page_id = "1";
    // }

    // useEffect(() => {
    //     const fetchHoroscopeDetails = async () => {
    //         //console.log("logggeddduser", loginuser_profileId);
    //         //console.log("viewid", id);
    //         try {
    //             const response = await apiClient.post("/auth/Get_profile_det_match/", {
    //                 profile_id: loginuser_profileId,
    //                 user_profile_id: id,
    //                 page_id: page_id
    //             });

    //             //console.log("API Response:", response.data);

    //             // Adjust the response processing based on the actual API response format
    //             setHoroscopeDetails(response.data.horoscope_details);
    //         } catch (error) {
    //             if (axios.isAxiosError(error)) {
    //                 console.error("Axios error:", error.response?.data || error.message);
    //                 setError(`Axios error: ${error.response?.data || error.message}`);
    //             } else {
    //                 console.error("Unexpected error:", error);
    //                 setError("Unexpected error occurred");
    //             }
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchHoroscopeDetails();
    // }, [id]);


    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2 className="flex items-center text-[30px] text-vysyamalaBlack font-bold mb-5 max-xl:text-[26px] max-md:text-[24px] max-sm:text-[18px] max-sm:justify-between max-sm:mb-2 ">Horoscope Details</h2>

            <div className="grid grid-rows-1 grid-cols-2 max-sm:grid-cols-1">
                <div>
                    {/* <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Tamil Year :
                        <span className="font-normal"> Srimukha</span></h5>

                    <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Tamil Month :
                        <span className="font-normal"> Karthikai</span></h5>

                    <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Tamil Day :
                        <span className="font-normal"> 18, Friday</span></h5>

                    <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Telugu Year :
                        <span className="font-normal"> -</span></h5>

                    <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Telugu Month :
                        <span className="font-normal"> -</span></h5>

                    <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Telugu Day :
                        <span className="font-normal"> 22 years</span></h5> */}
                    {horoscope_details?.rasi && horoscope_details.rasi !== "" && horoscope_details.rasi !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Rasi:
                            <span className="font-normal"> {horoscope_details?.rasi}</span></h5>)}

                    {horoscope_details?.star_name && horoscope_details.star_name !== "" && horoscope_details.star_name !== null && (() => {
                        const padham = horoscope_details?.padham;

                        return (
                            <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">
                                Star Name:
                                <span className="font-normal">
                                    {" "}
                                    {horoscope_details.star_name}
                                    {padham && padham !== "" && padham !== null && padham !== "0" && padham !== 0 && ` - ${padham}`}
                                </span>
                            </h5>
                        );
                    })()}

                    {horoscope_details?.lagnam && horoscope_details.lagnam !== "" && horoscope_details.lagnam !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Lagnam:
                            <span className="font-normal"> {horoscope_details?.lagnam}</span></h5>)}

                    {horoscope_details?.nallikai && horoscope_details.nallikai !== "" && horoscope_details.nallikai !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Nallikai:
                            <span className="font-normal"> {horoscope_details?.nallikai}</span></h5>)}


                    {horoscope_details?.didi && horoscope_details.didi !== "" && horoscope_details.didi !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Didi:
                            <span className="font-normal"> {horoscope_details?.didi}</span></h5>)}

                    {/* {horoscope_details?.chevvai_dosham && horoscope_details.chevvai_dosham !== "" && horoscope_details.chevvai_dosham !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Chevvai Dhosham:
                            <span className="font-normal"> {horoscope_details?.chevvai_dosham}</span></h5>)} */}

                    {horoscope_details?.chevvai_dosham && horoscope_details.chevvai_dosham !== "" && horoscope_details.chevvai_dosham !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Chevvai Dosham:
                            <span className="font-normal"> {horoscope_details?.chevvai_dosham}</span></h5>)}
                </div>

                <div>
                    {horoscope_details?.sarpadosham && horoscope_details.sarpadosham !== "" && horoscope_details.sarpadosham !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Ragu/Kethu Dhosham:
                            <span className="font-normal"> {horoscope_details?.sarpadosham}</span></h5>)}

                    {horoscope_details?.surya_gothram && horoscope_details.surya_gothram !== "" && horoscope_details.surya_gothram !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Surya Gothram:
                            <span className="font-normal"> {horoscope_details?.surya_gothram}</span></h5>)}

                    {horoscope_details?.madulamn && horoscope_details.madulamn !== "" && horoscope_details.madulamn !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Madhulam :
                            <span className="font-normal"> {horoscope_details?.madulamn}</span></h5>)}

                    {horoscope_details?.dasa_name && horoscope_details.dasa_name !== "" && horoscope_details.dasa_name !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Dasa Name:
                            <span className="font-normal"> {horoscope_details?.dasa_name}</span></h5>)}

                    {horoscope_details?.dasa_balance && horoscope_details.dasa_balance !== "" && horoscope_details.dasa_balance !== null && (
                        <h5 className="text-[20px] text-ash font-semibold mb-4 max-lg:text-[16px]">Dasa Balance:
                            <span className="font-normal"> {horoscope_details?.dasa_balance}</span></h5>)}

                </div>
            </div>

            <div className="space-y-10 my-10">
                {horoscope_details?.rasi_kattam && horoscope_details.rasi_kattam.trim() !== "" && (
                    <div>
                        <RasiGridview centerLabel={"Rasi"} rasiTemp={rasi} data={horoscope_details?.rasi_kattam} />
                    </div>
                )}
                {horoscope_details?.amsa_kattam && horoscope_details.amsa_kattam.trim() !== "" && (
                    <div>
                        <AmsamGridview centerLabel={"Amsam"} rasiTemp={rasi} data={horoscope_details?.amsa_kattam} />
                    </div>
                )}
            </div>
        </div>
    );
};
