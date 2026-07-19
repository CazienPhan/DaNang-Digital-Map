import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useOpeningHours } from '../../hooks/useOpeningHours';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PoiOpeningHoursProps {
    /** Raw gio_mo_cua value from POIDetailData */
    hours: Record<string, string> | null | undefined;
}

// ---------------------------------------------------------------------------
// Status badge — maps status → colour + label
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
    open: {
        dot: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        label: 'Đang mở cửa',
    },
    open_24h: {
        dot: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        label: 'Mở 24 giờ',
    },
    closed: {
        dot: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        label: 'Đã đóng cửa',
    },
    no_data: {
        dot: 'bg-stone-400',
        text: 'text-stone-500',
        label: 'Không có thông tin',
    },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PoiOpeningHours: React.FC<PoiOpeningHoursProps> = React.memo(
    ({ hours }) => {
        const {
            hasSchedule,
            status,
            todayLabel,
            todayValue,
            weekRows,
            nextOpenTime,
            closedMessage,
        } = useOpeningHours(hours);

        const [isExpanded, setIsExpanded] = useState(false);
        const toggle = useCallback(() => setIsExpanded((v) => !v), []);

        // Render nothing when no schedule data exists
        if (!hasSchedule) return null;

        const cfg = STATUS_CONFIG[status];

        return (
            <>
                {/* Header + Status */}
                <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground/70">
                        Giờ mở cửa
                    </span>

                    <div className={`flex items-center gap-1.5 shrink-0 ${cfg.text}`}>
                        <span
                            className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`}
                            aria-hidden="true"
                        />
                        <span className="text-xs font-semibold whitespace-nowrap">
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {/* Today — active interval (open) or closed-day label */}
                {todayValue && status !== 'open_24h' && (
                    <div className="flex items-center justify-between text-xs mt-2">
                        <span className="font-medium text-foreground">
                            {todayLabel}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                            {todayValue}
                        </span>
                    </div>
                )}

                {/* Between-intervals or end-of-day closed hints */}
                {status === 'closed' && (
                    <>
                        {/* "Opens again at HH:MM" — shown when between two intervals */}
                        {!closedMessage && nextOpenTime && (
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Mở cửa lại lúc{' '}
                                <span className="font-semibold text-foreground tabular-nums">
                                    {nextOpenTime}
                                </span>
                            </p>
                        )}

                        {/* "Today's hours have ended" — shown after the last interval */}
                        {closedMessage && (
                            <p className="text-xs text-muted-foreground mt-1.5">
                                {closedMessage}
                            </p>
                        )}

                        {/* Next-day hint — shown alongside the end-of-day message */}
                        {closedMessage && nextOpenTime && (
                            <p className="text-xs text-muted-foreground">
                                {nextOpenTime}
                            </p>
                        )}
                    </>
                )}

                {/* Expand */}
                {weekRows.length > 1 && (
                    <button
                        type="button"
                        onClick={toggle}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Ẩn lịch tuần' : 'Xem lịch tuần'}
                        className="
                            flex items-center gap-1 mt-2
                            text-xs font-medium text-muted-foreground
                            hover:text-foreground
                            transition-colors
                            cursor-pointer
                            select-none
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ring
                            rounded
                        "
                    >
                        {isExpanded ? (
                            <>
                                Ẩn lịch tuần
                                <ChevronUp size={13} strokeWidth={2.2} />
                            </>
                        ) : (
                            <>
                                Xem lịch tuần
                                <ChevronDown size={13} strokeWidth={2.2} />
                            </>
                        )}
                    </button>
                )}

                {/* Weekly Schedule */}
                <div
                    className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
                    `}
                    aria-hidden={!isExpanded}
                >
                    <div className="border-t border-border/40 pt-2 flex flex-col">
                        {weekRows.map((row) => (
                            <div
                                key={row.key}
                                className={`
                                    flex justify-between items-start py-1.5 text-xs gap-4
                                    ${row.isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'}
                                `}
                            >
                                <span className="shrink-0">{row.label}</span>
                                {/* Each interval on its own line — single intervals look identical */}
                                <div className="flex flex-col items-end gap-0.5 tabular-nums text-right">
                                    {row.intervals.map((interval, i) => (
                                        <span key={i}>{interval}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    });
