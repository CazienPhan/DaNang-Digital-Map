import React from 'react';
import { Store, MapPin, ChevronsRight } from 'lucide-react';

interface ProductDetailDiscoverSectionProps {
  productName: string;
  onDiscoverManufacturers?: () => void;
}

interface DiscoverCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  arrowColor: string;
  onClick?: () => void;
}

const DiscoverCard: React.FC<DiscoverCardProps> = ({
  icon,
  title,
  subtitle,
  bgColor,
  textColor,
  arrowColor,
  onClick,
}) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="flex h-full w-full flex-col items-start gap-2 rounded-2xl p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex w-full justify-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
          {icon}
        </div>
      </div>
      <p className="text-sm font-bold leading-snug" style={{ color: textColor }}>
        {title}
      </p>
      <p className="text-[10px] leading-snug" style={{ color: textColor }}>
        {subtitle}
      </p>
      <div className="mt-auto flex w-full justify-center pt-1">
        <ChevronsRight size={20} style={{ color: arrowColor }} />
      </div>
    </Tag>
  );
};

/**
 * ProductDetailDiscoverSection — bottom "Khám phá những điều thú vị hơn?"
 * block: a header + two cards (manufacturer / where-to-eat). Card texts
 * always interpolate the current product's name, never hardcoded.
 */
export const ProductDetailDiscoverSection: React.FC<ProductDetailDiscoverSectionProps> = ({
  productName,
  onDiscoverManufacturers,
}) => {
  return (
    <div className="mt-6 border-t pt-4">
      <h2 className="text-base font-extrabold uppercase text-foreground">
        Khám phá những điều thú vị hơn?
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Chọn hành trình phù hợp với bạn để khám phá sâu hơn về {productName}.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <DiscoverCard
          icon={<Store size={18} color="#13aa22" />}
          title="Khám phá nhà sản xuất"
          subtitle={`Xem các cơ sở gìn giữ và sản xuất ${productName}`}
          bgColor="#f3ffee"
          textColor="#004926"
          arrowColor="#13aa22"
          onClick={onDiscoverManufacturers}
        />
        <DiscoverCard
          icon={<MapPin size={18} color="#ff9500" />}
          title="Nơi thưởng thức"
          subtitle={`Tìm quán ăn, nhà hàng phục vụ ${productName}`}
          bgColor="#fff8eb"
          textColor="#720000"
          arrowColor="#ff9500"
        />
      </div>
    </div>
  );
};

export default ProductDetailDiscoverSection;
