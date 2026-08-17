import { meiliClientPromise } from "../client";
import { INDEXES } from "../indexes";
import { POIS_SETTINGS } from "../settings/pois.settings";

import { PoiRepository } from "../repositories/PoiRepository";
import { PoiMapper } from "../mappers/PoiMapper";

/**
 * PoiIndexService — manages the "pois" Meilisearch index lifecycle.
 *
 * Same architectural pattern as ProductIndexService:
 *   - createIndexIfNotExists()
 *   - applySettings()
 *   - indexAllDocuments()
 *
 * Used ONLY by the sync script. Never called during live search requests.
 */
export class PoiIndexService {

    private readonly repository = new PoiRepository();

    /**
     * Create the "pois" index if it does not exist.
     */
    async createIndexIfNotExists(): Promise<void> {

        const client = await meiliClientPromise;

        try {

            await client.getIndex(INDEXES.POIS);

            console.log(
                `[Meilisearch] Index "${INDEXES.POIS}" already exists.`
            );

        } catch {

            console.log(
                `[Meilisearch] Creating index "${INDEXES.POIS}"...`
            );

            await client.createIndex(
                INDEXES.POIS,
                {
                    primaryKey: "id",
                }
            );

            console.log(
                `[Meilisearch] Index "${INDEXES.POIS}" created successfully.`
            );

        }

    }

    /**
     * Apply POI-specific settings to the "pois" index.
     */
    async applySettings(): Promise<void> {

        const client = await meiliClientPromise;

        console.log(`[Meilisearch] Applying POI settings...`);

        const task = await client
            .index(INDEXES.POIS)
            .updateSettings(POIS_SETTINGS);

        await client.tasks.waitForTask(task.taskUid);

        console.log(`[Meilisearch] POI settings applied successfully.`);

    }

    /**
     * Fetch all POIs from Supabase, map to search documents, and bulk index.
     */
    async indexAllDocuments(): Promise<void> {

        const client = await meiliClientPromise;

        const pois = await this.repository.findAll();

        const searchDocuments = pois.map((poi) =>
            PoiMapper.toSearchDocument(poi)
        );

        console.log(
            `[Meilisearch] Indexing ${pois.length} POI documents...`
        );

        const task = await client
            .index(INDEXES.POIS)
            .addDocuments(searchDocuments);

        await client.tasks.waitForTask(task.taskUid);

        console.log(
            `[Meilisearch] Successfully indexed ${searchDocuments.length} POI documents.`
        );

    }

}
