import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Wallet, 
  Leaf, 
  Users, 
  Building2, 
  CheckCircle, 
  Clock, 
  DollarSign,
  BarChart3,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  Search,
  Star,
  Award,
  Shield,
  Zap,
  Target,
  PieChart as LucidePieChart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Pie
} from 'recharts';

// Mock data for demonstration
const mockData = {
  farmerDashboard: {
    dataCollection: {
      status: 'Active',
      lastSync: '2 hours ago',
      devicesConnected: 3,
      dataPoints: 1247
    },
    aiGuidance: [
      {
        id: 1,
        type: 'recommendation',
        title: 'Optimize Irrigation Schedule',
        description: 'Based on soil moisture data, reduce watering frequency by 20%',
        priority: 'high',
        impact: '+15% water efficiency'
      },
      {
        id: 2,
        type: 'alert',
        title: 'Soil pH Adjustment Needed',
        description: 'Soil pH is 5.2, consider adding lime to reach optimal 6.5-7.0',
        priority: 'medium',
        impact: '+8% crop yield'
      },
      {
        id: 3,
        type: 'tip',
        title: 'Carbon Sequestration Opportunity',
        description: 'Plant cover crops in fallow areas to increase carbon credits',
        priority: 'low',
        impact: '+2.5 t CO₂/year'
      }
    ],
    creditsEarned: {
      current: 45.2,
      target: 100,
      monthly: 12.3,
      total: 156.7
    }
  },
  buyerSection: {
    availableCredits: [
      {
        id: 1,
        projectName: 'Organic Rice Farming - Karnataka',
        location: 'Mysuru, Karnataka',
        credits: 25.5,
        price: 850,
        verification: 'Gold Standard',
        farmer: 'Rajesh Kumar',
        date: '2024-01-15',
        impact: 'Water conservation, soil health'
      },
      {
        id: 2,
        projectName: 'Agroforestry Project - Tamil Nadu',
        location: 'Coimbatore, Tamil Nadu',
        credits: 18.2,
        price: 920,
        verification: 'VCS',
        farmer: 'Priya Suresh',
        date: '2024-01-10',
        impact: 'Biodiversity, carbon sequestration'
      },
      {
        id: 3,
        projectName: 'Sustainable Cotton - Gujarat',
        location: 'Ahmedabad, Gujarat',
        credits: 32.1,
        price: 780,
        verification: 'Gold Standard',
        farmer: 'Amit Patel',
        date: '2024-01-08',
        impact: 'Reduced pesticides, water efficiency'
      }
    ],
    supplyChain: [
      {
        id: 1,
        stage: 'Farm Verification',
        status: 'completed',
        date: '2024-01-01',
        details: 'On-site inspection completed by certified auditor'
      },
      {
        id: 2,
        stage: 'Data Collection',
        status: 'completed',
        date: '2024-01-05',
        details: 'IoT sensors deployed, baseline data established'
      },
      {
        id: 3,
        stage: 'Practice Implementation',
        status: 'in-progress',
        date: '2024-01-10',
        details: 'Sustainable farming practices being implemented'
      },
      {
        id: 4,
        stage: 'Credit Generation',
        status: 'pending',
        date: '2024-02-01',
        details: 'First batch of credits will be generated'
      }
    ]
  },
  wallet: {
    balance: {
      credits: 45.2,
      inr: 38420,
      totalValue: 42500
    },
    transactions: [
      {
        id: 1,
        type: 'earned',
        amount: 12.3,
        inr: 10455,
        description: 'Monthly carbon credits - Rice farming',
        date: '2024-01-15',
        status: 'completed'
      },
      {
        id: 2,
        type: 'redeemed',
        amount: -5.0,
        inr: -4250,
        description: 'Redeemed for fertilizer subsidy',
        date: '2024-01-10',
        status: 'completed'
      },
      {
        id: 3,
        type: 'transferred',
        amount: -2.5,
        inr: -2125,
        description: 'Transferred to community pool',
        date: '2024-01-08',
        status: 'completed'
      }
    ]
  },
  schemes: {
    linked: [
      {
        id: 1,
        name: 'PM-KISAN Scheme',
        type: 'Direct Benefit Transfer',
        amount: 6000,
        status: 'active',
        nextPayment: '2024-02-01'
      },
      {
        id: 2,
        name: 'Soil Health Card Scheme',
        type: 'Subsidy',
        amount: 2000,
        status: 'active',
        nextPayment: '2024-01-25'
      }
    ],
    combined: {
      totalSubsidies: 8000,
      totalCredits: 45.2,
      combinedValue: 46420
    }
  }
};

const CarbonCreditsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'farmer' | 'buyer'>('farmer');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const creditHistoryData = [
    { month: 'Jan', credits: 12.3, earnings: 10455 },
    { month: 'Feb', credits: 15.7, earnings: 13345 },
    { month: 'Mar', credits: 18.2, earnings: 15470 },
    { month: 'Apr', credits: 14.8, earnings: 12580 },
    { month: 'May', credits: 16.5, earnings: 14025 },
    { month: 'Jun', credits: 19.1, earnings: 16235 }
  ];

  const projectTypeData = [
    { name: 'Rice Farming', value: 35, color: '#10b981' },
    { name: 'Tree Planting', value: 25, color: '#059669' },
    { name: 'Soil Management', value: 20, color: '#047857' },
    { name: 'Water Conservation', value: 20, color: '#065f46' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Leaf className="h-8 w-8 text-green-600" />
                Carbon Credits Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track, trade, and optimize your carbon credit journey</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-2xl font-bold text-green-600">₹850/t CO₂e</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +5.2% this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'farmer'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5" />
              Farmer Dashboard
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'buyer'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className="h-5 w-5" />
              Buyer Portal
            </button>
          </div>
        </div>

        {activeTab === 'farmer' && (
          <div className="space-y-6">
            {/* Farmer Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Credits Earned</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.farmerDashboard.creditsEarned.total}</p>
                    <p className="text-sm text-green-600">+{mockData.farmerDashboard.creditsEarned.monthly} this month</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.farmerDashboard.creditsEarned.current}</p>
                    <p className="text-sm text-gray-600">t CO₂e</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Data Collection</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.farmerDashboard.dataCollection.status}</p>
                    <p className="text-sm text-gray-600">Last sync: {mockData.farmerDashboard.dataCollection.lastSync}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">₹{mockData.wallet.balance.inr.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+12% vs last month</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Collection Status */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Automated Data Collection
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{mockData.farmerDashboard.dataCollection.devicesConnected}</p>
                  <p className="text-sm text-gray-600">Devices Connected</p>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{mockData.farmerDashboard.dataCollection.dataPoints.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Data Points Collected</p>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{mockData.farmerDashboard.dataCollection.lastSync}</p>
                  <p className="text-sm text-gray-600">Last Sync</p>
                </div>
              </div>
            </div>

            {/* AI Guidance */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-blue-600" />
                AI Guidance & Recommendations
              </h2>
              
              <div className="space-y-4">
                {mockData.farmerDashboard.aiGuidance.map((guidance) => (
                  <div key={guidance.id} className={`p-4 rounded-xl border ${getPriorityColor(guidance.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{guidance.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(guidance.priority)}`}>
                            {guidance.priority}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{guidance.description}</p>
                        <p className="text-sm font-medium text-green-600">{guidance.impact}</p>
                      </div>
                      <button className="ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credits Progress */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Carbon Credits Progress
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Annual Target Progress</span>
                    <span className="text-sm text-gray-600">{mockData.farmerDashboard.creditsEarned.current}/{mockData.farmerDashboard.creditsEarned.target} t CO₂e</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(mockData.farmerDashboard.creditsEarned.current / mockData.farmerDashboard.creditsEarned.target) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round((mockData.farmerDashboard.creditsEarned.current / mockData.farmerDashboard.creditsEarned.target) * 100)}% of annual target achieved
                  </p>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={creditHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [name === 'credits' ? `${value} t CO₂e` : `₹${value}`, name === 'credits' ? 'Credits' : 'Earnings']} />
                      <Legend />
                      <Line type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={3} name="Credits" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Digital Wallet */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Wallet className="h-5 w-5 text-blue-600" />
                Digital Wallet
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Carbon Credits</h3>
                      <Leaf className="h-6 w-6" />
                    </div>
                    <p className="text-3xl font-bold mb-2">{mockData.wallet.balance.credits}</p>
                    <p className="text-green-100">t CO₂e</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">INR Equivalent</span>
                      <span className="text-sm font-medium">₹{mockData.wallet.balance.inr.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Value</span>
                      <span className="text-sm font-medium">₹{mockData.wallet.balance.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {mockData.wallet.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'earned' ? 'bg-green-100' : 
                            transaction.type === 'redeemed' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {transaction.type === 'earned' ? (
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            ) : transaction.type === 'redeemed' ? (
                              <ArrowDownRight className="h-5 w-5 text-red-600" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} t CO₂e
                          </p>
                          <p className="text-sm text-gray-600">₹{Math.abs(transaction.inr).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scheme Integration */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-purple-600" />
                Government Scheme Integration
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Linked Schemes</h3>
                  <div className="space-y-3">
                    {mockData.schemes.linked.map((scheme) => (
                      <div key={scheme.id} className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{scheme.name}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                            {scheme.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{scheme.type}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">₹{scheme.amount.toLocaleString()}</span>
                          <span className="text-sm text-gray-600">Next: {scheme.nextPayment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Combined Benefits</h3>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-purple-100 text-sm">Government Subsidies</p>
                        <p className="text-2xl font-bold">₹{mockData.schemes.combined.totalSubsidies.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-purple-100 text-sm">Carbon Credits</p>
                        <p className="text-2xl font-bold">{mockData.schemes.combined.totalCredits} t CO₂e</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-400">
                      <p className="text-purple-100 text-sm">Total Combined Value</p>
                      <p className="text-3xl font-bold">₹{mockData.schemes.combined.combinedValue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Project Distribution</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={projectTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {projectTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buyer' && (
          <div className="space-y-6">
            {/* Buyer Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Available Credits</p>
                    <p className="text-2xl font-bold text-gray-900">75.8</p>
                    <p className="text-sm text-gray-600">t CO₂e</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verified Projects</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-green-600">+3 this month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Investment</p>
                    <p className="text-2xl font-bold text-gray-900">₹64.2L</p>
                    <p className="text-sm text-green-600">+15% vs last year</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Credits */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Verifiable Carbon Credits
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Projects</option>
                    <option value="gold-standard">Gold Standard</option>
                    <option value="vcs">VCS</option>
                    <option value="organic">Organic</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockData.buyerSection.availableCredits.map((credit) => (
                  <div key={credit.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{credit.projectName}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {credit.location}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        credit.verification === 'Gold Standard' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {credit.verification}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Credits Available</span>
                        <span className="font-semibold">{credit.credits} t CO₂e</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price per t CO₂e</span>
                        <span className="font-semibold">₹{credit.price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Farmer</span>
                        <span className="font-medium">{credit.farmer}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date</span>
                        <span className="text-sm">{credit.date}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Impact:</p>
                      <p className="text-sm text-green-600">{credit.impact}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        Purchase
                      </button>
                      <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Chain Transparency */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-blue-600" />
                Supply Chain Transparency
              </h2>
              
              <div className="space-y-4">
                {mockData.buyerSection.supplyChain.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        stage.status === 'completed' ? 'bg-green-100' :
                        stage.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {stage.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : stage.status === 'in-progress' ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                      {index < mockData.buyerSection.supplyChain.length - 1 && (
                        <div className={`w-0.5 h-8 mt-2 ${
                          stage.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{stage.stage}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stage.status)}`}>
                          {stage.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stage.details}</p>
                      <p className="text-sm text-gray-500">{stage.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonCreditsPage;