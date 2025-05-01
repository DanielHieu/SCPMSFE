"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useCurrentParkingLot } from '@/lib/hook/useCurrentParkingLot';
import { Contract } from '@/types/Contract';
import { RentalType } from '@/types/RentalType';
import { ContractStatus } from '@/types/ContractStatus';
import { useNotification } from '@/lib/context/NotificationContext';
import { ParkingSpaceStatus } from '@/types/ParkingSpaceStatus';
import { motion } from 'framer-motion';
import { Area } from '@/types/ParkingLot';
import CameraCapture, { CameraCaptureHandle } from '@/components/ui/CameraCapture';

export default function EntrancePage() {
    const [selectedRentalType, setSelectedRentalType] = useState<RentalType>(RentalType.Walkin);
    const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
    const [licensePlate, setLicensePlate] = useState('');
    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedLicensePlate, setVerifiedLicensePlate] = useState('');
    const [isContractChecked, setIsContractChecked] = useState(false);
    const [isValidLicensePlate, setIsValidLicensePlate] = useState(false);
    const [entranceImageDataUrl, setEntranceImageDataUrl] = useState<string | null>(null);
    const cameraRef = useRef<CameraCaptureHandle>(null);

    const { parkingLotFull, error, fetchParkingLotFull } = useCurrentParkingLot();
    const { addNotification } = useNotification();

    const walkinAreas = useMemo(() => parkingLotFull?.areas && parkingLotFull.areas
        .filter((area: { rentalType: RentalType; }) => area.rentalType === RentalType.Walkin), [parkingLotFull]);

    const contractAreas = useMemo(() => parkingLotFull?.areas && parkingLotFull.areas
        .filter((area: { rentalType: RentalType; }) => area.rentalType === RentalType.Contract), [parkingLotFull]);

    // Stats calculation
    const [stats, setStats] = useState({
        totalSpaces: 0,
        availableSpaces: 0,
        occupiedSpaces: 0
    });

    useEffect(() => {
        if (parkingLotFull?.parkingSpaces) {
            const total = parkingLotFull.parkingSpaces.length;

            const available = parkingLotFull.parkingSpaces.filter(s => s.status === ParkingSpaceStatus.Available).length;
            const occupied = parkingLotFull.parkingSpaces.filter(s => s.status === ParkingSpaceStatus.Occupied).length;

            setStats({
                totalSpaces: total,
                availableSpaces: available,
                occupiedSpaces: occupied
            });
        }
    }, [parkingLotFull]);

    useEffect(() => {
        if (error) {
            addNotification(error, "error");
        }
    }, [error, addNotification]);

    // Reset contract check when license plate changes
    useEffect(() => {
        if (licensePlate !== verifiedLicensePlate) {
            setIsContractChecked(false);
        }

        // Validate if the license plate field is not empty to enable the button
        // The actual format validation should ideally happen server-side or upon submission
        setIsValidLicensePlate(licensePlate.trim().length > 0);

    }, [licensePlate, verifiedLicensePlate]);

    const getSpaceStyles = (status: string, isSelected: boolean) => {
        const baseStyles = "relative p-4 text-center font-medium rounded-lg transition-all duration-300 border";

        const statusStyles = (s: string) => {
            switch (s) {
                case ParkingSpaceStatus.Available:
                    return "bg-green-100 border-green-500 text-green-800 hover:bg-green-200 cursor-pointer shadow-sm";
                case ParkingSpaceStatus.Occupied:
                    return "bg-red-100 border-red-500 text-red-800 cursor-not-allowed shadow-sm";
                case ParkingSpaceStatus.Reserved:
                    return "bg-purple-100 border-purple-500 text-purple-800 cursor-not-allowed shadow-sm";
                case ParkingSpaceStatus.Pending:
                    return "bg-yellow-100 border-yellow-500 text-yellow-800 cursor-not-allowed shadow-sm";
                case ParkingSpaceStatus.Disabled:
                    return "bg-gray-100 border-gray-500 text-gray-800 cursor-not-allowed shadow-sm";
                default:
                    return "bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed shadow-sm";
            }
        };

        const statusStyle = statusStyles(status);
        const selectedStyle = isSelected ? 'ring-2 ring-blue-500 transform scale-105 shadow-md' : '';

        return `${baseStyles} ${statusStyle} ${selectedStyle}`;
    };

    const checkContract = async () => {
        if (!licensePlate) {
            addNotification("Vui lòng nhập biển số xe", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + "/api/contracts/license-plate?licensePlate=" + licensePlate);
            const data = await response.json();

            if (data.success) {
                if (data.contract) {
                    setContract(data.contract);

                    // If contract is valid (not expired), select the parking space
                    if (data.contract && new Date(data.contract.endDate) > new Date()) {
                        addNotification("Đã tìm thấy hợp đồng", "success");

                        setSelectedRentalType(RentalType.Contract);
                        // Find and select the parking space associated with the contract
                        setSelectedSpace(data.contract.parkingSpaceId);
                    }
                } else {
                    addNotification("Không tìm thấy hợp đồng cho biển số này", "info");
                }

                // Set verified license plate and mark contract as checked
                setVerifiedLicensePlate(licensePlate);
                setIsContractChecked(true);
            } else {
                console.log("[API] Error checking contract:", data);

                addNotification(data.message, "error");
                setIsContractChecked(false);
                setVerifiedLicensePlate('');
            }
        } catch (error) {
            console.error("Error checking contract:", error);
            addNotification("Lỗi khi kiểm tra hợp đồng", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEntrance = async () => {
        if (!selectedSpace) {
            addNotification("Vui lòng chọn vị trí đỗ xe", "warning");
            return;
        }

        if (!licensePlate) {
            addNotification("Vui lòng nhập biển số xe", "warning");
            return;
        }

        if (!isContractChecked) {
            addNotification("Vui lòng kiểm tra hợp đồng trước", "warning");
            return;
        }

        // Ensure the license plate hasn't changed since verification
        if (licensePlate !== verifiedLicensePlate) {
            addNotification("Biển số xe đã thay đổi. Vui lòng kiểm tra lại hợp đồng.", "warning");
            return;
        }

        // Use existing image if available, otherwise capture a new one
        let capturedImage = entranceImageDataUrl;
        if (!capturedImage) {
            try {
                capturedImage = (await cameraRef.current?.triggerCapture()) ?? null;

                if (!capturedImage)
                    addNotification("Không thể chụp ảnh. Vui lòng bật camera và thử lại.", "warning");
            } catch (error) {
                console.error("Không thể chụp ảnh:", error);

                addNotification("Lỗi khi chụp ảnh", "error");
            }

            // Update state for preview
            setEntranceImageDataUrl(capturedImage);
        }

        setIsLoading(true);

        try {
            // Prepare the image data - ensure it's properly formatted for API
            let imageData = capturedImage;
            if (imageData && !imageData.startsWith('data:image')) {
                // If the image doesn't have the proper prefix, add it
                imageData = `data:image/jpeg;base64,${imageData}`;
            }

            const response = await fetch(process.env.NEXT_PUBLIC_API_LOCAL_URL + "/api/parking-lot/entrance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    licensePlate: licensePlate,
                    parkingSpaceId: selectedSpace,
                    rentalType: contract != null && contract.status == ContractStatus.Active ? RentalType.Contract : RentalType.Walkin,
                    entranceImage: imageData // Use the properly formatted image data
                })
            });

            if (response.ok) {
                fetchParkingLotFull();
                addNotification("Xe đã vào bãi thành công", "success");
                resetForm();
            } else {
                const errorData = await response.json();
                addNotification(errorData.message || "Lỗi khi vào bãi", "error");
            }
        } catch (error) {
            console.error("Error handling entrance:", error);
            addNotification("Lỗi khi vào bãi", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setLicensePlate('');
        setVerifiedLicensePlate('');
        setContract(null);
        setSelectedSpace(null);
        setIsContractChecked(false);
        setEntranceImageDataUrl(null); // Reset image state on form reset
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Controls & Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Parking Lot Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Thống kê bãi đỗ xe</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.totalSpaces}</div>
                                <div className="text-sm text-blue-700">Tổng vị trí</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.availableSpaces}</div>
                                <div className="text-sm text-green-700">Còn trống</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.occupiedSpaces}</div>
                                <div className="text-sm text-red-700">Đã sử dụng</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Camera Feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-xl shadow-sm px-6 pt-6 pb-0 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Camera Xe Vào</h2>
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                className={`px-4 py-2 font-medium text-sm ${!entranceImageDataUrl
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setEntranceImageDataUrl(null)}
                            >
                                Camera Xe Vào
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm ${entranceImageDataUrl
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                disabled={!entranceImageDataUrl}
                            >
                                Ảnh Xe Vào
                            </button>
                        </div>

                        {!entranceImageDataUrl && (
                            <div className="relative w-full h-0 pb-[75%]">
                                <div className="absolute inset-0">
                                    <CameraCapture ref={cameraRef} />
                                </div>
                            </div>
                        )}

                        {entranceImageDataUrl && (
                            <div className="flex flex-col items-center">
                                <img
                                    src={entranceImageDataUrl}
                                    alt="Ảnh xe vào"
                                    className="max-w-full rounded border border-gray-200"
                                />
                                <button
                                    onClick={() => setEntranceImageDataUrl(null)}
                                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Chụp lại ảnh
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* License Plate Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông tin xe vào bãi</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={licensePlate}
                                        onChange={(e) => {
                                            // Prevent changes if contract is already checked
                                            if (isContractChecked) return;

                                            const input = e.target.value.toUpperCase();
                                            // Validate Vietnamese license plate format (e.g., 51F-12345 or 51D-123.45)
                                            // Allow input during typing but enforce format
                                            const regex = /^[0-9]{0,2}[A-Z]{0,1}[-]{0,1}[0-9]{0,3}[.]{0,1}[0-9]{0,2}$/;
                                            if (regex.test(input)) {
                                                setLicensePlate(input);
                                            }
                                        }}
                                        placeholder="VD: 51F-12345"
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isContractChecked ? 'bg-gray-100' : ''}`}
                                        maxLength={10}
                                        autoComplete="off"
                                        inputMode="text"
                                        disabled={isContractChecked}
                                    />
                                    {licensePlate && !isContractChecked && (
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
                                {isContractChecked && (
                                    <p className="mt-1 text-xs text-blue-600">
                                        Biển số xe đã được khóa sau khi kiểm tra. Nhấn "Làm mới" để thay đổi.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className={`py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : isContractChecked
                                            ? 'bg-green-600 cursor-default'
                                            : !isValidLicensePlate
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    onClick={checkContract}
                                    disabled={isLoading || !isValidLicensePlate || isContractChecked}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : isContractChecked ? (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                    )}
                                    {isContractChecked ? 'Đã kiểm tra' : 'Kiểm tra HĐ'}
                                </button>
                                <button
                                    className={`py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${isLoading || !isContractChecked || licensePlate !== verifiedLicensePlate
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    onClick={handleEntrance}
                                    disabled={isLoading || !isContractChecked || licensePlate !== verifiedLicensePlate}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    )}
                                    Xe vào bãi
                                </button>
                            </div>

                            <button
                                className="w-full py-2 rounded-lg text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                                onClick={resetForm}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Làm mới
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right column - Parking Spaces */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                    <div className="flex mb-6">
                        <button
                            className={`flex-1 py-2 px-4 text-center font-medium border-b-2 transition-all duration-200 ${selectedRentalType === RentalType.Walkin ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setSelectedRentalType(RentalType.Walkin)}
                        >
                            Vãng lai
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 text-center font-medium border-b-2 transition-all duration-200 ${selectedRentalType === RentalType.Contract ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setSelectedRentalType(RentalType.Contract)}
                        >
                            Hợp đồng
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2 bg-green-100 border border-green-500"></div>
                            <span className="text-sm text-gray-600">Trống</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2 bg-red-100 border border-red-500"></div>
                            <span className="text-sm text-gray-600">Đã có xe</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2 bg-purple-100 border border-purple-500"></div>
                            <span className="text-sm text-gray-600">Đã đặt trước</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2 bg-gray-100 border border-gray-500"></div>
                            <span className="text-sm text-gray-600">Bảo trì</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2 bg-white border-2 border-blue-500"></div>
                            <span className="text-sm text-gray-600">Đã chọn</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2 bg-yellow-100 border border-yellow-500"></div>
                            <span className="text-sm text-gray-600">Xe đang vào/ra</span>
                        </div>
                    </div>

                    <div className="space-y-6 overflow-y-auto pr-2">
                        {selectedRentalType === RentalType.Walkin && (
                            <div className="space-y-6">
                                {walkinAreas && walkinAreas.map((area: Area) => (
                                    <div key={area.areaId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h3 className="text-lg font-semibold mb-3 pb-1 border-b text-gray-800">{area.areaName}</h3>
                                        <div className="space-y-4">
                                            {parkingLotFull && parkingLotFull.floors
                                                .filter((floor: { areaId: number; }) => floor.areaId === area.areaId)
                                                .map((floor: { floorId: number; floorName: string; }) => (
                                                    <div key={floor.floorId} className="mb-4">
                                                        <h4 className="text-md font-medium mb-2 text-gray-700">{floor.floorName}</h4>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                            {parkingLotFull.parkingSpaces
                                                                .filter((space: { floorId: number; }) => space.floorId === floor.floorId)
                                                                .map((space: { parkingSpaceId: number; status: string; parkingSpaceName: string; }) => (
                                                                    <motion.div
                                                                        key={space.parkingSpaceId}
                                                                        whileHover={space.status === ParkingSpaceStatus.Available ? { scale: 1.05 } : {}}
                                                                        className={getSpaceStyles(space.status, selectedSpace === space.parkingSpaceId)}
                                                                        onClick={() => space.status === ParkingSpaceStatus.Available && setSelectedSpace(space.parkingSpaceId)}
                                                                    >
                                                                        {space.parkingSpaceName}
                                                                    </motion.div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedRentalType === RentalType.Contract && (
                            <div className="space-y-6">
                                {contractAreas && contractAreas.map((area: Area) => (
                                    <div key={area.areaId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h3 className="text-lg font-semibold mb-3 pb-1 border-b text-gray-800">{area.areaName}</h3>
                                        <div className="space-y-4">
                                            {parkingLotFull && parkingLotFull.floors
                                                .filter((floor: { areaId: number; }) => floor.areaId === area.areaId)
                                                .map((floor: { floorId: number; floorName: string; }) => (
                                                    <div key={floor.floorId} className="mb-4">
                                                        <h4 className="text-md font-medium mb-2 text-gray-700">{floor.floorName}</h4>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                            {parkingLotFull.parkingSpaces
                                                                .filter((space: { floorId: number; }) => space.floorId === floor.floorId)
                                                                .map((space: { parkingSpaceId: number; status: string; parkingSpaceName: string; }) => {
                                                                    // Auto-select the space if it matches the contract's parking space
                                                                    const isContractSpace = contract && contract.parkingSpaceId === space.parkingSpaceId;
                                                                    // Use the contract space or manually selected space
                                                                    const isSelected = selectedSpace === space.parkingSpaceId ||
                                                                        (isContractSpace && selectedRentalType === RentalType.Contract);

                                                                    // If this is the contract space and we haven't set selectedSpace yet, set it
                                                                    if (isContractSpace && !selectedSpace && contract) {
                                                                        // This is a side effect in render, but React will re-render
                                                                        setTimeout(() => setSelectedSpace(space.parkingSpaceId), 0);
                                                                    }

                                                                    return (
                                                                        <motion.div
                                                                            key={space.parkingSpaceId}
                                                                            className={getSpaceStyles(space.status, isSelected === true)}
                                                                        // No onClick handler - contract spaces are auto-selected
                                                                        >
                                                                            {space.parkingSpaceName}
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Show this when no areas are available */}
                        {((selectedRentalType === RentalType.Walkin && (!walkinAreas || walkinAreas.length === 0)) ||
                            (selectedRentalType === RentalType.Contract && (!contractAreas || contractAreas.length === 0))) && (
                                <div className="py-12 text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có khu vực nào</h3>
                                    <p className="mt-1 text-sm text-gray-500">Không tìm thấy khu vực phù hợp cho loại hình này.</p>
                                </div>
                            )}
                    </div>

                    {/* Contract Information (if found) */}
                    {contract && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                            <h3 className="text-lg font-medium mb-2 text-blue-800">Thông tin hợp đồng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><span className="font-medium">Khách hàng:</span> {contract.car?.customerName}</p>
                                    <p><span className="font-medium">Biển số xe:</span> {contract.car?.licensePlate}</p>
                                    <p><span className="font-medium">Bãi đỗ xe:</span> {contract.parkingLotName || "N/A"}</p>
                                    <p><span className="font-medium">Khu vực:</span> {contract.areaName || "N/A"}</p>
                                </div>
                                <div>
                                    <p><span className="font-medium">Tầng:</span> {contract.floorName || "N/A"}</p>
                                    <p><span className="font-medium">Vị trí đỗ xe:</span> {contract.parkingSpaceName || "N/A"}</p>
                                    <p><span className="font-medium">Ngày bắt đầu:</span> {new Date(contract.startDate).toLocaleDateString()}</p>
                                    <p><span className="font-medium">Ngày kết thúc:</span> {new Date(contract.endDate).toLocaleDateString()}</p>
                                    <p><span className="font-medium">Trạng thái:</span> <span className={contract.status === ContractStatus.Active ? "text-green-600" : "text-red-600"}>
                                        {contract.status === ContractStatus.Active ? "Đang hoạt động" : "Hết hạn"}
                                    </span></p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}