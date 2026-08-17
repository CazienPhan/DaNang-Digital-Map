import sql from "../../db";

/**
 * PoiRepository — data access for POI indexing.
 *
 * Uses the same `postgres` connection (db.ts) already used by poi.service.ts.
 * Performs the required JOIN between poi.pois and poi.poi_geometries.
 *
 * This repository is used ONLY by the indexing pipeline (PoiIndexService).
 * Live search requests query Meilisearch — never this repository.
 */
export class PoiRepository {
    /**
     * Retrieve all POIs joined with their geometry for Meilisearch indexing.
     *
     * The query mirrors the verified JOIN in poi.service.ts → getAllPois(),
     * but selects only the fields needed for the search document.
     */
    async findAll() {
        const result = await sql`
            SELECT
                p.id,
                p.name,
                p.name_en,
                p.poi_type,
                p.dia_chi,
                g.lat,
                g.lng
            FROM poi.pois p
            JOIN poi.poi_geometries g ON g.poi_id = p.id
        `;

        return result;
    }
}
