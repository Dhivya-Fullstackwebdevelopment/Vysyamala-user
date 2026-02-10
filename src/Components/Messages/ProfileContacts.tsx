// import React, { useState, useEffect, useCallback } from 'react';
import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { NameCard } from "./NameCard";
import "../../index.css";
import config from "../../Config";

interface Chat {
  room_name_id: string;
  profile_image: string;
  profile_user_name: string;
  last_mesaage: string;
  profile_lastvist: string;
  last_message_seen: boolean; // Add this field
}

interface ProfileContactsProps {
  setSelectedProfile: (profile: {
    room_name_id: string;
    profile_image: string;
    profile_user_name: string;
    profile_lastvist: string;
  }) => void;
}

export const ProfileContacts: React.FC<ProfileContactsProps> = ({
  setSelectedProfile,
}) => {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const loginuser_profileId = localStorage.getItem("loginuser_profile_id");

  useEffect(() => {
    const mapApiDataToChatList = (data: any[]): Chat[] =>
      data.map((chat) => ({
        room_name_id: chat.room_name_id,
        profile_image: chat.profile_image,
        profile_user_name: chat.profile_user_name,
        last_mesaage: chat.last_mesaage,
        profile_lastvist: chat.profile_lastvist,
        //last_message_seen: !chat.last_mesaage_seen, // Inverse for highlighting
        last_message_seen: !chat.last_mesaage_seen === true, // Correctly map this field
      }));

    const fetchData = async () => {
      try {
        let data: any[] = [];
        if (searchTerm === "") {
          const response = await fetch(
             `${config.apiUrl}/auth/Get_user_chatlist/`,
           // "http://103.214.132.20:8000/auth/Get_user_chatlist/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ profile_id: loginuser_profileId  }),
            }
          );
          const result = await response.json();
          if (result.status === 1) {
            data = result.data;
          }
        } else {
          const response = await fetch(
            `${config.apiUrl}/auth/Get_user_chatlist_search/`,
            //"http://103.214.132.20:8000/auth/Get_user_chatlist_search/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                profile_id: loginuser_profileId,
                search_id: searchTerm,
              }),
            }
          );
          const result = await response.json();
          if (result.status === 1) {
            data = result.data;
          }
        }
        // Map API data to the chat list
        const mappedChatList = mapApiDataToChatList(data);

        //  // Sort chatList to show "last_message_seen: false" first
        const sortedChatList = mappedChatList.slice().sort((a, b) => {
          // Check if a and b have the same last_message_seen value
          if (a.last_message_seen === b.last_message_seen) return 0;
          // Show false (falsy) values first
          return a.last_message_seen ? -1 : 1;
        });
        setChatList(sortedChatList); // Update state with the sorted list
        // setChatList(mapApiDataToChatList(data));
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();
  }, [searchTerm, loginuser_profileId]);

  return (
    <div className="w-[420px] flex-shrink-0 border-footer-text-gray border-r-[1px] max-lg:w-[40%] max-md:w-full">
      <div className="relative border-b-[1px] border-footer-text-gray px-5 py-5">
        <HiOutlineSearch className="absolute top-7 left-7 text-[22px] text-ashSecondary" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-gray rounded-md pl-10 py-[8px] focus-visible:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="h-[40rem] overflow-y-auto message-profilecard">
        {chatList.map((chat) => (
          <NameCard
            key={chat.room_name_id}
            profile_image={chat.profile_image}
            profile_user_name={chat.profile_user_name}
            last_mesaage={chat.last_mesaage}
            profile_lastvist={chat.profile_lastvist}
            room_name={chat.room_name_id}
            last_message_seen={chat.last_message_seen} // Pass this prop
            onClick={() =>
              setSelectedProfile({
                room_name_id: chat.room_name_id,
                profile_image: chat.profile_image,
                profile_user_name: chat.profile_user_name,
                profile_lastvist: chat.profile_lastvist,
              })
            }
          />
        ))}
      </div>
    </div>
  );
};
