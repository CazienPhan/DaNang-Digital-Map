import { PoiIndexService } from "../services/PoiIndexService";

async function main() {
    try {
        console.log("==================================");
        console.log("POI Sync Started");
        console.log("==================================");

        const service = new PoiIndexService();

        // Create index if needed
        await service.createIndexIfNotExists();

        // Apply settings
        await service.applySettings();

        // Index all documents
        await service.indexAllDocuments();

        console.log("==================================");
        console.log("POI Sync Completed");
        console.log("==================================");

        process.exit(0);

    } catch (error) {

        console.error(error);

        process.exit(1);

    }
}

main();
