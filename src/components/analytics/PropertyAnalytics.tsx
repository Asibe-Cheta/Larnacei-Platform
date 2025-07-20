'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Eye, DollarSign, Users, MapPin, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PropertyAnalyticsProps {
  propertyId?: string;
  isAdmin?: boolean;
}

interface AnalyticsData {
  views: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    labels: string[];
  };
  inquiries: {
    total: number;
    thisMonth: number;
    conversionRate: number;
    byType: { type: string; count: number }[];
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
    byCategory: { category: string; amount: number }[];
  };
  marketData: {
    averagePrice: number;
    priceTrend: number;
    marketDemand: string;
    competitors: number;
  };
  userBehavior: {
    searchPatterns: { term: string; count: number }[];
    popularFilters: { filter: string; usage: number }[];
    conversionFunnel: { stage: string; count: number }[];
  };
}

export default function PropertyAnalytics({ propertyId, isAdmin = false }: PropertyAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in production, this would come from your analytics API
      const mockData: AnalyticsData = {
        views: {
          daily: [12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72, 80, 78, 85, 82, 90, 88],
          weekly: [120, 150, 180, 200, 220, 250, 280],
          monthly: [500, 650, 800, 950, 1100, 1250],
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
        },
        inquiries: {
          total: 156,
          thisMonth: 23,
          conversionRate: 8.5,
          byType: [
            { type: 'Purchase Intent', count: 45 },
            { type: 'Rental Application', count: 38 },
            { type: 'Price Inquiry', count: 32 },
            { type: 'Viewing Request', count: 28 },
            { type: 'Investment Inquiry', count: 13 }
          ]
        },
        revenue: {
          total: 2500000,
          thisMonth: 180000,
          growth: 12.5,
          byCategory: [
            { category: 'Property Sales', amount: 1500000 },
            { category: 'Rental Income', amount: 600000 },
            { category: 'Commission', amount: 400000 }
          ]
        },
        marketData: {
          averagePrice: 45000000,
          priceTrend: 5.2,
          marketDemand: 'High',
          competitors: 12
        },
        userBehavior: {
          searchPatterns: [
            { term: '3 bedroom apartment', count: 245 },
            { term: 'Lekki properties', count: 189 },
            { term: 'affordable housing', count: 156 },
            { term: 'luxury villa', count: 98 },
            { term: 'investment property', count: 87 }
          ],
          popularFilters: [
            { filter: 'Price Range', usage: 89 },
            { filter: 'Location', usage: 76 },
            { filter: 'Property Type', usage: 65 },
            { filter: 'Bedrooms', usage: 58 },
            { filter: 'Amenities', usage: 42 }
          ],
          conversionFunnel: [
            { stage: 'Property Views', count: 1000 },
            { stage: 'Detailed Views', count: 450 },
            { stage: 'Inquiries', count: 156 },
            { stage: 'Viewings', count: 89 },
            { stage: 'Offers', count: 23 }
          ]
        }
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    fetchAnalyticsData();
  }, [propertyId, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const viewsChartData = {
    labels: analyticsData.views.labels,
    datasets: [
      {
        label: 'Property Views',
        data: analyticsData.views.daily,
        borderColor: '#7C0302',
        backgroundColor: 'rgba(124, 3, 2, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const inquiriesChartData = {
    labels: analyticsData.inquiries.byType.map(item => item.type),
    datasets: [
      {
        data: analyticsData.inquiries.byType.map(item => item.count),
        backgroundColor: [
          '#7C0302',
          '#DC2626',
          '#EA580C',
          '#D97706',
          '#059669'
        ],
        borderWidth: 0
      }
    ]
  };

  const revenueChartData = {
    labels: analyticsData.revenue.byCategory.map(item => item.category),
    datasets: [
      {
        label: 'Revenue (₦)',
        data: analyticsData.revenue.byCategory.map(item => item.amount),
        backgroundColor: [
          'rgba(124, 3, 2, 0.8)',
          'rgba(220, 38, 38, 0.8)',
          'rgba(234, 88, 12, 0.8)'
        ],
        borderColor: [
          '#7C0302',
          '#DC2626',
          '#EA580C'
        ],
        borderWidth: 1
      }
    ]
  };

  const conversionFunnelData = {
    labels: analyticsData.userBehavior.conversionFunnel.map(item => item.stage),
    datasets: [
      {
        label: 'Users',
        data: analyticsData.userBehavior.conversionFunnel.map(item => item.count),
        backgroundColor: 'rgba(124, 3, 2, 0.8)',
        borderColor: '#7C0302',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Eye className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.views.daily.reduce((a, b) => a + b, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.inquiries.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{(analyticsData.revenue.total / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.inquiries.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Views Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Views Trend</h3>
          <Line
            data={viewsChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>

        {/* Inquiry Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Types</h3>
          <Doughnut
            data={inquiriesChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>
      </div>

      {/* Revenue and Market Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <Bar
            data={revenueChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '₦' + (Number(value) / 1000000).toFixed(1) + 'M';
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* Market Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Price</span>
              <span className="font-semibold">₦{(analyticsData.marketData.averagePrice / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price Trend</span>
              <span className={`font-semibold ${analyticsData.marketData.priceTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData.marketData.priceTrend > 0 ? '+' : ''}{analyticsData.marketData.priceTrend}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Demand</span>
              <span className="font-semibold text-green-600">{analyticsData.marketData.marketDemand}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Competitors</span>
              <span className="font-semibold">{analyticsData.marketData.competitors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Behavior */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <Bar
              data={conversionFunnelData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>

          {/* Popular Search Terms */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Terms</h3>
            <div className="space-y-3">
              {analyticsData.userBehavior.searchPatterns.slice(0, 5).map((term, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{term.term}</span>
                  <span className="font-semibold text-gray-900">{term.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 