import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviewsByRestaurant, approveReview, rejectReview, deleteReview, type Review } from '../../services/reviewManagement';
import AlertModal from './contribution/AlertModal';

interface Restaurant {
  id: string;
  restaurantName: string;
}

interface CommentManagementTabProps {
  restaurant: Restaurant | null;
  onUpdate: () => void;
}

const CommentManagementTab: React.FC<CommentManagementTabProps> = ({ restaurant, onUpdate }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const loadReviews = useCallback(async () => {
    if (!restaurant) return;
    
    setIsLoading(true);
    try {
      const allReviews = await getAllReviewsByRestaurant(restaurant.id);
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải danh sách comment',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [restaurant]);

  useEffect(() => {
    if (restaurant) {
      loadReviews();
    } else {
      setReviews([]);
    }
  }, [restaurant, loadReviews]);

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview(reviewId);
      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: 'Comment đã được duyệt và hiển thị',
        type: 'success',
      });
      loadReviews();
      onUpdate();
    } catch (error) {
      console.error('Error approving review:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể duyệt comment',
        type: 'error',
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await rejectReview(reviewId);
      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: 'Comment đã được từ chối.',
        type: 'success',
      });
      loadReviews();
      onUpdate();
    } catch (error) {
      console.error('Error rejecting review:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể từ chối comment',
        type: 'error',
      });
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: 'Comment đã được xóa hoàn toàn khỏi hệ thống',
        type: 'success',
      });
      loadReviews();
      onUpdate();
    } catch (error) {
      console.error('Error deleting review:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể xóa comment',
        type: 'error',
      });
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

  if (!restaurant) {
    return (
      <div className="p-4 text-center text-gray-500">
        Vui lòng chọn quán ăn để quản lý comment
      </div>
    );
  }

  const approvedReviews = reviews.filter(r => r.isApproved === true);
  const rejectedReviews = reviews.filter(r => r.isApproved === false);
  const pendingReviews = reviews.filter(r => r.isApproved === null || r.isApproved === undefined);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Quản lí comment</h3>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-4 flex gap-4 text-sm flex-wrap">
          <div className="text-gray-600">
            Tổng số: <span className="font-semibold">{reviews.length}</span>
          </div>
          <div className="text-green-600">
            Đã duyệt: <span className="font-semibold">{approvedReviews.length}</span>
          </div>
          <div className="text-orange-600">
            Chờ duyệt: <span className="font-semibold">{pendingReviews.length}</span>
          </div>
          <div className="text-red-600">
            Đã từ chối: <span className="font-semibold">{rejectedReviews.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Chưa có comment nào</div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
            {reviews.map((review) => {
              const isApproved = review.isApproved === true;
              const isRejected = review.isApproved === false;
              const isPending = review.isApproved === null || review.isApproved === undefined;

              return (
                <div
                  key={review.id}
                  className={`border rounded-lg p-3 ${
                    isApproved 
                      ? 'bg-green-50 border-green-200' 
                      : isRejected 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-800">{review.reviewerDisplayName}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xs ${
                                star <= Math.round(review.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isApproved
                            ? 'bg-green-200 text-green-800'
                            : isRejected
                            ? 'bg-red-200 text-red-800'
                            : 'bg-orange-200 text-orange-800'
                        }`}>
                          {isApproved ? 'Đã hiển thị' : isRejected ? 'Đã từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  {review.content && (
                    <div className="text-sm text-gray-700 mb-2">{review.content}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Hiển thị
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                    {isApproved && (
                      <span className="text-xs text-gray-500">
                        Comment đã được hiển thị, không thể chỉnh sửa hoặc xóa
                      </span>
                    )}
                    {isRejected && (
                      <>
                        <span className="text-xs text-gray-500 mr-2">
                          Comment đã bị từ chối, không thể chỉnh sửa
                        </span>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Xóa vĩnh viễn
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
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

export default CommentManagementTab;

