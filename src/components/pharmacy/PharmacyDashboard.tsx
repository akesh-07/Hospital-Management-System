import React from 'react';
import { 
  Pill, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react';
import { mockPharmacyAnalytics, mockDrugs } from '../../data/pharmacyData';

export const PharmacyDashboard: React.FC = () => {
  const analytics = mockPharmacyAnalytics;
  const drugs = mockDrugs;

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (quantity <= 20) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { status: 'Available', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ComponentType<any>;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Pill className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
              <p className="text-gray-600">Monitor inventory, sales, and prescription fulfillment</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Daily Sales"
            value={`$${analytics.dailySales.toLocaleString()}`}
            icon={DollarSign}
            color="bg-green-500"
            subtitle="Today's revenue"
          />
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-blue-500"
            subtitle="This month"
          />
          <StatCard
            title="Low Stock Items"
            value={analytics.lowStockItems.toString()}
            icon={AlertTriangle}
            color="bg-yellow-500"
            subtitle="Need restocking"
          />
          <StatCard
            title="Expiring Soon"
            value={analytics.expiringItems.toString()}
            icon={Clock}
            color="bg-red-500"
            subtitle="Within 30 days"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h3>
            </div>
            <div className="space-y-3">
              {analytics.salesTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{new Date(item.date).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(item.amount / Math.max(...analytics.salesTrend.map(i => i.amount))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16">${item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Stock Status Overview</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.stockStatus.available}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Low Stock</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.stockStatus.lowStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Out of Stock</span>
                </div>
                <span className="font-semibold text-gray-900">{analytics.stockStatus.outOfStock}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Pill className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Medicines</h3>
            </div>
            <div className="space-y-3">
              {analytics.topSellingDrugs.map((drug, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{drug.name}</p>
                    <p className="text-sm text-gray-600">{drug.quantity} units sold</p>
                  </div>
                  <span className="font-semibold text-green-600">${drug.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
            </div>
            <div className="space-y-3">
              {drugs.filter(drug => drug.stockQuantity <= 20 || isExpiringSoon(drug.expiryDate)).map((drug) => (
                <div key={drug.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900">{drug.drugName}</p>
                    <p className="text-sm text-red-600">
                      {drug.stockQuantity === 0 ? 'Out of stock' :
                       drug.stockQuantity <= 20 ? `Low stock: ${drug.stockQuantity} units` :
                       'Expiring soon'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockStatus(drug.stockQuantity).color}`}>
                    {getStockStatus(drug.stockQuantity).status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profit Margin by Category</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.profitMargin.map((item, index) => (
              <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{item.category}</p>
                <p className="text-xl font-bold text-blue-600">{item.margin}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};