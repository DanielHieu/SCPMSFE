"use client";

import { signOut } from "next-auth/react";

const SignOutPage = () => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Đăng xuất</h1>
            <p className="text-gray-600 mb-6 text-center">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </p>
            <div className="flex flex-col space-y-3">
                <button
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => {
                        signOut({ callbackUrl: "/auth/signin" });
                    }}
                >
                    Đăng xuất
                </button>
                <button
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    onClick={() => {
                        window.location.href = "/";
                    }}
                >
                    Hủy
                </button>
            </div>
        </div>
    )
}

export default SignOutPage;