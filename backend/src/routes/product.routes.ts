import { Router, Request, Response } from 'express';
import { ProductService } from '../services/product.service';

const router = Router();

/**
 * Endpoint: GET /api/products/by-poi/:poiId
 * Returns all products linked to a given POI via poi.product_listings.
 */
router.get('/by-poi/:poiId', async (req: Request, res: Response) => {
  const { poiId } = req.params;

  if (!poiId) {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'poiId parameter is required.',
    });
  }

  try {
    const products = await ProductService.getProductsByPoiId(poiId as string);
    return res.status(200).json({
      status: 'OK',
      products,
    });
  } catch (error: any) {
    console.error(`Failed to get products for POI ${poiId}:`, error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || `Error retrieving products for POI ${poiId}.`,
    });
  }
});

/**
 * Endpoint: GET /api/products/:id
 *
 * Returns the complete product type detail from Supabase.
 * Used exclusively by the Product Detail UI — Meilisearch is NOT involved.
 *
 * Architecture:
 *   Frontend → GET /api/products/:id → Supabase (product_types + product_media)
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'id parameter is required.',
    });
  }

  // Validate UUID format before hitting Supabase
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id as string)) {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'id must be a valid UUID.',
    });
  }

  try {
    const product = await ProductService.getProductTypeById(id as string);

    if (!product) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        message: `Product type with id "${id}" was not found.`,
      });
    }

    return res.status(200).json({
      status: 'OK',
      product,
    });
  } catch (error: any) {
    console.error(`[ProductDetailRoute] Failed to get product type ${id}:`, error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || `Error retrieving product type ${id}.`,
    });
  }
});

export default router;

