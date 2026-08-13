import { ProductSearchDocument } from "../documents/ProductTypeDocument";
export class ProductTypeMapper {

    static toSearchDocument(
        product: any
    ): ProductSearchDocument {

        return {

            id: product.id,

            slug:
                product.slug?.trim().toLowerCase() ?? "",

            name:
                product.name ?? "",

            name_en:
                product.name_en ?? "",

            danh_muc:
                product.danh_muc ?? "",

            short_description:
                product.short_description ?? "",

            overview:
                product.overview ?? "",

            cong_dung:
                Array.isArray(product.cong_dung)
                    ? product.cong_dung
                    : [],

            lich_su_hinh_thanh:
                product.lich_su_hinh_thanh ?? [],

        };

    }

}