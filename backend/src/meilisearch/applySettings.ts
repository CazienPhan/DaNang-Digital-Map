import { meiliClientPromise } from './client';
import { INDEXES } from './indexes';

import { PRODUCTS_SETTINGS } from './settings/products.settings';
import { POIS_SETTINGS } from './settings/pois.settings';


export async function applyAllSettings(): Promise<void> {

    const client = await meiliClientPromise;

    // =========================
    // PRODUCTS INDEX
    // =========================
    console.log("[Meilisearch] Applying PRODUCTS settings...");
    const productsTask = await client
        .index(INDEXES.PRODUCTS)
        .updateSettings(PRODUCTS_SETTINGS);

    console.log(
        `[Meilisearch] PRODUCTS settings applied`,
        productsTask
    );

    // =========================
    // POIS INDEX
    // =========================
    console.log("[Meilisearch] Applying POIS settings...");
    const poisTask = await client
        .index(INDEXES.POIS)
        .updateSettings(POIS_SETTINGS);

    console.log(
        `[Meilisearch] POIS settings applied`,
        poisTask
    );

}