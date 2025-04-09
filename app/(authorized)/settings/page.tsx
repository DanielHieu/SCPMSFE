"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === "account"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("account")}
                    >
                        Tài khoản
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === "appearance"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("appearance")}
                    >
                        Giao diện
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === "notifications"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("notifications")}
                    >
                        Thông báo
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin tài khoản</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Tên đăng nhập</p>
                                            <p className="font-medium">admin</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Vai trò</p>
                                            <p className="font-medium">Quản trị viên</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Bãi đỗ xe</p>
                                            <p className="font-medium">Smart Parking - Quận 1</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Khu vực</p>
                                            <p className="font-medium">Khu A</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
                                <form className="space-y-4">
                                    <div>
                                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mật khẩu hiện tại
                                        </label>
                                        <input
                                            type="password"
                                            id="current-password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            id="new-password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            id="confirm-password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Cập nhật mật khẩu
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Chế độ hiển thị</h3>
                                <div className="flex space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="light-mode"
                                            name="theme-mode"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            defaultChecked
                                        />
                                        <label htmlFor="light-mode" className="ml-2 block text-sm text-gray-700">
                                            Sáng
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="dark-mode"
                                            name="theme-mode"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-700">
                                            Tối
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="system-mode"
                                            name="theme-mode"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="system-mode" className="ml-2 block text-sm text-gray-700">
                                            Theo hệ thống
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Ngôn ngữ</h3>
                                <select className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt thông báo</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Thông báo xe vào</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo khi có xe vào bãi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Thông báo xe ra</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo khi có xe ra khỏi bãi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Thông báo hợp đồng sắp hết hạn</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo khi có hợp đồng sắp hết hạn</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Thông báo bãi đỗ đầy</p>
                                            <p className="text-sm text-gray-500">Nhận thông báo khi bãi đỗ đầy</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
