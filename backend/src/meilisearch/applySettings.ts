import { meiliClientPromise } from './client';
import { INDEXES } from './indexes';

import { PRODUCTS_SETTINGS } from './settings/products.settings';


export async function applyAllSettings(): Promise<void> {

    const client = await meiliClientPromise;

    // =========================
    // PRODUCTS INDEX
    // =========================
    console.log("[Meilisearch] Applying settings...");
    const productsTask = await client
        .index(INDEXES.PRODUCTS)
        .updateSettings(PRODUCTS_SETTINGS);

    console.log(
        `[Meilisearch] PRODUCTS settings applied`,
        productsTask
    );

}