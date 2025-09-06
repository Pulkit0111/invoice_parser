import { useState, useMemo, useCallback, memo } from 'react';
import { 
  TrashIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from '../ui/Icons';
import Button from '../ui/Button';

// Memoized Invoice Row Component
const InvoiceRow = memo(({ 
  invoice, 
  isDeleting, 
  onDelete, 
  onViewDetails 
}) => {
  const handleDeleteClick = useCallback(() => {
    onDelete(invoice.id);
  }, [invoice.id, onDelete]);

  const handleViewClick = useCallback(() => {
    onViewDetails(invoice);
  }, [invoice, onViewDetails]);

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {invoice.original_file_id ? (
              <img
                className="h-10 w-10 rounded-lg object-cover border border-gray-300"
                src={`/api/files/${invoice.original_file_id}/thumbnail?size=40`}
                alt="Invoice thumbnail"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600"
              style={{ display: invoice.original_file_id ? 'none' : 'flex' }}
            >
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">
              {invoice.invoice_number || 'N/A'}
            </div>
            <div className="text-sm text-gray-400">
              {invoice.invoice_date || 'No date'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-white">
          {invoice.vendor_name || 'Unknown Vendor'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-white">
          {invoice.customer_name || 'Unknown Customer'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-white">
          {invoice.currency} {invoice.net_amount?.toLocaleString() || '0.00'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full mr-2 bg-green-400"></div>
          <span className="text-sm text-gray-400">
            {new Date(invoice.created_at).toLocaleDateString()}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewClick}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PhotoIcon className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin mr-1" />
            ) : (
              <TrashIcon className="h-4 w-4 mr-1" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </td>
    </tr>
  );
});

InvoiceRow.displayName = 'InvoiceRow';

// Memoized Pagination Component
const PaginationControls = memo(({ 
  pagination, 
  onPageChange 
}) => {
  const handlePreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  }, [pagination.page, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      onPageChange(pagination.page + 1);
    }
  }, [pagination.page, pagination.pages, onPageChange]);

  const pageNumbers = useMemo(() => {
    const current = pagination.page;
    const total = pagination.pages;
    const pages = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  }, [pagination.page, pagination.pages]);

  // Only show pagination if there are more than 5 total items
  if (pagination.total <= 5) return null;

  return (
    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={pagination.page === pagination.pages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-300">
            Showing{' '}
            <span className="font-medium">
              {((pagination.page - 1) * pagination.limit) + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{pagination.total}</span>{' '}
            results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {pageNumbers.map((pageNum, index) => (
              pageNum === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pageNum === pagination.page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
            
            <button
              onClick={handleNextPage}
              disabled={pagination.page === pagination.pages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
});

PaginationControls.displayName = 'PaginationControls';

// Main Invoice Table Component with performance optimizations
const InvoiceTable = memo(({ 
  invoices, 
  loading, 
  onDeleteInvoice,
  pagination,
  onPageChange 
}) => {
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleDelete = useCallback(async (invoiceId) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    setDeletingIds(prev => new Set([...prev, invoiceId]));
    
    try {
      await onDeleteInvoice(invoiceId);
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  }, [onDeleteInvoice]);

  const handleViewDetails = useCallback((invoice) => {
    setSelectedInvoice(invoice);
  }, []);

  // Memoize rendered invoice rows for better performance
  const invoiceRows = useMemo(() => {
    return invoices.map((invoice) => (
      <InvoiceRow
        key={invoice.id}
        invoice={invoice}
        isDeleting={deletingIds.has(invoice.id)}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />
    ));
  }, [invoices, deletingIds, handleDelete, handleViewDetails]);

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
          
          {pagination && pagination.total > 5 && (
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
          <>
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Invoice Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {invoiceRows}
              </tbody>
            </table>
            
            <PaginationControls
              pagination={pagination}
              onPageChange={onPageChange}
            />
          </>
        ) : (
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
});

InvoiceTable.displayName = 'InvoiceTable';

export default InvoiceTable;
