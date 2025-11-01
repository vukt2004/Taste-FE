import React, { useState } from 'react';

interface DishContributionFormProps {
  dishNames: string[];
  onDishNamesChange: (names: string[]) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitError: string | null;
  submitSuccess: string | null;
}

const DishContributionForm: React.FC<DishContributionFormProps> = ({
  dishNames,
  onDishNamesChange,
  isSubmitting,
  onSubmit,
  onCancel,
  submitError,
  submitSuccess,
}) => {
  const [currentDishName, setCurrentDishName] = useState('');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const handleAddDish = () => {
    const trimmedName = currentDishName.trim();
    if (!trimmedName) {
      setDuplicateError(null);
      return;
    }

    // Kiểm tra trùng (case-insensitive)
    const isDuplicate = dishNames.some(
      name => name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicateError('Món ăn này đã có trong danh sách');
      return;
    }

    setDuplicateError(null);
    onDishNamesChange([...dishNames, trimmedName]);
    setCurrentDishName('');
  };

  const handleDishNameChange = (value: string) => {
    setCurrentDishName(value);
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    if (duplicateError) {
      setDuplicateError(null);
    }
  };

  const handleRemoveDish = (index: number) => {
    const newDishNames = dishNames.filter((_, i) => i !== index);
    onDishNamesChange(newDishNames);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDish();
    }
  };

  // Kiểm tra trùng khi người dùng nhập (case-insensitive)
  const isDuplicate = currentDishName.trim().length > 0 && dishNames.some(
    name => name.toLowerCase() === currentDishName.trim().toLowerCase()
  );

  return (
    <div className="space-y-4">
      {(submitError || submitSuccess) && (
        <div className={`mb-4 p-3 border rounded text-sm ${
          submitError 
            ? 'bg-red-100 border-red-400 text-red-700' 
            : 'bg-green-100 border-green-400 text-green-700'
        }`}>
          {submitError || submitSuccess}
        </div>
      )}

      {/* Danh sách món ăn đã thêm */}
      {dishNames.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh sách món ăn đã thêm ({dishNames.length})
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
            {dishNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border border-gray-200"
              >
                <span className="text-sm text-gray-700 flex-1">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDish(index)}
                  disabled={isSubmitting}
                  className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Xóa món ăn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input thêm món ăn mới */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên món ăn <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={currentDishName}
              onChange={(e) => handleDishNameChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                duplicateError || isDuplicate
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Ví dụ: Phở Bò Đặc Biệt"
              disabled={isSubmitting}
            />
            {(duplicateError || isDuplicate) && (
              <p className="mt-1 text-xs text-red-600">
                {duplicateError || 'Món ăn này đã có trong danh sách'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddDish}
            disabled={!currentDishName.trim() || isSubmitting || isDuplicate}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isDuplicate ? 'Món ăn đã tồn tại' : 'Thêm món ăn'}
          >
            Thêm
          </button>
        </div>
        {!duplicateError && !isDuplicate && (
          <p className="mt-1 text-xs text-gray-500">
            Nhấn Enter hoặc nút "Thêm" để thêm món ăn vào danh sách
          </p>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-gray-700 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        > 
          Hủy
        </button>
        <button
          onClick={onSubmit}
          disabled={dishNames.length === 0 || isSubmitting}
          className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? `Đang gửi ${dishNames.length} món ăn...` : `Gửi ${dishNames.length} món ăn`}
        </button>
      </div>
    </div>
  );
};

export default DishContributionForm;

