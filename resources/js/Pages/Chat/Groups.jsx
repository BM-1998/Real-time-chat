import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios, { initAxios } from '../../axiosConfig';
import yourLogo from '../../../../public/images/Open.png';

export default function Groups({ auth }) {
    const [users, setUsers] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await initAxios();
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.post('/getRooms', { user_id: auth.user.id });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
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

    const handleCreateGroup = async () => {
        if (!groupName.trim() || !groupDescription.trim() || selectedUsers.length === 0) return;
        try {
            const response = await axios.post('/createGroup', {
                name: groupName,
                description: groupDescription,
                user_ids: selectedUsers,
                creator_id: auth.user.id,
            });
            setIsCreatingGroup(false);
            setGroupName('');
            setGroupDescription('');
            setSelectedUsers([]);
            fetchRooms();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleOpenCreateGroup = async () => {
        setIsCreatingGroup(true);
        try {
            const response = await axios.post('/getAllUsers', { user_id: auth.user.id });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users for group creation:', error);
        }
    };

    return (
        <>
            <Head title="Groups" />
            <div className="py-4 sm:py-8">
                <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            <h3 className="font-semibold text-lg sm:text-xl border-b-2 pb-2 mb-4">My Groups</h3>
                            <button 
                                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition w-full sm:w-auto mb-4"
                                onClick={handleOpenCreateGroup}
                            >
                                Create New Group
                            </button>
                            <ul className="space-y-2">
                                {users.map(group => (
                                    <li key={group.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                                        <img 
                                            src={yourLogo}
                                            alt={`${group.name} logo`}
                                            className="w-10 h-10 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0"
                                        />
                                        <div className="flex-grow">
                                            <span className="text-gray-900 font-medium text-sm sm:text-base">{group.name}</span>
                                            <div className="text-gray-600 text-xs sm:text-sm">Created by: {group.creator_name}</div>
                                            <div className="text-gray-600 text-xs sm:text-sm">Description: {group.description || 'No description available.'}</div>
                                        </div>
                                        <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition mt-2 sm:mt-0 w-full sm:w-auto"
                                            onClick={() => openGroupChat(group)}
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

            {isCreatingGroup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                        <h4 className="font-semibold text-lg mb-4">Create New Group</h4>
                        <input 
                            type="text"
                            className="border w-full p-2 rounded mb-3"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <input 
                            type="text"
                            className="border w-full p-2 rounded mb-3"
                            placeholder="Group Description"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                        <h5 className="font-semibold mb-2">Select Users:</h5>
                        <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto">
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
                                    <span className="ml-2 text-sm">{user.name}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end space-x-2">
                            <button 
                                className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition"
                                onClick={() => setIsCreatingGroup(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                                onClick={handleCreateGroup}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeGroup && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="flex justify-between items-center border-b p-4">
                        <h4 className="font-semibold text-lg">{activeGroup.name}</h4>
                        <button 
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => setActiveGroup(null)}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="flex-grow p-3 overflow-y-auto">
                        {messages.length ? (
                            messages.map((msg, index) => (
                                <div key={index} className="text-gray-700 mb-2 text-sm">
                                    <strong>{msg.sender_name === auth.user.name ? 'You' : msg.sender_name}: </strong> 
                                    {msg.content}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-600 text-sm">No messages yet. Start chatting in {activeGroup.name}...</div>
                        )}
                    </div>
                    <div className="p-3 border-t flex items-center space-x-2">
                        <input 
                            type="text"
                            className="border w-full p-2 rounded text-sm"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
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
