// src/pages/FindMatch.tsx

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileContext } from "../../ProfileContext";
import { Get_advance_search } from "../../commonapicall";
import { SearchResults } from "../../Components/LoginSearch/SearchResults"; // Re-use your SearchResults component
import { Hearts } from "react-loader-spinner";
import apiClient from "../../API";

const FindMatch = () => {
    const context = useContext(ProfileContext);
    const navigate = useNavigate();

    // State for this component
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [responseMsg, setResponseMsg] = useState("");

    if (!context) {
        throw new Error("FindMatch must be used within a ProfileProvider");
    }

    // Destructure what you need from context
    const {
        fromAge, ToAge, fromHeight, toHeight, perPage, setTotalCount, totalCount,
        setAdvanceSearchData, advanceSearchData, AdvanceselectedProfessions,
        selectedAdvanceEducation, selectedIncomes, selectedMaxIncomes, chevvai_dhosam,
        rehuDhosam, advanceSelectedBirthStar, nativeState, workLocation,
        peopleOnlyWithPhoto, maritial_Status, fieldofstudy
    } = context;

    // Logic for pagination and URL parameters
    const getInitialPageNumber = () => {
        const searchParams = new URLSearchParams(location.search);
        const pageFromUrl = searchParams.get('page');
        return pageFromUrl ? parseInt(pageFromUrl) : 1;
    };

    const [pageNo, setPageNo] = useState<number>(getInitialPageNumber());

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', pageNo.toString());
        navigate(`?${searchParams.toString()}`, { replace: true });
    }, [pageNo, navigate]);

    // The API call function, moved here from Search.tsx
    const handle_Get_advance_search = async () => {
        setLoading(true);
        setError(false);
        const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

        try {
            const response = await apiClient.post(Get_advance_search, {
                profile_id: loginuser_profileId,
                from_age: fromAge,
                to_age: ToAge,
                from_height: fromHeight,
                to_height: toHeight,
                per_page: perPage,
                page_number: pageNo,
                search_marital_status: maritial_Status.join(","),
                field_ofstudy: fieldofstudy.join(","),
                search_profession: AdvanceselectedProfessions.join(","),
                search_education: selectedAdvanceEducation,
                min_income: selectedIncomes,
                max_income: selectedMaxIncomes,
                chevvai_dhosam: chevvai_dhosam,
                ragukethu_dhosam: rehuDhosam,
                search_star: advanceSelectedBirthStar,
                search_nativestate: nativeState.join(","),
                search_worklocation: workLocation,
                people_withphoto: peopleOnlyWithPhoto,
            });

            if (response.status === 200) {
                setResponseMsg(response.data.message);
                setAdvanceSearchData(response.data.data || []);
                setTotalCount(response.data.total_count || 0);
            } else {
                setAdvanceSearchData([]);
                setTotalCount(0);
            }
        } catch (err) {
            console.error(err);
            setError(true);
            setAdvanceSearchData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the component mounts or when the page number changes
    useEffect(() => {
        handle_Get_advance_search();
    }, [pageNo]);

    const calculatedPerPage = advanceSearchData?.length || 0;
    const totalPages = Math.ceil(totalCount / perPage);

    if (loading) {
        return (
            <div className="grid place-items-center min-h-screen">
                <div className="text-center">
                    <Hearts
                        height="100"
                        width="100"
                        color="#FF6666"
                        ariaLabel="hearts-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                    />
                    <p className="text-sm mt-2">Please wait...</p>
                </div>
            </div>
        );
    }


    // Re-use your SearchResults component for the UI
    return (
        <div className="bg-grayBg">
            <SearchResults
                responseMsg={responseMsg}
                totalCount={totalCount}
                error={error}
                pageNo={pageNo}
                setPageNo={setPageNo}
                totalPages={totalPages}
                calculatedPerPage={calculatedPerPage}
                onSearchAgain={() => navigate('/Search')} // Navigate back to the form
            />
        </div>
    );
};

export default FindMatch;