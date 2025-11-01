import React from 'react';

interface ContributionButtonsProps {
  onOpenDishModal: () => void;
  onOpenRestaurantModal: () => void;
  onOpenClaimModal: () => void;
}

const ContributionButtons: React.FC<ContributionButtonsProps> = ({
  onOpenDishModal,
  onOpenRestaurantModal,
  onOpenClaimModal,
}) => {
  return (
    <div className="space-y-2">
      <button
        onClick={onOpenDishModal}
        className="w-full p-2.5 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-sm sm:text-lg"></span>
          </div>
          <div>
            <div className="font-medium text-gray-800 text-sm sm:text-base">Đóng góp món ăn</div>
            <div className="text-xs text-gray-500">Gửi đề xuất món ăn mới</div>
          </div>
        </div>
      </button>

      <button
        onClick={onOpenRestaurantModal}
        className="w-full p-2.5 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm sm:text-lg"></span>
          </div>
          <div>
            <div className="font-medium text-gray-800 text-sm sm:text-base">Đóng góp quán ăn</div>
            <div className="text-xs text-gray-500">Thêm quán ăn mới vào hệ thống</div>
          </div>
        </div>
      </button>

      <button
        onClick={onOpenClaimModal}
        className="w-full p-2.5 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-left"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-sm sm:text-lg"></span>
          </div>
          <div>
            <div className="font-medium text-gray-800 text-sm sm:text-base">Xác nhận quán ăn</div>
            <div className="text-xs text-gray-500">Yêu cầu làm chủ quán ăn</div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ContributionButtons;

