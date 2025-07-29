'use client';

import { useState, useEffect } from 'react';
import { Users, Link, TrendingUp, Settings, DollarSign, Shield, LogOut } from 'lucide-react';
import { requireAuth, logout } from '@/lib/auth';

interface Customer {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional çünkü listeleme sırasında gösterilmez
  plan: 'free' | 'pro' | 'enterprise';
  monthlyFee: number;
  linksCount: number;
  totalClicks: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

interface AdminStats {
  totalCustomers: number;
  totalLinks: number;
  totalClicks: number;
  monthlyRevenue: number;
  activeCustomers: number;
}

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [auth, setAuth] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
    monthlyFee: 0
  });

  useEffect(() => {
    // Auth kontrolü
    const authData = requireAuth('admin');
    if (authData) {
      setAuth(authData);
      fetchAdminData();
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      // Admin API'lerini çağır
      const [customersRes, statsRes] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/stats')
      ]);
      
      if (customersRes.ok && statsRes.ok) {
        const customersData = await customersRes.json();
        const statsData = await statsRes.json();
        setCustomers(customersData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Admin data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/customers/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status: newStatus })
      });

      if (response.ok) {
        // Local state'i güncelle
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === customerId 
              ? { ...customer, status: newStatus as any }
              : customer
          )
        );
      }
    } catch (error) {
      console.error('Status toggle error:', error);
    }
  };

  const addCustomer = async () => {
    try {
      const response = await fetch('/api/admin/customers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });

      if (response.ok) {
        const addedCustomer = await response.json();
        setCustomers(prev => [...prev, addedCustomer]);
        setShowAddModal(false);
        setNewCustomer({ name: '', email: '', password: '', plan: 'free', monthlyFee: 0 });
      }
    } catch (error) {
      console.error('Add customer error:', error);
    }
  };

  const editCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      const response = await fetch('/api/admin/customers/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCustomer)
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === selectedCustomer.id ? updatedCustomer : customer
          )
        );
        setShowEditModal(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Edit customer error:', error);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch('/api/admin/customers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      });

      if (response.ok) {
        setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      }
    } catch (error) {
      console.error('Delete customer error:', error);
    }
  };

  if (loading || !auth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{auth.user.name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </button>
              <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
                { id: 'customers', name: 'Müşteriler', icon: Users },
                { id: 'revenue', name: 'Gelir', icon: DollarSign },
                { id: 'settings', name: 'Ayarlar', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <Link className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Link</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalLinks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toplam Tıklama</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
                    <p className="text-2xl font-semibold text-gray-900">₺{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktivite</h3>
              <div className="space-y-3">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₺{customer.monthlyFee}/ay</p>
                      <p className="text-xs text-gray-500">{customer.linksCount} link</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Add Customer Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Müşteri Yönetimi</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + Yeni Müşteri Ekle
              </button>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aylık Ücret
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Linkler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                            customer.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₺{customer.monthlyFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.linksCount} / {customer.totalClicks.toLocaleString()} tık
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.status === 'active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {customer.status === 'active' ? 'Aktif' : 
                             customer.status === 'inactive' ? 'Pasif' : 'Askıda'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => toggleCustomerStatus(customer.id, 
                              customer.status === 'active' ? 'suspended' : 'active')}
                            className={`${
                              customer.status === 'active' ? 'text-red-600 hover:text-red-900' : 
                              'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {customer.status === 'active' ? 'Askıya Al' : 'Aktive Et'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Düzenle
                          </button>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && stats && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Gelir Analizi</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Ay</h3>
                <p className="text-3xl font-bold text-green-600">₺{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Toplam gelir</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ortalama</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ₺{Math.round(stats.monthlyRevenue / Math.max(stats.activeCustomers, 1)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Müşteri başına</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyeksiyon</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ₺{(stats.monthlyRevenue * 12).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Yıllık potansiyel</p>
              </div>
            </div>

            {/* Revenue by Plan */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Bazında Gelir</h3>
              <div className="space-y-4">
                {['free', 'pro', 'enterprise'].map((plan) => {
                  const planCustomers = customers.filter(c => c.plan === plan);
                  const planRevenue = planCustomers.reduce((sum, c) => sum + c.monthlyFee, 0);
                  
                  return (
                    <div key={plan} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{plan} Plan</p>
                        <p className="text-sm text-gray-500">{planCustomers.length} müşteri</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900">₺{planRevenue.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Sistem Ayarları</h2>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Ayarları</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Adı
                  </label>
                  <input
                    type="text"
                    defaultValue="Link Kısaltıcı"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Domain
                  </label>
                  <input
                    type="text"
                    defaultValue="localhost:3001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varsayılan Plan Limitleri
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Free Plan</label>
                      <input type="number" defaultValue="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pro Plan</label>
                      <input type="number" defaultValue="1000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Enterprise Plan</label>
                      <input type="number" defaultValue="10000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                    </div>
                  </div>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Müşteri Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Şirket adını girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="email@sirket.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                <input
                  type="password"
                  value={newCustomer.password}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Güçlü bir şifre girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={newCustomer.plan}
                  onChange={(e) => {
                    const plan = e.target.value as 'free' | 'pro' | 'enterprise';
                    const fees = { free: 0, pro: 299, enterprise: 999 };
                    setNewCustomer(prev => ({ 
                      ...prev, 
                      plan,
                      monthlyFee: fees[plan]
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free (₺0/ay)</option>
                  <option value="pro">Pro (₺299/ay)</option>
                  <option value="enterprise">Enterprise (₺999/ay)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomer({ name: '', email: '', password: '', plan: 'free', monthlyFee: 0 });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={addCustomer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Müşteri Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Düzenle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                <input
                  type="text"
                  value={selectedCustomer.name}
                  onChange={(e) => setSelectedCustomer(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={selectedCustomer.email}
                  onChange={(e) => setSelectedCustomer(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Opsiyonel)</label>
                <input
                  type="password"
                  value={selectedCustomer.password || ''}
                  onChange={(e) => setSelectedCustomer(prev => prev ? ({ ...prev, password: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Şifreyi değiştirmek için yeni şifre girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={selectedCustomer.plan}
                  onChange={(e) => {
                    const plan = e.target.value as 'free' | 'pro' | 'enterprise';
                    const fees = { free: 0, pro: 299, enterprise: 999 };
                    setSelectedCustomer(prev => prev ? ({ 
                      ...prev, 
                      plan,
                      monthlyFee: fees[plan]
                    }) : null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free (₺0/ay)</option>
                  <option value="pro">Pro (₺299/ay)</option>
                  <option value="enterprise">Enterprise (₺999/ay)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => setSelectedCustomer(prev => prev ? ({ 
                    ...prev, 
                    status: e.target.value as 'active' | 'inactive' | 'suspended'
                  }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="suspended">Askıda</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={editCustomer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
