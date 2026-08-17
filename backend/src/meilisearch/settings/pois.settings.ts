/**
 * meilisearch/settings/pois.settings.ts
 *
 * Single responsibility: hold the Meilisearch configuration object
 * for the "pois" index.
 *
 * This file does NOT contain:
 *   - search logic
 *   - indexing logic
 *   - API requests
 *   - client references
 *
 * NOTE: We use a local type alias instead of importing `Settings` from
 * 'meilisearch' directly, because the package is pure ESM and the backend
 * uses CommonJS. Same approach as products.settings.ts.
 */


/**
 * Subset of Meilisearch's `Settings` type.
 * Covers every attribute configured for the POI index.
 */
export interface PoiIndexSettings {
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
    dictionary: string[];
}


export const POIS_SETTINGS: PoiIndexSettings = {


    searchableAttributes: [
        "name",
        "name_en",
        "dia_chi",
        "poi_type"
    ],


    displayedAttributes: [
        "id",
        "name",
        "name_en",
        "poi_type",
        "dia_chi",
        "lat",
        "lng"
    ],


    rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness"
    ],


    synonyms: {
        "cafe": ["coffee", "cà phê"],
        "coffee": ["cafe", "cà phê"],
        "cà phê": ["coffee", "cafe"],

        "nhà hàng": ["restaurant", "quán ăn"],
        "restaurant": ["nhà hàng", "quán ăn"],
        "quán ăn": ["nhà hàng", "restaurant"],

        "hotel": ["khách sạn"],
        "khách sạn": ["hotel"],

        "bridge": ["cầu"],
        "cầu": ["bridge"],

        "market": ["chợ"],
        "chợ": ["market"],

        "beach": ["biển", "bãi biển"],
        "biển": ["beach", "bãi biển"],
        "bãi biển": ["beach", "biển"],

        "museum": ["bảo tàng"],
        "bảo tàng": ["museum"],

        "temple": ["chùa"],
        "chùa": ["temple"],

        "pagoda": ["chùa"],
    },


    typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
            oneTypo: 3,
            twoTypos: 7,
        },
        disableOnWords: [],
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
    ]
};
