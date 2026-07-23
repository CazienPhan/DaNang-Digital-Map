import { SearchHit } from "./SearchHit";

export interface SearchResponse {

    hits: SearchHit[];

    total: number;

    limit: number;

    offset: number;

    processingTimeMs: number;

    query: string;

}