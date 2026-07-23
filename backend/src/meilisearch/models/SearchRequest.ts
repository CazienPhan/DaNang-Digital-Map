export interface SearchRequest {

    /**
     * Keyword entered by the user.
     */
    query: string;

    /**
     * Maximum number of documents returned.
     */
    limit?: number;

    /**
     * Pagination offset.
     */
    offset?: number;

    /**
     * Filter expression.
     *
     * Example:
     * danh_muc = "Ẩm thực"
     */
    filter?: string;

    /**
     * Sort expression.
     *
     * Example:
     * created_at:desc
     */
    sort?: string[];

}