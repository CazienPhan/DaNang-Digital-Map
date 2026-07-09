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

export default router;
