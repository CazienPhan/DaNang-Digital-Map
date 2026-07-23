/**
 * meilisearch/settings/pois.settings.ts
 *
 * Single responsibility: hold the future Meilisearch configuration object
 * for the "pois" index.
 *
 * This file does NOT contain:
 *   - search logic
 *   - indexing logic
 *   - API requests
 *   - client references
 *
 * PHASE 2 PLAN — populate this object when ready:
 *
 *   export const POIS_SETTINGS: PoiIndexSettings = {
 *     searchableAttributes: ['name', 'dia_chi', 'category_name'],
 *     displayedAttributes:  ['*'],
 *     filterableAttributes: ['category_id', 'is_active', 'poi_type'],
 *     sortableAttributes:   ['so_sao', 'luot_danh_gia'],
 *     rankingRules:         ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
 *     typoTolerance:        { enabled: true },
 *     stopWords:            [],
 *     synonyms:             {},
 *   };
 *
 * For now the object is intentionally empty — settings will be configured
 * in a dedicated phase once the indexing strategy is finalised.
 *
 * NOTE: We use a local type alias instead of importing `Settings` from
 * 'meilisearch' directly, because the package is pure ESM and the backend
 * uses CommonJS.  The alias mirrors the relevant subset of the real
 * `Settings` type and will be replaced with the official import in Phase 2
 * once the module resolution strategy is finalised.
 */


/**
 * Subset of Meilisearch's `Settings` type.
 * Covers every attribute that will be configured in Phase 2.
 * Extend as needed when new setting categories are introduced.
 */
export interface ProductIndexSettings {
    searchableAttributes?: string[];
    displayedAttributes?: string[];
    filterableAttributes?: string[];
    sortableAttributes?: string[];
    rankingRules?: string[];
    stopWords?: string[];
    synonyms?: Record<string, string[]>;
    typoTolerance: {
        enabled: boolean;
        minWordSizeForTypos?: {
            oneTypo?: number;
            twoTypos?: number;
        };
        disableOnWords?: string[];
        disableOnAttributes?: string[];
    };
    distinctAttribute?: string;
    dictionary: string[];
}


export const PRODUCTS_SETTINGS: ProductIndexSettings = {


    searchableAttributes: [
        "name",
        "name_en",
        "danh_muc",
        "short_description"
    ],


    displayedAttributes: [
        "slug",
        "name",
        "danh_muc",
        "short_description",
        "overview",
        "diem_noi_bat",
        "huong_dan_su_dung",
        "cong_dung",
        "lich_su_hinh_thanh"
    ],


    filterableAttributes: [
        "danh_muc"
    ],


    rankingRules: [
        "words",
        "typo",
        "proximity",
        "sort",
        "attributeRank",
        "wordPosition",
        "exactness"
    ],


    synonyms: {
        "cafe": ["coffee", "cà phê"],
        "coffee": ["cafe", "cà phê"],
        "cà phê": ["coffee", "cafe"],


        "hotel": ["khách sạn"],
        "khách sạn": ["hotel"],


        "bridge": ["cầu"],
        "cầu": ["bridge"],


        "market": ["chợ"],
        "chợ": ["market"]
    },


    typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
            oneTypo: 4,
            twoTypos: 8,
        },
        disableOnWords: ["OCOP"],
        disableOnAttributes: [],
    },


    stopWords: [
        "là",
        "và",
        "ở",
        "của",
        "các",
        "những",
        "được",
        "cho",
        "với",
        "trong",
        "trên",
        "tại",
        "đến",
        "từ",
    ],


    dictionary: [
        "Đà Nẵng",
        "Hội An",
        "Huế",


        "Hải Châu",
        "Thanh Khê",
        "Liên Chiểu",
        "Sơn Trà",
        "Ngũ Hành Sơn",
        "Cẩm Lệ",


        "Cầu Rồng",
        "Cầu Sông Hàn",
        "Bà Nà Hills",
        "Biển Mỹ Khê",
        "Bán đảo Sơn Trà",
        "Chùa Linh Ứng",
        "Bảo tàng Điêu khắc Chăm",


        "OCOP"
    ]
};










