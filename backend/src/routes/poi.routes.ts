import { Router, Request, Response } from 'express';
import { PoiService } from '../services/poi.service';
import { PoiStoryService } from '../services/poiStory.service';

const router = Router();

/**
 * Endpoint: GET /api/pois
 * Retrieves all real POIs from the database.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const pois = await PoiService.getAllPois();
    return res.status(200).json({
      status: 'OK',
      pois
    });
  } catch (error: any) {
    console.error('Failed to get POIs:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Error occurred while retrieving POIs.',
    });
  }
});

/**
 * Endpoint: GET /api/pois/tile/:x/:y/:zoom
 * Retrieves real POIs inside a Web Mercator tile from the database.
 */
router.get('/tile/:x/:y/:zoom', async (req: Request, res: Response) => {
  try {
    const x = parseInt(req.params.x as string, 10);
    const y = parseInt(req.params.y as string, 10);
    const zoom = parseInt(req.params.zoom as string, 10);

    if (isNaN(x) || isNaN(y) || isNaN(zoom)) {
      return res.status(400).json({
        status: 'INVALID_REQUEST',
        message: 'Parameters x, y, and zoom must be integers.',
      });
    }

    // `categories` is a comma-separated list of 'place' and/or 'ocop'.
    // Omitted entirely -> no filtering (all POIs). Present but empty/invalid
    // -> no category selected, so no POIs are returned.
    const categoriesParam = req.query.categories;
    let categories: Array<'place' | 'ocop'> | undefined;
    if (typeof categoriesParam === 'string') {
      categories = categoriesParam
        .split(',')
        .map((c) => c.trim())
        .filter((c): c is 'place' | 'ocop' => c === 'place' || c === 'ocop');
    }

    const pois = await PoiService.getPoisByTile(x, y, zoom, categories);
    return res.status(200).json(pois);

  } catch (error: any) {
    console.error(`Failed to get POIs for tile ${req.params.x}/${req.params.y}/${req.params.zoom}:`, error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Error occurred while retrieving tile POIs.',
    });
  }
});


/**
 * Endpoint: GET /api/pois/:id/story
 * Retrieves the business-story data ("Câu chuyện" tab) for a single POI:
 * poi_story, story media, highlighted products and certifications.
 * `story.is_business` is false for POIs that have no poi_details_business row.
 */
router.get('/:id/story', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'POI ID parameter is required.',
    });
  }

  try {
    const story = await PoiStoryService.getStoryByPoiId(id as string);
    if (!story) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        message: `POI with ID ${id} was not found.`,
      });
    }
    return res.status(200).json({
      status: 'OK',
      story,
    });
  } catch (error: any) {
    console.error(`Failed to get business story for POI ${id}:`, error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || `Error occurred while retrieving the story for POI ${id}.`,
    });
  }
});

/**
 * Endpoint: GET /api/pois/:id
 * Retrieves comprehensive details for a single POI by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      status: 'INVALID_REQUEST',
      message: 'POI ID parameter is required.',
    });
  }

  try {
    const poi = await PoiService.getPoiDetails(id as string);
    if (!poi) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        message: `POI with ID ${id} was not found.`,
      });
    }
    return res.status(200).json({
      status: 'OK',
      poi
    });
  } catch (error: any) {
    console.error(`Failed to get details for POI ${id}:`, error);
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || `Error occurred while retrieving POI details for ${id}.`,
    });
  }
});

export default router;

