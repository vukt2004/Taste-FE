import React from 'react';

const StarsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Yêu thích / Danh sách đen</h3>
      <div className="grid grid-cols-1 gap-2">
        {[1,2,3].map((i) => (
          <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Nhà hàng yêu thích {i}</div>
              <div className="text-xs text-gray-500">⭐ 4.{i} • Quận {i}</div>
            </div>
            <button className="text-sm text-red-500 hover:text-red-600">Bỏ thích</button>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-2">Blacklist</div>
        {[1].map((i) => (
          <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
            <div className="font-medium text-gray-800">Nhà hàng không ưa {i}</div>
            <button className="text-sm text-gray-500 hover:text-gray-700">Gỡ khỏi blacklist</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StarsTab;

