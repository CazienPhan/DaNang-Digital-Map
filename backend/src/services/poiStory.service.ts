import sql from '../db';
import { type ProductRecord } from './product.service';

/**
 * Business-story data for a single POI ("Câu chuyện" tab).
 *
 * Every value returned here comes from the database. Nothing is defaulted,
 * substituted or synthesised: a missing value stays null / empty so the UI can
 * hide the corresponding block instead of rendering a placeholder.
 *
 * Relationships used (all already defined in the schema):
 *   poi.poi_details_business.poi_id → poi.pois.id   (business membership)
 *   poi.poi_story.poi_id            → poi.pois.id
 *   poi.poi_media.poi_id            → poi.pois.id
 *   poi.certifications.poi_id       → poi.pois.id   (business-level certificates)
 *   poi.product_listings(poi_id, product_id) → poi.products.id
 *     (the same junction the "Sản phẩm" tab uses — see ProductService)
 */

/** Exact poi_media.media_category values that make up the story tab. */
export const STORY_MEDIA_CATEGORIES = [
  'business_story',
  'founder_story',
  'process_story',
  'tham_quan_story',
] as const;

export type StoryMediaCategory = (typeof STORY_MEDIA_CATEGORIES)[number];

export interface StoryMediaItem {
  id: string;
  media_type: string | null;
  media_category: StoryMediaCategory;
  url: string;
  caption: string | null;
  is_primary: boolean;
}

/**
 * poi_story.founder_info (jsonb). Only the keys actually configured in the
 * database are read; anything absent is returned as null.
 *
 * `founder_story` is read when present so a separate journey narrative can be
 * configured later; today the journey text is stored under `founder_quote`.
 */
export interface StoryFounderInfo {
  founder_name: string | null;
  founded_year: number | null;
  founder_role: string | null;
  founder_story: string | null;
  founder_quote: string | null;
  experience_description: string | null;
}

/** One entry of poi_story.quy_trinh_steps (jsonb array). */
export interface StoryProcessStep {
  step_number: number;
  description: string;
}

export interface StoryCertification {
  id: string;
  cert_name: string | null;
  cert_type: string | null;
  certificate_file_url: string;
}

/** A highlighted product, shaped exactly like the products the "Sản phẩm" tab
 *  already returns, plus the two story-specific columns. */
export interface StoryProductRecord extends ProductRecord {
  product_label: string | null;
  story_content: string | null;
}

export interface PoiStoryRecord {
  poi_id: string;
  /** True only when a poi.poi_details_business row exists for this POI. */
  is_business: boolean;
  gioi_thieu: string | null;
  founder: StoryFounderInfo | null;
  process_steps: StoryProcessStep[];
  media: Record<StoryMediaCategory, StoryMediaItem[]>;
  products: StoryProductRecord[];
  certifications: StoryCertification[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyMedia(): Record<StoryMediaCategory, StoryMediaItem[]> {
  return {
    business_story: [],
    founder_story: [],
    process_story: [],
    tham_quan_story: [],
  };
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** Reads founder_info (jsonb) without inventing values — absent keys stay null. */
function parseFounderInfo(raw: unknown): StoryFounderInfo | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const info = raw as Record<string, unknown>;

  const yearRaw = info.founded_year;
  const foundedYear =
    typeof yearRaw === 'number' && Number.isFinite(yearRaw)
      ? yearRaw
      : typeof yearRaw === 'string' && yearRaw.trim() !== '' && Number.isFinite(Number(yearRaw))
        ? Number(yearRaw)
        : null;

  const founder: StoryFounderInfo = {
    founder_name: nonEmptyString(info.founder_name),
    founded_year: foundedYear,
    founder_role: nonEmptyString(info.founder_role),
    founder_story: nonEmptyString(info.founder_story),
    founder_quote: nonEmptyString(info.founder_quote),
    experience_description: nonEmptyString(info.experience_description),
  };

  const hasAnyValue = Object.values(founder).some((v) => v !== null);
  return hasAnyValue ? founder : null;
}

/**
 * Reads quy_trinh_steps (jsonb array) and orders it by step_number ASC.
 * Array/insertion order is never trusted — the stored step_number decides.
 * Entries without a usable step_number or description are dropped.
 */
function parseProcessSteps(raw: unknown): StoryProcessStep[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry): StoryProcessStep | null => {
      if (!entry || typeof entry !== 'object') return null;
      const step = entry as Record<string, unknown>;

      const numRaw = step.step_number;
      const stepNumber =
        typeof numRaw === 'number' && Number.isFinite(numRaw)
          ? numRaw
          : typeof numRaw === 'string' && numRaw.trim() !== '' && Number.isFinite(Number(numRaw))
            ? Number(numRaw)
            : null;

      const description = nonEmptyString(step.description);
      if (stepNumber === null || description === null) return null;

      return { step_number: stepNumber, description };
    })
    .filter((s): s is StoryProcessStep => s !== null)
    .sort((a, b) => a.step_number - b.step_number);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class PoiStoryService {
  /**
   * Loads every piece of business-story data for ONE POI.
   *
   * Returns null when the POI does not exist (the route answers 404).
   * When the POI has no poi_details_business row, `is_business` is false and
   * all story collections are empty — the story tab does not apply to it.
   */
  static async getStoryByPoiId(id: string): Promise<PoiStoryRecord | null> {
    const cleanId = id.startsWith('database-poi-') ? id.replace('database-poi-', '') : id;

    try {
      // 1. POI existence + business membership + the poi_story row itself.
      const baseRows = await sql`
        SELECT
          p.id,
          (b.poi_id IS NOT NULL) AS is_business,
          s.gioi_thieu,
          s.founder_info,
          s.quy_trinh_steps
        FROM poi.pois p
        LEFT JOIN poi.poi_details_business b ON b.poi_id = p.id
        LEFT JOIN poi.poi_story s ON s.poi_id = p.id
        WHERE p.id = ${cleanId}
        ORDER BY s.id ASC
        LIMIT 1
      `;

      if (baseRows.length === 0) {
        return null;
      }

      const base = baseRows[0];
      const isBusiness = base.is_business === true;

      // The story tab only applies to POIs represented in poi_details_business.
      if (!isBusiness) {
        return {
          poi_id: base.id,
          is_business: false,
          gioi_thieu: null,
          founder: null,
          process_steps: [],
          media: emptyMedia(),
          products: [],
          certifications: [],
        };
      }

      // 2. Related records — only for this POI, fetched in parallel.
      const [mediaRows, productRows, certRows] = await Promise.all([
        sql`
          SELECT
            m.id,
            m.media_type,
            m.media_category,
            m.url,
            m.caption,
            m.is_primary
          FROM poi.poi_media m
          WHERE m.poi_id = ${cleanId}
            AND m.media_category IN ${sql([...STORY_MEDIA_CATEGORIES])}
            AND m.url IS NOT NULL
            AND m.url <> ''
          ORDER BY m.id ASC
        `,
        sql`
          SELECT
            pr.id,
            pr.name,
            pr.description,
            pr.is_ocop,
            pr.hinh_anh_url,
            pr.danh_muc,
            pr.product_type,
            pr.is_available,
            pr.product_label,
            pr.story_content,
            pl.price_min,
            pl.price_max,
            pl.stock_status,
            oc.certificate_file_url,
            oc.so_sao AS ocop_so_sao
          FROM poi.product_listings pl
          JOIN poi.products pr ON pr.id = pl.product_id
          LEFT JOIN poi.certifications oc ON oc.product_id = pr.id
          WHERE pl.poi_id = ${cleanId}
            AND pr.is_highlighted = true
            AND (pr.is_available IS NULL OR pr.is_available = true)
          ORDER BY pr.name ASC
        `,
        sql`
          SELECT
            c.id,
            c.cert_name,
            c.cert_type,
            c.certificate_file_url
          FROM poi.certifications c
          WHERE c.poi_id = ${cleanId}
            AND c.certificate_file_url IS NOT NULL
            AND c.certificate_file_url <> ''
          ORDER BY c.id ASC
        `,
      ]);

      const media = emptyMedia();
      mediaRows.forEach((raw: any) => {
        const category = raw.media_category as StoryMediaCategory;
        if (!media[category]) return;
        media[category].push({
          id: String(raw.id),
          media_type: raw.media_type || null,
          media_category: category,
          url: raw.url,
          caption: raw.caption || null,
          is_primary: raw.is_primary === true,
        });
      });

      const products = productRows.map((raw: any): StoryProductRecord => ({
        id: raw.id,
        name: raw.name,
        description: raw.description || null,
        is_ocop: raw.is_ocop ?? null,
        hinh_anh_url: raw.hinh_anh_url || null,
        danh_muc: raw.danh_muc || null,
        product_type: raw.product_type || null,
        is_available: raw.is_available ?? null,
        price_min:
          raw.price_min !== null && raw.price_min !== undefined ? Number(raw.price_min) : null,
        price_max:
          raw.price_max !== null && raw.price_max !== undefined ? Number(raw.price_max) : null,
        stock_status: raw.stock_status || null,
        certificate_file_url: raw.certificate_file_url || null,
        ocop_so_sao:
          raw.ocop_so_sao !== null && raw.ocop_so_sao !== undefined ? Number(raw.ocop_so_sao) : null,
        product_label: raw.product_label || null,
        story_content: raw.story_content || null,
      }));

      const certifications = certRows.map((raw: any): StoryCertification => ({
        id: String(raw.id),
        cert_name: raw.cert_name || null,
        cert_type: raw.cert_type || null,
        certificate_file_url: raw.certificate_file_url,
      }));

      return {
        poi_id: base.id,
        is_business: true,
        gioi_thieu: nonEmptyString(base.gioi_thieu),
        founder: parseFounderInfo(base.founder_info),
        process_steps: parseProcessSteps(base.quy_trinh_steps),
        media,
        products,
        certifications,
      };
    } catch (err: any) {
      console.error(`Error fetching business story for POI ${id}:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}
