"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EntrancingCar } from '@/types/EntrancingCar';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon, ClockIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { TruckIcon } from '@heroicons/react/24/solid';

export default function Dashboard() {
  const [carsInParkingLot, setCarsInParkingLot] = useState<EntrancingCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats ] = useState({
    totalSpaces: 200,
    occupiedSpaces: 150,
    revenueToday: 2450000,
    percentageOccupied: 75
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCarsInParkingLot = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/parking-lot/cars');
        const data = await response.json();
        setCarsInParkingLot(data.carsInParkingLot);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCarsInParkingLot();
  }, []);

  // Fake data for hourly revenue chart
  const hourlyRevenue = [
    { hour: '6:00', amount: 150000 },
    { hour: '7:00', amount: 320000 },
    { hour: '8:00', amount: 240000 },
    { hour: '9:00', amount: 360000 },
    { hour: '10:00', amount: 280000 },
    { hour: '11:00', amount: 400000 },
    { hour: '12:00', amount: 160000 },
    { hour: '13:00', amount: 300000 },
    { hour: '14:00', amount: 380000 },
    { hour: '15:00', amount: 220000 },
    { hour: '16:00', amount: 340000 },
    { hour: '17:00', amount: 420000 },
  ];

  // Find max revenue for scaling the chart
  const maxRevenue = Math.max(...hourlyRevenue.map(item => item.amount));

  // Animation variants for staggered children
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

  return (
    <div className="container mx-auto p-4">
      {/* Header with time and date */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
            <p className="text-gray-500">Tổng quan về hoạt động bãi đỗ xe</p>
          </div>
          <div className="flex items-center mt-4 sm:mt-0">
            <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="text-xl font-semibold text-gray-800">
                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick action cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={item}>
          <Link href="/entrance" className="block h-full">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200 h-full hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <ArrowRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium py-1 px-2 rounded-full bg-blue-100 text-blue-800">Entrance</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-blue-900">Xe vào bãi</h2>
              <p className="text-blue-700">Quản lý xe vào bãi đỗ xe</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/exit" className="block h-full">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200 h-full hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                  <ArrowLeftIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs font-medium py-1 px-2 rounded-full bg-green-100 text-green-800">Exit</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-900">Xe ra bãi</h2>
              <p className="text-green-700">Quản lý xe ra bãi đỗ xe</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/tasks" className="block h-full">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200 h-full hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <TableCellsIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium py-1 px-2 rounded-full bg-purple-100 text-purple-800">Manage</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-purple-900">Quản lý công việc</h2>
              <p className="text-purple-700">Xem và quản lý công việc</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/statistics" className="block h-full">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm p-6 border border-amber-200 h-full hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-2 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <ChartBarIcon className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-xs font-medium py-1 px-2 rounded-full bg-amber-100 text-amber-800">Analytics</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-amber-900">Thống kê</h2>
              <p className="text-amber-700">Xem báo cáo và thống kê</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Statistics summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Tổng số chỗ đỗ</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalSpaces}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${stats.percentageOccupied}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.percentageOccupied}% đã sử dụng</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Xe trong bãi</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.occupiedSpaces}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TruckIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <div className="bg-green-600 h-1 rounded-full" style={{ width: `${(stats.occupiedSpaces / stats.totalSpaces) * 100}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.totalSpaces - stats.occupiedSpaces} chỗ trống</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Doanh thu hôm nay</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.revenueToday.toLocaleString()} VND</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Cập nhật lúc: {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Lượt xe trong ngày</p>
              <h3 className="text-2xl font-bold text-gray-800">187</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <ArrowRightIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center text-green-600">
              <span className="text-xs font-medium">+12%</span>
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 ml-2">so với hôm qua</span>
          </div>
        </div>
      </motion.div>

      {/* Cars in parking lot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Xe đang trong bãi</h2>
            <p className="text-gray-500 text-sm">Danh sách các xe hiện đang đỗ trong bãi</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <TruckIcon className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : carsInParkingLot && carsInParkingLot.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biển số xe</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tầng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vị trí</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian vào</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {carsInParkingLot.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{car.licensePlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.areaName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.floorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.parkingSpaceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.checkInTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.rentalType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <TruckIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center font-medium">Không có xe nào trong bãi</p>
            <p className="text-gray-400 text-sm text-center mt-1">Bãi đỗ xe hiện đang trống</p>
          </div>
        )}
      </motion.div>

      {/* Charts and statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Doanh thu trong ngày</h2>
              <p className="text-gray-500 text-sm">Thống kê theo giờ</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <div className="h-64">
            <div className="h-52 flex items-end justify-between space-x-1">
              {hourlyRevenue.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.amount / maxRevenue) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                ></motion.div>
              ))}
            </div>
            <div className="w-full flex justify-between mt-2 text-xs text-gray-500">
              {hourlyRevenue.filter((_, i) => i % 2 === 0).map((item, index) => (
                <span key={index}>{item.hour}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.revenueToday.toLocaleString()} VND</p>
            <p className="text-sm text-gray-500">Cập nhật lúc: {currentTime.toLocaleTimeString('vi-VN')}</p>
          </div>
        </motion.div>

        {/* Parking lot status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Tình trạng bãi đỗ xe</h2>
              <p className="text-gray-500 text-sm">Tổng quan về công suất sử dụng</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * stats.percentageOccupied) / 100 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-bold text-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {stats.percentageOccupied}%
                </motion.span>
                <span className="text-sm text-gray-500">Đã sử dụng</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Số xe hiện tại</p>
              <p className="text-2xl font-bold text-blue-600">{stats.occupiedSpaces}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng số chỗ đỗ</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalSpaces}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Chỗ trống</p>
              <p className="text-2xl font-bold text-amber-600">{stats.totalSpaces - stats.occupiedSpaces}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Thời gian trung bình</p>
              <p className="text-2xl font-bold text-purple-600">2.5h</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
