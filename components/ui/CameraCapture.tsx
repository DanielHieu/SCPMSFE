"use client";

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';


// Define the methods that will be exposed via the ref
export interface CameraCaptureHandle {
    triggerCapture: () => Promise<string | null>;
    isReady: () => boolean;
    reset: () => void;
}

const CameraCapture = forwardRef<CameraCaptureHandle>((_, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [deviceId, setDeviceId] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);

    useEffect(() => {
        getVideoDevices();
    }, []);

    useEffect(() => {
        if (deviceId) {
            startVideoStream();
            return () => {
                stopVideoStream();
            };
        }
    }, [deviceId]);

    const getVideoDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setDeviceId(videoDevices[0].deviceId);
            } else {
                setError('Không tìm thấy thiết bị camera.');
            }
        } catch (err) {
            setError('Lỗi khi liệt kê thiết bị: ' + (err as Error).message);
        }
    };

    const startVideoStream = async () => {
        try {
            if (stream) {
                stopVideoStream();
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsCameraOn(true);
                    setError(null);
                };
            }
        } catch (err) {
            setError('Lỗi khi truy cập camera: ' + (err as Error).message);
            setIsCameraOn(false);
        }
    };

    const stopVideoStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const captureImage = async (): Promise<string | null> => {
        if (!videoRef.current || !isCameraOn) {
            return null;
        }

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                return imageDataUrl;
            }
            return null;
        } catch (err) {
            setError('Lỗi khi chụp ảnh: ' + (err as Error).message);
            return null;
        }
    };

    useImperativeHandle(ref, () => ({
        triggerCapture: captureImage,
        isReady: () => !!(isCameraOn && stream && stream.active),
        reset: () => {
            stopVideoStream();
            if (deviceId) {
                startVideoStream();
            }
        }
    }));

    return (
        <div className="camera-capture w-full">
            {error && <div className="error-message bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}

            <div className="camera-container relative">
                <video
                    ref={videoRef}
                    className="w-full h-auto rounded-lg border border-gray-300"
                    style={{ display: isCameraOn ? 'block' : 'none' }}
                ></video>

                {!isCameraOn && !error && (
                    <div className="camera-loading flex items-center justify-center h-[300px] bg-gray-100 rounded-lg">
                        <span>Đang kết nối camera...</span>
                    </div>
                )}
            </div>

            {devices.length > 1 && (
                <div className="device-selector mt-2">
                    <select
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {devices.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${devices.indexOf(device) + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
});

// Assign display name for debugging
CameraCapture.displayName = "CameraCapture";

// Exporting default for easier dynamic import if needed
export default CameraCapture; 