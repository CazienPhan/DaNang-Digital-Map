import React from 'react';

interface StoryMetaRowProps {
  /** Icon element from the project's Lucide set. */
  icon: React.ReactNode;
  /** Static UI label. */
  label: string;
  /** Database value — carries the stronger typography of the pair. */
  value: React.ReactNode;
}

/**
 * One "[icon] label / value" row of the founder metadata.
 * Shared so icon size, alignment and the label/value hierarchy stay identical
 * across every row, whatever the length of the value.
 */
export const StoryMetaRow: React.FC<StoryMetaRowProps> = React.memo(
  ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
      <span className="mt-px shrink-0 text-[#fd9401]" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
        <p className="break-words text-[11px] font-semibold leading-snug text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
);
