import React, { useRef } from 'react';

interface QRPaymentResponse {
  qrCodeUrl: string;
  accountNo: string;
  accountName: string;
  acqId: string;
  amount: number;
  description: string;
  bankName: string;
}

interface ClaimRestaurantFormProps {
  selectedRestaurantForClaim: { id: string; name: string } | null;
  claimBusinessRelationship: string;
  onClaimBusinessRelationshipChange: (value: string) => void;
  claimAdditionalInfo: string;
  onClaimAdditionalInfoChange: (value: string) => void;
  claimProofImages: File[];
  claimImagePreviews: string[];
  onClaimImageSelect: (files: File[]) => void;
  onRemoveClaimImage: (index: number) => void;
  isSubmittingClaim: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  qrPaymentData?: QRPaymentResponse | null;
  showQRPayment?: boolean;
  onConfirmPayment?: () => void;
}

const ClaimRestaurantForm: React.FC<ClaimRestaurantFormProps> = (props) => {
  const {
    selectedRestaurantForClaim,
    claimBusinessRelationship,
    onClaimBusinessRelationshipChange,
    claimAdditionalInfo,
    onClaimAdditionalInfoChange,
    claimImagePreviews,
    onClaimImageSelect,
    onRemoveClaimImage,
    isSubmittingClaim,
    onSubmit,
    qrPaymentData,
    showQRPayment,
    onConfirmPayment,
  } = props;
  const claimFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onClaimImageSelect(files);
    }
  };

  return (
    <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn marker trên bản đồ để claim quán ăn
        </label>
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
          {selectedRestaurantForClaim 
            ? `Đã chọn: ${selectedRestaurantForClaim.name}`
            : 'Hãy click vào một marker trên bản đồ để chọn quán ăn vô chủ'}
        </div>
      </div>

      {selectedRestaurantForClaim && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mối quan hệ kinh doanh <span className="text-red-500">*</span>
            </label>
            <textarea
              value={claimBusinessRelationship}
              onChange={(e) => onClaimBusinessRelationshipChange(e.target.value)}
              placeholder="Ví dụ: Tôi là chủ sở hữu của quán ăn này"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thông tin bổ sung
            </label>
            <textarea
              value={claimAdditionalInfo}
              onChange={(e) => onClaimAdditionalInfoChange(e.target.value)}
              placeholder="Ví dụ: Có giấy phép kinh doanh và hợp đồng thuê mặt bằng"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh chứng minh
            </label>
            <input
              ref={claimFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => claimFileInputRef.current?.click()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Chọn ảnh
            </button>
            
            {claimImagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {claimImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Proof ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={() => onRemoveClaimImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showQRPayment ? (
            <button
              onClick={onSubmit}
              disabled={isSubmittingClaim}
              className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-yellow-500 text-white text-xs sm:text-sm rounded-lg hover:bg-yellow-600 transition-colors ${
                isSubmittingClaim ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmittingClaim ? 'Đang gửi...' : 'Gửi yêu cầu claim'}
            </button>
          ) : (
            <>
              {/* QR Payment Section */}
              {qrPaymentData && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Quét mã QR để chuyển khoản
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Số tiền: <span className="font-bold text-blue-600">{qrPaymentData.amount.toLocaleString('vi-VN')} VND</span>
                    </p>
                    
                    {/* QR Code Image */}
                    <div className="flex justify-center mb-4">
                      <img 
                        src={qrPaymentData.qrCodeUrl} 
                        alt="QR Code"
                        className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"
                      />
                    </div>
                    
                    {/* Bank Info */}
                    <div className="text-left bg-white p-3 rounded-lg border border-gray-200">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngân hàng:</span>
                          <span className="font-medium">{qrPaymentData.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số tài khoản:</span>
                          <span className="font-medium font-mono">{qrPaymentData.accountNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chủ tài khoản:</span>
                          <span className="font-medium">{qrPaymentData.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nội dung:</span>
                          <span className="font-medium text-xs break-all">{qrPaymentData.description}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Confirm Payment Button */}
                    <button
                      onClick={onConfirmPayment}
                      className="w-full py-2 px-4 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Xác nhận đã chuyển khoản
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ClaimRestaurantForm;

