import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-bold text-2xl text-white leading-tight border-b pb-3 border-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12 bg-gray-100 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Profile Information</h3>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-full"
                        />
                    </div>

                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                        <UpdatePasswordForm className="max-w-full" />
                    </div>

                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
                        <DeleteUserForm className="max-w-full" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
