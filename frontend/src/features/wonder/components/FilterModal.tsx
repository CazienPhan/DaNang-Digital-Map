import React from 'react';
import { X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useEscapeToClose, dismissOnBackdrop } from '../hooks/useDismiss';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  onlyVerified: boolean;
  setOnlyVerified: (v: boolean) => void;
  onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  setSelectedDistrict,
  minRating,
  setMinRating,
  onlyVerified,
  setOnlyVerified,
  onReset,
}) => {
  // Cho phép thoát bằng phím Esc, không bắt buộc bấm nút ✕
  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  // Đủ 6 quận + 1 huyện của Đà Nẵng. Thiếu quận nào thì địa điểm thuộc quận đó
  // sẽ không thể lọc ra được, nên danh sách này phải khớp với dữ liệu.
  const districts = [
    'Tất cả',
    'Hải Châu',
    'Thanh Khê',
    'Sơn Trà',
    'Ngũ Hành Sơn',
    'Liên Chiểu',
    'Cẩm Lệ',
    'Hòa Vang',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={dismissOnBackdrop(onClose)}>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#FFF9F3]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#F47A1F]" />
            <h3 className="font-extrabold text-base text-[#1F2937]">Bộ lọc tìm kiếm</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-xs font-medium">
          {/* Quận / Huyện */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Quận / Huyện Đà Nẵng</label>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDistrict === d
                      ? 'bg-[#F47A1F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Đánh giá tối thiểu */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Đánh giá tối thiểu</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    minRating === r
                      ? 'bg-[#14213D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r === 0 ? 'Tất cả sao' : `★ ${r}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Chỉ hiển thị Đã xác thực */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-bold text-slate-800 text-xs">Chỉ địa điểm đã xác thực</p>
              <p className="text-[11px] text-slate-500">Hiển thị các địa điểm có huy hiệu chính thức</p>
            </div>
            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                onlyVerified ? 'bg-[#10B981]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  onlyVerified ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button
            onClick={onReset}
            className="w-1/3 py-2.5 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
          <button
            onClick={onClose}
            className="w-2/3 py-2.5 rounded-2xl text-xs font-bold bg-[#F47A1F] text-white hover:bg-[#D9630F] transition-colors cursor-pointer"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};
