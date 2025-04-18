"use client";

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

interface CameraCaptureProps {
    // onCapture is no longer needed as capture is triggered imperatively
}

// Define the methods that will be exposed via the ref
export interface CameraCaptureHandle {
    triggerCapture: () => string | null; // Function to trigger capture and return base64 URL
}

export const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>((props, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null); // Still used for internal preview
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get available video devices
    useEffect(() => {
        const getDevices = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true }); // Request permission first
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);
                if (videoDevices.length > 0 && !selectedDeviceId) {
                    setSelectedDeviceId(videoDevices[0].deviceId); // Select the first camera by default
                }
            } catch (err) {
                console.error("Error enumerating devices:", err);
                setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
            }
        };
        getDevices();
    }, [selectedDeviceId]);

    // Start stream when device is selected and camera is turned on
    const startStream = useCallback(async () => {
        setIsLoading(true);
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop previous stream
        }
        if (selectedDeviceId) {
            setError(null);
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: selectedDeviceId } }
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    // Ensure video plays after setting srcObject
                    videoRef.current.onloadedmetadata = () => {
                        if (videoRef.current) {
                            videoRef.current.play().catch(e => {
                                console.error("Error playing video:", e);
                                setError("Không thể phát video. Vui lòng thử lại.");
                            });
                        }
                    };
                }
                setIsCameraOn(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError(`Không thể bật camera. Vui lòng kiểm tra quyền truy cập hoặc thử lại sau.`);
                setIsCameraOn(false);
                setStream(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("Không tìm thấy thiết bị camera. Vui lòng kết nối camera và thử lại.");
            setIsCameraOn(false);
            setStream(null);
            setIsLoading(false);
        }
    }, [selectedDeviceId, stream]);

    // Stop stream
    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if(videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
        setIsCameraOn(false);
        setCapturedImage(null); // Clear captured image when stopping
    }, [stream]);

    // Cleanup stream on component unmount
    useEffect(() => {
        return () => {
            stopStream();
        };
    }, [stopStream]);

    // Internal capture logic, now returns the data URL
    const captureLogic = useCallback(() => {
        if (videoRef.current && stream && stream.active) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/png');
                setCapturedImage(imageDataUrl); // Update internal preview state
                return imageDataUrl; // Return the data
            }
        }
        return null; // Return null if capture failed
    }, [stream]);

    // Expose the triggerCapture function via ref
    useImperativeHandle(ref, () => ({
        triggerCapture: () => {
            return captureLogic(); // Call the internal logic and return the result
        }
    }));

    return (
        <div className="space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

            {devices.length > 0 && (
                <div className="flex items-center space-x-2">
                    <label htmlFor="camera-select" className="text-sm font-medium text-gray-700">Chọn camera:</label>
                    <select
                        id="camera-select"
                        value={selectedDeviceId || ''}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {devices.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${devices.indexOf(device) + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="relative rounded-lg overflow-hidden shadow-inner border border-gray-200 bg-gray-900 aspect-video">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted // Mute to avoid feedback loop if microphone is also captured
                    className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                />
                {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Camera đang tắt
                    </div>
                )}
                {isCameraOn && stream && stream.active && (
                     <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-semibold bg-black bg-opacity-50 px-1.5 py-0.5 rounded">LIVE</span>
                     </div>
                )}
                {isCameraOn && (!stream || !stream.active) && (
                    <div className="absolute inset-0 flex items-center justify-center text-yellow-400 bg-black bg-opacity-70">
                        Đang kết nối camera...
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center space-x-2">
                {!isCameraOn ? (
                    <button
                        onClick={startStream}
                        disabled={!selectedDeviceId || isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                        {isLoading ? "Đang kết nối..." : "Bật Camera"}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={captureLogic}
                            disabled={!stream || !stream.active}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                            Chụp ảnh (Thủ công)
                        </button>
                         <button
                            onClick={stopStream}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                            Tắt Camera
                        </button>
                    </>
                )}
            </div>

            {capturedImage && (
                <div className="mt-4 border border-gray-300 rounded-lg p-2">
                     <h3 className="text-sm font-medium text-gray-700 mb-2">Ảnh vừa chụp (Xem trước):</h3>
                    <img src={capturedImage} alt="Captured" className="max-w-full h-auto rounded" />
                     <button
                        onClick={() => setCapturedImage(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                        Xóa ảnh xem trước
                    </button>
                </div>
            )}
        </div>
    );
});

// Assign display name for debugging
CameraCapture.displayName = "CameraCapture";

// Exporting default for easier dynamic import if needed
export default CameraCapture; 