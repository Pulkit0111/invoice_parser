import { useState } from 'react';
import { 
  TrashIcon, 
  EyeIcon, 
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
  onViewInvoice,
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

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatConfidence = (confidence) => {
    if (!confidence) return 'N/A';
    const percentage = Math.round(confidence * 100);
    const colorClass = percentage >= 90 ? 'text-green-600' : percentage >= 70 ? 'text-yellow-600' : 'text-red-600';
    return <span className={`font-medium ${colorClass}`}>{percentage}%</span>;
  };

  const getThumbnailComponent = (invoice) => {
    // For now, we'll show a placeholder since we don't have actual thumbnails
    // In a real implementation, this would show the actual invoice thumbnail
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        {invoice.original_filename?.toLowerCase().includes('.pdf') ? (
          <DocumentTextIcon className="h-6 w-6 text-gray-400" />
        ) : (
          <PhotoIcon className="h-6 w-6 text-gray-400" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        </div>
        
        <div className="p-6">
          {/* Skeleton loader */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            <p className="text-sm text-gray-600 mt-1">
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
              
              <span className="text-sm text-gray-600">
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  {/* Thumbnail + Invoice Number */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getThumbnailComponent(invoice)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number || 'No Number'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.original_filename || 'Unknown File'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.company_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.email || ''}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAmount(invoice.total_amount)}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {formatConfidence(invoice.confidence_score)}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.created_at)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onViewInvoice && onViewInvoice(invoice)}
                        className="text-violet-600 hover:text-violet-900 transition-colors"
                        title="View Invoice"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
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
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-600 mb-6">
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
