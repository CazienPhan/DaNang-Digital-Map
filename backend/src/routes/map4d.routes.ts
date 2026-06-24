import { Router, Request, Response } from 'express';
import { Map4dBackendService } from '../services/map4d.service';

const router = Router();

/**
 * Endpoint: GET /api/map4d/geocode
 * Query Param: address (string)
 */
router.get('/geocode', async (req: Request, res: Response) => {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'Query parameter "address" is required and must be a string.',
    });
  }

  try {
    const data = await Map4dBackendService.geocode(address);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Error occurred while processing geocoding request.',
    });
  }
});

/**
 * Endpoint: GET /api/map4d/search
 * Query Param: text (string)
 */
router.get('/search', async (req: Request, res: Response) => {
  const { text } = req.query;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'Query parameter "text" is required and must be a string.',
    });
  }

  try {
    const data = await Map4dBackendService.textSearch(text);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Error occurred while processing search request.',
    });
  }
});

export default router;
