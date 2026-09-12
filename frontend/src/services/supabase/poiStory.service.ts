import { MAP4D_CONFIG } from '@/config/map.config';
import { mapProductRecord, type ProductItem } from './product.service';

// ─── Story UI contract ────────────────────────────────────────────────────────

/**
 * Business-story data for the "Câu chuyện" tab of a POI.
 *
 * Everything here is read from the database through
 * GET /api/pois/:id/story — no defaults, no placeholders. A missing value is
 * null / an empty array so the UI can hide the corresponding block.
 */

/** Exact poi_media.media_category values used by the story tab. */
export type StoryMediaCategory =
  | 'business_story'
  | 'founder_story'
  | 'process_story'
  | 'tham_quan_story';

export interface StoryMediaItem {
  id: string;
  /** poi_media.media_type — 'IMAGE' | 'VIDEO' as stored. */
  mediaType: string | null;
  category: StoryMediaCategory;
  /** poi_media.url */
  url: string;
  caption: string | null;
  /** poi_media.is_primary — decides the featured experience image. */
  isPrimary: boolean;
}

/** poi_story.founder_info (jsonb) — absent keys stay null. */
export interface StoryFounderInfo {
  founderName: string | null;
  foundedYear: number | null;
  founderRole: string | null;
  /** Journey narrative, when configured separately from the quote. */
  founderStory: string | null;
  founderQuote: string | null;
  experienceDescription: string | null;
}

/** One entry of poi_story.quy_trinh_steps, already ordered by step_number ASC. */
export interface StoryProcessStep {
  stepNumber: number;
  description: string;
}

export interface StoryCertification {
  id: string;
  /** certifications.cert_name — used for alt text / lightbox caption only. */
  name: string | null;
  type: string | null;
  /** certifications.certificate_file_url */
  imageUrl: string;
}

/**
 * A highlighted product (products.is_highlighted = true).
 * Extends the standard ProductItem so the existing product-detail flow can
 * open it unchanged, and adds the two story-specific columns.
 */
export interface StoryProductItem extends ProductItem {
  /** products.product_label */
  productLabel: string | null;
  /** products.story_content */
  storyContent: string | null;
}

export interface PoiStoryData {
  poiId: string;
  /** True only when the POI has a poi_details_business row. */
  isBusiness: boolean;
  /** poi_story.gioi_thieu */
  gioiThieu: string | null;
  founder: StoryFounderInfo | null;
  processSteps: StoryProcessStep[];
  media: Record<StoryMediaCategory, StoryMediaItem[]>;
  products: StoryProductItem[];
  certifications: StoryCertification[];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function emptyMedia(): Record<StoryMediaCategory, StoryMediaItem[]> {
  return {
    business_story: [],
    founder_story: [],
    process_story: [],
    tham_quan_story: [],
  };
}

function mapMedia(raw: any): Record<StoryMediaCategory, StoryMediaItem[]> {
  const media = emptyMedia();
  if (!raw || typeof raw !== 'object') return media;

  (Object.keys(media) as StoryMediaCategory[]).forEach((category) => {
    const items = Array.isArray(raw[category]) ? raw[category] : [];
    media[category] = items
      .filter((m: any) => typeof m?.url === 'string' && m.url.trim().length > 0)
      .map((m: any): StoryMediaItem => ({
        id: String(m.id),
        mediaType: m.media_type || null,
        category,
        url: m.url,
        caption: m.caption || null,
        isPrimary: m.is_primary === true,
      }));
  });

  return media;
}

function mapFounder(raw: any): StoryFounderInfo | null {
  if (!raw || typeof raw !== 'object') return null;

  const year = Number(raw.founded_year);

  const founder: StoryFounderInfo = {
    founderName: raw.founder_name || null,
    foundedYear: Number.isFinite(year) && raw.founded_year !== null ? year : null,
    founderRole: raw.founder_role || null,
    founderStory: raw.founder_story || null,
    founderQuote: raw.founder_quote || null,
    experienceDescription: raw.experience_description || null,
  };

  const hasAnyValue = Object.values(founder).some((v) => v !== null);
  return hasAnyValue ? founder : null;
}

function mapStory(raw: any): PoiStoryData {
  return {
    poiId: raw.poi_id,
    isBusiness: raw.is_business === true,
    gioiThieu: raw.gioi_thieu || null,
    founder: mapFounder(raw.founder),
    // The backend already orders steps by step_number ASC; the mapper keeps
    // that order rather than re-deriving one from the array position.
    processSteps: Array.isArray(raw.process_steps)
      ? raw.process_steps.map((s: any): StoryProcessStep => ({
          stepNumber: Number(s.step_number),
          description: s.description,
        }))
      : [],
    media: mapMedia(raw.media),
    products: Array.isArray(raw.products)
      ? raw.products.map((p: any): StoryProductItem => ({
          ...mapProductRecord(p),
          productLabel: p.product_label || null,
          storyContent: p.story_content || null,
        }))
      : [],
    certifications: Array.isArray(raw.certifications)
      ? raw.certifications
          .filter((c: any) => typeof c?.certificate_file_url === 'string' && c.certificate_file_url)
          .map((c: any): StoryCertification => ({
            id: String(c.id),
            name: c.cert_name || null,
            type: c.cert_type || null,
            imageUrl: c.certificate_file_url,
          }))
      : [],
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class PoiStoryClientService {
  /**
   * Fetches the business-story bundle for a single POI: poi_story, story media,
   * highlighted products and certifications — one request, one POI.
   */
  static async getStoryByPoiId(poiId: string): Promise<PoiStoryData> {
    const cleanId = poiId.startsWith('database-poi-')
      ? poiId.replace('database-poi-', '')
      : poiId;

    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/pois/${encodeURIComponent(cleanId)}/story`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.status === 'OK' && data.story) {
        return mapStory(data.story);
      }

      throw new Error(data.message || 'Malformed story response from server');
    } catch (error) {
      console.error(`Failed to load business story for POI ${poiId}:`, error);
      throw error;
    }
  }
}

export default PoiStoryClientService;
