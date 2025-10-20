import React, { useEffect, useState } from 'react';
import { type User } from '../services/user';
import GoogleLogin from './GoogleLogin';
import { listDishes } from '../services/dish';
import { listDishTypes } from '../services/dishType';
import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'comments' | 'stars' | 'user'>('explore');
  const [dishSearch, setDishSearch] = useState('');
  const [dishes, setDishes] = useState<any[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [selectedDishMap, setSelectedDishMap] = useState<Record<string, boolean>>({});
  const [dishTypes, setDishTypes] = useState<any[]>([]);
  const [selectedDishTypeId, setSelectedDishTypeId] = useState<string>('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoadingDishes(true);
        const data = await listDishes({ searchTerm: dishSearch || undefined, categoryId: selectedDishTypeId || undefined });
        if (!ignore) setDishes(data?.data ?? data ?? []);
      } finally {
        setLoadingDishes(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [dishSearch, selectedDishTypeId]);

  useEffect(() => {
    listDishTypes().then(res => setDishTypes(res?.data ?? res ?? []));
  }, []);

  return (
    <div className={`h-full bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-[500px]' : 'w-12'}`}>
      {/* Toggle button */}
      <div className="relative">
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-6 h-6 rounded-full border border-gray-300 bg-white shadow-sm text-gray-700 hover:bg-gray-50"
          title={isOpen ? 'Đóng' : 'Mở'}
        >
          {isOpen ? '<' : '>'}
        </button>
      </div>
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 ${isOpen ? 'block' : 'hidden'}`}>
        <h2 className="text-lg font-semibold text-gray-800">Taste Map</h2>
        <p className="text-sm text-gray-600">Khám phá ẩm thực Việt Nam</p>
        
        {/* 4 nút bấm ngang (không chữ) */}
        <div className="flex mt-4 space-x-1">
          <button
            className={`flex-1 p-2 rounded-lg transition-colors ${activeTab === 'explore' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('explore')}
            title="Khám phá"
          >
            <span className="text-lg">🔍</span>
          </button>
          <button
            className={`flex-1 p-2 rounded-lg transition-colors ${activeTab === 'comments' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('comments')}
            title="Bình luận"
          >
            <span className="text-lg">💬</span>
          </button>
          <button
            className={`flex-1 p-2 rounded-lg transition-colors ${activeTab === 'stars' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('stars')}
            title="Yêu thích / Blacklist"
          >
            <span className="text-lg">⭐</span>
          </button>
          <button
            className={`flex-1 p-2 rounded-lg transition-colors ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('user')}
            title="Tài khoản"
          >
            <span className="text-lg">👤</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content (thay đổi theo tab) */}
      <div className={`flex-1 overflow-y-auto p-4 ${isOpen ? 'block' : 'hidden'}`}>
        {activeTab === 'explore' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Khám phá</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Tìm món ăn (dish) ..."
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedDishTypeId}
                  onChange={(e) => setSelectedDishTypeId(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  title="Dish Type"
                >
                  <option value="">Tất cả loại</option>
                  {(dishTypes ?? []).map((t: any) => (
                    <option key={t.id || t.Id} value={t.id || t.Id}>{t.typeName || t.TypeName}</option>
                  ))}
                </select>
              </div>
              {/* thanh chọn tất cả / xóa / đề xuất món */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="font-semibold tracking-wide">Dishes</div>
                <div className="space-x-3">
                  <button
                    className="hover:text-blue-600"
                    onClick={() => {
                      const map: Record<string, boolean> = {};
                      (dishes ?? []).forEach((d: any) => {
                        const id = String(d.id || d.Id);
                        map[id] = true;
                      });
                      setSelectedDishMap(map);
                    }}
                  >Chọn tất cả</button>
                  <button
                    className="hover:text-red-600"
                    onClick={() => setSelectedDishMap({})}
                  >Xóa</button>
                  <button
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    title="Đề xuất món ăn chưa có"
                    onClick={() => {
                      const name = window.prompt('Đề xuất món ăn mới (tên):');
                      if (!name) return;
                      // Chỉ gửi tên, backend hỗ trợ các field còn lại tùy chọn
                      fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_CONTRIBUTION.CREATE}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...{} },
                        body: JSON.stringify({ name })
                      }).catch(() => {});
                      alert('Đã gửi đề xuất!');
                    }}
                  >Đề xuất</button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {loadingDishes ? (
                  <div className="p-3 text-sm text-gray-500">Đang tải món ăn...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(dishes ?? []).slice(0, 50).map((d: any) => (
                      <label key={d.id || d.Id} className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!selectedDishMap[String(d.id || d.Id)]}
                          onChange={(e) => {
                            const id = String(d.id || d.Id);
                            setSelectedDishMap(prev => ({ ...prev, [id]: e.target.checked }));
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 truncate" title={d.name || d.Name}>{d.name || d.Name}</div>
                          {d.tags && <div className="text-[10px] text-gray-500 truncate">{d.tags}</div>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
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
        )}

        {activeTab === 'stars' && (
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
        )}

        {activeTab === 'user' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Tài khoản</h3>
            {user ? (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-800">{user.fullName || user.username}</div>
                    <div className="text-xs text-gray-600">{user.email}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Điểm: {user.points}</span>
                  <span>Loại: {user.userType}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <GoogleLogin />
              </div>
            )}
          </div>
        )}
      </div>
      {/* Footer có thể thêm sau */}
    </div>
  );
};

export default Sidebar;
