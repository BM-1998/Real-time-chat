import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios, { initAxios } from '../../axiosConfig';
import yourLogo from '../../../../public/images/Open.png';

export default function Groups({ auth }) {
    const [users, setUsers] = useState([]); // Holds all users for group creation
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState(''); // New state for group description

    // Initialize CSRF token and fetch users when the component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await initAxios();
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.post('/getRooms', { user_id: auth.user.id });
                setUsers(response.data); // Assuming this returns groups with creator_name and description
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        fetchRooms();
    }, []);

    const openGroupChat = async (group) => {
        setActiveGroup(group);
        try {
            const response = await axios.post('/getGroupMessages', { room_id: group.id, user_id: auth.user.id });
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching group messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post('/SendMessageGroup', {
                user_id: auth.user.id,
                room_id: activeGroup.id,
                message: newMessage,
            });
            setMessages((prevMessages) => [...prevMessages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending group message:', error);
        }
    };
    
    const fetchRooms = async () => {
        try {
            await initAxios();
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/getRooms', { user_id: auth.user.id });
            //const response = await axios.get('/getRooms'); // Replace with the correct endpoint for fetching rooms
            setUsers(response.data); // Update the rooms state
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || !groupDescription.trim() || selectedUsers.length === 0) return;

        try {
            const response = await axios.post('/createGroup', {
                name: groupName,
                description: groupDescription, // Send the description along with the group name
                user_ids: selectedUsers,
                creator_id: auth.user.id,
            });
            setIsCreatingGroup(false);
            setGroupName('');
            setGroupDescription(''); // Reset the description
            setSelectedUsers([]);
            // Fetch the updated group list here if needed
            fetchRooms();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleOpenCreateGroup = async () => {
        setIsCreatingGroup(true);
        // Fetch users when opening the group creation modal
        try {
            const response = await axios.post('/getAllUsers', { user_id: auth.user.id }); // Ensure you have an endpoint to get all users
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users for group creation:', error);
        }
    };

    return (
        <>
            <Head title="Groups" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="font-semibold text-lg border-b-2 pb-2 mb-4">My Groups</h3>
                            <button 
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition mb-4"
                                onClick={handleOpenCreateGroup} // Open group creation modal and fetch users
                            >
                                Create New Group
                            </button>
                            <ul className="mt-4 space-y-2">
                                {/* Display groups with creator name and description */}
                                {users.map(group => (
                                    <li key={group.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                                        <img 
                                            src={yourLogo} // Assuming a placeholder since groups don't have profiles
                                            alt={`${group.name} logo`}
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div className="flex-grow">
                                            <span className="text-gray-900 font-medium">{group.name}</span>
                                            <div className="text-gray-600 text-sm">Created by: {group.creator_name}</div>
                                            <div className="text-gray-600 text-sm">Description: {group.description || 'No description available.'}</div>
                                        </div>
                                        <button 
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                            onClick={() => openGroupChat(group)} // Open the chat for the selected group
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

            {/* Create Group Modal */}
            {isCreatingGroup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h4 className="font-semibold text-lg mb-4">Create New Group</h4>
                        <input 
                            type="text"
                            className="border w-full p-2 rounded mb-4"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <input 
                            type="text"
                            className="border w-full p-2 rounded mb-4"
                            placeholder="Group Description"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)} // Add input for description
                        />
                        <h5 className="font-semibold mb-2">Select Users:</h5>
                        <ul className="space-y-2 mb-4">
                            {users.map(user => (
                                <li key={user.id} className="flex items-center">
                                    <input 
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => {
                                            setSelectedUsers(prev => 
                                                prev.includes(user.id) ? 
                                                prev.filter(id => id !== user.id) : 
                                                [...prev, user.id]
                                            );
                                        }}
                                    />
                                    <span className="ml-2">{user.name}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end">
                            <button 
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition mr-2"
                                onClick={() => setIsCreatingGroup(false)} // Close modal
                            >
                                Cancel
                            </button>
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleCreateGroup}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Group Chat Box */}
            {activeGroup && (
                <div className="fixed bottom-0 right-0 m-4 bg-white shadow-lg rounded-lg border w-80">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h4 className="font-semibold text-lg">{activeGroup.name}</h4>
                        <button 
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => setActiveGroup(null)} // Close chat box
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
                            <div className="text-gray-600">No messages yet. Start chatting in {activeGroup.name}...</div>
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
