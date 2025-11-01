import React from 'react';

interface ContributionModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ContributionModal: React.FC<ContributionModalProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {children}
      </div>
    </div>
  );
};

export default ContributionModal;

