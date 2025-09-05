import { 
  XMarkIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClipboardIcon,
  ArrowDownIcon
} from '../ui/Icons';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Invoice Detail Modal Component
function InvoiceDetailModal({ invoice, isOpen, onClose }) {
  if (!invoice) return null;

  const handleCopyData = async () => {
    try {
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        company_name: invoice.company_name,
        total_amount: invoice.total_amount,
        date: invoice.date,
        due_date: invoice.due_date,
        email: invoice.email,
        phone: invoice.phone,
        address: invoice.address,
        items: invoice.items || []
      };
      
      await navigator.clipboard.writeText(JSON.stringify(invoiceData, null, 2));
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy data:', error);
    }
  };

  const handleDownloadData = () => {
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      company_name: invoice.company_name,
      total_amount: invoice.total_amount,
      date: invoice.date,
      due_date: invoice.due_date,
      email: invoice.email,
      phone: invoice.phone,
      address: invoice.address,
      items: invoice.items || [],
      processed_at: invoice.created_at,
      confidence_score: invoice.confidence_score
    };

    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoice_number || invoice.id}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Details"
      showCloseButton={true}
    >
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {invoice.invoice_number || 'No Invoice Number'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Processed on {formatDate(invoice.created_at)}
            </p>
            {invoice.confidence_score && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {Math.round(invoice.confidence_score * 100)}% confidence
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Invoice Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h4 className="font-medium text-gray-900">Invoice Information</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Invoice Number</label>
                  <p className="text-sm text-gray-900 mt-1">{invoice.invoice_number || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(invoice.date)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(invoice.due_date)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Amount</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatAmount(invoice.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h4 className="font-medium text-gray-900">Company Information</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Company Name</label>
                  <p className="text-sm text-gray-900 mt-1">{invoice.company_name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{invoice.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm text-gray-900 mt-1">{invoice.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-sm text-gray-900 mt-1">{invoice.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Invoice Items</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.description || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.quantity || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.unit_price ? formatAmount(item.unit_price) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {item.total_price ? formatAmount(item.total_price) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* File Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-600">Original Filename</label>
              <p className="text-gray-900 mt-1">{invoice.original_filename || 'Unknown'}</p>
            </div>
            <div>
              <label className="font-medium text-gray-600">File ID</label>
              <p className="text-gray-900 mt-1 font-mono text-xs">
                {invoice.original_file_id || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCopyData}
            className="flex items-center justify-center"
          >
            <ClipboardIcon className="h-4 w-4 mr-2" />
            Copy Data
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownloadData}
            className="flex items-center justify-center"
          >
            <ArrowDownIcon className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          
          <div className="flex-1"></div>
          
          <Button
            onClick={onClose}
            className="flex items-center justify-center"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default InvoiceDetailModal;
