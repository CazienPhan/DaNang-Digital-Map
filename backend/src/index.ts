import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import map4dRouter from './routes/map4d.routes';
import poiRouter from './routes/poi.routes';
import productRouter from './routes/product.routes';

// Load environment configurations from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Apply standard global middlewares
app.use(cors());
app.use(express.json());

// Set up route handlers
app.use('/api/map4d', map4dRouter);
app.use('/api/pois', poiRouter);
app.use('/api/products', productRouter);

// Base sanity check / health route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Digital Map Platform Backend Proxy'
  });
});

// Start Express Listener
app.listen(port, () => {
  console.log(`[Server] Digital Map Platform backend listening at http://localhost:${port}`);
});
