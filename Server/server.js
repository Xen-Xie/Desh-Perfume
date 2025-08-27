import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { DB } from './src/config/db.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import userRoutes from './src/routes/userRoutes.js';
import ProductRoutes from './src/routes/productRoutes.js'
import AddressRoutes from './src/routes/addressRoutes.js'
import { authenticateToken } from './src/middlewares/authorization.js';


// Configurations
const app = express();
dotenv.config();

// Middleware
app.use(cors()); // Enable CORS for all routes unless it goes on production
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

// Database Connection
const url = process.env.MONGO_URL;
DB(url);

// Routes
app.use('/api/user',userRoutes)
app.use('/api/products', ProductRoutes);
app.use('/api/address', authenticateToken, AddressRoutes)

// Server Port
const PORT = process.env.PORT || 5000;

app.listen(PORT,"0.0.0.0",()=>{
  console.log(`SERVER: http://0.0.0.0:${PORT}`);
})