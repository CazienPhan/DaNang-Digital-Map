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
     *
     * @param geoFilter — optional Meilisearch filter string for geographic
     *   filtering (e.g. `_geoRadius(lat, lng, 2000)` or `_geoBoundingBox(...)`).
     *   When provided, only documents matching the geographic constraint are
     *   returned. When omitted, no geographic filter is applied (existing behavior).
     *
     * @param userLat — optional user GPS latitude. When provided together with
     *   userLng and a geoFilter, results are sorted by `_geoPoint(lat, lng):asc`
     *   so Meilisearch returns `_geoDistance` in each hit.
     *
     * @param userLng — optional user GPS longitude.
     */
    async search(
        query: string,
        limit = 20,
        offset = 0,
        geoFilter?: string,
        userLat?: number,
        userLng?: number
    ): Promise<PoiListingResponse> {

        const client = await meiliClientPromise;

        // Build search options
        const searchOptions: Record<string, any> = {
            limit,
            offset,
            attributesToRetrieve: ["id", "name", "dia_chi", "lat", "lng"],
            filter: geoFilter || undefined,
        };

        // When GPS coordinates and a geo filter are provided, add _geoPoint
        // sort so Meilisearch computes and returns _geoDistance for each hit.
        if (userLat !== undefined && userLng !== undefined && geoFilter) {
            searchOptions.sort = [`_geoPoint(${userLat}, ${userLng}):asc`];
        }

        const result = await client
            .index(INDEXES.POIS)
            .search<PoiSearchDocument>(query, searchOptions);

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
