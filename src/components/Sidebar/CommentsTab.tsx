import React from 'react';

interface Restaurant {
  id: string;
  restaurantName: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  operatingHours?: string;
  amenities?: string;
  story?: string;
  images?: string;
  verificationStatus?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ownerName?: string;
}

interface CommentsTabProps {
  restaurant?: Restaurant | null;
}

const CommentsTab: React.FC<CommentsTabProps> = ({ restaurant }) => {
  const parseAmenities = (amenities: string | undefined): Array<{ name: string } | string> => {
    if (!amenities) return [];
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseOperatingHours = (hours: string | undefined) => {
    if (!hours) return null;
    try {
      const parsed = JSON.parse(hours);
      return parsed;
    } catch {
      return hours;
    }
  };

  const parseImages = (images: string | undefined): string[] => {
    if (!images) return [];
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Try to split by comma if it's a comma-separated string
      return images.split(',').map(img => img.trim()).filter(img => img);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Chi tiết & Bình luận</h3>
      
      {restaurant ? (
        <>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="font-semibold text-gray-800 mb-2">{restaurant.restaurantName}</div>
            
            {restaurant.description && (
              <div className="text-sm text-gray-600 mb-3">{restaurant.description}</div>
            )}
            
            {restaurant.story && (
              <div className="text-sm text-gray-600 mb-3 italic">
                <span className="font-medium">Câu chuyện:</span> {restaurant.story}
              </div>
            )}
            
            {restaurant.priceRange && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">Khoảng giá:</span> {restaurant.priceRange}
              </div>
            )}
            
            {restaurant.operatingHours && (() => {
              const hours = parseOperatingHours(restaurant.operatingHours);
              return hours ? (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-medium">Giờ mở cửa:</span> {typeof hours === 'string' ? hours : JSON.stringify(hours)}
                </div>
              ) : null;
            })()}
            
            {restaurant.amenities && (() => {
              const amenities = parseAmenities(restaurant.amenities);
              return amenities.length > 0 ? (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-medium">Tiện ích:</span> {amenities.map((a) => (typeof a === 'object' && a.name ? a.name : String(a))).join(', ')}
                </div>
              ) : null;
            })()}
            
            {restaurant.ownerName && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">Chủ sở hữu:</span> {restaurant.ownerName}
              </div>
            )}
            
            {restaurant.isVerified && (
              <div className="text-xs text-blue-600 font-medium mt-2">
                ✓ Đã xác minh
              </div>
            )}
            
            {restaurant.images && (() => {
              const images = parseImages(restaurant.images);
              return images.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-2 font-medium">Hình ảnh:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, idx) => (
                      <img key={idx} src={img} alt={`${restaurant.restaurantName} ${idx + 1}`} className="w-auto max-h-[150px] object-contain rounded border border-gray-300" />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
          
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="font-medium text-gray-800 mb-2">Viết đánh giá</div>
            <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm" rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
            <div className="mt-2 flex justify-end">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Gửi đánh giá</button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="font-semibold text-gray-800">Chưa chọn địa điểm</div>
          <div className="text-xs text-gray-500">Hãy chọn một marker trên bản đồ để xem chi tiết.</div>
        </div>
      )}
    </div>
  );
};

export default CommentsTab;

