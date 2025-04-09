"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Task {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    dueDate: string;
    priority: "low" | "medium" | "high";
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    joinDate: string;
    phoneNumber: string;
    address: string;
    avatar: string;
}

const ProfilePage = () => {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu này từ API
                // Hiện tại, chúng ta sẽ giả lập hồ sơ dựa trên dữ liệu phiên
                setProfile({
                    id: "1",
                    name: session?.user?.name || "Nhân viên",
                    email: session?.user?.email || "nhanvien@example.com",
                    role: "Nhân viên bãi đỗ xe",
                    department: "Vận hành",
                    joinDate: "15/01/2023",
                    phoneNumber: "0123456789",
                    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
                    avatar: session?.user?.image || "/images/default-avatar.png",
                });

                // Giả lập việc lấy danh sách công việc
                setTasks([
                    {
                        id: "task1",
                        title: "Giám sát cổng vào",
                        description: "Đảm bảo xe ra vào thuận lợi và phát hành vé đúng quy định",
                        status: "in-progress",
                        dueDate: "30/12/2023",
                        priority: "high",
                    },
                    {
                        id: "task2",
                        title: "Kiểm tra chỗ đỗ xe",
                        description: "Kiểm tra các vấn đề bảo trì trong khu vực đỗ xe B",
                        status: "pending",
                        dueDate: "25/12/2023",
                        priority: "medium",
                    },
                    {
                        id: "task3",
                        title: "Hỗ trợ báo cáo hàng tháng",
                        description: "Tổng hợp dữ liệu xe ra vào cho báo cáo hàng tháng",
                        status: "completed",
                        dueDate: "15/12/2023",
                        priority: "low",
                    },
                ]);

                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu hồ sơ:", error);
                setIsLoading(false);
            }
        };

        if (session) {
            fetchProfileData();
        }
    }, [session]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-600";
            case "medium":
                return "text-orange-500";
            case "low":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "in-progress":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xử lý";
            case "in-progress":
                return "Đang thực hiện";
            case "completed":
                return "Hoàn thành";
            default:
                return status;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case "high":
                return "Ưu tiên cao";
            case "medium":
                return "Ưu tiên trung bình";
            case "low":
                return "Ưu tiên thấp";
            default:
                return priority;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Thẻ hồ sơ */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col items-center">
                            <div className="relative w-32 h-32 mb-4">
                                <Image
                                    src={"/images/ai-generated-call-center.jpg"}
                                    alt="Hồ sơ"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800">{profile?.name}</h2>
                            <p className="text-gray-600 mb-2">{profile?.role}</p>
                            <p className="text-sm text-gray-500 mb-4">{profile?.department}</p>

                            <div className="w-full border-t border-gray-200 pt-4 mt-2">
                                <div className="grid grid-cols-1 gap-3 w-full">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-gray-700">{profile?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Điện thoại</p>
                                        <p className="text-gray-700">{profile?.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                                        <p className="text-gray-700">{profile?.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Ngày tham gia</p>
                                        <p className="text-gray-700">{profile?.joinDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Công việc và Hoạt động */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Công việc được giao</h3>

                        {tasks.length === 0 ? (
                            <p className="text-gray-500">Hiện tại không có công việc nào được giao.</p>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-medium text-gray-800">{task.title}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                                                {getStatusText(task.status)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{task.description}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                                                {getPriorityText(task.priority)}
                                            </span>
                                            <span className="text-gray-500">Hạn: {task.dueDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động gần đây</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800">Hoàn thành ca trực tại Cổng vào</p>
                                    <p className="text-sm text-gray-500">Hôm nay, 9:30 sáng</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800">Hỗ trợ 5 khách hàng với thắc mắc về bãi đỗ xe</p>
                                    <p className="text-sm text-gray-500">Hôm qua, 2:15 chiều</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800">Nộp báo cáo bãi đỗ xe hàng tuần</p>
                                    <p className="text-sm text-gray-500">20/12/2023</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage; 