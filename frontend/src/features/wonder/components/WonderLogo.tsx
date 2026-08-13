import React from 'react';

interface WonderLogoProps {
  /**
   * full          — biểu tượng + chữ nằm ngang (mặc định)
   * icon-only     — chỉ biểu tượng
   * wordmark-only — chỉ phần chữ "WONDER / OCOP ĐÀ NẴNG"
   * stacked       — biểu tượng trên, chữ dưới
   */
  variant?: 'full' | 'icon-only' | 'wordmark-only' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Đặt trên nền tối — phần chữ navy sẽ được làm sáng lên cho đọc được. */
  darkBg?: boolean;
  className?: string;
}

/**
 * Logo chính thức WONDER — OCOP Đà Nẵng.
 *
 * Dùng đúng file ảnh thương hiệu do chủ dự án cung cấp:
 *   /wonder-icon.png      biểu tượng chữ W lồng ghim bản đồ, kèm lá xanh và sóng biển
 *   /wonder-wordmark.png  chữ WONDER (cam → navy) và dòng OCOP ĐÀ NẴNG
 *
 * Cả hai đã được cắt sát nội dung và nền trong suốt, nên chỉ cần khống chế
 * chiều cao, chiều rộng tự co theo tỉ lệ gốc.
 */
export const WonderLogo: React.FC<WonderLogoProps> = ({
  variant = 'full',
  size = 'md',
  darkBg = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'h-8', wordmark: 'h-5', gap: 'gap-2' },
    md: { icon: 'h-11', wordmark: 'h-7', gap: 'gap-2.5' },
    lg: { icon: 'h-16', wordmark: 'h-10', gap: 'gap-3' },
    xl: { icon: 'h-24', wordmark: 'h-14', gap: 'gap-4' },
  };

  const dim = sizeMap[size];

  const IconAsset = (
    <img
      src="/wonder-icon.png"
      alt="Biểu tượng WONDER"
      className={`${dim.icon} w-auto object-contain shrink-0`}
    />
  );

  const WordmarkAsset = (
    <img
      src="/wonder-wordmark.png"
      alt="WONDER — OCOP Đà Nẵng"
      className={`${dim.wordmark} w-auto object-contain shrink-0 ${
        darkBg ? 'brightness-0 invert' : ''
      }`}
    />
  );

  if (variant === 'icon-only') {
    return <span className={`inline-flex ${className}`}>{IconAsset}</span>;
  }

  if (variant === 'wordmark-only') {
    return <span className={`inline-flex ${className}`}>{WordmarkAsset}</span>;
  }

  if (variant === 'stacked') {
    return (
      <span className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
        {IconAsset}
        {WordmarkAsset}
      </span>
    );
  }

  // full — mặc định
  return (
    <span className={`inline-flex items-center ${dim.gap} ${className}`}>
      {IconAsset}
      {WordmarkAsset}
    </span>
  );
};

export default WonderLogo;
