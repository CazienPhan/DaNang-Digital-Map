import { ProductIndexService } from "../services/ProductIndexService";

async function main() {
    try {
        console.log("==================================");
        console.log("Product Sync Started");
        console.log("==================================");

        const service = new ProductIndexService();

        // Create index if needed
        await service.createIndexIfNotExists();

        // Apply settings
        await service.applySettings();

        // Index all documents
        await service.indexAllDocuments();

        console.log("==================================");
        console.log("Product Sync Completed");
        console.log("==================================");

        process.exit(0);

    } catch (error) {

        console.error(error);

        process.exit(1);

    }
}

main();