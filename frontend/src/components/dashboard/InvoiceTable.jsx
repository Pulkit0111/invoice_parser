import { useState } from 'react';
import { 
  TrashIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from '../ui/Icons';
import Button from '../ui/Button';

// Invoice Table Component with thumbnails and actions
function InvoiceTable({ 
  invoices, 
  loading, 
  onDeleteInvoice,
  pagination,
  onPageChange 
}) {
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleDelete = async (invoiceId) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    setDeletingIds(prev => new Set([...prev, invoiceId]));
    
    try {
      await onDeleteInvoice(invoiceId);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };


  const getThumbnailComponent = (invoice) => {
    // For now, we'll show a placeholder since we don't have actual thumbnails
    // In a real implementation, this would show the actual invoice thumbnail
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        {invoice.original_filename?.toLowerCase().includes('.pdf') ? (
          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
        ) : (
          <PhotoIcon className="h-8 w-8 text-gray-400" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Invoices</h3>
        </div>
        
        <div className="p-6">
          {/* Skeleton loader */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex-1 flex justify-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="flex-1 flex flex-col items-center space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Invoices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {pagination?.total || 0} total invoices processed
            </p>
          </div>
          
          {pagination && pagination.total > pagination.limit && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {invoices && invoices.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {/* Invoice Preview */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      {getThumbnailComponent(invoice)}
                    </div>
                  </td>

                  {/* Invoice Number */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invoice.invoice_number || 'No Number'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {invoice.original_filename || 'Unknown File'}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(invoice.created_at)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deletingIds.has(invoice.id)}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                        title="Delete Invoice"
                      >
                        {deletingIds.has(invoice.id) ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No invoices yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start by processing your first invoice to see it appear here.
            </p>
            <Button onClick={() => window.location.href = '/process'}>
              Process First Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceTable;
