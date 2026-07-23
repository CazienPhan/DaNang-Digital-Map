import { supabase } from "../../config/supabase";
export class ProductTypeRepository {
    /**
     * Get all active product types
     */
    async findAll() {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_types")
            .select("*")
            .eq("is_active", true);

        if (error) {
            throw error;
        }

        return data ?? [];
    }

    /**
     * Find one product type by id
     */
    async findById(id: string) {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_types")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}