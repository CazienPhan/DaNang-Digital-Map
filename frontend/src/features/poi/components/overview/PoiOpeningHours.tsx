import React from 'react';
import {
  translateDay,
  translateTimeValue,
  getOpenClosedStatus,
} from "../../utils/openingHours";

interface PoiOpeningHoursProps {
  hours: Record<string, string> | null;
}

export const PoiOpeningHours: React.FC<PoiOpeningHoursProps> = React.memo(({ hours }) => {
  if (!hours) return null;
  const status = getOpenClosedStatus(hours);

  return (
    <div className="poi-opening-hours-section">
      <h3 className="section-title text-sm font-semibold uppercase tracking-wide text-muted-foreground">Giờ mở cửa</h3>
      {status && (
        <div className="poi-status-badge text-xs font-medium" style={{ color: status.color }}>
          {status.label}
        </div>
      )}
      <div className="hours-list-redesigned">
        {Object.entries(hours).map(([day, time]) => (
          <div key={day} className="hours-day-row-redesigned">
            <span className="hours-day-redesigned text-sm font-medium text-foreground">{translateDay(day)}</span>
            <span className="hours-time-redesigned text-sm text-muted-foreground leading-relaxed">{translateTimeValue(time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
