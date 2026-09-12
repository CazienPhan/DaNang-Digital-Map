import { useEffect, useState } from 'react';
import PoiStoryClientService, { type PoiStoryData } from '@/services/supabase/poiStory.service';

export interface UsePoiStoryResult {
  story: PoiStoryData | null;
  loading: boolean;
  error: string | null;
}

/** Last completed request, tagged with the POI it belongs to. */
interface StoryResult {
  poiId: string;
  story: PoiStoryData | null;
  error: string | null;
}

/**
 * Fetches the business-story bundle for a POI, the first time the
 * "Câu chuyện" tab is opened.
 *
 * `enabled` keeps the request lazy: nothing is fetched for POIs whose story tab
 * is never opened, and because the hook lives in PoiDetailCard (which stays
 * mounted while the user switches tabs) the data is fetched only once per POI.
 *
 * The result is tagged with its POI id, so a story is only ever returned for
 * the POI it was loaded for — selecting another POI reports "loading", never
 * the previous business's content.
 */
export function usePoiStory(
  poiId: string | undefined | null,
  enabled: boolean
): UsePoiStoryResult {
  const [result, setResult] = useState<StoryResult | null>(null);

  useEffect(() => {
    if (!poiId || !enabled) return;
    if (result?.poiId === poiId) return;

    let cancelled = false;

    PoiStoryClientService.getStoryByPoiId(poiId)
      .then((data) => {
        if (cancelled) return;
        setResult({ poiId, story: data, error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error('[usePoiStory] Failed to load business story:', err);
        setResult({
          poiId,
          story: null,
          error: err.message || 'Không thể kết nối đến máy chủ.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [poiId, enabled, result?.poiId]);

  const current = poiId && result?.poiId === poiId ? result : null;

  return {
    story: current?.story ?? null,
    // A request is in flight whenever the tab is active for a POI whose story
    // has not arrived yet — this also covers the first render after the user
    // selects a different POI.
    loading: Boolean(poiId && enabled) && current === null,
    error: current?.error ?? null,
  };
}
