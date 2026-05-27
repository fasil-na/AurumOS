import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { PORT, CLIENT_URL } from './constants.js';
const app = express();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
import authRoutes from './routes/auth.js';
import inviteRoutes from './routes/invite.js';
import userRoutes from './routes/users.js';
import workspaceRoutes from './routes/workspaces.js';
import sectionRoutes from './routes/sections.js';
import productRoutes from './routes/products.js';
import taskRoutes from './routes/tasks.js';
import inventoryRoutes from './routes/inventory.js';
import stoneTypeRoutes from './routes/stoneTypes.js';
import supplierRoutes from './routes/suppliers.js';

app.use('/api/auth', authRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stones', stoneTypeRoutes);
app.use('/api/suppliers', supplierRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running and connected!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
