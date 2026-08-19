import { Router, Request, Response } from 'express';
import { EventService } from '../services/event.service';

const router = Router();

/**
 * Endpoint: GET /api/events/by-poi/:poiId
 * Returns all active, non-ended events linked to a given POI via
 * events.event_pois.
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
    const events = await EventService.getEventsByPoiId(poiId as string);
    return res.status(200).json({
      status: 'OK',
      events,
    });
  } catch (error: any) {
    console.error(`Failed to get events for POI ${poiId}:`, error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || `Error retrieving events for POI ${poiId}.`,
    });
  }
});

export default router;
