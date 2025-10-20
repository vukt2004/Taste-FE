import React from 'react';

const RestaurantsPage: React.FC = () => {
  return (
    <div className="h-full p-6 bg-white bg-opacity-95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🍽️ Nhà hàng</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample restaurant cards */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Hình ảnh nhà hàng {item}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nhà hàng {item}</h3>
              <p className="text-gray-600 text-sm mb-3">Mô tả ngắn về nhà hàng...</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm text-gray-600 ml-2">4.5</span>
                </div>
                <span className="text-sm text-gray-500">$$</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantsPage;
