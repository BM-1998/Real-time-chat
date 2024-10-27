// Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Chat from '@/Pages/Chat/Chat'; 
import Groups from '@/Pages/Chat/Groups';// Import the Chat component

export default function Dashboard({ auth }) {
    // State to manage selected tab
    const [selectedTab, setSelectedTab] = useState('chat');

    return (
        <AuthenticatedLayout
            user={auth.user}
            
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Tab Navigation */}
                            <div className="flex space-x-4 border-b border-gray-200">
                                <button
                                    onClick={() => setSelectedTab('chat')}
                                    className={`py-2 px-4 font-medium ${
                                        selectedTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                                    }`}
                                >
                                    Chat
                                </button>
                                <button
                                    onClick={() => setSelectedTab('groups')}
                                    className={`py-2 px-4 font-medium ${
                                        selectedTab === 'groups' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                                    }`}
                                >
                                    Groups
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-4">
                                {selectedTab === 'chat' && (
                                    <Chat auth={auth} /> // Render the Chat component
                                )}
                                {selectedTab === 'groups' && (
                                    <Groups auth={auth} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
