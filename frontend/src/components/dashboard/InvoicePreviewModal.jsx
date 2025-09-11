import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const InvoicePreviewModal = ({ isOpen, onClose, invoiceId }) => {
  const { apiRequest } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceDetails();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest(`/api/invoices/${invoiceId}`);
      
      if (result.success) {
        setInvoice(result.data);
      } else {
        setError('Failed to load invoice details');
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📄</span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Invoice Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading invoice details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-2">
                <div className="text-4xl mx-auto mb-2 opacity-50">📄</div>
                <p className="text-lg font-semibold">Error Loading Invoice</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={fetchInvoiceDetails}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : invoice ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">📄</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {invoice.invoice_number || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">📅</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Date</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">💰</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {invoice.currency} {invoice.total_amount?.toLocaleString() || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">🏢</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vendor</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {invoice.vendor_name || 'Unknown Vendor'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">👤</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {invoice.customer_name || 'Unknown Customer'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">💰</span>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Net Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {invoice.currency} {invoice.net_amount?.toLocaleString() || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {invoice.extracted_data && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Extracted Data
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {JSON.stringify(invoice.extracted_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Original Image Preview */}
              {invoice.original_file_id && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Original Document
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <img
                      src={`/api/files/${invoice.original_file_id}/preview`}
                      alt="Invoice Preview"
                      className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className="text-center py-8 text-gray-500 dark:text-gray-400 hidden"
                    >
                      <div className="text-4xl mx-auto mb-2 opacity-50">📄</div>
                      <p>Preview not available</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-400 mx-auto mb-2 opacity-50">📄</div>
              <p className="text-gray-500 dark:text-gray-400">No invoice data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
