import { useEffect, useState } from 'react';
import axios, { initAxios } from '../../axiosConfig';
import echo from '../../echo'; // Import your configured Echo instance

export default function UserChatList({ auth }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const channel = echo.channel("msg-channel.1"); // Use the public channel for the selected user
            channel.listen('.message.sent', (event) => {
                console.log(event.message); // Log the incoming message
                setMessages(prevMessages => [
                    ...prevMessages,
                    { text: event.message.text, sender: event.message.sender }, // Adjust according to your event structure
                ]);
            });
    // Fetch users when the component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await initAxios();
                const response = await axios.post('/users');
                // Filter out the logged-in user
                setUsers(response.data.filter(user => user.id !== auth.user.id));
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [auth.user.id]);

    // Listen for incoming messages on the selected user's channel
    useEffect(() => {
        if (selectedUser) {
            console.log(`Listening to messages for user: ${selectedUser.name}`);
            const channel = echo.channel(`msg-channel.${selectedUser.id}`); // Use the public channel for the selected user
            channel.listen('.message.sent', (event) => {
                console.log(event.message); // Log the incoming message
                setMessages(prevMessages => [
                    ...prevMessages,
                    { text: event.message.text, sender: event.message.sender }, // Adjust according to your event structure
                ]);
            });

            // Cleanup listener on unmount or user change
            return () => {
                channel.stopListening('.message.sent');
            };
        }else{
            console.log("sadsa");
        }
    }, [selectedUser]);

    // Open the chat box for the selected user
    const openChatBox = (user) => {
        setSelectedUser(user);
        setIsChatBoxOpen(true);
        setMessages([]); // Clear messages when opening chat
        // Optionally, fetch existing messages for the selected user
        // fetchMessages(user.id); // Uncomment if you implement fetchMessages
    };

    // Close the chat box and clear the state
    const closeChatBox = () => {
        setIsChatBoxOpen(false);
        setSelectedUser(null);
        setMessages([]); // Clear messages when chat is closed
    };

    // Handle sending a message
    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageData = {
                text: newMessage,
                sender: 'me',
                senderId: auth.user.id, // Assuming auth.user.id contains the logged-in user's ID
            };

            setMessages(prevMessages => [...prevMessages, messageData]); // Update local state
            setNewMessage(''); // Clear input field after sending

            // Send the message to the server via an API call
            axios.post('/api/messages', {
                text: newMessage,
                senderId: auth.user.id,
                recipientId: selectedUser.id,
            })
            .then(response => {
                console.log('Message sent:', response.data);
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="font-semibold text-lg">Users</h3>
                <ul className="mt-4 space-y-4">
                    {users.map(user => (
                        <li key={user.id} className="flex items-center">
                            <img 
                                src={user.profile_image || '/images/default_profile.png'}
                                alt={`${user.name}'s profile`}
                                className="w-10 h-10 rounded-full mr-4"
                            />
                            <span 
                                onClick={() => openChatBox(user)} 
                                className="text-gray-900 cursor-pointer hover:text-blue-500"
                            >
                                {user.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chatbox Popup */}
            {isChatBoxOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white rounded-lg p-4 w-96">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg">{selectedUser.name}</h4>
                            <button onClick={closeChatBox} className="text-gray-500 hover:text-gray-900">&times;</button>
                        </div>
                        <div className="mt-4">
                            <div className="h-64 overflow-auto border border-gray-300 p-2">
                                {/* Display messages here */}
                                {messages.map((msg, index) => (
                                    <div key={index} className={`my-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                                        <span className={`inline-block p-2 rounded ${msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                            {msg.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)} 
                                    className="border border-gray-300 rounded p-2 flex-grow mr-2"
                                />
                                <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded p-2">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
}
