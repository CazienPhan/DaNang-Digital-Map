import { PoiSearchDocument } from "../documents/PoiSearchDocument";

/**
 * PoiMapper — pure mapping layer.
 *
 * Transforms raw Supabase POI rows (after JOIN) into the
 * PoiSearchDocument shape expected by Meilisearch.
 *
 * Same architectural pattern as ProductTypeMapper.
 *
 * No IO, no HTTP, no React.
 */
export class PoiMapper {

    static toSearchDocument(
        poi: any
    ): PoiSearchDocument {

        return {

            id: poi.id,

            name:
                poi.name ?? "",

            name_en:
                poi.name_en ?? "",

            poi_type:
                poi.poi_type ?? "",

            dia_chi:
                poi.dia_chi ?? "",

            lat:
                Number(poi.lat) || 0,

            lng:
                Number(poi.lng) || 0,

        };

    }

}
