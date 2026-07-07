import React from 'react';

interface PoiDescriptionProps {
  description?: string;
}

export const PoiDescription: React.FC<PoiDescriptionProps> = React.memo(({ description }) => {
  if (!description) return null;

  return (
    <div className="poi-description-section">
      <h3 className="section-title text-sm font-semibold uppercase tracking-wide text-muted-foreground">Giới thiệu</h3>
      <p className="poi-description-text text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
});
