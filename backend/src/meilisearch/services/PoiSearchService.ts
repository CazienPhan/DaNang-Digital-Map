import { meiliClientPromise } from "../client";
import { INDEXES } from "../indexes";
import { PoiListingItem } from "../models/PoiListingItem";
import { PoiListingResponse } from "../models/PoiListingResponse";
import { PoiSearchDocument } from "../documents/PoiSearchDocument";

/**
 * PoiSearchService — queries the "pois" Meilisearch index.
 *
 * Same anti-corruption pattern as ProductSearchService:
 *   - Raw Meilisearch hits (PoiSearchDocument) are mapped to
 *     PoiListingItem[] before leaving this service.
 *   - Callers never see Meilisearch internals.
 *
 * This service handles Meilisearch queries ONLY.
 * The Map4D fallback decision is made in the controller layer.
 */
export class PoiSearchService {

    /**
     * Full POI search — returns a typed PoiListingResponse.
     *
     * Retrieves only the fields needed for listing and map interaction.
     */
    async search(
        query: string,
        limit = 20,
        offset = 0
    ): Promise<PoiListingResponse> {

        const client = await meiliClientPromise;

        const result = await client
            .index(INDEXES.POIS)
            .search<PoiSearchDocument>(query, {
                limit,
                offset,
                attributesToRetrieve: ["id", "name", "dia_chi", "lat", "lng"],
            });

        const items: PoiListingItem[] = result.hits.map((hit) => ({
            id: hit.id,
            name: hit.name,
            dia_chi: hit.dia_chi ?? "",
            lat: hit.lat,
            lng: hit.lng,
        }));

        return {
            query: result.query,
            processingTimeMs: result.processingTimeMs,
            estimatedTotalHits: result.estimatedTotalHits ?? 0,
            items,
            source: "meilisearch",
        };

    }

    /**
     * Returns lightweight suggestions for the autocomplete dropdown.
     *
     * Retrieves { id, name, dia_chi, lat, lng } — enough for the
     * SearchSuggestion mapper to populate the dropdown with
     * place name, address, and coordinates.
     */
    async autocomplete(
        query: string,
        limit = 7
    ): Promise<PoiListingResponse> {

        const client = await meiliClientPromise;

        const result = await client
            .index(INDEXES.POIS)
            .search<PoiSearchDocument>(query, {
                limit,
                attributesToRetrieve: ["id", "name", "dia_chi", "lat", "lng"],
            });

        const items: PoiListingItem[] = result.hits.map((hit) => ({
            id: hit.id,
            name: hit.name,
            dia_chi: hit.dia_chi ?? "",
            lat: hit.lat,
            lng: hit.lng,
        }));

        return {
            query: result.query,
            processingTimeMs: result.processingTimeMs,
            estimatedTotalHits: result.estimatedTotalHits ?? 0,
            items,
            source: "meilisearch",
        };

    }

}
