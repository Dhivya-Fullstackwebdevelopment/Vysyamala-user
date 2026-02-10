// import { useContext } from "react";
// import { ProfileContext } from "../../ProfileContext";


// const ImagePage: React.FC = () => {
  

//  const context =useContext(ProfileContext)
//  if (!context) {
//     throw new Error("MyComponent must be used within a ProfileProvider");
//   }

//  const { images,
//           get_myprofile_personal,
//           }=context
//   return (
//     <div>
//       <h1>Image Details</h1>
//       <img src={images[5]?.imageUrl} alt={get_myprofile_personal?.personal_profile_name} />
//       <p>{get_myprofile_personal?.profile_id}</p>
//       <p>{get_myprofile_personal?.personal_profile_name}</p>
//       <p>{get_myprofile_personal?.personal_age}</p>
//       <p>{get_myprofile_personal?.star}</p>
//     </div>
//   );
// };

// export default ImagePage;


// import { useContext } from "react";
// import { ProfileContext } from "../../ProfileContext";
// import { HeroSection } from "../../Components/HomePage/HeroSection";

// const ImagePage: React.FC = () => {
//   const context = useContext(ProfileContext);

//   if (!context) {
//     throw new Error("MyComponent must be used within a ProfileProvider");
//   }

//   const { images, get_myprofile_personal } = context;
// console.log('sssssssssss',get_myprofile_personal)
//   return (<>
//   <HeroSection onNext={function (mobile: string): void {
//           throw new Error("Function not implemented.");
//       } }/>
//     <div className="flex flex-col items-center p-40 min-w-96  bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-semibold text-gray-800 mb-1">Image Details</h1>
//       <div className="bg-orange-200 rounded-lg shadow-lg overflow-hidden w-full sm:w-96 p-6">
//         <div className="flex justify-center mb-4">
//           <img
//             src={images[5]?.imageUrl}
//             alt={get_myprofile_personal?.personal_profile_name}
//             className="w-96 h-96 object-cover rounded-full border-4 border-gray-300"
//           />
//         </div>
//         <div className="text-center">
//           <p className="text-xl font-bold text-gray-700">{get_myprofile_personal?.personal_profile_name}</p>
//           <p className="text-gray-600 mt-2">Profile ID: {get_myprofile_personal?.profile_id}</p>
//           <p className="text-gray-600 mt-2">Age: {get_myprofile_personal?.personal_age}</p>
//           <p className="text-gray-600 mt-2">Star: {get_myprofile_personal?.star}</p>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default ImagePage;




// import { HeroSection } from "../../Components/HomePage/HeroSection";
// import { useSearchParams } from "react-router-dom";

// const ImagePage: React.FC = () => {
    

//     // Extract search parameters
//     const [searchParams] = useSearchParams();
//     const profileId = searchParams.get("profileId");
//     const profileName = searchParams.get("profileName");
//    const age=searchParams.get("age")
//    const starName= searchParams.get("starName")
//    const profileImagess= searchParams.get("profileImagess")
//     return (
//         <>
//             <HeroSection
//                 onNext={(mobile: string) => {
//                     //console.log("HeroSection mobile:", mobile);
//                 }}
//             />
//             <div className="flex flex-col items-center p-40 min-w-96 bg-gray-100 min-h-screen">
//                 <h1 className="text-5xl font-semibold text-gray-800 mb-12">{`${profileName} Image with Details`}</h1>
//                 <div className="bg-orange-200 rounded-lg shadow-lg overflow-hidden w-full sm:w-2/3 lg:w-2/3  p-6">
//                     <div className="flex justify-center mb-8">
//                         <img
//                             src={ profileImagess|| "default-image-url.jpg"}
//                             alt={profileName || "Name not available"}
//                             className="w-72 h-72 sm:w-96 sm:h-96 object-cover rounded-full border-4 border-gray-300"
//                         />
//                     </div>
//                     <div className="text-center">
//                         <p className="text-3xl font-bold text-gray-700">
//                             {profileName || "Name not available"}
//                         </p>
//                         <p className="text-gray-600 text-xl mt-2">Profile ID: {profileId  || "N/A"}</p>
//                         <p className="text-gray-600 text-xl mt-2">Age: {age|| "N/A"}</p>
//                         <p className="text-gray-600 text-xl mt-2">Star: {starName||"N/A"}</p>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default ImagePage;

import { Helmet } from "react-helmet";
// import { HeroSection } from "../../Components/HomePage/HeroSection";
import { useSearchParams } from "react-router-dom";
import config from "../../Config";

const ImagePage: React.FC = () => {
    // Extract search parameters
    const [searchParams] = useSearchParams("");
    const encodedData = searchParams.get("data");

    // Decode and parse the profile data
    const profileData = encodedData ? JSON.parse(atob(encodedData)) : null;

    // Handle missing or invalid profile data
    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <h1 className="text-2xl font-medium text-gray-700">
                    No profile data available.
                </h1>
            </div>
        );
    }

    const { profileId, profileName, age, starName, profileImagess } = profileData;

    return (
        <>
        <Helmet>
                <title>Profile of { 'User'}</title>
                <meta property="og:title" content={`Profile of ${ 'User'}`} />
                <meta
                  property="og:description"
                  content={`Profile ID: ${profileId || 'N/A'}, Age: ${ '25'}, Star: ${ 'N/A'}`}
                />
                <meta
                  property="og:image"
                   content={ `${config.apiUrl}/media/default_groom.png`} // Use placeholder if no image
                //content={ 'http://103.214.132.20:8000/media/default_groom.png'} // Use placeholder if no image
                />
                <meta property="og:url" content={`${config.apiUrl}/media/default_groom.png`} />
                {/* <meta property="og:url" content={'http://103.214.132.20:8000/media/default_groom.png'} /> */}
              </Helmet>
            {/* Hero Section */}
            {/* <HeroSection
                onNext={(mobile: string) => {
                    //console.log("HeroSection mobile:", mobile);
                }}
            /> */}
            {/* Profile Details Section */}
            <div className="container">
            <div className="flex flex-col items-start py-20 max-md:py-16 bg-gray-50 ">
                <h1 className="text-4xl sm:text-3xl font-semibold text-gray-800 mb-5 text-center">
                    {profileName ? `${profileName}'s Profile` : "Profile Details"}
                </h1>
                <div className="w-full">
                    <div className="flex justify-start mb-6">
                        <img
                             src={profileImagess || `${config.apiUrl}/media/default_groom.png`}
                           // src={profileImagess || "http://103.214.132.20:8000/media/default_groom.png"}
                            alt={profileName || "Name not available"}
                            className="w-48 h-48 sm:w-[40%] sm:h-[40%] object-cover rounded-3xl border-4 border-orange-400 shadow-redboxshadow hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <div className="text-start space-y-4">
                        <p className="text-3xl font-bold text-gray-800">
                            {profileName || "Name not available"}
                        </p>
                        <p className="text-lg text-gray-600">
                            <span className="font-medium text-gray-700">Profile ID:</span> {profileId || "N/A"}
                        </p>
                        <p className="text-lg text-gray-600">
                            <span className="font-medium text-gray-700">Age:</span> {age || "N/A"}
                        </p>
                        <p className="text-lg text-gray-600">
                            <span className="font-medium text-gray-700">Star:</span> {starName || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
            </div>
            
        </>
    );
};

export default ImagePage;
