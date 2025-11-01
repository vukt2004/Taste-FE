import React, { useEffect, useState, useRef } from 'react';
import { listDishes } from '../../services/dish';
import { listAmenities } from '../../services/amenity';
import { type RestaurantFilter, filterRestaurants } from '../../services/restaurant';
import AlertModal from './contribution/AlertModal';

interface CacheData {
  amenities: Array<{ id: string; name: string; isActive: boolean }>;
  dishes: Array<{ id: string; name: string }>;
}

interface Dish {
  id: string;
  name: string;
}

interface ExploreTabProps {
  onFilterChange: (filter: RestaurantFilter) => void;
  mapCenter?: { lat: number; lng: number };
  cacheData?: CacheData;
}

interface Amenity {
  id: string;
  name: string;
  isActive: boolean;
}

const RADIUS_KM = 5;

// Tính toán bounding box từ center và radius (km)
const calculateBoundingBox = (lat: number, lng: number, radiusKm: number) => {
  // 1 độ latitude ≈ 111 km
  // 1 độ longitude ≈ 111 km * cos(latitude)
  const latDelta = radiusKm / 111;
  const cosLat = Math.cos(lat * Math.PI / 180);
  // Tránh chia cho 0 hoặc giá trị quá nhỏ
  const lngDelta = cosLat > 0.01 ? radiusKm / (111 * cosLat) : radiusKm / 111;
  
  return {
    southWestLat: lat - latDelta,
    southWestLng: lng - lngDelta,
    northEastLat: lat + latDelta,
    northEastLng: lng + lngDelta,
  };
};

const ExploreTab: React.FC<ExploreTabProps> = ({ onFilterChange, mapCenter, cacheData }) => {
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [amenitySearch, setAmenitySearch] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ data?: unknown[] } | null>(null);
  const prevMapCenterRef = useRef<{ lat: number; lng: number } | undefined>(undefined);
  
  // Additional filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [dishSearchTerm, setDishSearchTerm] = useState('');
  
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
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    price: true,
    categories: true,
    dishes: true,
    amenities: true,
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Load dishes with localStorage cache
    const loadDishes = async () => {
      const CACHE_KEY_DISHES = 'tastemap_dishes_cache';
      const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

      // Try cacheData first
      if (cacheData && cacheData.dishes && cacheData.dishes.length > 0) {
        setAvailableDishes(cacheData.dishes);
        // Also save to localStorage for future use
        localStorage.setItem(CACHE_KEY_DISHES, JSON.stringify({
          data: cacheData.dishes,
          timestamp: Date.now()
        }));
        return;
      }

      // Try localStorage cache
      try {
        const cached = localStorage.getItem(CACHE_KEY_DISHES);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          if (data && data.length > 0 && (now - timestamp) < CACHE_EXPIRY) {
            setAvailableDishes(data);
            return;
          }
        }
      } catch {
        // Failed to read cache, continue to fetch from API
      }

      // Fetch from API
      try {
        const dishes = await listDishes();
        const dishesList = dishes || [];
        setAvailableDishes(dishesList);
        
        // Save to localStorage
        localStorage.setItem(CACHE_KEY_DISHES, JSON.stringify({
          data: dishesList,
          timestamp: Date.now()
        }));
      } catch {
        setAvailableDishes([]);
      }
    };
    loadDishes();
    
    // Load amenities with localStorage cache
    const loadAmenities = async () => {
      const CACHE_KEY_AMENITIES = 'tastemap_amenities_cache';
      const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

      // Try cacheData first
      if (cacheData && cacheData.amenities.length > 0) {
        setAmenities(cacheData.amenities);
        // Also save to localStorage for future use
        localStorage.setItem(CACHE_KEY_AMENITIES, JSON.stringify({
          data: cacheData.amenities,
          timestamp: Date.now()
        }));
        return;
      }

      // Try localStorage cache
      try {
        const cached = localStorage.getItem(CACHE_KEY_AMENITIES);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          if (data && data.length > 0 && (now - timestamp) < CACHE_EXPIRY) {
            setAmenities(data);
            return;
          }
        }
      } catch {
        // Failed to read cache, continue to fetch from API
      }

      // Fetch from API
      const res = await listAmenities({ activeOnly: true });
      const data = res?.data ?? res ?? [];
      setAmenities(data);
      
      // Save to localStorage
      localStorage.setItem(CACHE_KEY_AMENITIES, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    };
    loadAmenities();
  }, [cacheData]);

  // useEffect(() => {
  //   // Load all dishes without category filtering
  //   const newAvailable: DishCategory[] = [];
  //   dishTypes.forEach(dt => dt.dishCategories && newAvailable.push(...dt.dishCategories));
    
  //   // Remove duplicates by dishId
  //   const uniqueDishes = newAvailable.filter((dish, index, self) => 
  //     index === self.findIndex(d => d.dishId === dish.dishId)
  //   );
    
  //   setAvailableDishes(uniqueDishes);

  //   setSelectedDishIds(prev => {
  //     const newSet = new Set<string>();
  //     prev.forEach(id => {
  //       if (uniqueDishes.some(d => d.dishId === id)) newSet.add(id);
  //     });
  //     return newSet;
  //   });
  // }, [dishTypes]);

  // Tự động cập nhật bounding box khi mapCenter thay đổi và đã có kết quả tìm kiếm trước đó
  useEffect(() => {
    if (mapCenter && searchResult) {
      // Kiểm tra xem mapCenter có thay đổi không
      const prevMapCenter = prevMapCenterRef.current;
      const hasChanged = !prevMapCenter || 
        prevMapCenter.lat !== mapCenter.lat || 
        prevMapCenter.lng !== mapCenter.lng;
      
      if (hasChanged) {
        // Debounce để tránh quá nhiều calls khi di chuyển map
        const timeoutId = setTimeout(() => {
          const bbox = calculateBoundingBox(mapCenter.lat, mapCenter.lng, RADIUS_KM);
        const filter: RestaurantFilter = {
          verifiedOnly: true,
          activeOnly: true,
          limit: 500,
          dishIds: selectedDishIds.size > 0 ? Array.from(selectedDishIds) : undefined,
          amenityIds: selectedAmenityIds.size > 0 ? Array.from(selectedAmenityIds) : undefined,
          searchKeyword: searchKeyword.trim() || undefined,
          priceRange: priceRange.trim() || undefined,
          southWestLat: bbox.southWestLat,
          southWestLng: bbox.southWestLng,
          northEastLat: bbox.northEastLat,
          northEastLng: bbox.northEastLng,
        };
          
          onFilterChange(filter);
        }, 500); // Debounce 500ms
        
        return () => clearTimeout(timeoutId);
      }
    }
    
    // Luôn cập nhật ref để track mapCenter hiện tại
    if (mapCenter) {
      prevMapCenterRef.current = mapCenter;
    }
  }, [mapCenter, selectedDishIds, selectedAmenityIds, searchResult, searchKeyword, priceRange, onFilterChange]);


  const handleSearch = async (e?: React.MouseEvent) => {
    // Ngăn chặn event propagation nếu có
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const filter: RestaurantFilter = {
        verifiedOnly: true,
        activeOnly: true,
        limit: 500,
        dishIds: selectedDishIds.size > 0 ? Array.from(selectedDishIds) : undefined,
        amenityIds: selectedAmenityIds.size > 0 ? Array.from(selectedAmenityIds) : undefined,
        searchKeyword: searchKeyword.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
      };
      
      // Thêm thông tin vùng địa lý nếu có mapCenter
      if (mapCenter && !isNaN(mapCenter.lat) && !isNaN(mapCenter.lng)) {
        const bbox = calculateBoundingBox(mapCenter.lat, mapCenter.lng, RADIUS_KM);
        filter.southWestLat = bbox.southWestLat;
        filter.southWestLng = bbox.southWestLng;
        filter.northEastLat = bbox.northEastLat;
        filter.northEastLng = bbox.northEastLng;
      } else {
        // Nếu không có mapCenter, sử dụng tọa độ mặc định (Hồ Chí Minh)
        const defaultCenter = { lat: 10.8231, lng: 106.6297 };
        const bbox = calculateBoundingBox(defaultCenter.lat, defaultCenter.lng, RADIUS_KM);
        filter.southWestLat = bbox.southWestLat;
        filter.southWestLng = bbox.southWestLng;
        filter.northEastLat = bbox.northEastLat;
        filter.northEastLng = bbox.northEastLng;
      }
      
      setIsSearching(true);
      const result = await filterRestaurants(filter);
      setSearchResult(result);
      onFilterChange(filter);
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Có lỗi xảy ra khi tìm kiếm',
        type: 'error',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSet = (setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string, maxItems?: number) => {
    setFn(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        // Check max items limit
        if (maxItems && s.size >= maxItems) {
          setAlertModal({
            isOpen: true,
            title: 'Thông báo',
            message: `Bạn chỉ có thể chọn tối đa ${maxItems} món ăn`,
            type: 'info',
          });
          return s;
        }
        s.add(id);
      }
      return s;
    });
  };

  const collapsibleSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    content: React.ReactNode,
    actions?: React.ReactNode
  ) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-md cursor-pointer hover:from-gray-100 hover:to-gray-150 transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">{title}</h3>
        <div className="flex items-center gap-2">
          {actions && <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>{actions}</div>}
          <span className="text-gray-500 text-xs">
            {expandedSections[sectionKey] ? '▼' : '▶'}
          </span>
        </div>
      </div>
      {expandedSections[sectionKey] && (
        <div className="transition-all duration-200">
          {content}
        </div>
      )}
    </div>
  );

  const inputStyle =
    'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm';

  const itemStyle = (selected: boolean) =>
    `px-2 py-1.5 cursor-pointer text-sm rounded-md transition-all truncate
    ${selected ? 'bg-blue-600 text-white font-medium shadow-sm' : 'bg-gray-50 hover:bg-blue-50 text-gray-800'}`;

  return (
    <div className="space-y-4">
      {/* Nút tìm kiếm */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 shadow-md">
        <button
          type="button"
          onClick={(e) => {
            handleSearch(e);
          }}
          disabled={isSearching}
          className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-white text-blue-600 font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm quán ăn'}
        </button>
        {searchResult && (
          <div className="mt-2 text-white text-xs sm:text-sm text-center">
            Tìm thấy {searchResult.data?.length || 0} quán ăn
          </div>
        )}
      </div>

      {/* Tìm kiếm từ khóa */}
      {collapsibleSection(
        'Tìm kiếm',
        'search',
        <div className="p-3">
          <input
            type="text"
            placeholder="Tìm theo tên quán ăn..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={inputStyle}
          />
        </div>
      )}

      {/* Khoảng giá */}
      {collapsibleSection(
        'Khoảng giá',
        'price',
        <div className="p-3">
          <input
            type="text"
            placeholder="Ví dụ: 50000-100000"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className={inputStyle}
          />
        </div>
      )}

      {/* DANH MỤC */}
      {/* {collapsibleSection(
        'Danh mục',
        'categories',
        <>
          <div className="p-2">
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-1 px-2 pb-2 max-h-60 overflow-y-auto scrollbar-hide">
            {(() => {
              const filteredDishTypes = dishTypes.filter(dt => !categorySearch || dt.typeName.toLowerCase().includes(categorySearch.toLowerCase()));
              return filteredDishTypes.map((dt, index) => (
                <div
                  key={`${dt.id}-${index}`}
                  className={itemStyle(selectedDishTypeIds.has(dt.id))}
                  onClick={() => handleToggleSet(setSelectedDishTypeIds, dt.id)}
                >
                  {dt.typeName}
                </div>
              ));
            })()}
          </div>
        </>,
        <button onClick={() => setSelectedDishTypeIds(new Set())} className="text-[11px] text-gray-500 hover:text-blue-500 transition-colors">
          Xoá
        </button>
      )} */}

      {/* MÓN ĂN */}
      {collapsibleSection(
        'Món ăn',
        'dishes',
        <>
          <div className="p-2">
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={dishSearchTerm}
              onChange={(e) => setDishSearchTerm(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-1 px-2 pb-2 max-h-72 overflow-y-auto scrollbar-hide">
            {availableDishes.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400 text-sm py-6">Không có món ăn ({availableDishes.length})</div>
            ) : (
              (() => {
                const filteredDishes = availableDishes.filter(d => !dishSearchTerm || d.name.toLowerCase().includes(dishSearchTerm.toLowerCase()));
                return filteredDishes.map((d, index) => (
                  <div
                    key={`${d.id}-${index}`}
                    className={itemStyle(selectedDishIds.has(d.id))}
                    onClick={() => handleToggleSet(setSelectedDishIds, d.id, 10)}
                  >
                    {d.name}
                  </div>
                ));
              })()
            )}
          </div>
        </>,
        <>
          <span className="text-[11px] text-gray-500">
            {selectedDishIds.size}/10
          </span>
          <button
            onClick={() => setSelectedDishIds(new Set())}
            className="text-[11px] text-gray-500 hover:text-blue-500 transition-colors"
          >
            Xoá
          </button>
        </>
      )}

      {/* TIỆN ÍCH */}
      {collapsibleSection(
        'Tiện ích',
        'amenities',
        <>
          <div className="p-2">
            <input
              type="text"
              placeholder="Tìm tiện ích..."
              value={amenitySearch}
              onChange={(e) => setAmenitySearch(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-1 px-2 pb-2 max-h-60 overflow-y-auto scrollbar-hide">
            {amenities
              .filter(a => !amenitySearch || a.name.toLowerCase().includes(amenitySearch.toLowerCase()))
              .map((a, index) => (
                <div
                  key={`${a.id}-${index}`}
                  className={itemStyle(selectedAmenityIds.has(a.id))}
                  onClick={() => handleToggleSet(setSelectedAmenityIds, a.id, 10)}
                >
                  {a.name}
                </div>
              ))}
          </div>
        </>,
        <>
          <span className="text-[11px] text-gray-500">
            {selectedAmenityIds.size}/10
          </span>
          <button
            onClick={() => setSelectedAmenityIds(new Set())}
            className="text-[11px] text-gray-500 hover:text-blue-500 transition-colors"
          >
            Xoá
          </button>
        </>
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

export default ExploreTab;
