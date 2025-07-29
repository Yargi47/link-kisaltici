'use client';

import { useState, useEffect } from 'react';
import { Link, TrendingUp, Copy, Plus, BarChart3, LogOut, Edit, X, Trash2 } from 'lucide-react';
import { requireAuth, logout } from '@/lib/auth';

interface CustomerLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

interface CustomerStats {
  totalLinks: number;
  totalClicks: number;
  planLimit: number;
  plan: string;
  monthlyFee: number;
}

export default function CustomerDashboard() {
  const [links, setLinks] = useState<CustomerLink[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [auth, setAuth] = useState<{ user: { id: string; name: string } } | null>(null);
  
  // Bulk edit states
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditUrl, setBulkEditUrl] = useState('');
  const [bulkEditMode, setBulkEditMode] = useState<'replace' | 'find-replace'>('replace');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  // Single edit states
  const [showSingleEdit, setShowSingleEdit] = useState(false);
  const [editingLink, setEditingLink] = useState<CustomerLink | null>(null);
  const [singleEditUrl, setSingleEditUrl] = useState('');

  useEffect(() => {
    // Auth kontrolü
    const authData = requireAuth('customer');
    if (authData) {
      setAuth(authData);
    }
  }, []);

  useEffect(() => {
    // Auth yüklendikten sonra veriyi getir
    if (auth?.user?.id) {
      fetchCustomerData();
    }
  }, [auth]);

  const fetchCustomerData = async () => {
    if (!auth?.user?.id) return;
    
    try {
      // Customer API'lerini çağır (customerId parametresi ile)
      const [linksRes, statsRes] = await Promise.all([
        fetch(`/api/customer/links?customerId=${auth.user.id}`),
        fetch(`/api/customer/stats?customerId=${auth.user.id}`)
      ]);
      
      if (linksRes.ok && statsRes.ok) {
        const linksData = await linksRes.json();
        const statsData = await statsRes.json();
        setLinks(linksData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Customer data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createShortLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth?.user?.id) {
      console.error('Müşteri ID bulunamadı');
      return;
    }
    
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: newUrl,
          customCode: customCode || undefined,
          customerId: auth.user.id // Müşteri ID'sini gönder
        })
      });

      if (response.ok) {
        setNewUrl('');
        setCustomCode('');
        setShowCreateForm(false);
        fetchCustomerData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Link oluşturulamadı');
      }
    } catch (error) {
      console.error('Link creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Bulk edit fonksiyonları
  const toggleLinkSelection = (linkId: string) => {
    setSelectedLinks(prev => 
      prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  const selectAllLinks = () => {
    setSelectedLinks(links.map(link => link.id));
  };

  const clearSelection = () => {
    setSelectedLinks([]);
  };

  const openBulkEdit = () => {
    if (selectedLinks.length === 0) {
      alert('Lütfen düzenlemek istediğiniz linkleri seçin');
      return;
    }
    setShowBulkEdit(true);
  };

  const executeBulkEdit = async () => {
    if (!auth?.user?.id) return;

    try {
      const response = await fetch('/api/customer/links/bulk-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: auth.user.id,
          linkIds: selectedLinks,
          mode: bulkEditMode,
          newUrl: bulkEditMode === 'replace' ? bulkEditUrl : undefined,
          findText: bulkEditMode === 'find-replace' ? findText : undefined,
          replaceText: bulkEditMode === 'find-replace' ? replaceText : undefined
        })
      });

      if (response.ok) {
        setShowBulkEdit(false);
        setBulkEditUrl('');
        setFindText('');
        setReplaceText('');
        clearSelection();
        fetchCustomerData(); // Refresh data
        alert('Linkler başarıyla güncellendi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Bulk edit error:', error);
      alert('Bir hata oluştu');
    }
  };

  // Silme fonksiyonları
  const deleteSingleLink = async (linkId: string, linkShortCode: string) => {
    if (!confirm(`"${linkShortCode}" kodlu linki silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    if (!auth?.user?.id) return;

    try {
      const response = await fetch('/api/customer/links/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkIds: [linkId],
          customerId: auth.user.id
        })
      });

      if (response.ok) {
        fetchCustomerData(); // Refresh data
        alert('Link başarıyla silindi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Bir hata oluştu');
    }
  };

  const deleteSelectedLinks = async () => {
    if (selectedLinks.length === 0) {
      alert('Lütfen silmek istediğiniz linkleri seçin');
      return;
    }

    if (!confirm(`${selectedLinks.length} linki silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    if (!auth?.user?.id) return;

    try {
      const response = await fetch('/api/customer/links/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkIds: selectedLinks,
          customerId: auth.user.id
        })
      });

      if (response.ok) {
        clearSelection();
        fetchCustomerData(); // Refresh data
        alert('Seçili linkler başarıyla silindi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Bir hata oluştu');
    }
  };

  // Single edit fonksiyonları
  const openSingleEdit = (link: CustomerLink) => {
    setEditingLink(link);
    setSingleEditUrl(link.originalUrl);
    setShowSingleEdit(true);
  };

  const executeSingleEdit = async () => {
    if (!auth?.user?.id || !editingLink) return;

    try {
      const response = await fetch('/api/customer/links/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: auth.user.id,
          linkId: editingLink.id,
          newUrl: singleEditUrl
        })
      });

      if (response.ok) {
        setShowSingleEdit(false);
        setEditingLink(null);
        setSingleEditUrl('');
        fetchCustomerData(); // Refresh data
        alert('Link başarıyla güncellendi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Single edit error:', error);
      alert('Bir hata oluştu');
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
              <Link className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">{auth.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                Pro Plan
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {auth.user.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <Link className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Link</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalLinks} / {stats.planLimit}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(stats.totalLinks / stats.planLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Tıklama</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ortalama Tıklama</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">₺</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aylık Plan</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₺{stats.monthlyFee}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create New Link Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Yeni Link Oluştur</h2>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Yeni Link
              </button>
            )}
          </div>

          {showCreateForm && (
            <form onSubmit={createShortLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/uzun-link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel Kod (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="ozel-kod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  pattern="[a-zA-Z0-9]{3,20}"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Linklerim</h3>
              
              {/* Bulk Edit Controls */}
              <div className="flex items-center gap-3">
                {selectedLinks.length > 0 && (
                  <>
                    <span className="text-sm text-gray-600">
                      {selectedLinks.length} link seçildi
                    </span>
                    <button
                      onClick={openBulkEdit}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Toplu Düzenle
                    </button>
                    <button
                      onClick={deleteSelectedLinks}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Sil
                    </button>
                    <button
                      onClick={clearSelection}
                      className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 inline mr-1" />
                      Seçimi Temizle
                    </button>
                  </>
                )}
                {selectedLinks.length === 0 && (
                  <button
                    onClick={selectAllLinks}
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    Tümünü Seç
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLinks.length === links.length && links.length > 0}
                      onChange={selectedLinks.length === links.length ? clearSelection : selectAllLinks}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orijinal URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kısa Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLinks.includes(link.id)}
                        onChange={() => toggleLinkSelection(link.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600">
                          {link.shortUrl}
                        </span>
                        <button
                          onClick={() => copyToClipboard(link.shortUrl)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {link.clicks.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSingleEdit(link)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Düzenle
                        </button>
                        <button
                          onClick={() => window.open(`/stats/${link.shortCode}`, '_blank')}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <BarChart3 className="h-4 w-4" />
                          İstatistik
                        </button>
                        <button
                          onClick={() => deleteSingleLink(link.id, link.shortCode)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {links.length === 0 && (
            <div className="text-center py-12">
              <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Hen&uuml;z link oluşturmadanız
              </h3>
              <p className="text-gray-500 mb-4">
                İlk kısa linkinizi oluşturmak i&ccedil;in yukarıdaki butona tıklayın.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                İlk Linki Oluştur
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Toplu Link Düzenleme ({selectedLinks.length} link)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Düzenleme Modu
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="replace"
                      checked={bulkEditMode === 'replace'}
                      onChange={(e) => setBulkEditMode(e.target.value as 'replace')}
                      className="mr-2"
                    />
                    URL'i değiştir
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="find-replace"
                      checked={bulkEditMode === 'find-replace'}
                      onChange={(e) => setBulkEditMode(e.target.value as 'find-replace')}
                      className="mr-2"
                    />
                    Bul & Değiştir
                  </label>
                </div>
              </div>

              {bulkEditMode === 'replace' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni URL
                  </label>
                  <input
                    type="url"
                    value={bulkEditUrl}
                    onChange={(e) => setBulkEditUrl(e.target.value)}
                    placeholder="https://yeni-site.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Seçili tüm linkler bu URL'e yönlendirilecek
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bul (örn: mersobahis101.com)
                    </label>
                    <input
                      type="text"
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      placeholder="mersobahis101.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Değiştir (örn: mersobahis102.com)
                    </label>
                    <input
                      type="text"
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      placeholder="mersobahis102.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    URL'lerde bulunan metin değiştirilecek
                  </p>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBulkEdit(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={executeBulkEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Edit Modal */}
      {showSingleEdit && editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Link Düzenle: {editingLink.shortCode}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut URL
                </label>
                <div className="p-2 bg-gray-100 rounded text-sm text-gray-600 break-all">
                  {editingLink.originalUrl}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni URL
                </label>
                <input
                  type="url"
                  value={singleEditUrl}
                  onChange={(e) => setSingleEditUrl(e.target.value)}
                  placeholder="https://yeni-site.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSingleEdit(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={executeSingleEdit}
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
