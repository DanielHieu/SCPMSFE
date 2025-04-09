"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParkingLotPrice } from '@/lib/hook/useParkingLotPrice';
import { Contract } from '@/types/Contract';
import { ParkingSpace } from '@/types/ParkingLot';
import { toRentalTypeDisplay } from '@/lib/utils/displayUltil';
import { useNotification } from '@/lib/context/NotificationContext';
import { motion } from 'framer-motion';

interface ParkingRecord {
    id: string;
    licensePlate: string;
    parkingSpaceId: string;
    checkInTime: Date;
    checkOutTime: Date;
    rentalType: string;
    remainingHour: number;
    fee: number;
    calculationNotes: string;
    contract: Contract | null;
    parkingSpace: ParkingSpace | null;
}

export default function ExitPage() {
    const price = useParkingLotPrice();
    const { addNotification } = useNotification();

    // State
    const [licensePlate, setLicensePlate] = useState('');
    const [parkingRecord, setParkingRecord] = useState<ParkingRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Functions
    const calculateFee = async () => {
        if (!licensePlate) {
            addNotification("Vui lòng nhập biển số xe", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + `/api/parking-lot/calculate-fee?licensePlate=${licensePlate}`);
            const data = await response.json();

            if (data.success) {
                setParkingRecord(data.parkingRecord);
                addNotification(`Đã tính phí cho xe ${licensePlate}`, "success");
            } else {
                addNotification(data.message || "Không tìm thấy thông tin xe", "error");
            }
        } catch (error) {
            console.error("Error calculating fee:", error);
            addNotification("Lỗi khi tính phí", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLicensePlate('');
        setParkingRecord(null);
        addNotification("Đã xóa thông tin tìm kiếm", "info");
    };

    const handlePayment = async (entryExitId: string) => {
        if (!entryExitId) return;

        setIsLoading(true);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + `/api/parking-lot/pay-fee?entryExitId=${entryExitId}`);
            const data = await response.json();

            if (data.success) {
                addNotification("Thanh toán thành công", "success");
                resetForm();
            } else {
                addNotification(data.message || "Lỗi khi thanh toán", "error");
            }
        } catch (error) {
            console.error("Error handling payment:", error);
            addNotification("Lỗi khi thanh toán", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Format timestamp nicely
    const formatTime = (date: Date | string | undefined) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Search and Contract Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Search Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông tin xe ra bãi</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Biển số xe
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300
                                    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                    type="text"
                                    placeholder="VD: 51F-12345"
                                    value={licensePlate}
                                />
                                {licensePlate && (
                                    <button
                                        onClick={() => setLicensePlate('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className={`py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={calculateFee}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                )}
                                Tính phí
                            </button>
                            <button
                                className="py-3 px-4 rounded-lg text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                                onClick={resetForm}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Reset
                            </button>
                        </div>
                    </motion.div>

                    {/* Current Time */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">Thời gian hiện tại</h2>
                        <div className="text-3xl font-bold text-blue-600">
                            {currentTime.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                        <div className="text-sm text-gray-500">
                            {currentTime.toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </div>
                    </motion.div>

                    {/* Price Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Bảng giá</h2>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại phí
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mức phí
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">Theo giờ</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{price.pricePerHour.toLocaleString()} VNĐ/giờ</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">Theo ngày</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{price.pricePerDay.toLocaleString()} VNĐ/ngày</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">Theo tháng</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{price.pricePerMonth.toLocaleString()} VNĐ/tháng</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Right Columns - Vehicle Images and Fee Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Camera Feeds */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Camera ra bãi</h2>
                            <div className="relative rounded-lg overflow-hidden shadow-inner border border-gray-200">
                                <Image
                                    src="/images/entrance.jpg"
                                    alt="Hình ảnh xe ra khỏi bãi"
                                    width={500}
                                    height={300}
                                    className="w-full object-cover h-64"
                                />
                                <div className="absolute top-2 right-2 bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    LIVE
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Camera tổng quan</h2>
                            <div className="relative rounded-lg overflow-hidden shadow-inner border border-gray-200">
                                <Image
                                    src="/images/entrance.jpg"
                                    alt="Hình ảnh tổng quan bãi"
                                    width={500}
                                    height={300}
                                    className="w-full object-cover h-64"
                                />
                                <div className="absolute top-2 right-2 bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    LIVE
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contract Information */}
                    {parkingRecord?.contract && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                        >
                            <div className="flex items-center mb-4">
                                <div className="rounded-full bg-blue-100 p-2 mr-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Thông tin hợp đồng</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-2">
                                        <span className="inline-block w-36 font-medium text-gray-700">Tên khách hàng:</span>
                                        <span>{parkingRecord.contract.customerName}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="inline-block w-36 font-medium text-gray-700">Biển số xe:</span>
                                        <span>{parkingRecord.contract.licensePlate}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="inline-block w-36 font-medium text-gray-700">Vị trí đậu xe:</span>
                                        <span>{parkingRecord.parkingSpace?.parkingSpaceName || "N/A"}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-2">
                                        <span className="inline-block w-36 font-medium text-gray-700">Ngày bắt đầu:</span>
                                        <span>{formatTime(parkingRecord.contract.startDate)}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="inline-block w-36 font-medium text-gray-700">Ngày kết thúc:</span>
                                        <span>{formatTime(parkingRecord.contract.endDate)}</span>
                                    </p>
                                    <p className="mb-2">
                                        <span className="inline-block w-36 font-medium text-gray-700">Tình trạng:</span>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                            {parkingRecord.contract.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Fee Information */}
                    {parkingRecord && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                        >
                            <div className="flex items-center mb-4">
                                <div className="rounded-full bg-green-100 p-2 mr-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Thông tin phí</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Biển số xe:</span>
                                        <span className="text-gray-900 font-medium">{parkingRecord.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Thời gian vào bãi:</span>
                                        <span className="text-gray-900">{formatTime(parkingRecord.checkInTime)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Thời gian ra bãi:</span>
                                        <span className="text-gray-900">{formatTime(parkingRecord.checkOutTime)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Loại thuê:</span>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {toRentalTypeDisplay(parkingRecord.rentalType)}
                                        </span>
                                    </div>
                                    {parkingRecord.contract && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700">Hợp đồng:</span>
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Có</span>
                                        </div>
                                    )}
                                    {parkingRecord.remainingHour !== undefined && parkingRecord.remainingHour > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700">Số giờ còn lại:</span>
                                            <span className="text-gray-900 font-medium">{parkingRecord.remainingHour} giờ</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 mb-6">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="font-medium text-blue-800">Chi tiết tính phí:</span>
                                </div>
                                <div className="text-blue-700 text-sm pl-7" dangerouslySetInnerHTML={{ __html: parkingRecord.calculationNotes?.replace(/\n/g, '<br/>') || "N/A" }}></div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg mb-6">
                                <span className="text-lg font-bold text-gray-800">Tổng phí:</span>
                                <span className="text-2xl font-bold text-blue-600">{parkingRecord.fee?.toLocaleString()} VNĐ</span>
                            </div>

                            <button
                                className={`w-full py-4 px-6 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                onClick={() => handlePayment(parkingRecord.id)}
                                disabled={isLoading || !parkingRecord}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                )}
                                Thanh toán phí
                            </button>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!parkingRecord && (
                        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-800 mb-1">Chưa có thông tin xe</h3>
                            <p className="text-gray-500 text-center mb-6">
                                Nhập biển số xe và nhấn &quot;Tính phí&quot; để xem thông tin.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}