import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import axios, { initAxios } from '../../axiosConfig';
import yourLogo from '../../../../public/images/Open.png';
import echo from '../../echo';

export default function Chat({ auth }) {
    const [users, setUsers] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null); // Ref for scrolling to the bottom

    useEffect(() => {
        const channel = echo.channel(`msg-channel.${auth.user.id}`);
        channel.listen('.message.sent', (event) => {
            const receivedMessage = {
                sender_id: event.sender_id,
                receiver_id: event.receiver_id,
                sender_name: event.sender_name,
                content: event.message,
            };

            if (activeChatUser && activeChatUser.id === receivedMessage.sender_id) {
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            } else {
                setActiveChatUser({ id: receivedMessage.sender_id, name: receivedMessage.sender_name });
                loadMessagesForUser(receivedMessage.sender_id);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            }
        });

        return () => {
            channel.stopListening('.message.sent');
        };
    }, [auth.user.id, activeChatUser]);

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

    const openChatBox = async (user) => {
        setActiveChatUser(user);
        await loadMessagesForUser(user.id);
    };

    const loadMessagesForUser = async (recipientId) => {
        try {
            const response = await axios.post('/messages', { user_id: auth.user.id, recipient_id: recipientId });
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

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

    // Function to scroll to the bottom when new messages arrive
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom(); // Scroll to bottom whenever messages change
    }, [messages]);

    return (
        <>
            <Head title="Chat" />
    
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-300">
                        <div className="p-4">
                            <h3 className="font-semibold text-xl text-blue-600 border-b border-gray-300 pb-3 mb-4">My Chats</h3>
                            <ul className="space-y-2">
                                {users.map(user => (
                                    <li key={user.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition cursor-pointer" onClick={() => openChatBox(user)}>
                                        <img 
                                            src={user.profile_image || yourLogo}
                                            alt={`${user.name}'s profile`}
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <div className="flex-grow">
                                            <span className="text-gray-900 font-medium">{user.name}</span>
                                            <div className="text-gray-500 text-sm">Last seen: 2 mins ago</div>
                                        </div>
                                        <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition">
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
                <div className="fixed inset-0 sm:bottom-0 sm:right-0 sm:inset-auto sm:m-6 bg-white shadow-lg rounded-none sm:rounded-lg border w-full sm:w-[350px] h-full sm:h-[75vh] flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center bg-blue-50">
                        <h4 className="font-semibold text-lg text-gray-800">{activeChatUser.name}</h4>
                        <button className="text-gray-500 hover:text-gray-700 text-lg" onClick={() => setActiveChatUser(null)}>
                            &times;
                        </button>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
                        {messages.length ? (
                            messages.map((msg, index) => (
                                <div key={index} className={`mb-2 ${msg.sender_id === auth.user.id ? 'text-right' : 'text-left'}`}>
                                    <span className={`inline-block p-2 rounded-md ${msg.sender_id === auth.user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <strong>{msg.sender_name === auth.user.name ? 'You' : msg.sender_name}:</strong> {msg.content}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">No messages yet. Start chatting with {activeChatUser.name}...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t flex items-center bg-gray-100">
                        <input 
                            type="text"
                            className="border rounded-md flex-grow p-2 mr-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition"
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
