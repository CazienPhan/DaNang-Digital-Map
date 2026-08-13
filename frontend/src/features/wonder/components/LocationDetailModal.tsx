import React, { useState } from 'react';
import type { LocationItem } from '../types';
import { useEscapeToClose, dismissOnBackdrop } from '../hooks/useDismiss';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Star, 
  Navigation, 
  Share2, 
  Heart, 
  ShoppingBag,
  ShieldCheck,
  Award,
  Fish,
  Leaf,
  Gift,
  CreditCard,
  Users,
  Boxes,
  Play,
  ChevronRight,
  Building2,
  Image as ImageIcon
} from 'lucide-react';

interface LocationDetailModalProps {
  location: LocationItem | null;
  onClose: () => void;
  onOpenDirections: (loc: LocationItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  allLocations?: LocationItem[];
  onSelectLocation?: (loc: LocationItem) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  onClose,
  onOpenDirections,
  isFavorite,
  onToggleFavorite,
  allLocations = [],
  onSelectLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ocop' | 'reviews' | 'photos'>('overview');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Thoát bằng phím Esc. Khi đang xem ảnh phóng to thì Esc chỉ đóng lớp ảnh,
  // giữ nguyên trang chi tiết — bấm Esc lần nữa mới đóng hẳn.
  useEscapeToClose(showPhotoModal, () => setShowPhotoModal(false));
  useEscapeToClose(!!location && !showPhotoModal, onClose);

  if (!location) return null;

  // Gallery Photos
  const photos = location.galleryImages && location.galleryImages.length > 0 
    ? location.galleryImages 
    : [location.image];

  // Nearby locations lookup
  const nearbyLocations = location.nearbyLocationIds && location.nearbyLocationIds.length > 0
    ? allLocations.filter(l => location.nearbyLocationIds?.includes(l.id))
    : allLocations.filter(l => l.id !== location.id).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={dismissOnBackdrop(onClose)}>
      {/* Right Drawer Panel overlaying or sliding smoothly from right */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto flex flex-col font-sans text-slate-800 custom-scrollbar animate-in slide-in-from-right duration-300">
        
        {/* 1. HERO GALLERY TOP BAR */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0 group">
          <img
            src={photos[activePhotoIndex] || location.image}
            alt={location.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* Ghi công ảnh — bắt buộc với giấy phép CC BY / CC BY-SA */}
          {location.imageCredit && (
            <span className="absolute bottom-1 right-2 z-10 text-[9px] text-white/70 bg-black/35 px-1.5 py-0.5 rounded backdrop-blur-xs">
              Ảnh: {location.imageCredit}
            </span>
          )}

          {/* Top Actions: Close, Share, Favorite */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: location.name,
                    text: location.address,
                    url: window.location.href,
                  });
                } else {
                  alert(`Đã sao chép liên kết chia sẻ cho ${location.name}`);
                }
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
              title="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo Gallery Thumbnails Strip */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar z-10">
            {/* Video preview thumb */}
            <div 
              onClick={() => setShowPhotoModal(true)}
              className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-white/80 shrink-0 cursor-pointer group/vid"
            >
              <img src={photos[0]} alt="Video" className="w-full h-full object-cover brightness-75 group-hover/vid:scale-105 transition-transform" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            {/* Photo thumbnails */}
            {photos.slice(0, 3).map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  activePhotoIndex === idx ? 'border-[#F47A1F] scale-105 shadow-md' : 'border-white/80 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}

            {/* View All Photos Counter Button */}
            <button
              onClick={() => setShowPhotoModal(true)}
              className="relative w-20 h-12 rounded-lg overflow-hidden border-2 border-white/80 shrink-0 cursor-pointer group/all bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-1 hover:bg-black/80 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 mb-0.5 text-amber-300" />
              <span className="text-[10px] font-bold leading-tight text-center">
                Xem tất cả {location.totalPhotosCount || photos.length} ảnh
              </span>
            </button>
          </div>
        </div>

        {/* 2. MAIN DETAILS CONTENT BODY */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          
          {/* Header Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {location.categoryLabel}
              </span>
              {location.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã xác thực
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {location.name}
            </h1>

            {/* Key stats row */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-slate-900 text-sm">{location.rating}</span>
                <span className="text-slate-500">({location.reviewCount} đánh giá)</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-[#F47A1F]" />
                <span>{location.distanceStr}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{location.status === 'Đang mở' ? 'Đang mở cửa' : location.status}</span>
              </div>
            </div>
          </div>

          {/* 3 Quick Info Cards (Opening hours, Phone, Address) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">
                  {location.openingHours || '06:00 - 18:00'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Giờ mở cửa</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">
                  {location.phone || '0236 3822 456'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Liên hệ</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-700 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900 line-clamp-1">
                  {location.address}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{location.district}, Đà Nẵng</p>
              </div>
            </div>
          </div>

          {/* Description Text */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {location.description || 'Chợ Hàn là một trong những khu chợ truyền thống lâu đời và nổi tiếng bậc nhất Đà Nẵng. Nơi đây bày bán đa dạng các mặt hàng từ đặc sản, hải sản khô, thực phẩm tươi sống đến quà lưu niệm, OCOP địa phương.'}
          </p>

          {/* 4. VÌ SAO NÊN GHÉ? (Highlights / Advantages) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Vì sao nên ghé?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(location.whyVisit || [
                {
                  title: 'Đặc sản phong phú',
                  desc: 'Thiên đường đặc sản Đà Nẵng, hải sản tươi ngon.',
                  icon: 'star'
                },
                {
                  title: 'Giá cả hợp lý',
                  desc: 'Hàng hóa đa dạng, giá cả phải chăng.',
                  icon: 'shield'
                },
                {
                  title: 'Văn hóa địa phương',
                  desc: 'Trải nghiệm nhịp sống và văn hóa chợ truyền thống.',
                  icon: 'bag'
                }
              ]).map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F47A1F]/15 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[#F47A1F]/10 text-[#F47A1F]">
                      {item.icon === 'star' && <Award className="w-4 h-4" />}
                      {item.icon === 'shield' && <ShieldCheck className="w-4 h-4" />}
                      {item.icon === 'bag' && <ShoppingBag className="w-4 h-4" />}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. DANH MỤC NỔI BẬT (Featured Category Chips) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Danh mục nổi bật</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(location.featuredCategoryChips || [
                { id: 'cat-1', label: 'Đặc sản Đà Nẵng', icon: 'bag' },
                { id: 'cat-2', label: 'Hải sản khô', icon: 'fish' },
                { id: 'cat-3', label: 'Thực phẩm', icon: 'leaf' },
                { id: 'cat-4', label: 'Quà lưu niệm', icon: 'gift' }
              ]).map((chip) => {
                const isSelected = selectedCategoryFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategoryFilter(isSelected ? null : chip.id)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F47A1F] text-white border-[#F47A1F] shadow-sm'
                        : 'bg-orange-50/50 hover:bg-orange-50 border-orange-100/80 text-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#F47A1F]'}`}>
                      {chip.icon === 'bag' && <ShoppingBag className="w-4 h-4" />}
                      {chip.icon === 'fish' && <Fish className="w-4 h-4" />}
                      {chip.icon === 'leaf' && <Leaf className="w-4 h-4" />}
                      {chip.icon === 'gift' && <Gift className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-center">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. TABBED NAVIGATION */}
          <div className="border-b border-slate-200 flex items-center gap-6 pt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'overview' ? 'text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Thông tin tổng quan
              {activeTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47A1F] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('ocop')}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'ocop' ? 'text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sản phẩm OCOP ({location.featuredOcopProducts?.length || 3})
              {activeTab === 'ocop' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47A1F] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'reviews' ? 'text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đánh giá ({location.reviewCount})
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47A1F] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'photos' ? 'text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hình ảnh
              {activeTab === 'photos' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47A1F] rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: OVERVIEW (MAP PREVIEW + DETAILED METADATA GRID) */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Mini Map Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Vị trí trên bản đồ</h4>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 group/map">
                  <img
                    src={`https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80`}
                    alt="Map preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-900/10" />
                  
                  {/* Pin marker graphic */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#F47A1F] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="w-3 h-1 bg-black/30 rounded-full blur-xs mt-1" />
                  </div>

                  <button
                    onClick={() => onOpenDirections(location)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-md hover:bg-white transition-all border border-slate-200 cursor-pointer"
                  >
                    Xem trên bản đồ
                  </button>
                </div>
              </div>

              {/* Right Column: Detailed Structured Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Thông tin chi tiết</h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      Loại hình
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {location.detailedSpecs?.typeStr || 'Chợ truyền thống'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-emerald-500" />
                      Quy mô
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {location.detailedSpecs?.scaleStr || '~600 gian hàng'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                      Mặt hàng
                    </span>
                    <span className="font-bold text-slate-900 text-right max-w-[180px] line-clamp-2">
                      {location.detailedSpecs?.itemsStr || 'Đặc sản, hải sản, thực phẩm, OCOP, quà lưu niệm'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-500" />
                      Đối tượng phù hợp
                    </span>
                    <span className="font-bold text-slate-900 text-right max-w-[180px] line-clamp-2">
                      {location.detailedSpecs?.suitableFor || 'Khách du lịch, người dân địa phương'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-teal-500" />
                      Thanh toán
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {location.detailedSpecs?.paymentMethods || 'Tiền mặt, chuyển khoản'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OCOP PRODUCTS */}
          {activeTab === 'ocop' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Sản phẩm OCOP đặc trưng tại điểm này</h4>
              {location.featuredOcopProducts && location.featuredOcopProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {location.featuredOcopProducts.map((p) => (
                    <div key={p.id} className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 transition-all flex gap-3 items-center shadow-2xs">
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.producerName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-extrabold text-[#F47A1F]">{p.priceStr}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            ★ {p.starRating} Sao
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Đang cập nhật thêm danh sách sản phẩm OCOP...</p>
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Đánh giá từ khách tham quan</h4>
                <button
                  onClick={() => alert(`Cảm ơn bạn! Tính năng gửi đánh giá cho ${location.name} đã được kích hoạt.`)}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-[#F47A1F] hover:bg-orange-200 transition-colors cursor-pointer"
                >
                  + Viết đánh giá
                </button>
              </div>

              {(location.reviewsList || [
                {
                  id: 'rev-1',
                  author: 'Nguyễn Văn Anh',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                  rating: 5,
                  date: '10/08/2026',
                  content: 'Chợ Hàn cực kỳ sôi động! Gian hàng OCOP rất chuẩn chất lượng, chả bò và bánh khô mè Bà Liễu mua ở đây cực ngon.',
                },
                {
                  id: 'rev-2',
                  author: 'Trần Thị Mai',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                  rating: 4,
                  date: '05/08/2026',
                  content: 'Vị trí thuận tiện ngay trung tâm, mua sắm quà lưu niệm và đặc sản Đà Nẵng rất thích hợp.',
                }
              ]).map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={rev.avatar} alt={rev.author} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{rev.content}</p>
                  <span className="text-[10px] text-slate-400 block text-right">{rev.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Bộ sưu tập hình ảnh</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setActivePhotoIndex(i);
                      setShowPhotoModal(true);
                    }}
                    className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                  >
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. KHÁM PHÁ QUANH ĐÂY (Nearby Recommendations Carousel) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Khám phá quanh đây</h3>
              <button 
                onClick={() => {
                  if (allLocations.length > 0) {
                    onSelectLocation?.(allLocations[0]);
                  }
                }}
                className="text-xs font-bold text-[#F47A1F] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {nearbyLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation?.(loc)}
                  className="w-44 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group/near"
                >
                  <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover/near:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{loc.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                    <MapPin className="w-3 h-3 text-[#F47A1F]" />
                    <span>{loc.distanceStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 8. STICKY BOTTOM ACTIONS BAR */}
        <div className="sticky bottom-0 p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center gap-2.5 z-20 shadow-lg">
          <button
            onClick={() => onOpenDirections(location)}
            className="flex-1 py-3 px-4 rounded-2xl text-xs font-black text-white bg-[#F47A1F] hover:bg-[#D9630F] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Chỉ đường</span>
          </button>

          <button
            onClick={() => onToggleFavorite(location.id)}
            className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isFavorite 
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
            <span>{isFavorite ? 'Đã lưu' : 'Lưu địa điểm'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reviews');
              alert(`Kích hoạt gửi đánh giá cho ${location.name}`);
            }}
            className="py-3 px-4 rounded-2xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Đánh giá</span>
          </button>
        </div>

      </div>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={dismissOnBackdrop(() => setShowPhotoModal(false))}
        >
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl max-h-[80vh] w-full flex items-center justify-center p-2">
            <img
              src={photos[activePhotoIndex] || location.image}
              alt={location.name}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto mt-4 max-w-full px-4">
            {photos.map((img, i) => (
              <button
                key={i}
                onClick={() => setActivePhotoIndex(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                  activePhotoIndex === i ? 'border-[#F47A1F]' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
