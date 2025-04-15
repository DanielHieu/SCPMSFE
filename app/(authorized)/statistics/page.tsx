"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/ui/Pagination';

interface EntryExitLog {
    id: string;
    licensePlate: string;
    entryTime: string;
    exitTime: string;
    totalAmount: number;
    rentalType: string;
    parkingSpaceName: string;
    isPaid: boolean;
    parkingSpaceStatus: string;
}

interface SearchResult {
    items: EntryExitLog[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
}

export default function StatisticsPage() {
    const [result, setResult] = useState<SearchResult>({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async (pageIndex = result.pageIndex) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_LOCAL_URL}/api/parking-lot/logs?pageIndex=${pageIndex}&pageSize=${result.pageSize}`);

            if (!response.ok) {
                throw new Error('Failed to fetch logs');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Failed to load parking logs. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [result.pageSize]);

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const getParkingSpaceStatus = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'Xe đang vào/ra';
            case 'Occupied':
                return 'Xe đang đỗ';
            default:
                return 'Trạng thái không xác định';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const totalPages = Math.ceil(result.totalCount / result.pageSize);

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <ChartBarIcon className="h-6 w-6 text-amber-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Thống kê ra vào bãi</h1>
                    </div>
                    <button
                        onClick={() => fetchLogs(1)}
                        className="flex items-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Làm mới
                    </button>
                </div>
                <p className="text-gray-500 mb-4">Danh sách lịch sử xe ra vào bãi đỗ</p>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                ) : result?.items?.length === 0 ? (
                    <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                        Không có dữ liệu lịch sử ra vào
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Biển số xe
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian vào
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian ra
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số tiền
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại thuê
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vị trí đỗ
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {result.items.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.licensePlate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.entryTime}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.exitTime}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.isPaid ? formatCurrency(log.totalAmount) : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.rentalType == "Walkin" ? "Vãng lai" : "Hợp đồng"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.parkingSpaceName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {log.isPaid ?
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Đã thanh toán
                                                    </span> :
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.parkingSpaceStatus === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                                                        log.parkingSpaceStatus === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                                                            log.parkingSpaceStatus === 'Unavailable' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {getParkingSpaceStatus(log.parkingSpaceStatus)}
                                                    </span>
                                                }
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={result.pageIndex}
                            totalPages={totalPages}
                            onPageChange={fetchLogs}
                            pageSize={result.pageSize}
                            totalCount={result.totalCount}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
