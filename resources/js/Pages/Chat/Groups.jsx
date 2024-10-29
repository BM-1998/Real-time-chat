import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios, { initAxios } from '../../axiosConfig';
import yourLogo from '../../../../public/images/Open.png';
import echo from '../../echo';

export default function Groups({ auth }) {
    const [users, setUsers] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groups, setGroups] = useState([]);

    const fetchUsersAndGroups = async () => {
        try {
            await initAxios();
            await axios.get('/sanctum/csrf-cookie');
            const usersResponse = await axios.post('/getAllUsers', { user_id: auth.user.id });
            setUsers(usersResponse.data);
            const groupsResponse = await axios.post('/getRooms', { user_id: auth.user.id });
            setGroups(groupsResponse.data);
        } catch (error) {
            console.error('Error fetching users or groups:', error);
        }
    };

    useEffect(() => {
        const channel = echo.channel('grp-msg-channel');
        channel.listen('.group.message.sent', (event) => {
            if (activeGroup && activeGroup.id === event.room_id && auth.user.id !== event.sender_id) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender_id: event.sender_id, sender_name: event.sender_name, content: event.message },
                ]);
            }
        });
        return () => channel.stopListening('.group.message.sent');
    }, [activeGroup]);

    useEffect(() => {
        fetchUsersAndGroups();
    }, [auth.user.id]);

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
            await axios.post('/SendMessageGroup', {
                user_id: auth.user.id,
                room_id: activeGroup.id,
                message: newMessage,
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                { sender_id: auth.user.id, sender_name: auth.user.name, content: newMessage },
            ]);

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
            await fetchUsersAndGroups();
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleOpenCreateGroup = () => {
        setIsCreatingGroup(true);
        setSelectedUsers([]);
    };

    return (
        <>
            <Head title="Groups" />
            <div className="py-4 sm:py-8 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
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
                            {groups.map(group => (
                                <li key={group.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                                    <img
                                        src={yourLogo}
                                        alt={`${group.name} logo`}
                                        className="w-10 h-10 rounded-full mr-4"
                                    />
                                    <div className="flex-grow">
                                        <span className="text-gray-900 font-medium text-sm">{group.name}</span>
                                        <div className="text-gray-600 text-xs sm:text-sm">Creator: {group.creator_name}</div>
                                        <div className="text-gray-600 text-xs sm:text-sm">Description: {group.description || 'No description'}</div>
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
                                                prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]
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
                <div className="fixed inset-0 z-50 bg-white flex flex-col shadow-lg rounded-lg max-w-xs sm:max-w-md w-full h-96 mx-auto my-auto border border-gray-300">
                    <div className="flex justify-between items-center border-b p-3 bg-blue-500 text-white rounded-t-lg">
                        <h4 className="font-semibold text-lg">{activeGroup.name}</h4>
                        <button
                            className="text-white hover:text-gray-200"
                            onClick={() => setActiveGroup(null)}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="flex-grow p-3 overflow-y-auto bg-gray-50">
                        {messages.length ? (
                            messages.map((message, index) => (
                                <div key={index} className={`mb-2 ${message.sender_id === auth.user.id ? 'text-right' : 'text-left'}`}>
                                    <span className="font-semibold">{message.sender_name}: </span>{message.content}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500">No messages yet.</div>
                        )}
                    </div>
                    <div className="p-3 border-t flex items-center space-x-2">
                        <input
                            type="text"
                            className="flex-grow p-2 border rounded-lg"
                            placeholder="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
