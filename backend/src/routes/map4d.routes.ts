import { Router, Request, Response } from 'express';
import { Map4dBackendService } from '../services/map4d.service';

const router = Router();

/**
 * Endpoint: GET /api/map4d/geocode
 * Query Param: address (string)
 */
router.get('/geocode', async (req: Request, res: Response) => {
  const { address, location } = req.query;

  if ((!address || typeof address !== 'string') && (!location || typeof location !== 'string')) {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'Query parameter "address" or "location" is required and must be a string.',
    });
  }

  try {
    const data = await Map4dBackendService.geocode(
      address as string | undefined,
      location as string | undefined
    );
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

/**
 * Endpoint: GET /api/map4d/autosuggest
 * Query Params: text (string), location (string, optional)
 */
router.get('/autosuggest', async (req: Request, res: Response) => {
  const { text, location } = req.query;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'Query parameter "text" is required and must be a string.',
    });
  }

  try {
    let data;
    // Map4D Autosuggest returns empty for single character queries.
    // If text length is exactly 1, fall back to textSearch which natively supports 1 character.
    if (text.trim().length === 1) {
      data = await Map4dBackendService.textSearch(text, location as string | undefined);
    } else {
      data = await Map4dBackendService.autosuggest(text, location as string | undefined);
    }
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Error occurred while processing autosuggest request.',
    });
  }
});

/**
 * Endpoint: GET /api/map4d/route
 * Query Params: origin (string), destination (string)
 */
router.get('/route', async (req: Request, res: Response) => {
  const { origin, destination } = req.query;

  if (!origin || typeof origin !== 'string' || !destination || typeof destination !== 'string') {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'Query parameters "origin" and "destination" are required and must be strings.',
    });
  }

  try {
    const data = await Map4dBackendService.route(origin, destination);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Error occurred while processing route request.',
    });
  }
});

export default router;
