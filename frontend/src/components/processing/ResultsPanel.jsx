import { useState } from 'react';
import { 
  DocumentCheckIcon,
  ClipboardIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '../ui/Icons';
import Button from '../ui/Button';

// Skeleton loader component for loading state
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="space-y-2 mt-6">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Results Panel Component for side-by-side processing interface
function ResultsPanel({ 
  processing, 
  results, 
  error, 
  onSaveToDatabase, 
  saveStatus, 
  onCopyResults, 
  onDownloadResults 
}) {
  const [activeTab, setActiveTab] = useState('formatted');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      onCopyResults();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (onDownloadResults) {
      onDownloadResults();
    }
  };

  const renderFormattedResults = () => {
    if (!results) return null;

    return (
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Invoice Number</label>
              <p className="text-sm text-gray-900 mt-1">{results.invoice_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date</label>
              <p className="text-sm text-gray-900 mt-1">{results.date || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Due Date</label>
              <p className="text-sm text-gray-900 mt-1">{results.due_date || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total Amount</label>
              <p className="text-sm text-gray-900 mt-1 font-semibold">
                {results.total_amount ? `$${results.total_amount}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Company Name</label>
              <p className="text-sm text-gray-900 mt-1">{results.company_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-sm text-gray-900 mt-1">{results.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-sm text-gray-900 mt-1">{results.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="text-sm text-gray-900 mt-1">{results.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        {results.items && results.items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-600">
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Unit Price</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-900">
                  {results.items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-2">{item.description || 'N/A'}</td>
                      <td className="py-2">{item.quantity || 'N/A'}</td>
                      <td className="py-2">{item.unit_price ? `$${item.unit_price}` : 'N/A'}</td>
                      <td className="py-2">{item.total_price ? `$${item.total_price}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {results.confidence_score && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Extraction Confidence: {Math.round(results.confidence_score * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Extracted Data</h2>
        <p className="text-gray-600">
          AI-powered data extraction results from your invoice
        </p>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {processing ? (
          /* Loading State */
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Processing your invoice...</p>
                <p className="text-sm text-gray-500 mt-1">This usually takes 2-5 seconds</p>
              </div>
            </div>
            <SkeletonLoader />
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : results ? (
          /* Results State */
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('formatted')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'formatted'
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Formatted View
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'json'
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  JSON View
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-64">
              {activeTab === 'formatted' ? (
                renderFormattedResults()
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={onSaveToDatabase}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                loading={saveStatus === 'saving'}
                className={saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {saveStatus === 'saved' ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Saved to Database
                  </>
                ) : saveStatus === 'saving' ? (
                  'Saving...'
                ) : (
                  <>
                    <DocumentCheckIcon className="h-4 w-4 mr-2" />
                    Save to Database
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={handleCopy}>
                <ClipboardIcon className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>

              <Button variant="outline" onClick={handleDownload}>
                <ArrowDownIcon className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <DocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Process</h3>
            <p className="text-gray-600">
              Upload an invoice to see the extracted data here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;
