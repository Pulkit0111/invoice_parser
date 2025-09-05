import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCards from '../components/dashboard/StatsCards';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceDetailModal from '../components/dashboard/InvoiceDetailModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Enhanced Dashboard page with tabular invoice management
function Dashboard() {
  const { user, apiRequest } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch stats and invoices in parallel
        const [statsResult, invoicesResult] = await Promise.all([
          apiRequest('/api/dashboard/stats'),
          apiRequest(`/api/dashboard/invoices?page=${pagination.page}&limit=${pagination.limit}`)
        ]);

        if (statsResult.success) {
          setStats(statsResult.data);
        } else {
          console.warn('Failed to fetch stats:', statsResult.error);
          // Set default stats for demo
          setStats({
            total_invoices: 0,
            success_rate: 0,
            recent_activity: 0,
            storage_used: 0,
            storage_limit: 1000
          });
        }

        if (invoicesResult.success) {
          setInvoices(invoicesResult.data.invoices || []);
          setPagination(prev => ({
            ...prev,
            total: invoicesResult.data.total || 0
          }));
        } else {
          console.warn('Failed to fetch invoices:', invoicesResult.error);
          setInvoices([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data. Please refresh the page.', 'Loading Error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiRequest, pagination.page, pagination.limit, showError]);

  // Refresh invoices data (used after deletion)
  const refreshInvoices = async () => {
    setInvoicesLoading(true);
    
    try {
      const result = await apiRequest(`/api/dashboard/invoices?page=${pagination.page}&limit=${pagination.limit}`);
      
      if (result.success) {
        setInvoices(result.data.invoices || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.total || 0
        }));
        
        // Also refresh stats to update counts
        const statsResult = await apiRequest('/api/dashboard/stats');
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const result = await apiRequest(`/api/dashboard/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        showSuccess('Invoice deleted successfully', 'Deleted');
        await refreshInvoices(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete invoice. Please try again.', 'Delete Failed');
    }
  };

  // Handle invoice view
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      const result = await apiRequest('/api/dashboard/export');
      
      if (result.success) {
        // Create and download the export file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccess('Data exported successfully!', 'Export Complete');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      showInfo('Export functionality will be available soon!', 'Coming Soon');
    }
  };

  // Handle view analytics
  const handleViewAnalytics = () => {
    showInfo('Advanced analytics dashboard will be available soon!', 'Coming Soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader
          user={user}
          onExportData={handleExportData}
          onViewAnalytics={handleViewAnalytics}
        />

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={false} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Invoice Table */}
          <div className="lg:col-span-3">
            <InvoiceTable
              invoices={invoices}
              loading={invoicesLoading}
              onDeleteInvoice={handleDeleteInvoice}
              onViewInvoice={handleViewInvoice}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/process'}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-violet-600 text-sm font-medium">+</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Process Invoice</div>
                      <div className="text-sm text-gray-600">Upload and extract data</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={handleViewAnalytics}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">📊</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">View Analytics</div>
                      <div className="text-sm text-gray-600">Detailed insights</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={handleExportData}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">📄</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Export Data</div>
                      <div className="text-sm text-gray-600">Download CSV/JSON</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Getting Started */}
            {stats?.total_invoices === 0 && (
              <div className="bg-violet-50 rounded-lg border border-violet-200 p-6">
                <h3 className="text-lg font-semibold text-violet-900 mb-2">
                  Welcome to Invoice Parser!
                </h3>
                <p className="text-violet-700 text-sm mb-4">
                  Ready to process your first invoice? It only takes a few seconds to get started.
                </p>
                
                <button
                  onClick={() => window.location.href = '/process'}
                  className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                  Process First Invoice
                </button>
              </div>
            )}

            {/* Storage Usage */}
            {stats && stats.total_invoices > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used</span>
                    <span className="font-medium text-gray-900">
                      {stats.storage_used || 0} MB
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((stats.storage_used || 0) / (stats.storage_limit || 1000) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0 MB</span>
                    <span>{stats.storage_limit || 1000} MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
}

export default Dashboard;