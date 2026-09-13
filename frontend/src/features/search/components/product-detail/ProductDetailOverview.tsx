import React from 'react';

interface ProductDetailOverviewProps {
  name: string;
  overview: string | null;
  thumbnailUrl: string | null;
}

/** Groups words two at a time so long names wrap ~2 words/line; short names stay on one line. */
function toNameLines(name: string): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [words.join(' ')];
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(' '));
  }
  return lines;
}

/**
 * ProductDetailOverview — thumbnail/logo (left) + product name (right, same
 * row, ~2 words/line), then the overview paragraph. White background.
 */
export const ProductDetailOverview: React.FC<ProductDetailOverviewProps> = ({
  name,
  overview,
  thumbnailUrl,
}) => {
  const nameLines = toNameLines(name);

  return (
    <section className="w-full bg-white pt-4 pb-6 ">
      <div className="flex items-center gap-1.25">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={name}
            className="-ml-4 h-32 w-32 shrink-0 object-contain"
            loading="lazy"
          />
        )}
        <h1 className="font-display min-w-0 flex-1 text-left text-4xl font-bold leading-tight text-foreground">
          {nameLines.map((line, index) => (
            <span key={index} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </h1>
      </div>

      {overview && (
        <p className="mt-3 text-justify text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
          {overview}
        </p>
      )}
    </section>
  );
};

export default ProductDetailOverview;
