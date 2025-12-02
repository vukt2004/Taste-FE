import React, { useState, useEffect } from 'react';
import { BACKEND_URL, API_ENDPOINTS } from '../../config/backend';
import { listDishes } from '../../services/dish';
import { listAmenities } from '../../services/amenity';
import { UserService } from '../../services/userService';
import { createRestaurantOwnershipRequest } from '../../services/restaurantOwnership';
import { uploadReviewImages } from '../../services/review';
import { createQRPayment, type QRPaymentResponse } from '../../services/payment';
import ContributionButtons from './contribution/ContributionButtons';
import ContributionModal from './contribution/ContributionModal';
import DishContributionForm from './contribution/DishContributionForm';
import RestaurantContributionForm from './contribution/RestaurantContributionForm';
import ClaimRestaurantForm from './contribution/ClaimRestaurantForm';
import AlertModal from './contribution/AlertModal';

type ContributionType = 'dish' | 'restaurant';

interface Amenity {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
}

// interface DishType {
//   id: string;
//   typeName: string;
// }

interface ContributionsTabProps {
  mapCenter?: { lat: number; lng: number };
  onShowCenterMarkerChange?: (show: boolean) => void;
  selectedRestaurantForClaim?: { id: string; name: string } | null;
  onRestaurantSelectedForClaim?: (restaurant: { id: string; name: string } | null) => void;
  onClaimModeChange?: (isClaimMode: boolean) => void;
  user?: { id: string; username: string } | null;
  onTabChange?: (tab: 'explore' | 'comments' | 'contributions' | 'user') => void;
}

const ContributionsTab: React.FC<ContributionsTabProps> = ({ mapCenter, onShowCenterMarkerChange, selectedRestaurantForClaim: propSelectedRestaurant, onRestaurantSelectedForClaim, onClaimModeChange, user, onTabChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [contributionType, setContributionType] = useState<ContributionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  // Dish form states
  const [dishNames, setDishNames] = useState<string[]>([]);
  // const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [selectedDishTypeIds, setSelectedDishTypeIds] = useState<string[]>([]);
  // const [dishTypeSearchTerm, setDishTypeSearchTerm] = useState('');
  
  // Restaurant form states
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [priceRange, setPriceRange] = useState('');
  const [operatingHours, setOperatingHours] = useState<{ open: string; close: string }>({ open: '', close: '' });
  const [story, setStory] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [amenitySearchTerm, setAmenitySearchTerm] = useState('');
  const [dishSearchTerm, setDishSearchTerm] = useState('');
  
  // Claim form states
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  // Notify parent when claim mode changes
  useEffect(() => {
    onClaimModeChange?.(showClaimModal);
  }, [showClaimModal, onClaimModeChange]);
  const selectedRestaurantForClaim = propSelectedRestaurant;
  const [claimBusinessRelationship, setClaimBusinessRelationship] = useState('');
  const [claimAdditionalInfo, setClaimAdditionalInfo] = useState('');
  const [claimProofImages, setClaimProofImages] = useState<File[]>([]);
  const [claimImagePreviews, setClaimImagePreviews] = useState<string[]>([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [qrPaymentData, setQrPaymentData] = useState<QRPaymentResponse | null>(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  
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

  const openModal = (type: ContributionType) => {
    setContributionType(type);
    setShowModal(true);
    // Set default location from map center
    if (mapCenter && type === 'restaurant') {
      setSelectedLocation(mapCenter);
    }
  };

  // Update location when map center changes (for restaurant contribution)
  useEffect(() => {
    if (showModal && contributionType === 'restaurant' && mapCenter) {
      setSelectedLocation(mapCenter);
    }
  }, [mapCenter, showModal, contributionType]);

  // Show/hide center marker based on contribution type
  useEffect(() => {
    if (showModal && contributionType === 'restaurant') {
      onShowCenterMarkerChange?.(true);
    } else {
      onShowCenterMarkerChange?.(false);
    }
  }, [showModal, contributionType, onShowCenterMarkerChange]);

  const closeModal = () => {
    setShowModal(false);
    setContributionType(null);
    // Reset form states
    setDishNames([]);
    setSelectedDishTypeIds([]);
    // setDishTypeSearchTerm('');
    setRestaurantName('');
    setRestaurantDescription('');
    setSelectedLocation(null);
    setPriceRange('');
    setOperatingHours({ open: '', close: '' });
    setStory('');
    setSelectedAmenityIds([]);
    setAmenitySearchTerm('');
    setImages([]);
    setSelectedDishIds([]);
    setDishSearchTerm('');
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Fetch amenities on component mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await listAmenities({ activeOnly: true });
        const data = res?.data ?? res ?? [];
        setAmenities(data);
      } catch {
        // Silently handle error
      }
    };
    fetchAmenities();
  }, []);

  // Fetch dish types on component mount
  // useEffect(() => {
  //   const fetchDishTypes = async () => {
  //     try {
  //       const res = await listDishTypes();
  //       const data = res?.data ?? res ?? [];
  //       setDishTypes(data);
  //     } catch {
  //       // Silently handle error
  //     }
  //   };
  //   fetchDishTypes();
  // }, []);

  // Fetch dishes on component mount (for restaurant form only)
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await listDishes();
        const data = res?.data ?? res ?? [];
        setDishes(data);
      } catch {
        // Silently handle error
      }
    };
    fetchDishes();
  }, []);

  const handleSubmitDish = async () => {
    if (dishNames.length === 0) {
      setSubmitError('Vui lòng thêm ít nhất một món ăn');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Gửi từng món ăn một
      const results = [];
      for (const dishName of dishNames) {
    try {
      const response = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.DISH_CONTRIBUTION.CREATE}`, {
        method: 'POST',
        headers: UserService.getAuthHeaders(),
        body: JSON.stringify({
          name: dishName,
          typeIds: selectedDishTypeIds
        }),
      });

      const data = await response.json();
          results.push({ name: dishName, success: response.ok && data.isSuccess, message: data.message });
        } catch {
          results.push({ name: dishName, success: false, message: 'Lỗi kết nối' });
        }
      }

      // Kiểm tra kết quả
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      if (failedCount === 0) {
        setSubmitSuccess(`Đã gửi thành công ${successCount} món ăn!`);
        setDishNames([]);
      } else if (successCount > 0) {
        setSubmitError(`Gửi thành công ${successCount}/${results.length} món ăn. Có ${failedCount} món thất bại.`);
      } else {
        setSubmitError('Gửi yêu cầu thất bại. Vui lòng thử lại.');
      }
    } catch {
      setSubmitError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRestaurant = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Format operating hours - string đơn giản
      let formattedHours = '';
      if (operatingHours.open && operatingHours.close) {
        formattedHours = `${operatingHours.open}-${operatingHours.close}`;
      }

      // Format amenities
      const formattedAmenities = selectedAmenityIds.map(id => ({ amenityId: id }));

      const token = localStorage.getItem('auth_token');
      
      // Validate coordinates
      if (selectedLocation?.lat && (selectedLocation.lat < -90 || selectedLocation.lat > 90)) {
        setSubmitError(`Tọa độ không hợp lệ: Vĩ độ phải trong khoảng -90 đến 90 (nhận được: ${selectedLocation.lat})`);
        setIsSubmitting(false);
        return;
      }
      if (selectedLocation?.lng && (selectedLocation.lng < -180 || selectedLocation.lng > 180)) {
        setSubmitError(`Tọa độ không hợp lệ: Kinh độ phải trong khoảng -180 đến 180 (nhận được: ${selectedLocation.lng})`);
        setIsSubmitting(false);
        return;
      }
      
      // Prepare FormData
      const formData = new FormData();
      formData.append('restaurantName', restaurantName);
      if (restaurantDescription) formData.append('description', restaurantDescription);
      // Format coordinates with fixed decimal places and use dot separator (not comma)
      if (selectedLocation?.lat) formData.append('latitude', selectedLocation.lat.toFixed(8));
      if (selectedLocation?.lng) formData.append('longitude', selectedLocation.lng.toFixed(8));
      if (priceRange) formData.append('priceRange', priceRange);
      if (formattedHours) formData.append('operatingHours', formattedHours);
      if (story) formData.append('story', story);
      if (formattedAmenities.length > 0) formData.append('amenities', JSON.stringify(formattedAmenities));
      if (selectedDishIds.length > 0) formData.append('dishIds', JSON.stringify(selectedDishIds));
      
      // Add images
      images.forEach(image => {
        formData.append('images', image);
      });

      const headers: HeadersInit = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANT_CONTRIBUTION.CREATE}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok && (data.isSuccess || data.success)) {
        setSubmitSuccess('Đã gửi yêu cầu đóng góp quán ăn thành công!');
      } else {
        if (response.status === 401) {
          setSubmitError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setSubmitError(data.message || 'Gửi yêu cầu thất bại');
        }
      }
    } catch {
      setSubmitError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleClaimImageSelect = (files: File[]) => {
      setClaimProofImages(files);
      const newPreviews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setClaimImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const handleRemoveClaimImage = (index: number) => {
    setClaimProofImages(prev => prev.filter((_, i) => i !== index));
    setClaimImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClaim = async () => {
    if (!selectedRestaurantForClaim || isSubmittingClaim) return;
    
    if (!claimBusinessRelationship.trim()) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Vui lòng điền mối quan hệ kinh doanh',
        type: 'error',
      });
      return;
    }
    
    setIsSubmittingClaim(true);
    try {
      // Upload proof images if any
      let proofImageUrls: string[] = [];
      if (claimProofImages.length > 0) {
        const urls = await uploadReviewImages(claimProofImages);
        proofImageUrls = urls;
      }
      
      await createRestaurantOwnershipRequest({
        restaurantId: selectedRestaurantForClaim.id,
        businessRelationship: claimBusinessRelationship,
        additionalInfo: claimAdditionalInfo || undefined,
        proofImages: proofImageUrls.length > 0 ? JSON.stringify(proofImageUrls) : undefined
      });
      
      // Tạo QR code để thanh toán 10k
      try {
        const qrData = await createQRPayment({
          description: selectedRestaurantForClaim.id // Nội dung chuyển khoản là ID của quán ăn
        });
        setQrPaymentData(qrData);
        setShowQRPayment(true);
      } catch {
        // Vẫn hiển thị thông báo thành công dù QR tạo thất bại
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Yêu cầu xét duyệt chủ quán ăn đã được gửi thành công! Đang chờ admin xét duyệt.',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi yêu cầu claim. Vui lòng thử lại.';
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Đóng góp</h3>
      
      {!user ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800 mb-2">Vui lòng đăng nhập để đóng góp</p>
          <button
            onClick={() => onTabChange?.('user')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
          >
            Đăng nhập
          </button>
        </div>
      ) : !showModal && !showClaimModal ? (
        <ContributionButtons
          onOpenDishModal={() => openModal('dish')}
          onOpenRestaurantModal={() => openModal('restaurant')}
          onOpenClaimModal={() => setShowClaimModal(true)}
        />
      ) : showClaimModal ? (
        <ContributionModal
          title="Xác nhận quán ăn"
          onClose={() => {
                setShowClaimModal(false);
                onRestaurantSelectedForClaim?.(null);
                setClaimBusinessRelationship('');
                setClaimAdditionalInfo('');
                setClaimProofImages([]);
                setClaimImagePreviews([]);
              }}
        >
          <ClaimRestaurantForm
            selectedRestaurantForClaim={selectedRestaurantForClaim ?? null}
            claimBusinessRelationship={claimBusinessRelationship}
            onClaimBusinessRelationshipChange={setClaimBusinessRelationship}
            claimAdditionalInfo={claimAdditionalInfo}
            onClaimAdditionalInfoChange={setClaimAdditionalInfo}
            claimProofImages={claimProofImages}
            claimImagePreviews={claimImagePreviews}
            onClaimImageSelect={handleClaimImageSelect}
            onRemoveClaimImage={handleRemoveClaimImage}
            isSubmittingClaim={isSubmittingClaim}
            onSubmit={handleSubmitClaim}
            onCancel={() => {
              setShowClaimModal(false);
              onRestaurantSelectedForClaim?.(null);
              setClaimBusinessRelationship('');
              setClaimAdditionalInfo('');
              setClaimProofImages([]);
              setClaimImagePreviews([]);
              setQrPaymentData(null);
              setShowQRPayment(false);
            }}
            qrPaymentData={qrPaymentData}
            showQRPayment={showQRPayment}
            onConfirmPayment={() => {
              setAlertModal({
                isOpen: true,
                title: 'Đã xác nhận',
                message: 'Bạn đã xác nhận chuyển khoản. Yêu cầu của bạn sẽ được admin duyệt thủ công. Vui lòng đợi phản hồi.',
                type: 'success',
              });
              // Đóng modal và reset form
              setTimeout(() => {
                setShowClaimModal(false);
                onRestaurantSelectedForClaim?.(null);
                setClaimBusinessRelationship('');
                setClaimAdditionalInfo('');
                setClaimProofImages([]);
                setClaimImagePreviews([]);
                setQrPaymentData(null);
                setShowQRPayment(false);
              }, 2000);
            }}
          />
        </ContributionModal>
      ) : (
        <ContributionModal
          title={contributionType === 'dish' ? 'Đóng góp món ăn' : 'Đóng góp quán ăn'}
          onClose={closeModal}
        >
              {contributionType === 'dish' ? (
            <DishContributionForm
              dishNames={dishNames}
              onDishNamesChange={setDishNames}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitDish}
              onCancel={closeModal}
              submitError={submitError}
              submitSuccess={submitSuccess}
            />
          ) : (
            <RestaurantContributionForm
              restaurantName={restaurantName}
              onRestaurantNameChange={setRestaurantName}
              restaurantDescription={restaurantDescription}
              onRestaurantDescriptionChange={setRestaurantDescription}
              story={story}
              onStoryChange={setStory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              operatingHours={operatingHours}
              onOperatingHoursChange={setOperatingHours}
              selectedLocation={selectedLocation}
              amenities={amenities}
              selectedAmenityIds={selectedAmenityIds}
              onSelectedAmenityIdsChange={setSelectedAmenityIds}
              amenitySearchTerm={amenitySearchTerm}
              onAmenitySearchTermChange={setAmenitySearchTerm}
              dishes={dishes}
              selectedDishIds={selectedDishIds}
              onSelectedDishIdsChange={setSelectedDishIds}
              dishSearchTerm={dishSearchTerm}
              onDishSearchTermChange={setDishSearchTerm}
              images={images}
              onImagesChange={setImages}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitRestaurant}
              onCancel={closeModal}
              submitError={submitError}
              submitSuccess={submitSuccess}
            />
          )}
        </ContributionModal>
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

export default ContributionsTab;

