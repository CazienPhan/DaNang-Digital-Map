import React from 'react';
import { WonderLogo } from './WonderLogo';
import { X, Sparkles, MapPin, Award, Heart, CheckCircle2 } from 'lucide-react';
import { useEscapeToClose, dismissOnBackdrop } from '../hooks/useDismiss';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  // Cho phép thoát bằng phím Esc, không bắt buộc bấm nút ✕
  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={dismissOnBackdrop(onClose)}>
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#FFF9F3] flex items-center justify-between">
          <WonderLogo size="md" variant="full" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs text-slate-600 font-medium leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#14213D] text-white">
            <h3 className="font-extrabold text-sm text-[#F47A1F] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Sứ mệnh WONDER OCOP Đà Nẵng</span>
            </h3>
            <p className="text-slate-200">
              Nền tảng bản đồ số hóa du lịch & kết nối thương mại sản phẩm OCOP TP. Đà Nẵng. Giúp du khách dễ dàng tìm kiếm các điểm bán đạt chuẩn, cơ sở làng nghề truyền thống và các điểm đến trải nghiệm văn hóa địa phương.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">Giá trị cốt lõi nền tảng</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-bold text-slate-800 block text-xs">Xác thực 100%</span>
                <span className="text-[11px] text-slate-500">Mọi địa điểm & sản phẩm OCOP đều được kiểm duyệt chính thức.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin className="w-4 h-4 text-[#F47A1F] mb-1" />
                <span className="font-bold text-slate-800 block text-xs">Bản đồ tương tác</span>
                <span className="text-[11px] text-slate-500">Chỉ đường chính xác, tự động định vị khoảng cách gần nhất.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Award className="w-4 h-4 text-amber-500 mb-1" />
                <span className="font-bold text-slate-800 block text-xs">Chứng nhận OCOP</span>
                <span className="text-[11px] text-slate-500">Tôn vinh sản phẩm OCOP 3 sao, 4 sao, 5 sao chất lượng cao.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Heart className="w-4 h-4 text-red-500 mb-1" />
                <span className="font-bold text-slate-800 block text-xs">Lưu danh mục</span>
                <span className="text-[11px] text-slate-500">Đánh dấu địa điểm yêu thích và tạo lộ trình trải nghiệm riêng.</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
            💡 <strong>Mẹo sử dụng:</strong> Nhấp vào bất kỳ điểm ghim nào trên bản đồ hoặc chọn thẻ địa điểm để xem thông tin chi tiết, hình ảnh thực tế và lộ trình di chuyển.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-xs font-bold bg-[#F47A1F] text-white hover:bg-[#D9630F] transition-colors cursor-pointer"
          >
            Khám phá ngay
          </button>
        </div>
      </div>
    </div>
  );
};
