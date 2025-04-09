"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

// Define task status types
type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Define task interface
interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high';
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from your API
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/tasks');
                const data = await response.json();
                if (data.success) {
                    setTasks(data.tasks);
                } else {
                    console.error("Error fetching tasks:", data.error);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
                // For demo purposes, set some mock data
                setTasks(mockTasks);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(task => task.status === filter);

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'pending': return 'text-amber-500 bg-amber-50 border-amber-200';
            case 'in-progress': return 'text-blue-500 bg-blue-50 border-blue-200';
            case 'completed': return 'text-green-500 bg-green-50 border-green-200';
            default: return 'text-gray-500 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-amber-500" />;
            case 'in-progress':
                return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
            case 'completed':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            default:
                return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cao</span>;
            case 'medium':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Trung bình</span>;
            case 'low':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Thấp</span>;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
            >
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý công việc</h1>
                        <p className="text-gray-500">Xem và quản lý các công việc được giao</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Tạo công việc mới
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'pending' ? 'bg-amber-200 text-amber-800' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                    >
                        Chờ xử lý
                    </button>
                    <button
                        onClick={() => setFilter('in-progress')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'in-progress' ? 'bg-blue-200 text-blue-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                        Đang thực hiện
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'completed' ? 'bg-green-200 text-green-800' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                        Hoàn thành
                    </button>
                </div>
            </div>

            {/* Tasks list */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-4"
                >
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
                            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">Không có công việc nào</h3>
                            <p className="text-gray-500">
                                {filter === 'all'
                                    ? 'Bạn chưa có công việc nào được giao.'
                                    : `Bạn không có công việc nào ở trạng thái "${filter}".`}
                            </p>
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <motion.div
                                key={task.id}
                                variants={item}
                                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                                                {getStatusIcon(task.status)}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                        <p className="text-gray-600 mb-3">{task.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <ClockIcon className="h-4 w-4 mr-1" />
                                                <span>Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                            Chi tiết
                                        </button>
                                        {task.status !== 'completed' && (
                                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                                {task.status === 'pending' ? 'Bắt đầu' : 'Hoàn thành'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}
        </div>
    );
}

// Mock data for demonstration
const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Kiểm tra hệ thống camera bãi A',
        description: 'Kiểm tra tình trạng hoạt động của các camera giám sát tại bãi đỗ xe A và báo cáo các vấn đề nếu có.',
        status: 'pending',
        dueDate: '2023-11-25',
        assignedTo: 'staff1',
        priority: 'high'
    },
    {
        id: '2',
        title: 'Hướng dẫn khách hàng mới',
        description: 'Hỗ trợ khách hàng mới làm quen với hệ thống đỗ xe và giải đáp thắc mắc.',
        status: 'in-progress',
        dueDate: '2023-11-23',
        assignedTo: 'staff1',
        priority: 'medium'
    },
    {
        id: '3',
        title: 'Cập nhật bảng thông báo',
        description: 'Cập nhật các thông báo mới về quy định đỗ xe và giá cả lên bảng thông báo.',
        status: 'completed',
        dueDate: '2023-11-20',
        assignedTo: 'staff1',
        priority: 'low'
    },
    {
        id: '4',
        title: 'Kiểm tra hệ thống thanh toán',
        description: 'Kiểm tra và đảm bảo hệ thống thanh toán tự động hoạt động bình thường.',
        status: 'pending',
        dueDate: '2023-11-26',
        assignedTo: 'staff1',
        priority: 'high'
    },
    {
        id: '5',
        title: 'Báo cáo tình trạng bãi đỗ xe',
        description: 'Lập báo cáo hàng tuần về tình trạng sử dụng bãi đỗ xe và các vấn đề phát sinh.',
        status: 'in-progress',
        dueDate: '2023-11-24',
        assignedTo: 'staff1',
        priority: 'medium'
    }
];
