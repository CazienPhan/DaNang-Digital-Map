import { AutocompleteItem } from "./AutocompleteItem";

export interface AutocompleteResponse {

    query: string;

    processingTimeMs: number;

    estimatedTotalHits: number;

    items: AutocompleteItem[];

}