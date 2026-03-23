import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { cronJobGame1p } from './controllers/cronJobs.js';
import downlineRoutes from './routes/admin/downlineRoutes.js';
import manualResultRoutes from './routes/admin/manualResultRoutes.js';
import marketAnalizeRoutes from './routes/admin/marketAnalizeRoutes.js';
import matchSettingsRoutes from './routes/admin/matchSettingsRoute.js';
import subRouteRoutes from './routes/admin/subAdminRoutes.js';
import betRoute from './routes/betRoute.js';
import casinoRoutes from './routes/casinoRoutes.js';
import crickeRoute from './routes/cricketRoutes.js';
import horseRacingRoutes from './routes/horseRacingRoutes.js';
import soccerRoutes from './routes/soccerRoutes.js';
import tennisRoutes from './routes/tennisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cashoutRoute from './routes/cashoutRoute.js';
import { setupWebSocket } from './socket/bettingSocket.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const APP_TYPE = process.env.APP_TYPE || 'dashboard';

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://diamond-admin-tau.vercel.app/',
      'https://diamondbook-client.vercel.app/',
      'https://aura444.org/',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.set('trust proxy', true);
app.use(morgan('dev'));

// Additional settlement tracking middleware
app.use((req, res, next) => {
  const url = req.url;
  const method = req.method;

  next();
});

// Routes
app.use('/api', subRouteRoutes);
app.use('/api', downlineRoutes);
app.use('/api', userRoutes);
app.use('/api', betRoute);
app.use('/api', crickeRoute);
app.use('/api', soccerRoutes);
app.use('/api', tennisRoutes);
app.use('/api', horseRacingRoutes);
app.use('/api', casinoRoutes);
app.use('/api', marketAnalizeRoutes);
app.use('/api', matchSettingsRoutes);
app.use('/api', manualResultRoutes);
app.use('/api', cashoutRoute);

// Static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (APP_TYPE === 'dashboard') {
  app.use(express.static(path.join(__dirname, '../dashboard/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'))
  );
} else {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  );
}

setupWebSocket(server);

// Only run settlement crons on the client backend process.
// In production, TWO PM2 processes (agaura444 + aura444) run the same server.js.
// If both run crons, bets get settled twice → bettingProfitLoss doubles.
if (APP_TYPE !== 'dashboard') {
  cronJobGame1p();
  console.log('[CRON] Settlement crons started (client process)');
} else {
  console.log('[CRON] Settlement crons SKIPPED (dashboard process)');
}

const isLocal = process.env.NODE_ENV !== 'production';

const PORT = isLocal
  ? process.env.PORT || (APP_TYPE === 'dashboard' ? 8001 : 8000)
  : APP_TYPE === 'dashboard'
    ? process.env.DASHBOARD_PORT
    : process.env.CLIENT_PORT;

server.listen(PORT, () => {
  console.log(
    `${APP_TYPE} server running on port ${PORT} (${isLocal ? 'local' : 'prod'})`
  );
});
