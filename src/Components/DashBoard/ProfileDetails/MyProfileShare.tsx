import React from 'react';
import { WhatsappShareButton } from 'react-share';
import { MdImage, MdImageNotSupported } from 'react-icons/md';

interface ShareProps {
  closePopup: () => void;
  profileId?: string | number | null;
  EncryptedprofileID: string;
  profileName?: string;
  age?: number | string;
  starName?: string;
  profileImage?: string | null; // Public image URL
  profileImagess?: string; // Public image URL
  annualIncome?: string;
  education?: string;
  profession?: string;
  companyName?: string;
  placeOfStay?: string;
  businessName?: string;
}

export const MyProfileShare: React.FC<ShareProps> = ({
  closePopup,
  //profileImagess,
  profileId,
  EncryptedprofileID,
  profileName,
  age,
  starName,
  annualIncome,
  education,
  profession,
  companyName,
  placeOfStay,
  businessName,
}) => {
  // Encode the data to be shared
  // const encodedData = btoa(
  //   JSON.stringify({
  //     profileId,
  //     profileName,
  //     age,
  //     starName,
  //     profileImagess,
  //   })
  // );

  // Dynamic URL to the profile share page
  // const shareUrl = `http://matrimonyapp.rainyseasun.com/ProfileImage?data=${encodedData}`;

  const shareUrl = `https://app.vysyamala.com/auth/profile/${EncryptedprofileID}/`;
  const shareUrlWithoutImage = `https://app.vysyamala.com/auth/profile_view/${EncryptedprofileID}/`
  const title = 'Check out this profile!';
  const registrationLink = 'vysyamala.com'

  // const shareUrl = `http://103.214.132.20:8000/auth/profile/${profileId}/`;
  // const shareUrlWithoutImage=`http://103.214.132.20:8000/auth/profile_view/${profileId}/`
  //  const title = 'Check out this profile!';
  // const registrationLink = 'http://103.214.132.20:8000/'



  const prepareShareText = () => {
    let professionLine = '💼 *Profession:* Not available\n';

    if (profession) {
      if (profession.toLowerCase() === 'employed' && companyName) {
        professionLine = `💼 *Profession:* Employed at ${companyName}\n`;
      } else if (profession.toLowerCase() === 'business' && businessName) {
        professionLine = `💼 *Profession:* Business at ${businessName}\n`;
      } else if (profession.toLowerCase() === 'employed/business' && businessName) {
        professionLine = `💼 *Profession:* ${profession}-Employed at ${companyName}, Business at ${businessName}\n`;
      } else if (profession.toLowerCase() === 'goverment/ psu' && companyName) {
        professionLine = `💼 *Profession:* Government/ PSU at ${companyName}\n`;
      } else {
        professionLine = `💼 *Profession:* ${profession}\n`;
      }
    }
    return (
      `${title}\n\n` +
      `🆔 *Profile ID:* ${profileId || 'Not available'}\n` +
      `👤 *Profile Name:* ${profileName || 'Not available'}\n` +
      `🎂 *Age:* ${age || 'Not available'} years\n` +
      `✨ *Star Name:* ${starName || 'Not available'}\n` +
      `💰 *Annual Income:* ${annualIncome || 'Not available'}\n` +
      `🎓 *Education:* ${education || 'Not available'}\n` +
      // `💼 *Profession:* ${profession || 'Not available'}${companyName || businessName ? ` at ${companyName || businessName}` : ''}\n` +4
      professionLine +
      `📍 *Place of Stay:* ${placeOfStay || 'Not available'}\n\n` +
      `🌟 *For More Details:* ${shareUrl}\n` +
      `------------------------------------------- \n` +
      // `click here to visit your matrimony profile on Vysyamala -\n` +
      `Click here to register your profile on Vysyamala :\n`
      // +
      // `${registrationLink}\n\n`


    );
  };

  // Prepare WhatsApp share text without the image
  const prepareDetailsOnlyText = () => {
    let professionLine = '💼 *Profession:* Not available\n';

    if (profession) {
      if (profession.toLowerCase() === 'employed' && companyName) {
        professionLine = `💼 *Profession:* Employed at ${companyName}\n`;
      } else if (profession.toLowerCase() === 'business' && businessName) {
        professionLine = `💼 *Profession:* Business at ${businessName}\n`;
      } else if (profession.toLowerCase() === 'employed/business' && businessName) {
        professionLine = `💼 *Profession:* ${profession}-Employed at ${companyName}, Business at ${businessName}\n`;
      } else if (profession.toLowerCase() === 'goverment/ psu' && companyName) {
        professionLine = `💼 *Profession:* Government/ PSU at ${companyName}\n`;
      } else {
        professionLine = `💼 *Profession:* ${profession}\n`;
      }
    }
    return (
      `${title}\n\n` +
      // `🌟 *Profile  Link:* ${shareUrlWithoutImage}\n` +
      `🆔 *Profile ID:* ${profileId || 'Not available'}\n` +
      `👤 *Profile Name:* ${profileName || 'Not available'}\n` +
      `🎂 *Age:* ${age || 'Not available'} years\n` +
      `✨ *Star Name:* ${starName || 'Not available'}\n` +
      `💰 *Annual Income:* ${annualIncome || 'Not available'}\n` +
      `🎓 *Education:* ${education || 'Not available'}\n` +
      // `💼 *Profession:* ${profession || 'Not available'}${companyName || businessName ? ` at ${companyName || businessName}` : ''}\n` +
      professionLine +
      `📍 *Place of Stay:* ${placeOfStay || 'Not available'}\n\n` +
      `🌟 *For More Details:* ${shareUrlWithoutImage}\n` +
      `------------------------------------------- \n` +
      // `click here to visit your matrimony profile on Vysyamala -\n` +
      `Click here to register your profile on Vysyamala :\n`
      // +
      // `${registrationLink}\n\n`
    );
  };

  return (
    <>
      {/* <Helmet>
        <title>Profile of {profileName || 'User'}</title>
        <meta property="og:title" content={`Profile of ${profileName || 'User'}`} />
        <meta
          property="og:description"
          content={`Profile ID: ${profileId || 'N/A'}, Age: ${age || 'N/A'}, Star: ${starName || 'N/A'}`}
        />
        <meta
          property="og:image"
          content={profileImagess || 'https://matrimonyapi.rainyseasun.com/media/default_groom.png'} // Use placeholder if no image
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content={shareUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Profile of ${profileName || 'User'}`} />
        <meta
          name="twitter:description"
          content={`Profile ID: ${profileId || 'N/A'}, Age: ${age || 'N/A'}, Star: ${starName || 'N/A'}`}
        />
        <meta name="twitter:image" content={profileImagess || 'https://matrimonyapi.rainyseasun.com/media/default_groom.png'} />
      </Helmet> 
       */}


      <div className="absolute top-5 right-0 mt-2 w-[220px] p-4 z-10 bg-white rounded-md shadow-lg max-sm:left-auto max-sm:right-[-200px]">


        {/* <div className="flex justify-end">
            <IoClose
              onClick={closePopup}
              className="absolute top-3 right-3 text-[22px] text-black cursor-pointer"
              aria-label="Close popup"
            />
          </div> */}
        <div className="flex flex-col items-center ">
          {/* {profileImagess && (
              <img
                src={profileImagess}
                alt="Profile"
                className="w-full h-auto mb-4 rounded-md"
              />
            )} */}
        </div>
        <div className="flex flex-col items-center gap-4">
          <WhatsappShareButton
            url={registrationLink} // Dynamic URL with proper OG tags
            title={prepareShareText()}
            className="flex gap-2 items-center justify-start bg-green-500 text-white px-5 py rounded-lg w-full "
            aria-label="Share on WhatsApp"
            onClick={closePopup}
          >
            {/* <WhatsappIcon size={48} round /> */}
            <MdImage className="text-2xl " />
            Share with Image
          </WhatsappShareButton>

          <WhatsappShareButton
            url={registrationLink}
            title={prepareDetailsOnlyText()}
            className="flex gap-2 items-center justify-start bg-green-500 text-white px-5 py rounded-lg w-full "
            aria-label="Share on WhatsApp"
            onClick={closePopup}
          >
            {/* <WhatsappIcon size={48} round /> */}

            <MdImageNotSupported className='text-2xl' />
            Share without Image
          </WhatsappShareButton>
        </div>

      </div>
    </>
  );
};

