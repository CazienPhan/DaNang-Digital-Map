import React, { useState } from 'react';
import type { OCOPProduct, SellingPointItem } from '../types';
import { useEscapeToClose, dismissOnBackdrop } from '../hooks/useDismiss';
import { 
  X, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Navigation, 
  Share2, 
  Heart, 
  Award,
  ShieldCheck,
  Sparkles,
  FileText,
  Leaf,
  Layers,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: OCOPProduct | null;
  onClose: () => void;
  onFindSellingPoints: (product: OCOPProduct) => void;
  onSelectStore: (store: SellingPointItem) => void;
  allProducts?: OCOPProduct[];
  onSelectProduct?: (prod: OCOPProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onFindSellingPoints,
  onSelectStore,
  allProducts = [],
  onSelectProduct,
}) => {
  // Cho phép thoát bằng phím Esc, không bắt buộc bấm nút ✕
  useEscapeToClose(!!product, onClose);

  const [activeTab, setActiveTab] = useState<'overview' | 'points' | 'story' | 'process' | 'guide' | 'reviews'>('story');
  const [activeGuideTab, setActiveGuideTab] = useState<'usage' | 'benefits' | 'storage'>('usage');
  const [isSaved, setIsSaved] = useState(false);

  if (!product) return null;

  // Filter related products
  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={dismissOnBackdrop(onClose)}>
      {/* Modal Card Box */}
      <div className="relative w-full max-w-5xl bg-[#FFF9F3] rounded-3xl shadow-2xl border border-orange-100 overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-800 font-sans">
        
        {/* TOP HEADER / BREADCRUMB */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-orange-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto">
            <span className="text-slate-400">Trang chủ</span>
            <span>›</span>
            <span className="text-slate-400">Sản phẩm OCOP</span>
            <span>›</span>
            <span className="text-[#F47A1F] font-bold truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  });
                } else {
                  alert(`Đã chia sẻ sản phẩm ${product.name}`);
                }
              }}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar">
          
          {/* HERO BANNER SECTION (Matches Figma Screenshot 2) */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-6 sm:p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Product Hero Info */}
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  CÂU CHUYỆN SẢN PHẨM
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-950" />
                    OCOP {product.starRating} sao
                  </span>

                  {product.isVerified && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Đã xác thực
                    </span>
                  )}

                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-amber-100 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-amber-300" />
                    Sản phẩm tiêu biểu
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-amber-100/90 italic leading-relaxed font-normal">
                  "{product.storySubtitle || 'Tinh túy từ thiên nhiên – kết tinh bằng công nghệ và tâm huyết. Món quà quý cho sức khỏe và chất lượng sống.'}"
                </p>

                {/* 4 Value Proposition Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {(product.valueProps || [
                    { title: 'Nuôi trồng công nghệ cao', icon: 'tech' },
                    { title: '100% nguyên chất', icon: 'pure' },
                    { title: 'Kiểm định chất lượng', icon: 'quality' },
                    { title: 'Truy xuất nguồn gốc', icon: 'traceability' },
                  ]).map((vp, i) => (
                    <div key={i} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-[11px] font-bold text-white">
                      <Award className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="line-clamp-2 leading-tight">{vp.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Hero Image */}
              <div className="md:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-amber-300/30 shadow-xl group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Ghi công ảnh — bắt buộc với giấy phép CC BY / CC BY-SA */}
                {product.imageCredit && (
                  <span className="absolute bottom-1 right-1.5 z-10 text-[9px] text-white/75 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {product.imageCredit}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                  <span className="bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md">
                    {product.priceStr}
                  </span>
                  <span className="bg-[#F47A1F] px-2.5 py-1 rounded-full">
                    {product.pointCountStr || '5 điểm bán'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* TOP SECTION TABS NAVIGATION */}
          <div className="bg-white rounded-2xl p-2 border border-orange-100 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'story', label: 'Câu chuyện sản phẩm' },
              { id: 'points', label: `Điểm bán gần bạn (${product.sellingLocations?.length || 5})` },
              { id: 'process', label: 'Quy trình sản xuất' },
              { id: 'guide', label: 'Hướng dẫn & Công dụng' },
              { id: 'overview', label: 'Thông tin xác thực & Chứng nhận' },
            ].map((tab) => {
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSel
                      ? 'bg-[#F47A1F] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CÂU CHUYỆN SẢN PHẨM & HÀNH TRÌNH (Matches Figma Screenshot 2 & 5) */}
          {(activeTab === 'story' || activeTab === 'overview') && (
            <div className="space-y-8">
              
              {/* 1. HÀNH TRÌNH HÌNH THÀNH (4 Steps with Step Numbers & Images) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-[#F47A1F]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      Hành trình hình thành
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Từ nguồn dược liệu đến sản phẩm hoàn chỉnh</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(product.journeySteps || [
                    {
                      stepNumber: '01',
                      title: 'Khởi nguồn từ thiên nhiên',
                      desc: 'Lấy cảm hứng từ dược liệu quý của vùng núi cao, tìm kiếm giống Cordyceps militaris thuần chủng.',
                      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      stepNumber: '02',
                      title: 'Nghiên cứu & chọn lọc',
                      desc: 'Ứng dụng khoa học hiện đại để phân lập, nuôi cấy và chọn lọc chủng nấm có dược tính vượt trội.',
                      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      stepNumber: '03',
                      title: 'Nuôi trồng công nghệ cao',
                      desc: 'Sản xuất trong phòng sạch đạt chuẩn, kiểm soát chặt chẽ nhiệt độ, độ ẩm và dinh dưỡng.',
                      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      stepNumber: '04',
                      title: 'Lan tỏa giá trị sức khỏe',
                      desc: 'Mang sản phẩm chất lượng đến cộng đồng, góp phần nâng cao sức khỏe và chất lượng cuộc sống.',
                      image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
                    },
                  ]).map((step, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-orange-100 p-4 space-y-3 shadow-2xs hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#F47A1F] text-white font-black text-xs flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{step.title}</h4>
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-100">
                        <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. NGUỒN GỐC & GIÁ TRỊ NỔI BẬT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Card: Nguồn gốc & quy trình */}
                <div className="bg-white p-5 rounded-2xl border border-orange-100 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase">Nguồn gốc & Quy trình</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                      <MapPin className="w-4 h-4 text-[#F47A1F] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Nguồn gốc:</span>
                        <span className="text-slate-600">{product.producerAddress || 'Hòa Phong, Hòa Vang, Đà Nẵng'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                      <Leaf className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Giống chủng:</span>
                        <span className="text-slate-600">Cordyceps militaris thuần chủng</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Tiêu chuẩn:</span>
                        <span className="text-slate-600">Khép kín – chuẩn GMP – ISO 22000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Giá trị nổi bật */}
                <div className="bg-white p-5 rounded-2xl border border-orange-100 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase">Giá trị nổi bật</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#F47A1F]" />
                      <span className="font-bold text-slate-800">Tăng cường sức đề kháng</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-slate-800">Hỗ trợ bồi bổ cơ thể</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5">
                      <Leaf className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-slate-800">Chống oxy hóa</span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5">
                      <Heart className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-800">Phù hợp mọi lứa tuổi</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ĐIỂM BÁN GẦN BẠN (Matches Figma Screenshot 1 & 3) */}
          {(activeTab === 'points' || activeTab === 'overview') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#F47A1F]" />
                    Điểm bán gần bạn ({product.sellingLocations?.length || 5})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Các cửa hàng, đại lý ủy quyền phân phối sản phẩm này</p>
                </div>

                <button
                  onClick={() => onFindSellingPoints(product)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F47A1F] text-white hover:bg-[#D9630F] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                  <span>Định vị trên bản đồ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(product.sellingLocations || [
                  {
                    id: 'loc-store-a',
                    name: 'Cửa hàng OCOP A',
                    distanceStr: '0,6 km',
                    address: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
                    district: 'Hải Châu',
                    rating: 4.8,
                    reviewCount: 56,
                    stockStatus: 'Còn hàng',
                    lat: 16.0601,
                    lng: 108.2152,
                  },
                  {
                    id: 'loc-store-b',
                    name: 'Đặc sản Đà Nẵng B',
                    distanceStr: '1,2 km',
                    address: '78 Lê Duẩn, Hải Châu, Đà Nẵng',
                    district: 'Hải Châu',
                    rating: 4.6,
                    reviewCount: 32,
                    stockStatus: 'Sắp hết hàng',
                    lat: 16.0699,
                    lng: 108.2120,
                  },
                  {
                    id: 'loc-store-c',
                    name: 'Siêu thị đặc sản C',
                    distanceStr: '2,1 km',
                    address: '255 Nguyễn Hữu Thọ, Hải Châu, Đà Nẵng',
                    district: 'Hải Châu',
                    rating: 4.5,
                    reviewCount: 18,
                    stockStatus: 'Còn hàng',
                    lat: 16.0425,
                    lng: 108.2091,
                  },
                ]).map((store) => (
                  <div
                    key={store.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#F47A1F] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#F47A1F]">
                          {store.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          store.stockStatus === 'Còn hàng' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {store.stockStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-0.5 text-slate-700 font-bold">
                          <MapPin className="w-3 h-3 text-[#F47A1F]" />
                          {store.distanceStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {store.rating} ({store.reviewCount})
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {store.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onSelectStore(store)}
                        className="py-1.5 px-2 rounded-xl text-[11px] font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 text-center cursor-pointer"
                      >
                        Xem cửa hàng
                      </button>
                      <button
                        onClick={() => onSelectStore(store)}
                        className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-[#F47A1F] text-white hover:bg-[#D9630F] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Chỉ đường</span>
                        <Navigation className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUY TRÌNH SẢN XUẤT (Matches Figma Screenshot 3 & 4) */}
          {(activeTab === 'process' || activeTab === 'overview') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    6 bước quy trình sản xuất chuẩn OCOP
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Quy trình khép kín đảm bảo vệ sinh an toàn thực phẩm</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(product.productionSteps || [
                  { stepNumber: '01', title: 'Chọn giống', desc: 'Chọn lọc chủng nấm Cordyceps militaris thuần chủng, chất lượng cao.' },
                  { stepNumber: '02', title: 'Nhân giống', desc: 'Nhân giống trong môi trường dinh dưỡng vô trùng, kiểm soát nhiệt độ & độ ẩm.' },
                  { stepNumber: '03', title: 'Ươm sợi', desc: 'Sợi nấm phát triển khỏe mạnh trong phòng sạch vô trùng.' },
                  { stepNumber: '04', title: 'Nuôi trồng quả thể', desc: 'Điều khiển ánh sáng, nhiệt độ, độ ẩm tối ưu để hình thành quả thể.' },
                  { stepNumber: '05', title: 'Thu hoạch & sấy', desc: 'Thu hoạch đúng thời điểm, sấy khô bằng công nghệ sấy lạnh giữ nguyên dưỡng chất.' },
                  { stepNumber: '06', title: 'Đóng gói & kiểm định', desc: 'Đóng gói trong điều kiện vô trùng, kiểm định chất lượng trước khi xuất xưởng.' },
                ]).map((pstep, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3 shadow-2xs">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-[#F47A1F] font-black text-xs flex items-center justify-center shrink-0">
                      {pstep.stepNumber}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">{pstep.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">{pstep.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HƯỚNG DẪN & CÔNG DỤNG (Matches Figma Screenshot 3) */}
          {(activeTab === 'guide' || activeTab === 'overview') && (
            <div className="bg-white p-5 rounded-3xl border border-orange-100 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase">Cách dùng – Công dụng – Bảo quản</h3>
              
              {/* Internal Tabs */}
              <div className="flex gap-2 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setActiveGuideTab('usage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeGuideTab === 'usage' ? 'bg-orange-100 text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cách dùng
                </button>
                <button
                  onClick={() => setActiveGuideTab('benefits')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeGuideTab === 'benefits' ? 'bg-orange-100 text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Công dụng
                </button>
                <button
                  onClick={() => setActiveGuideTab('storage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeGuideTab === 'storage' ? 'bg-orange-100 text-[#F47A1F]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Bảo quản
                </button>
              </div>

              {/* Guide Bullet List */}
              <div className="space-y-2 text-xs">
                {activeGuideTab === 'usage' && (product.usageGuides?.usageList || [
                  'Pha với nước ấm (70–80°C) như trà hàng ngày.',
                  'Hầm cùng canh, súp hoặc các món bổ dưỡng.',
                  'Ngâm mật ong hoặc rượu để tăng hương vị và dưỡng chất.',
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#F47A1F] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}

                {activeGuideTab === 'benefits' && (product.usageGuides?.benefitsList || [
                  'Hỗ trợ tăng cường sức đề kháng và thể lực.',
                  'Giúp bồi bổ cơ thể, hỗ trợ chức năng hô hấp.',
                  'Chống oxy hóa, làm chậm quá trình lão hóa.',
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}

                {activeGuideTab === 'storage' && (product.usageGuides?.storageList || [
                  'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.',
                  'Đậy kín nắp sau khi sử dụng để giữ chất lượng.',
                  'Nhiệt độ bảo quản lý tưởng: 15–25°C.',
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VERIFICATION CERTIFICATE PANEL (Matches Figma Screenshot 3 & 4) */}
          <div className="bg-white p-5 rounded-3xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#F47A1F] uppercase text-xs">Chứng nhận OCOP:</span>
                <span className="font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                  ★ OCOP {product.verificationCert?.starRating || 4} Sao
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã xác thực
                </span>
              </div>
              <p className="font-bold text-slate-900">
                Đơn vị sản xuất: {product.verificationCert?.producerName || 'Công ty TNHH Dược liệu Đà Nẵng'}
              </p>
              <p className="text-slate-500">
                Địa chỉ: {product.verificationCert?.address || 'Hòa Phong, Hòa Vang, Đà Nẵng'}
              </p>
              <p className="text-slate-500">
                Mã truy xuất nguồn gốc: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold">{product.verificationCert?.certCode || 'DN-OCOP-000567'}</code>
              </p>
            </div>

            {/* QR Code and Button */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={product.verificationCert?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DN-OCOP-000567'}
                  alt="QR Code"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <button
                onClick={() => alert(`Hiển thị Giấy chứng nhận OCOP cho mã ${product.verificationCert?.certCode}`)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#F47A1F]" />
                <span>Xem giấy chứng nhận</span>
              </button>
            </div>
          </div>

          {/* SẢN PHẨM LIÊN QUAN */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase">Sản phẩm liên quan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct?.(rel)}
                  className="bg-white rounded-2xl border border-slate-200 p-2.5 hover:border-[#F47A1F] transition-all cursor-pointer group"
                >
                  <div className="h-24 rounded-xl overflow-hidden bg-slate-100 mb-2">
                    <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{rel.name}</p>
                  <p className="text-[11px] font-extrabold text-[#F47A1F] mt-0.5">{rel.priceStr}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* STICKY BOTTOM ACTIONS BAR (Matches Figma Screenshot 3 bottom sticky bar) */}
        <div className="p-4 bg-white border-t border-orange-100/80 flex items-center justify-between gap-3 shadow-lg z-20">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500 font-medium">Giá sản phẩm:</p>
            <p className="text-lg font-black text-[#F47A1F]">{product.priceStr}</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onFindSellingPoints(product)}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-[#F47A1F] hover:bg-[#D9630F] text-white text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Tìm điểm bán gần tôi</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Lưu sản phẩm"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
