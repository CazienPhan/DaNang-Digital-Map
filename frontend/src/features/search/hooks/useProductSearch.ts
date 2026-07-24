import { useCallback } from "react";

import {
    ProductSearchService,
    type AutocompleteItem,
    type ProductListingItem,
} from "@/services/meilisearch/productSearch.service";

export interface UseProductSearch {

    autocomplete(
        query: string,
        signal?: AbortSignal
    ): Promise<AutocompleteItem[]>;

    search(
        query: string,
        signal?: AbortSignal
    ): Promise<ProductListingItem[]>;
}

export function useProductSearch(): UseProductSearch {

    const autocomplete = useCallback(

        async (
            query: string,
            signal?: AbortSignal
        ) => {

            return ProductSearchService.autocomplete(
                query,
                signal
            );

        },

        []

    );

    const search = useCallback(

        async (
            query: string,
            signal?: AbortSignal
        ) => {

            return ProductSearchService.search(
                query,
                signal
            );

        },

        []

    );

    return {

        autocomplete,

        search,

    };

}