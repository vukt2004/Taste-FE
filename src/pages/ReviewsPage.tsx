import React from 'react';

const ReviewsPage: React.FC = () => {
  return (
    <div className="h-full p-6 bg-white bg-opacity-95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">⭐ Đánh giá</h1>
        
        <div className="space-y-6">
          {/* Sample review cards */}
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  U{item}
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-800">Người dùng {item}</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                    <span className="text-sm text-gray-500 ml-2">2 ngày trước</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                Đây là một đánh giá mẫu về nhà hàng. Món ăn rất ngon, phục vụ tốt và không gian đẹp.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Nhà hàng ABC</span>
                <div className="flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-700 text-sm">👍 Thích</button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">💬 Trả lời</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
