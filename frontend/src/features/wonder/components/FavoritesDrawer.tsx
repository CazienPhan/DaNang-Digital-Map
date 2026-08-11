import React from 'react';
import type { LocationItem } from '../types';
import { useEscapeToClose, dismissOnBackdrop } from '../hooks/useDismiss';
import { X, Heart, Trash2 } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  locations: LocationItem[];
  onSelectLocation: (loc: LocationItem) => void;
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  locations,
  onSelectLocation,
  onRemoveFavorite,
  onClearAll,
}) => {
  // Cho phép thoát bằng phím Esc, không bắt buộc bấm nút ✕
  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  const favLocations = locations.filter((loc) => favorites.includes(loc.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={dismissOnBackdrop(onClose)}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#FFF9F3]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h3 className="font-extrabold text-base text-[#1F2937]">
              Danh sách yêu thích ({favLocations.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {favLocations.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">Chưa có địa điểm yêu thích nào.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Nhấn biểu tượng trái tim trên thẻ địa điểm để lưu vào đây.
              </p>
            </div>
          ) : (
            favLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200 hover:border-[#F47A1F] bg-white flex gap-3 cursor-pointer transition-all group"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-[#F47A1F]">
                      {loc.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 inline-block mt-0.5">
                      {loc.categoryLabel}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-1">📍 {loc.address}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700">{loc.distanceStr}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(loc.id);
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {favLocations.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button
              onClick={onClearAll}
              className="w-full py-2.5 rounded-2xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
