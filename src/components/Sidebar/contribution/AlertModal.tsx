import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className={`${typeStyles[type]} text-white px-6 py-4 rounded-t-lg`}>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

