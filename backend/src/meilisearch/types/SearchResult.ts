import { ProductSearchDocument } from "../documents/ProductTypeDocument";

export interface SearchResult {
  hits: ProductSearchDocument[];
  estimatedTotalHits: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
  query: string;
}
