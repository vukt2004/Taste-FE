import React, { useState, useEffect, useRef } from 'react';
import { toggleFavourite } from '../../services/favourite';
import { toggleBlacklist } from '../../services/blacklist';
import { toggleReviewLike, toggleReviewDislike, createReview } from '../../services/review';
import AlertModal from './contribution/AlertModal';

interface RestaurantDish {
  id: string;
  dishId: string;
  dishName: string;
}

interface Amenity {
  id: string;
  name: string;
  isActive: boolean;
}

interface Review {
  id: string;
  restaurantId: string;
  reviewerDisplayName: string;
  rating: number;
  content?: string;
  reviewScore: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  createdAt?: string;
}

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
  ownerId?: string;
  dishes?: RestaurantDish[];
  restaurantAmenities?: Amenity[];
  isFavourite?: boolean;
  isBlacklisted?: boolean;
  myReview?: Review;
  reviews?: Review[];
  totalReviews?: number;
  averageRating?: number;
}

interface RestaurantTabProps {
  restaurant?: Restaurant | null;
  lastFilterKeywords?: {
    dishIds?: string[];
    amenityIds?: string[];
  };
  onRestaurantRefresh?: () => void;
  user?: { id: string; username: string } | null;
}

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const [isLiked, setIsLiked] = useState(review.userLiked ?? false);
  const [isDisliked, setIsDisliked] = useState(review.userDisliked ?? false);
  const [reviewScore, setReviewScore] = useState(review.reviewScore);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await toggleReviewLike(review.id);
      if (response?.data) {
        setReviewScore(response.data.reviewScore ?? reviewScore);
        setIsLiked(response.data.isLiked ?? !isLiked);
        // Backend tự động xóa dislike nếu có, nên cập nhật state
        if (response.data.isLiked) {
          setIsDisliked(false);
        }
      } else {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await toggleReviewDislike(review.id);
      if (response?.data) {
        setReviewScore(response.data.reviewScore ?? reviewScore);
        setIsDisliked(response.data.isDisliked ?? !isDisliked);
        // Backend tự động xóa like nếu có, nên cập nhật state
        if (response.data.isDisliked) {
          setIsLiked(false);
        }
      } else {
        setIsDisliked(!isDisliked);
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <div className="border-b border-gray-200 pb-3 last:border-b-0">
      {/* Header: Name - Stars - Date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">{review.reviewerDisplayName}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-sm ${star <= Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
        </div>
        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
      </div>

      {/* Content */}
      {review.content ? (
        <div className="text-sm text-gray-700 mb-2 min-h-[1.5rem]">{review.content}</div>
      ) : (
        <div className="text-sm text-gray-400 italic mb-2 min-h-[1.5rem]">Không có nội dung đánh giá</div>
      )}

      {/* Like/Dislike and Score */}
      {/* Sắp xếp: nút đã active (đã like/dislike) hiển thị trước */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
        {isLiked ? (
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs transition-colors flex items-center gap-0.5 sm:gap-1 bg-blue-500 text-white hover:bg-blue-600 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-xs sm:text-sm">👍</span>
            <span>Like</span>
          </button>
        ) : null}
        {isDisliked ? (
          <button
            onClick={handleDislike}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs transition-colors flex items-center gap-0.5 sm:gap-1 bg-red-500 text-white hover:bg-red-600 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-xs sm:text-sm">👎</span>
            <span>Dislike</span>
          </button>
        ) : null}
        {!isLiked && (
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs transition-colors flex items-center gap-0.5 sm:gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-xs sm:text-sm">👍</span>
            <span>Like</span>
          </button>
        )}
        {!isDisliked && (
          <button
            onClick={handleDislike}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs transition-colors flex items-center gap-0.5 sm:gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-xs sm:text-sm">👎</span>
            <span>Dislike</span>
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          Điểm: {reviewScore}
        </span>
      </div>
    </div>
  );
};

const RestaurantTab: React.FC<RestaurantTabProps> = ({ restaurant, lastFilterKeywords, onRestaurantRefresh, user }) => {
  const [showAllDishes, setShowAllDishes] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isFavourite, setIsFavourite] = useState(restaurant?.isFavourite ?? false);
  const [isBlacklisted, setIsBlacklisted] = useState(restaurant?.isBlacklisted ?? false);
  const [isLoadingFavourite, setIsLoadingFavourite] = useState(false);
  const [isLoadingBlacklist, setIsLoadingBlacklist] = useState(false);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Track previous restaurant to detect changes - using ID and important fields instead of object reference
  const prevRestaurantIdRef = useRef<string | null>(null);
  const prevFavouriteRef = useRef<boolean | null>(null);
  const prevBlacklistedRef = useRef<boolean | null>(null);
  const isFirstRender = useRef(true);
  
  // Load initial state from API response - luôn load khi restaurant prop thay đổi
  useEffect(() => {
    if (!restaurant) {
      setIsFavourite(false);
      setIsBlacklisted(false);
      prevRestaurantIdRef.current = null;
      prevFavouriteRef.current = null;
      prevBlacklistedRef.current = null;
      return;
    }
    
    const currentRestaurantId = restaurant.id;
    const currentFavourite = restaurant.isFavourite ?? false;
    const currentBlacklisted = restaurant.isBlacklisted ?? false;
    
    // Chỉ update khi restaurant ID thay đổi hoặc lần đầu render
    const restaurantIdChanged = prevRestaurantIdRef.current !== currentRestaurantId;
    
    if (restaurantIdChanged || isFirstRender.current) {
      setIsFavourite(currentFavourite);
      setIsBlacklisted(currentBlacklisted);
      
      // Update refs
      prevRestaurantIdRef.current = currentRestaurantId;
      prevFavouriteRef.current = currentFavourite;
      prevBlacklistedRef.current = currentBlacklisted;
      isFirstRender.current = false;
    } else {
      // Nếu restaurant ID không đổi nhưng giá trị từ API thay đổi, cập nhật
      if (prevFavouriteRef.current !== currentFavourite) {
        setIsFavourite(currentFavourite);
        prevFavouriteRef.current = currentFavourite;
      }
      if (prevBlacklistedRef.current !== currentBlacklisted) {
        setIsBlacklisted(currentBlacklisted);
        prevBlacklistedRef.current = currentBlacklisted;
      }
    }
  }, [restaurant]);
  

  const handleToggleFavourite = async () => {
    if (!restaurant || isLoadingFavourite) return;
    
    setIsLoadingFavourite(true);
    try {
      const result = await toggleFavourite(restaurant.id);
      setIsFavourite(result.isFavourite);
      // Refresh restaurant data để đảm bảo trạng thái đồng bộ
      if (onRestaurantRefresh) {
        await onRestaurantRefresh();
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    } finally {
      setIsLoadingFavourite(false);
    }
  };

  const handleToggleBlacklist = async () => {
    if (!restaurant || isLoadingBlacklist) return;
    
    setIsLoadingBlacklist(true);
    try {
      const result = await toggleBlacklist(restaurant.id);
      setIsBlacklisted(result.isBlacklisted);
      // Refresh restaurant data để đảm bảo trạng thái đồng bộ
      if (onRestaurantRefresh) {
        await onRestaurantRefresh();
      }
    } catch (error) {
      console.error('Error toggling blacklist:', error);
    } finally {
      setIsLoadingBlacklist(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!restaurant || isSubmittingReview) return;
    
    setIsSubmittingReview(true);
    try {
      await createReview({
        restaurantId: restaurant.id,
        rating: reviewRating,
        content: reviewContent || undefined
      });
      
      // Reset form
      setReviewRating(5);
      setReviewContent('');
      
      // Refresh restaurant data instead of reloading page
      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: 'Đánh giá đã được gửi thành công! Đang chờ admin duyệt.',
        type: 'success',
      });
      onRestaurantRefresh?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
          <div className="p-3 bg-white rounded-lg border border-gray-200 relative">
            {/* Nút Yêu thích và Blacklist - chỉ hiển thị khi đã đăng nhập */}
            {/* Sắp xếp: nút đã active (đã thực hiện) hiển thị trước */}
            {user && (
              <div className="absolute top-3 right-3 flex gap-2">
                {isFavourite ? (
                  <button
                    onClick={handleToggleFavourite}
                    disabled={isLoadingFavourite}
                    className={`p-2 rounded-full transition-colors bg-yellow-100 text-yellow-600 hover:bg-yellow-200 ${
                      isLoadingFavourite ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Bỏ yêu thích"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ) : null}
                {isBlacklisted ? (
                  <button
                    onClick={handleToggleBlacklist}
                    disabled={isLoadingBlacklist}
                    className={`p-2 rounded-full transition-colors bg-red-100 text-red-600 hover:bg-red-200 ${
                      isLoadingBlacklist ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Bỏ cấm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : null}
                {!isFavourite && (
                  <button
                    onClick={handleToggleFavourite}
                    disabled={isLoadingFavourite}
                    className={`p-2 rounded-full transition-colors bg-gray-100 text-gray-400 hover:bg-gray-200 ${
                      isLoadingFavourite ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Yêu thích"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                )}
                {!isBlacklisted && (
                  <button
                    onClick={handleToggleBlacklist}
                    disabled={isLoadingBlacklist}
                    className={`p-2 rounded-full transition-colors bg-gray-100 text-gray-400 hover:bg-gray-200 ${
                      isLoadingBlacklist ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Cấm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            <div className={`font-semibold text-gray-800 mb-2 text-[30px] ${user ? 'pr-20' : ''}`}>{restaurant.restaurantName}</div>
            
            {/* Average Rating */}
            {restaurant.averageRating !== undefined && restaurant.totalReviews !== undefined && restaurant.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-2xl ${star <= Math.round(restaurant.averageRating!) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-700">
                  {restaurant.averageRating.toFixed(1)} ({restaurant.totalReviews} đánh giá)
                </span>
              </div>
            )}
            
            {restaurant.description && (
              <div className="text-gray-600 mb-3 text-[14px]">{restaurant.description}</div>
            )}
            
            {restaurant.story && (
              <div className="text-gray-600 mb-3 italic text-[14px]">
                <span className="font-medium">Câu chuyện:</span> {restaurant.story}
              </div>
            )}
            
            {restaurant.priceRange && (
              <div className="text-gray-500 mb-1 text-[14px]">
                <span className="font-medium">Khoảng giá:</span> {restaurant.priceRange}
              </div>
            )}
            
            {restaurant.operatingHours && (() => {
              const hours = parseOperatingHours(restaurant.operatingHours);
              return hours ? (
                <div className="text-gray-500 mb-1 text-[14px]">
                  <span className="font-medium">Giờ mở cửa:</span> {typeof hours === 'string' ? hours : JSON.stringify(hours)}
                </div>
              ) : null;
            })()}
            
            {restaurant.amenities && (() => {
              const amenities = parseAmenities(restaurant.amenities);
              return amenities.length > 0 ? (
                <div className="text-gray-500 mb-1 text-[14px]">
                  <span className="font-medium">Tiện ích:</span> {amenities.map((a) => (typeof a === 'object' && a.name ? a.name : String(a))).join(', ')}
                </div>
              ) : null;
            })()}
            
            {/* Món ăn */}
            {restaurant.dishes && restaurant.dishes.length > 0 && (
              <div className="mb-3">
                <div className="font-medium text-gray-500 mb-1 text-[14px]">Món ăn:</div>
                <div className="flex flex-wrap gap-0.5">
                  {(showAllDishes ? restaurant.dishes : restaurant.dishes.slice(0, 5)).map((d, index) => {
                    const isMatched = lastFilterKeywords?.dishIds?.includes(d.dishId);
                    return (
                      <div 
                        key={`${d.dishId}-${index}`} 
                        className={`h-[25px] px-2 flex items-center justify-center rounded-lg text-[16px] ${
                          isMatched ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {d.dishName}
                      </div>
                    );
                  })}
                  {restaurant.dishes.length > 5 && (
                    <button
                      onClick={() => setShowAllDishes(!showAllDishes)}
                      className="h-[25px] w-[25px] flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-[16px] hover:bg-gray-300"
                    >
                      {showAllDishes ? '-' : '+'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Tiện ích */}
            {restaurant.restaurantAmenities && restaurant.restaurantAmenities.length > 0 && (
              <div className="mb-3">
                <div className="font-medium text-gray-500 mb-1 text-[14px]">Tiện ích:</div>
                <div className="flex flex-wrap gap-0.5">
                  {(showAllAmenities ? restaurant.restaurantAmenities : restaurant.restaurantAmenities.slice(0, 5)).map((a, index) => {
                    const isMatched = lastFilterKeywords?.amenityIds?.includes(a.id);
                    return (
                      <div 
                        key={`${a.id}-${index}`} 
                        className={`h-[25px] px-2 flex items-center justify-center rounded-lg text-[16px] ${
                          isMatched ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {a.name}
                      </div>
                    );
                  })}
                  {restaurant.restaurantAmenities.length > 5 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="h-[25px] w-[25px] flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-[16px] hover:bg-gray-300"
                    >
                      {showAllAmenities ? '-' : '+'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {restaurant.images && (() => {
              const images = parseImages(restaurant.images);
              return images.length > 0 ? (
                <div className="mt-3">
                  <div className="text-gray-500 mb-2 font-medium text-[14px]">Hình ảnh:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, idx) => (
                      <img key={idx} src={img} alt={`${restaurant.restaurantName} ${idx + 1}`} className="w-auto max-h-[150px] object-contain rounded border border-gray-300" />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
          
          {/* Hiển thị đánh giá của bản thân */}
          {restaurant.myReview && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-800 mb-2 text-[14px]">Đánh giá của bạn</div>
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  <span className="font-medium">Đánh giá:</span> {restaurant.myReview.rating}/5
                </div>
                {restaurant.myReview.content && (
                  <div className="mb-1">
                    <span className="font-medium">Nội dung:</span> {restaurant.myReview.content}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Điểm review:</span> {restaurant.myReview.reviewScore}
                </div>
              </div>
            </div>
          )}
          
          {/* Hiển thị thống kê đánh giá */}
          {restaurant.totalReviews !== undefined && restaurant.totalReviews > 0 && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-800 mb-2 text-[14px]">Đánh giá ({restaurant.totalReviews})</div>
              {restaurant.averageRating !== undefined && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Điểm trung bình:</span> {restaurant.averageRating.toFixed(1)}/5
                </div>
              )}
            </div>
          )}
          
          {/* Hiển thị tất cả review */}
          {restaurant.reviews && restaurant.reviews.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-800 mb-2 text-[14px]">Tất cả đánh giá</div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                {restaurant.reviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
          
          {/* Form viết đánh giá - chỉ hiển thị nếu chưa có review, đã đăng nhập và không phải chủ quán */}
          {!restaurant.myReview && !(user && restaurant.ownerId && user.id === restaurant.ownerId) && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">Vui lòng đăng nhập để viết đánh giá</p>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : (
                <>
                  <div className="font-medium text-gray-800 mb-2 text-[14px]">Viết đánh giá</div>
              
              {/* Rating selection */}
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Đánh giá (1-5 sao)</label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded border text-xs sm:text-sm ${
                        reviewRating === rating
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {rating} ⭐
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Content textarea */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                />
              </div>
              
              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-600 ${
                    isSubmittingReview ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="font-semibold text-gray-800 text-[14px]">Chưa chọn địa điểm</div>
          <div className="text-gray-500 text-[14px]">Hãy chọn một marker trên bản đồ để xem chi tiết.</div>
        </div>
      )}
      
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default RestaurantTab;

