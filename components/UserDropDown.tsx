"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
const UserDropdown = () => {
    const { data: session, status } = useSession();

    if (status !== "authenticated") {
        return null;
    }

    console.log(session.user);

    return (
        <div className="relative">
            <button
                className="flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-gray-100"
                onClick={() => {
                    const dropdown = document.getElementById('user-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('hidden');
                    }
                }}
                aria-haspopup="true"
                aria-expanded="false"
            >
                <span className="text-sm font-medium">{session.user?.email || 'User'}</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 shadow-sm">
                    {session.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt={`${session.user.name}'s Avatar`}
                            width={32}
                            height={32}
                            className="object-cover rounded-full"
                        />
                    ) : (
                        <Image
                            src="/images/ai-generated-call-center.jpg"
                            alt="Default Avatar"
                            width={32}
                            height={32}
                            className="object-cover rounded-full"
                        />
                    )}
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            <div
                id="user-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 hidden z-50 border border-gray-200 transition-all duration-200 ease-in-out"
            >
                <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email || ''}</p>
                </div>
                <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-gray-500"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Hồ sơ
                </Link>
                <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-gray-500"
                    >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Cài đặt
                </Link>
                <hr className="my-1" />
                <Link href="/auth/signout" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-red-500"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Đăng xuất
                </Link>
            </div>
        </div>
    );
}

export default UserDropdown;
