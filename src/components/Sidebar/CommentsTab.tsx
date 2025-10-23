import React from 'react';

const CommentsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Chi tiết & Bình luận</h3>
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="font-semibold text-gray-800">Chưa chọn địa điểm</div>
        <div className="text-xs text-gray-500">Hãy chọn một marker trên bản đồ để xem chi tiết.</div>
      </div>
      <div className="p-3 bg-white rounded-lg border border-gray-200">
        <div className="font-medium text-gray-800 mb-2">Viết đánh giá</div>
        <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
        <div className="mt-2 flex justify-end">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Gửi đánh giá</button>
        </div>
      </div>
    </div>
  );
};

export default CommentsTab;

