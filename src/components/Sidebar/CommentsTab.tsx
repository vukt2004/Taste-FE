import React, { useState, useEffect, useRef } from 'react';
import { toggleFavourite } from '../../services/favourite';
import { toggleBlacklist } from '../../services/blacklist';
import { toggleReviewLike, toggleReviewDislike, createReview, uploadReviewImages } from '../../services/review';

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
  images?: string;
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
  dishes?: RestaurantDish[];
  restaurantAmenities?: Amenity[];
  isFavourite?: boolean;
  isBlacklisted?: boolean;
  myReview?: Review;
  reviews?: Review[];
  totalReviews?: number;
  averageRating?: number;
}

interface CommentsTabProps {
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
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await toggleReviewLike(review.id);
      if (isDisliked) {
        await toggleReviewDislike(review.id);
        setIsDisliked(false);
      }
      setIsLiked(!isLiked);
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
      await toggleReviewDislike(review.id);
      if (isLiked) {
        await toggleReviewLike(review.id);
        setIsLiked(false);
      }
      setIsDisliked(!isDisliked);
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

  const images = review.images ? (() => {
    try {
      console.log('Review images raw:', review.images);
      const parsed = JSON.parse(review.images);
      console.log('Review images parsed:', parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing review images:', e);
      return [];
    }
  })() : [];
  
  console.log('Review item data:', {
    id: review.id,
    images: review.images,
    parsedImages: images,
    content: review.content
  });

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

      {/* Content and Image */}
      <div className="flex gap-3">
        {/* Left: Content */}
        <div className="flex-1">
          {review.content && (
            <div className="text-sm text-gray-600 mb-2">{review.content}</div>
          )}
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mb-2">
              <img 
                src={images[0]} 
                alt="Review" 
                className="w-24 h-24 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>
        
        {/* Right: Stars */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-gray-500">Đánh giá</div>
          <div className="flex flex-col items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-lg ${star <= Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Like/Dislike and Score */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs transition-colors flex items-center gap-0.5 sm:gap-1 ${
            isLiked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-xs sm:text-sm">👍</span>
          <span>Like</span>
        </button>
        <button
          onClick={handleDislike}
          disabled={isLoading}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs transition-colors flex items-center gap-0.5 sm:gap-1 ${
            isDisliked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-xs sm:text-sm">👎</span>
          <span>Dislike</span>
        </button>
        <span className="text-xs text-gray-500 ml-auto">
          Điểm: {review.reviewScore}
        </span>
      </div>
    </div>
  );
};

const CommentsTab: React.FC<CommentsTabProps> = ({ restaurant, lastFilterKeywords, onRestaurantRefresh, user }) => {
  const [showAllDishes, setShowAllDishes] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isLoadingFavourite, setIsLoadingFavourite] = useState(false);
  const [isLoadingBlacklist, setIsLoadingBlacklist] = useState(false);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial state from API response
  useEffect(() => {
    if (restaurant) {
      setIsFavourite(restaurant.isFavourite ?? false);
      setIsBlacklisted(restaurant.isBlacklisted ?? false);
    }
  }, [restaurant]);

  const handleToggleFavourite = async () => {
    if (!restaurant || isLoadingFavourite) return;
    
    setIsLoadingFavourite(true);
    try {
      const result = await toggleFavourite(restaurant.id);
      setIsFavourite(result.isFavourite);
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
      // Upload image if selected
      let imageUrl: string | undefined;
      if (reviewImage) {
        const urls = await uploadReviewImages([reviewImage]);
        imageUrl = urls[0];
      }
      
      await createReview({
        restaurantId: restaurant.id,
        rating: reviewRating,
        content: reviewContent || undefined,
        images: imageUrl ? JSON.stringify([imageUrl]) : undefined
      });
      
      // Reset form
      setReviewRating(5);
      setReviewContent('');
      setReviewImage(null);
      setReviewImagePreview(null);
      
      // Refresh restaurant data instead of reloading page
      alert('Đánh giá đã được gửi thành công! Đang chờ admin duyệt.');
      onRestaurantRefresh?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReviewImage(null);
    setReviewImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            {user && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={handleToggleFavourite}
                  disabled={isLoadingFavourite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavourite ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  } ${isLoadingFavourite ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isFavourite ? 'Bỏ yêu thích' : 'Yêu thích'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
                <button
                  onClick={handleToggleBlacklist}
                  disabled={isLoadingBlacklist}
                  className={`p-2 rounded-full transition-colors ${
                    isBlacklisted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  } ${isLoadingBlacklist ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isBlacklisted ? 'Bỏ cấm' : 'Cấm'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
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
          {restaurant.myReview && (() => {
            console.log('My review data:', restaurant.myReview);
            return (
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
                {restaurant.myReview.images && (
                  <div className="mb-1">
                    <span className="font-medium">Hình ảnh:</span> {restaurant.myReview.images}
      </div>
                )}
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Điểm review:</span> {restaurant.myReview.reviewScore}
        </div>
      </div>
            </div>
            );
          })()}
          
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
          {restaurant.reviews && restaurant.reviews.length > 0 && (() => {
            console.log('Restaurant reviews:', restaurant.reviews);
            return (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="font-medium text-gray-800 mb-2 text-[14px]">Tất cả đánh giá</div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {restaurant.reviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            </div>
            );
          })()}
          
          {/* Form viết đánh giá - chỉ hiển thị nếu chưa có review và đã đăng nhập */}
          {!restaurant.myReview && (
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
              
              {/* Image upload */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh (tùy chọn, tối đa 1 ảnh)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {reviewImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={reviewImagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Chọn ảnh
                  </button>
                )}
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
    </div>
  );
};

export default CommentsTab;

