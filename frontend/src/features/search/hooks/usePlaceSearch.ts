import { useCallback } from "react";

import {
    SearchService,
    type PlaceSuggestion,
} from "@/services/map4d/search.service";

export interface UsePlaceSearch {

    autocomplete(
        query: string,
        locationBias?: string,
        signal?: AbortSignal
    ): Promise<PlaceSuggestion[]>;

    search(
        query: string,
        locationBias?: string,
        signal?: AbortSignal
    ): Promise<PlaceSuggestion[]>;
}

export function usePlaceSearch(): UsePlaceSearch {

    const autocomplete = useCallback(

        (
            query: string,
            locationBias?: string,
            signal?: AbortSignal
        ) => {

            return SearchService.searchPlaces(
                query,
                locationBias,
                signal
            );

        },

        []

    );

    const search = useCallback(

        (
            query: string,
            locationBias?: string,
            signal?: AbortSignal
        ) => {

            return SearchService.searchPlaces(
                query,
                locationBias,
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