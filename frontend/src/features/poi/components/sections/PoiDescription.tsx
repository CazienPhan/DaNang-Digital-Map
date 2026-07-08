import React from 'react';

interface PoiDescriptionProps {
  description?: string;
  name?: string;
}

export const PoiDescription: React.FC<PoiDescriptionProps> = React.memo(({ description, name }) => {
  if (!description) return null;

  return (
    <div className="bg-[#F5EFE3] font-normal rounded-2xl border border-amber-200/60 p-5">
      <h2 className="text-base font-bold text-stone-800 leading-tight mb-1.5">
        {name}
      </h2>
      <p className="text-xs leading-relaxed text-stone-700 text-justify">
        {description}
      </p>
    </div>
  );
});
