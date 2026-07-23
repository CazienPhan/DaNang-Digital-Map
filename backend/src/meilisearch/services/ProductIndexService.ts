import { meiliClientPromise } from "../client";
import { INDEXES } from "../indexes";
import { PRODUCTS_SETTINGS } from "../settings/products.settings";

import { ProductTypeRepository } from "../repositories/ProductTypeRepository";
import { ProductTypeMapper } from "../mappers/ProductTypeMapper";

export class ProductIndexService {

    private readonly repository = new ProductTypeRepository();

    /**
     * Create index if it does not exist.
     */
    async createIndexIfNotExists(): Promise<void> {

        const client = await meiliClientPromise;

        try {

            await client.getIndex(INDEXES.PRODUCTS);

            console.log(
                `[Meilisearch] Index "${INDEXES.PRODUCTS}" already exists.`
            );

        } catch {

            console.log(
                `[Meilisearch] Creating index "${INDEXES.PRODUCTS}"...`
            );

            await client.createIndex(
                INDEXES.PRODUCTS,
                {
                    primaryKey: "id",
                }
            );

            console.log(
                `[Meilisearch] Index "${INDEXES.PRODUCTS}" created successfully.`
            );

        }

    }

    async applySettings(): Promise<void> {

        const client = await meiliClientPromise;

        console.log(`[Meilisearch] Applying settings...`);

        const task = await client
            .index(INDEXES.PRODUCTS)
            .updateSettings(PRODUCTS_SETTINGS);

        await client.tasks.waitForTask(task.taskUid);

        console.log(`[Meilisearch] Settings applied successfully.`);

    }

    async indexAllDocuments(): Promise<void> {

        const client = await meiliClientPromise;

        const products = await this.repository.findAll();

        const searchDocuments = products.map((product) =>
            ProductTypeMapper.toSearchDocument(product)
        );

        console.log(
            `[Meilisearch] Indexing ${products.length} documents...`
        );

        const task = await client
            .index(INDEXES.PRODUCTS)
            .addDocuments(searchDocuments);

        await client.tasks.waitForTask(task.taskUid);

        console.log(
            `[Meilisearch] Successfully indexed ${searchDocuments.length} documents.`
        );

    }

}