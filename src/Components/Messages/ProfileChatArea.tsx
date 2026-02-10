/* eslint-disable @typescript-eslint/no-explicit-any */
//import axios from 'axios';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoMdSend } from 'react-icons/io';
import SenderMessageTail from "../../assets/images/SenderMessageTail.png";
import ReceiverMessageTail from "../../assets/images/ReceiverMessageTail.png"
import apiClient from '../../API';
import config from '../../Config';

interface ProfileChatAreaProps {
    selectedProfile: {
        room_name_id: string | null;
        profile_image: string;
        profile_user_name: string;
        profile_lastvist: string;
    } | null;

}

interface Message {
    username: string;
    message: string;
    date: string;
}

export const ProfileChatArea: React.FC<ProfileChatAreaProps> = ({ selectedProfile }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const ws = useRef<WebSocket | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const roomName = selectedProfile?.room_name_id || '';
    const profile_id = localStorage.getItem("loginuser_profile_id") || 'Guest';
    const username = profile_id;

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const fetchChatHistory = useCallback(async () => {
        if (!roomName) return;

        try {
            const response = await fetch(`${config.apiUrl}/auth/GetMessages/`, {
                //  const response = await fetch('http://103.214.132.20:8000/auth/GetMessages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_name: roomName,
                    profile_id: profile_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Make sure to access the "messages" field, and each message has the "value" (message content), "date", and "user".
                const formattedMessages = data.messages.map((msg: any) => ({
                    username: msg.user,         // Assuming "user" holds the sender's username.
                    message: msg.value,         // Assuming "value" holds the actual message.
                    date: msg.date || new Date().toISOString(),
                }));

                setMessages(formattedMessages);
            } else {
                console.error('Error fetching chat history:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoading(false);
        }
    }, [roomName, profile_id]);

    useEffect(() => {
        if (selectedProfile) {
            fetchChatHistory();
            scrollToBottom();
        }
    }, [selectedProfile, fetchChatHistory]);

    useEffect(() => {
        if (!roomName) return;

        const websocketUrl = `ws://vysyamaladevnew-aehaazdxdzegasfb.westcentralus-01.azurewebsites.net/ws/chat/${roomName}/?username=${username}`;
        //const websocketUrl = `ws://103.214.132.20:8000/ws/chat/${roomName}/?username=${username}`;
        ws.current = new WebSocket(websocketUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connection opened.');
        };

        ws.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            const data = JSON.parse(event.data);
            if (data.date == null) {
                data.date = new Date().toISOString();
            }
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, data];
                localStorage.setItem(`messages_${roomName}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            });
            scrollToBottom();
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.current.onclose = (event) => {
            console.error('WebSocket connection closed:', event);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [roomName, username]);

    // const handleSendMessage = () => {
    //     if (ws.current && newMessage.trim() !== '') {
    //         if (ws.current.readyState === WebSocket.OPEN) {
    //             ws.current.send(JSON.stringify({
    //                 username,
    //                 message: newMessage,
    //                 date: new Date().toISOString(),
    //             }));
    //             setNewMessage('');
    //             window.location.reload(); // Reloads the entire window

    //         } else {
    //             console.error('WebSocket is not open. Current state:', ws.current.readyState);
    //         }
    //     } else {
    //         console.error('No WebSocket connection or empty message.');
    //     }
    // };



    //import axios from 'axios';

    const handleSendMessage = async () => {
        if (ws.current && newMessage.trim() !== '') {
            if (ws.current.readyState === WebSocket.OPEN) {
                try {
                    // Send message via WebSocket
                    ws.current.send(JSON.stringify({
                        username,
                        message: newMessage,
                        date: new Date().toISOString(),
                    }));

                    // Clear the message input
                    setNewMessage('');

                    // // Call the first API


                    // Create a FormData object
                    const formData = new FormData();
                    formData.append('profile_id', profile_id);

                    // Make the API call
                    const response = await apiClient.post(
                        '/auth/unread_message_count/',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data', // Ensure correct content type
                            },
                        }
                    );

                    console.log('User Chat List Response:', response.data);

                    // Call the second API
                    const userChatListResponse = await apiClient.post(
                        '/auth/Get_user_chatlist/',
                        { profile_id: profile_id }
                    );

                    console.log('User Chat List:', userChatListResponse.data);

                } catch (error) {
                    console.error('Error during API calls:', error);
                }
            } else {
                console.error('WebSocket is not open. Current state:', ws.current.readyState);
            }
        } else {
            console.error('No WebSocket connection or empty message.');
        }
    };



    if (loading) {
        return (
            <div className="w-full flex items-center justify-center">
                <h4 className="text-lg text-gray-500">Loading chat...</h4>
            </div>
        );
    }

    if (!selectedProfile || !selectedProfile.room_name_id) {
        return (
            <div className="w-full flex items-center justify-center">
                <h4 className="text-lg text-gray-500">Select a chat to start messaging</h4>
            </div>
        );
    }

    // const lastMessage = messages[messages.length - 1];

    // let lastDate = ""; // Track the last displayed date



    return (
        <div className="w-full relative">
            {/* Profile Name & Last seen */}
            <div className="border-footer-text-gray border-b-[1px]">
                <div className="flex items-center px-5 py-4 space-x-3">
                    <div>
                        <img
                            src={selectedProfile.profile_image}
                            alt="Profile"
                            className="w-12 h-12 rounded-md"
                        />
                    </div>
                    <div>
                        <h6 className="text-vysyamalaBlack font-bold">
                            {selectedProfile.profile_user_name}
                        </h6>
                        <p className="text-xs text-ashSecondary font-semibold">
                            Last seen: {selectedProfile.profile_lastvist}
                        </p>
                    </div>
                </div>
            </div>

            {/* Last Chat Message */}


            {/* Chat Area */}

            <div className="h-[35rem] overflow-y-auto px-5 py-3 message-box">
                {messages.length > 0 ? (
                    messages.map((msg, index) => {
                        const currentDate = new Date(msg.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "Asia/Kolkata",
                        });

                        // Show the date only once per day
                        const showDate =
                            index === 0 ||
                            new Date(messages[index - 1].date).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                timeZone: "Asia/Kolkata",
                            }) !== currentDate;

                        return (
                            <div key={index}>
                                {showDate && (
                                    <div className="text-center ">
                                        <p className="text-[10px] text-center my-3 text-gray-500 p-1 bg-gray inline-block rounded-md">
                                            {currentDate}
                                        </p>
                                    </div>
                                )}
                                <div
                                    className={`relative z-[2] flex ${msg.username === username ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`rounded-[15px] px-4 py-2 mb-4 ${msg.username === username
                                            ? "bg-chatBlue text-white"
                                            : "bg-chatGray text-black"
                                            }`}
                                    >
                                        <p className="mb-1">{msg.message}</p>
                                        <div className={`text-[10px]  ${msg.username === username ? "text-end" : "text-start"
                                            }`}>
                                            {new Date(msg.date).toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                // second: "2-digit",
                                                hour12: true,
                                                timeZone: "Asia/Kolkata",
                                            })}
                                        </div>
                                        <div
                                            className={`absolute z-[-1] ${msg.username === username
                                                ? "-right-[4px] bottom-[16px]"
                                                : "-left-[4px] bottom-[16px]"
                                                }`}
                                        >
                                            <img
                                                className="w-full"
                                                src={`${msg.username === username
                                                    ? SenderMessageTail
                                                    : ReceiverMessageTail
                                                    }`}
                                                alt=""
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">No messages yet.</p>
                )}
                <div ref={messagesEndRef} />
            </div>


            {/* Message Input Area */}
            <div className="w-full bottom-0">
                <div className="relative mx-5 my-5">
                    <input
                        type="text"
                        placeholder="Type a message"
                        className="w-full bg-chatGray rounded-lg px-3 py-4 focus-visible:outline-none"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <IoMdSend
                        className="text-[26px] text-primary absolute right-3 top-[15px] cursor-pointer"
                        onClick={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
};