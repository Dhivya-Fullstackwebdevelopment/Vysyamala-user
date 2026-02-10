import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../Config';

interface Message {
    username: string;
    message: string;
    date: string;
}
export const ChatRoom: React.FC = () => {
    const { room_name } = useParams<{ room_name: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const ws = useRef<WebSocket | null>(null);

    // Retrieve the profile ID dynamically from sessionStorage
    const loginuser_profileId = localStorage.getItem("loginuser_profile_id");
    const username = loginuser_profileId || "Guest"; // Default to "Guest" if not found

    // Fetch chat history from the server
    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/auth/getMessages/${room_name}/`, {
                //const response = await fetch(`http://103.214.132.20:8000/auth/getMessages/${room_name}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Chat history data:', data);

            if (data.status === 1 && Array.isArray(data.data)) {
                const formattedMessages = data.data.map((msg:   any) => ({
                    message: msg.value,
                    username: msg.user,
                    date: msg.date,
                }));

                // Update state and localStorage
                setMessages(formattedMessages);
                localStorage.setItem(`messages_${room_name}`, JSON.stringify(formattedMessages));
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    useEffect(() => {
        // Load cached messages from localStorage
        const cachedMessages = localStorage.getItem(`messages_${room_name}`);
        if (cachedMessages) {
            setMessages(JSON.parse(cachedMessages));
        }

        const websocketUrl = `ws://vysyamaladevnew-aehaazdxdzegasfb.westcentralus-01.azurewebsites.net/ws/chat/${room_name}/?username=${username}`;
        //const websocketUrl = `ws://103.214.132.20:8000/ws/chat/${room_name}/?username=${username}`;
        console.log('Connecting to WebSocket:', websocketUrl);
        ws.current = new WebSocket(websocketUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connection opened.');
        };

        ws.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            const data = JSON.parse(event.data);

            let newMessages: Message[] = [];
            if (Array.isArray(data)) {
                newMessages = data;
            } else {
                newMessages = [data];
            }

            // Update state and localStorage
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, ...newMessages];
                localStorage.setItem(`messages_${room_name}`, JSON.stringify(updatedMessages));
                return updatedMessages;
            });
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
    }, [room_name, username]);

    useEffect(() => {
        fetchChatHistory();
    }, [room_name]);

    const sendMessage = () => {
        if (ws.current && newMessage.trim() !== '') {
            if (ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    'message': newMessage,
                    'username': username,  // Send dynamic username
                    'profile_id': loginuser_profileId // Send the profile ID
                }));
                setNewMessage('');
            } else {
                console.error('WebSocket is not open. Current state:', ws.current.readyState);
            }
        } else {
            console.error('No WebSocket connection or empty message.');
        }
    };
    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
            <h2 className="text-xl font-bold mb-4">Chat Room: {room_name}</h2>

            <div className="flex-1 overflow-y-auto p-2 bg-white border border-gray-300 rounded-lg mb-4">
                {messages.length > 0 ? (
                    messages.map((message, index) => {
                        // Correctly parse the date string from the server
                        const parsedDate = new Date(message.date);

                        // Check if the parsed date is valid
                        const isValidDate = !isNaN(parsedDate.getTime());

                        // Format the date to Indian Standard Time (IST)
                        const formattedDate = isValidDate
                            ? parsedDate.toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                                timeZone: 'Asia/Kolkata', // Convert to IST
                            })
                            : 'Invalid Date';
                        return (
                            <div
                                key={index}
                                className={`flex mb-2 p-2 rounded-lg ${message.username === username
                                    ? 'bg-white self-start text-left' // Received messages on the left
                                    :  'bg-white self-end text-right flex-row-reverse' // Sent messages on the right
                                        
                                    }`}
                            >
                                <div>
                                    <b className="font-semibold">{message.username}</b>
                                    <p>{message.message}</p>
                                    <span className="text-gray-500 text-sm">{formattedDate}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-600">Loading messages...</p>
                )}
            </div>
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                />
                <button
                    onClick={sendMessage}
                    className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
};
