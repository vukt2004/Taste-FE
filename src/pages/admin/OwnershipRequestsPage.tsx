import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOwnershipRequests, approveOwnershipRequest, type OwnershipRequestDto, type ProcessOwnershipRequestDto } from '../../services/ownershipRequest';
import { UserService } from '../../services/userService';

const AdminOwnershipRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<OwnershipRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<OwnershipRequestDto | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdmin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdmin = async () => {
    try {
      const user = await UserService.getCurrentUser();
      console.log('Current user:', user);
      if (!user || user.userType !== 'admin') {
        console.log('User is not admin, redirecting to /');
        navigate('/');
        return;
      }
      console.log('User is admin, loading requests...');
      loadRequests();
    } catch (err) {
      console.error('Error checking admin:', err);
      navigate('/');
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await listOwnershipRequests();
      if (response.isSuccess && response.data) {
        setRequests(response.data);
      } else {
        setError('Không thể tải danh sách yêu cầu');
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Lỗi khi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (isApproved: boolean) => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const dto: ProcessOwnershipRequestDto = {
        isApproved,
        adminNotes: adminNotes || undefined
      };

      console.log('Sending approval request:', { requestId: selectedRequest.id, dto });
      const response = await approveOwnershipRequest(selectedRequest.id, dto);
      console.log('Approval response:', response);
      
      if (response.isSuccess || response.success) {
        alert(isApproved ? 'Chấp thuận yêu cầu thành công!' : 'Từ chối yêu cầu thành công!');
        setSelectedRequest(null);
        setAdminNotes('');
        loadRequests();
      } else {
        const errorMessage = response.message || 'Có lỗi xảy ra khi xử lý yêu cầu';
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error processing request:', err);
      alert('Lỗi khi xử lý yêu cầu: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const parseProofImages = (proofImages?: string): string[] => {
    if (!proofImages) return [];
    try {
      return JSON.parse(proofImages);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý yêu cầu Claim quán ăn</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Quay lại
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">Không có yêu cầu nào đang chờ xử lý</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Yêu cầu #{request.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Ngày tạo: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Chờ xử lý
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Restaurant ID:</span> {request.restaurantId}</p>
                  <p><span className="font-medium">Người yêu cầu:</span> {request.requestedById}</p>
                  <p className="line-clamp-2">
                    <span className="font-medium">Mối quan hệ:</span> {request.businessRelationship}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRequest(request);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal chi tiết */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Chi tiết yêu cầu</h2>
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setAdminNotes('');
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant ID</label>
                    <p className="text-gray-900">{selectedRequest.restaurantId}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người yêu cầu</label>
                    <p className="text-gray-900">{selectedRequest.requestedById}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mối quan hệ kinh doanh</label>
                    <p className="text-gray-900">{selectedRequest.businessRelationship}</p>
                  </div>

                  {selectedRequest.additionalInfo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin bổ sung</label>
                      <p className="text-gray-900">{selectedRequest.additionalInfo}</p>
                    </div>
                  )}

                  {selectedRequest.proofImages && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh chứng minh</label>
                      <div className="grid grid-cols-3 gap-2">
                        {parseProofImages(selectedRequest.proofImages).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Proof ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú admin</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleApprove(true)}
                      disabled={processing}
                      className={`flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                        processing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processing ? 'Đang xử lý...' : 'Chấp thuận'}
                    </button>
                    <button
                      onClick={() => handleApprove(false)}
                      disabled={processing}
                      className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${
                        processing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processing ? 'Đang xử lý...' : 'Từ chối'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOwnershipRequestsPage;

