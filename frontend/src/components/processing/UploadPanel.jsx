import { useState, useRef } from 'react';
import { 
  CloudUploadIcon, 
  DocumentTextIcon,
  XMarkIcon,
  PhotoIcon 
} from '../ui/Icons';
import Button from '../ui/Button';

// Upload Panel Component for side-by-side processing interface
function UploadPanel({ onFileSelect, selectedFile, onClearFile, processing }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG) or PDF.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return PhotoIcon;
    }
    return DocumentTextIcon;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Invoice</h2>
        <p className="text-gray-600">
          Upload your invoice image or PDF for AI-powered data extraction
        </p>
      </div>

      {!selectedFile ? (
        /* Upload Area */
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-violet-400 bg-violet-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${processing ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop your invoice here
          </h3>
          
          <p className="text-gray-600 mb-6">
            or click to browse your files
          </p>

          <Button 
            onClick={handleBrowseClick}
            disabled={processing}
            className="mb-4"
          >
            Browse Files
          </Button>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Supports: JPG, PNG, PDF</p>
            <p>Maximum file size: 10MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={processing}
          />
        </div>
      ) : (
        /* File Preview */
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Selected File</h3>
            {!processing && (
              <button
                onClick={onClearFile}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
              {(() => {
                const IconComponent = getFileIcon(selectedFile.type);
                return <IconComponent className="h-6 w-6 text-violet-600" />;
              })()}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600">
                {formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
          </div>

          {/* File Preview for Images */}
          {selectedFile.type.startsWith('image/') && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Invoice preview"
                className="max-w-full h-48 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>
          )}

          {/* Processing Status */}
          {processing && (
            <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-sm font-medium text-violet-800">
                  Processing your invoice...
                </span>
              </div>
              <p className="text-xs text-violet-600 mt-1">
                Our AI is extracting data from your document
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ensure the invoice is clearly visible and well-lit</li>
          <li>• Avoid blurry or rotated images</li>
          <li>• Include the entire invoice in the image</li>
          <li>• Higher resolution images provide better accuracy</li>
        </ul>
      </div>
    </div>
  );
}

export default UploadPanel;
