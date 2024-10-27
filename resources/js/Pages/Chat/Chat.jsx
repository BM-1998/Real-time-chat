import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios, { initAxios } from '../../axiosConfig';
import yourLogo from '../../../../public/images/Open.png';

export default function Chat({ auth }) {
    const [users, setUsers] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null); // State for the active chat user
    const [messages, setMessages] = useState([]); // State for storing messages
    const [newMessage, setNewMessage] = useState(''); // State for the input message

    // Initialize CSRF token and fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await initAxios();
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.post('/users', { user_id: auth.user.id });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Function to handle opening the chat box and fetching messages for that user
    const openChatBox = async (user) => {
        setActiveChatUser(user);
        try {
            const response = await axios.post('/messages', { user_id: auth.user.id, recipient_id: user.id });
            setMessages(response.data.messages); // Set the fetched messages
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Function to handle sending a new message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post('/sendMessage', {
                user_id: auth.user.id,
                recipient_id: activeChatUser.id,
                message: newMessage,
            });
            setMessages((prevMessages) => [...prevMessages, response.data]); 
            setNewMessage(''); 
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <>
            <Head title="Chat" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="font-semibold text-lg border-b-2 pb-2 mb-4">My Chats</h3>
                            <ul className="mt-4 space-y-2">
                                {users.map(user => (
                                    <li key={user.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                                        <img 
                                            src={user.profile_image || yourLogo}
                                            alt={`${user.name}'s profile`}
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div className="flex-grow">
                                            <span className="text-gray-900 font-medium">{user.name}</span>
                                            <div className="text-gray-600 text-sm">Last seen: 2 minutes ago</div>
                                        </div>
                                        <button 
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                            onClick={() => openChatBox(user)}
                                        >
                                            Chat
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Box */}
            {activeChatUser && (
                <div className="fixed bottom-0 right-0 m-4 bg-white shadow-lg rounded-lg border w-80">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h4 className="font-semibold text-lg">{activeChatUser.name}</h4>
                        <button 
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => setActiveChatUser(null)} // Close chat box
                        >
                            &times;
                        </button>
                    </div>
                    <div className="p-4 h-48 overflow-y-auto">
                        {messages.length ? (
                            messages.map((msg, index) => (
                                <div key={index} className="text-gray-700 mb-2">
                                    <strong>{msg.sender_name === auth.user.name ? 'You' : msg.sender_name}: </strong> 
                                    {msg.content}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-600">No messages yet. Start chatting with {activeChatUser.name}...</div>
                        )}
                    </div>
                    <div className="p-2 border-t flex items-center">
                        <input 
                            type="text"
                            className="border w-full p-2 rounded mr-2"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            onClick={handleSendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}