"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsProps {
  salesData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  orderStats: {
    total: number;
    pending: number;
    completed: number;
  };
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export default function AdminAnalytics({
  salesData,
  orderStats,
  revenue,
}: AnalyticsProps) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-2'>Daily Revenue</h3>
          <p className='text-3xl font-bold text-blue-600'>${revenue.daily}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-2'>Weekly Revenue</h3>
          <p className='text-3xl font-bold text-blue-600'>${revenue.weekly}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-2'>Monthly Revenue</h3>
          <p className='text-3xl font-bold text-blue-600'>${revenue.monthly}</p>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h3 className='text-lg font-semibold mb-4'>Sales Overview</h3>
        <div className='h-[300px]'>
          <Bar
            data={salesData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top" as const,
                },
                title: {
                  display: true,
                  text: "Sales Data",
                },
              },
            }}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-2'>Total Orders</h3>
          <p className='text-3xl font-bold text-gray-800'>{orderStats.total}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-2'>Pending Orders</h3>
          <p className='text-3xl font-bold text-yellow-600'>
            {orderStats.pending}
          </p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-2'>Completed Orders</h3>
          <p className='text-3xl font-bold text-green-600'>
            {orderStats.completed}
          </p>
        </div>
      </div>
    </div>
  );
}
