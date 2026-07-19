import React from 'react';
import { MapPin, Phone, Globe, Briefcase, CalendarDays, Ticket, Clock } from 'lucide-react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { PoiOpeningHours } from './PoiOpeningHours';
import { parseSchedule } from '../../utils/openingHoursParser';

interface PoiInformationProps {
  poi: POIDetailData;
  /** Raw gio_mo_cua from POIDetailData — rendered as the final row */
  openingHours?: Record<string, string> | null;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label?: string;
  children: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
    <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      {label && <p className="text-xs font-semibold tracking-wider text-muted-foreground/70 mb-0.5">{label}</p>}
      <div className="text-xs text-foreground">{children}</div>
    </div>
  </div>
);

export const PoiInformation: React.FC<PoiInformationProps> = React.memo(({ poi, openingHours }) => {
  const isTourism = poi.poi_type === 'TOURISM';

  // Parse phone number list
  let displayPhone = '';
  if (poi.sdt) {
    try {
      const numbers = JSON.parse(poi.sdt);
      displayPhone = Array.isArray(numbers) && numbers.length > 0 ? numbers.join(', ') : poi.sdt;
    } catch {
      displayPhone = poi.sdt;
    }
  }

  // Parse website list
  const websiteList: string[] = [];
  if (poi.website) {
    if (Array.isArray(poi.website)) {
      websiteList.push(...poi.website);
    } else if (typeof (poi.website as any) === 'string' && (poi.website as any).trim() !== '') {
      websiteList.push(poi.website as any);
    }
  }

  // Determine whether the raw opening hours object contains at least one
  // meaningful (non-empty, non-whitespace) value — mirrors what the hook does.
  const hasValidOpeningHours = parseSchedule(openingHours) !== null;

  const hasAnyInfo =
    poi.dia_chi ||
    displayPhone ||
    websiteList.length > 0 ||
    (!isTourism && poi.nganh_hang) ||
    (isTourism && (poi.nam_xay_dung || poi.gia_ve)) ||
    hasValidOpeningHours;

  if (!hasAnyInfo) return null;

  return (
    <div className="bg-card border border-border/60 rounded-2xl px-4 py-1">
      {/* Category / Nganh Hang (Business only) */}
      {!isTourism && poi.nganh_hang && (
        <InfoRow icon={<Briefcase size={16} />} label="Ngành hàng">
          <span className="font-normal text-xs">{poi.nganh_hang}</span>
        </InfoRow>
      )}

      {/* Tourism properties */}
      {isTourism && poi.nam_xay_dung && (
        <InfoRow icon={<CalendarDays size={16} />} label="Năm xây dựng">
          {poi.nam_xay_dung}
        </InfoRow>
      )}
      {isTourism && poi.gia_ve && (
        <InfoRow icon={<Ticket size={16} />} label="Giá vé">
          {poi.gia_ve}
        </InfoRow>
      )}

      {/* Address */}
      {poi.dia_chi && (
        <InfoRow icon={<MapPin size={16} />} label="Địa chỉ">
          {poi.dia_chi}
        </InfoRow>
      )}

      {/* Phone */}
      {displayPhone && (
        <InfoRow icon={<Phone size={16} />} label="Điện thoại">
          <a href={`tel:${displayPhone.split(',')[0].trim()}`} className="text-blue-600 hover:underline">
            {displayPhone}
          </a>
        </InfoRow>
      )}

      {/* Website */}
      {websiteList.length > 0 && (
        <InfoRow icon={<Globe size={16} />} label="Website">
          <div className="flex flex-col gap-1">
            {websiteList.map((url, idx) => {
              let label = url;
              try {
                label = new URL(url).hostname.replace('www.', '');
              } catch { /* fallback */ }
              return (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate">
                  {label}
                </a>
              );
            })}
          </div>
        </InfoRow>
      )}

      {/* Opening Hours — only rendered when at least one valid schedule entry exists */}
      {hasValidOpeningHours && (
        <InfoRow icon={<Clock size={16} />}>
          <PoiOpeningHours hours={openingHours} />
        </InfoRow>
      )}
    </div>
  );
});
