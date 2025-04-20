"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ChartBarIcon, ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
    entranceImage: string;
    exitImage: string;
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
    const [selectedImage, setSelectedImage] = useState<{ url: string, title: string } | null>(null);

    const fetchLogs = useCallback(async (pageIndex = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_LOCAL_URL}/api/parking-lot/logs?pageIndex=${pageIndex}&pageSize=${result.pageSize}`);

            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu:', err);
            setError('Không thể tải lịch sử ra vào bãi. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, [result.pageSize]);

    useEffect(() => {
        fetchLogs(1);
    }, [fetchLogs]);

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

    const openImageModal = (imageUrl: string, title: string) => {
        if (imageUrl) {
            setSelectedImage({ url: imageUrl, title });
        }
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ảnh
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex space-x-2">
                                                    {log.entranceImage && (
                                                        <button
                                                            onClick={() => openImageModal(log.entranceImage, `Ảnh vào - ${log.licensePlate}`)}
                                                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center"
                                                            title="Xem ảnh vào"
                                                        >
                                                            <PhotoIcon className="h-4 w-4" />
                                                            <span className="ml-1 text-xs">Vào</span>
                                                        </button>
                                                    )}
                                                    {log.exitImage && (
                                                        <button
                                                            onClick={() => openImageModal(log.exitImage, `Ảnh ra - ${log.licensePlate}`)}
                                                            className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors flex items-center"
                                                            title="Xem ảnh ra"
                                                        >
                                                            <PhotoIcon className="h-4 w-4" />
                                                            <span className="ml-1 text-xs">Ra</span>
                                                        </button>
                                                    )}
                                                </div>
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

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">{selectedImage.title}</h3>
                            <button
                                onClick={closeImageModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 flex justify-center items-center max-h-[70vh] overflow-auto">
                            <div className="relative h-auto w-full">
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.title}
                                    className="max-w-full max-h-[60vh] object-contain mx-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
