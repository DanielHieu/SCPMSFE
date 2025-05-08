"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParkingLotPrice } from '@/lib/hook/useParkingLotPrice';
import { Contract } from '@/types/Contract';
import { toRentalTypeDisplay } from '@/lib/utils/displayUltil';
import { useNotification } from '@/lib/context/NotificationContext';
import { motion } from 'framer-motion';
import CameraCapture, { CameraCaptureHandle } from '@/components/ui/CameraCapture';

interface ParkingRecord {
    id: string;
    licensePlate: string;
    parkingSpaceId: string;
    parkingSpaceName: string;
    floorName: string;
    areaName: string;
    checkInTime: Date;
    checkOutTime: Date;
    rentalType: string;
    remainingHour: number;
    fee: number;
    calculationNotes: string;
    contract: Contract | null;
    entranceImage?: string;
}

export default function ExitPage() {
    const price = useParkingLotPrice();
    const { addNotification } = useNotification();

    // State
    const [licensePlate, setLicensePlate] = useState('');
    const [parkingRecord, setParkingRecord] = useState<ParkingRecord | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [exitImageDataUrl, setExitImageDataUrl] = useState<string | null>(null);
    const cameraRef = useRef<CameraCaptureHandle>(null);
    const [activeTab, setActiveTab] = useState<'camera' | 'image'>('camera');
    const [isLicensePlateLocked, setIsLicensePlateLocked] = useState(false);

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

        // Trigger capture first
        const capturedImage = await cameraRef.current?.triggerCapture();
        setExitImageDataUrl(capturedImage ?? null);

        if (capturedImage) {
            setActiveTab('image'); // Switch to image tab after capturing
        }

        if (capturedImage === null) {
            addNotification("Không thể chụp ảnh xe ra. Vui lòng bật camera và thử lại.", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + `/api/parking-lot/calculate-fee?licensePlate=${licensePlate}`);
            const data = await response.json();

            if (data.success) {
                setParkingRecord(data.parkingRecord);
                setIsLicensePlateLocked(true); // Lock license plate after successful fee calculation
                addNotification(`Đã tính phí cho xe ${licensePlate}`, "success");
            } else {
                setParkingRecord(null);
                addNotification(data.message || "Không tìm thấy thông tin xe", "error");
            }
        } catch (error) {
            console.error("Error calculating fee:", error);
            setParkingRecord(null);
            addNotification("Lỗi khi tính phí", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLicensePlate('');
        setParkingRecord(null);
        setExitImageDataUrl(null);
        setActiveTab('camera');
        setIsLicensePlateLocked(false); // Unlock license plate when clearing data
        addNotification("Đã xóa thông tin tìm kiếm", "info");
    };

    const handlePayment = async (entryExitId: string) => {
        if (!entryExitId) return;

        if (!exitImageDataUrl) {
            addNotification("Chưa có ảnh xe ra. Vui lòng bấm 'Tính phí' lại.", "warning");
            return;
        }

        setIsLoading(true);

        try {
            console.log("Processing payment/exit with image:", exitImageDataUrl ? exitImageDataUrl.substring(0, 30) + "..." : "No image");

            const response = await fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + `/api/parking-lot/pay-fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entryExitId: entryExitId,
                    exitImage: exitImageDataUrl
                }),
            });

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
                                    className={`w-full px-4 py-3 rounded-lg border border-gray-300
                                    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                                    ${isLicensePlateLocked ? 'bg-gray-100' : ''}`}
                                    onChange={(e) => {
                                        // Prevent changes if license plate is locked
                                        if (isLicensePlateLocked) return;

                                        const input = e.target.value.toUpperCase();
                                        // Validate Vietnamese license plate format (e.g., 51F-12345 or 51D-123.45)
                                        // Allow input during typing but enforce format
                                        const regex = /^[0-9]{0,2}[A-Z]{0,1}[-]{0,1}[0-9]{0,3}[.]{0,1}[0-9]{0,2}$/;
                                        if (regex.test(input)) {
                                            setLicensePlate(input);
                                        }
                                    }}
                                    maxLength={10}
                                    type="text"
                                    placeholder="VD: 51F-12345"
                                    value={licensePlate}
                                    disabled={isLicensePlateLocked}
                                />
                                {licensePlate && !isLicensePlateLocked && (
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
                            {isLicensePlateLocked && (
                                <p className="mt-1 text-xs text-blue-600">
                                    Biển số xe đã được khóa sau khi tính phí. Nhấn <i>Làm mới</i> để thay đổi.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className={`py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : parkingRecord
                                        ? 'bg-green-600 cursor-default'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                onClick={calculateFee}
                                disabled={isLoading || !licensePlate || isLicensePlateLocked}
                                title={isLicensePlateLocked ? "Đã tính phí cho biển số này. Nhấn 'Làm mới' để tính lại hoặc nhập biển số khác." : ""}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : parkingRecord ? (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                )}
                                {parkingRecord ? 'Đã tính phí' : 'Tính phí'}
                            </button>
                            <button
                                className="py-3 px-4 rounded-lg text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                                onClick={resetForm}
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Làm mới
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Camera Feed with Tabs */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex border-b border-gray-200 mb-4">
                                <button
                                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'camera'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('camera')}
                                >
                                    Camera Xe Ra
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'image'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('image')}
                                    disabled={!exitImageDataUrl}
                                >
                                    Ảnh Xe Ra
                                </button>
                            </div>

                            {activeTab === 'camera' && (
                                <div className="relative w-full h-0 pb-[75%]">
                                    <div className="absolute inset-0">
                                        <CameraCapture ref={cameraRef} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'image' && exitImageDataUrl && (
                                <div className="flex flex-col items-center">
                                    <img
                                        src={exitImageDataUrl}
                                        alt="Ảnh xe ra"
                                        className="max-w-full rounded border border-gray-200"
                                    />
                                    <button
                                        onClick={() => setActiveTab('camera')}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Chụp lại ảnh
                                    </button>
                                </div>
                            )}

                            {activeTab === 'image' && !exitImageDataUrl && (
                                <div className="flex items-center justify-center h-[250px] bg-gray-100 rounded-lg">
                                    <span className="text-gray-500">Chưa có ảnh xe ra</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="font-medium text-sm border-b border-gray-200 mb-4 p-3">Ảnh vào</h2>
                            {parkingRecord?.entranceImage ? (
                                <div className="mt-4 border border-gray-300 rounded-lg p-2 bg-gray-50">
                                    <img src={parkingRecord.entranceImage} alt="Entrance Capture Preview" className="max-w-full h-auto rounded" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[250px] bg-gray-100 rounded-lg border border-gray-200">
                                    <div className="text-center p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-gray-500 font-medium">Chưa có ảnh xe vào</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Fee Information */}
                    {parkingRecord ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông tin tính phí</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Side - Details */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Biển số xe</p>
                                        <p className="text-lg font-medium text-gray-900">{parkingRecord.licensePlate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Vị trí đỗ</p>
                                        <div className="text-gray-900">
                                            <p>Khu vực: {parkingRecord?.areaName || 'N/A'}</p>
                                            <p>Tầng: {parkingRecord?.floorName || 'N/A'}</p>
                                            <p>Vị trí: {parkingRecord?.parkingSpaceName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Loại hình thuê</p>
                                        <p className="text-gray-900 font-semibold">{toRentalTypeDisplay(parkingRecord.rentalType)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Thời gian vào</p>
                                        <p className="text-gray-900">{formatTime(parkingRecord.checkInTime)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Thời gian ra (hiện tại)</p>
                                        <p className="text-gray-900">{formatTime(currentTime)}</p>
                                    </div>
                                </div>

                                {/* Right Side - Fee and Contract */}
                                <div className="space-y-4">
                                    {/* Fee Summary Box */}
                                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-5 shadow-sm">
                                        <p className="text-sm text-amber-700 font-medium mb-2">Tổng số tiền</p>
                                        <p className="text-3xl font-bold text-amber-800">{parkingRecord.fee.toLocaleString()} VNĐ</p>
                                        {parkingRecord.calculationNotes && (
                                            <div className="mt-3 bg-white bg-opacity-50 rounded-md p-3">
                                                <p className="text-xs text-amber-700 italic whitespace-pre-line">
                                                    {parkingRecord.calculationNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contract Information */}
                                    {parkingRecord.contract && (
                                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                                            <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                Thông tin hợp đồng
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Khách hàng:</span>
                                                </p>
                                                <p className="text-sm text-gray-800">{parkingRecord.contract.car?.customerName}</p>

                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Ngày hết hạn:</span>
                                                </p>
                                                <p className="text-sm text-gray-800">{formatTime(parkingRecord.contract.endDate)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Button */}
                                    <button
                                        className={`w-full py-3.5 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center shadow-md ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
                                        onClick={() => handlePayment(parkingRecord.id)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        )}
                                        Xác nhận thanh toán & Xe ra
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-10 border border-gray-100 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có thông tin</h3>
                            <p className="mt-1 text-sm text-gray-500">Vui lòng nhập biển số xe và bấm <span className="font-bold">Tính phí</span> để xem thông tin.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}