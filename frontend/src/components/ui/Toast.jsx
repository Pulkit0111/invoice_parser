import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from './Icons';

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto remove after duration
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, toast.duration || 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircleIcon,
        bgColor: 'bg-white',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700'
      },
      error: {
        icon: XCircleIcon,
        bgColor: 'bg-white',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        titleColor: 'text-red-800',
        messageColor: 'text-red-700'
      },
      warning: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-white',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        titleColor: 'text-yellow-800',
        messageColor: 'text-yellow-700'
      },
      info: {
        icon: InformationCircleIcon,
        bgColor: 'bg-white',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700'
      }
    };
    
    return configs[type] || configs.info;
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <div
      className={`
        w-full ${config.bgColor} shadow-lg rounded-lg pointer-events-auto border ${config.borderColor}
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
        ${isLeaving ? 'translate-y-4 opacity-0 scale-95' : ''}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 ${config.iconBg} rounded-full flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          
          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className={`text-sm font-medium ${config.titleColor}`}>
                {toast.title}
              </p>
            )}
            <p className={`text-sm ${config.messageColor} ${toast.title ? 'mt-1' : ''}`}>
              {toast.message}
            </p>
          </div>
          
          {/* Close Button */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md transition-colors"
              onClick={handleRemove}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-gray-100">
        <div 
          className={`h-full transition-all ease-linear ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
          style={{
            width: '100%',
            animation: `shrink ${toast.duration || 5000}ms linear forwards`
          }}
        ></div>
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }) {
  return (
    <div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-md"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
