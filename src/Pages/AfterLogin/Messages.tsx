import { ProfileContacts } from '../../Components/Messages/ProfileContacts';
import { ProfileChatArea } from '../../Components/Messages/ProfileChatArea';
import { useContext, useEffect, useState } from 'react';
import { ProfileContext } from '../../ProfileContext';
import config from '../../Config';




// interface selectedProfile {
//   room_name_id: string | null;
//   profile_image: string;
//   profile_user_name: string;
//   profile_lastvist: string;
// }

export const Messages = () => {
  const context = useContext(ProfileContext);
  //const [selectedProfile, setSelectedProfileprofile] = useState<selectedProfile | null>(null);

  if (!context) {
    throw new Error('MyComponent must be used within a ProfileProvider');
  }

  const {
    setFromAge,
    setToAge,
    setFromHeight,
    setToHeight,
    setWorkLocation,
    setAdvanceSelectedProfessions,
    Set_Maritial_Status,
    setAdvanceSelectedEducation,
    setSelectedIncomes,
    setChevvai_dhosam,
    setRehuDhosam,
    setAdvanceSelectedBirthStar,
    setNativeState,
    setPeopleOnlyWithPhoto,
    setAdvanceSearchData,
  } = context;

  useEffect(() => {
    setFromAge(0);
    setToAge(0);
    setFromHeight(0);
    setToHeight(0);
    setWorkLocation('');
    setAdvanceSelectedProfessions([]);
    Set_Maritial_Status([]);
    setAdvanceSelectedEducation('');
    setSelectedIncomes('');
    setChevvai_dhosam('no');
    setRehuDhosam('no');
    setAdvanceSelectedBirthStar('');
    setNativeState([]);
    setPeopleOnlyWithPhoto(0);
    setAdvanceSearchData([]);
  }, []);








  const [selectedProfile, setSelectedProfile] = useState<{
    room_name_id: string | null;
    profile_image: string;
    profile_user_name: string;
    profile_lastvist: string;
  } | null>(null);




  // Fetch or load default profile from localStorage, API or context
  useEffect(() => {
    const savedProfile = sessionStorage.getItem('selectedProfile');

    //console.log("savedProfile",savedProfile)
    
    if (savedProfile) {
      setSelectedProfile(JSON.parse(savedProfile));
    } else {
      // Optionally set a default profile if nothing is stored
      setSelectedProfile({
        room_name_id: 'VY240001VY240023',

         profile_image: `${config.apiUrl}/media/profile_VY240023/images.jpeg`,
        //profile_image: 'http://103.214.132.20:8000/media/profile_VY240023/images.jpeg',
        profile_user_name: 'User23',
        profile_lastvist: '(October 22, 2024)',
      });
    }
  }, []);

  return (
    <div>
      <div className="bg-grayBg">
        <div className="container mx-auto py-10">
          <h4 className="text-[24px] text-vysyamalaBlackSecondary font-bold mb-5 max-md:text-[18px]">Messages</h4>
          <div className="bg-white rounded-2xl shadow-profileCardShadow">
            <div className="w-full flex items-start justify-start max-md:flex-col">
          

              <ProfileContacts setSelectedProfile={setSelectedProfile} />
              {/* Automatically open the chat area based on selectedProfile */}
              {selectedProfile ? (
                <ProfileChatArea selectedProfile={selectedProfile} />
              ) : (
                <div className="w-full flex items-center justify-center ">
                  <h4 className="text-lg text-gray-500">Select a chat to start messaging</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};