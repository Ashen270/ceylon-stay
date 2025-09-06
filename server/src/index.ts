import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authMiddleware } from './middleware/authMiddleware';

// Routes import
import tenantRoutes from './routes/tenantRoutes';
import managerRoutes from './routes/managerRoutes';
import propertyRoutes from './routes/propertyRoutes';
import leaseRoutes from './routes/leaseRoutes';
import applicationRoutes from './routes/applicationRoutes';


// Configurations
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginEmbedderPolicy({ policy: "require-corp" }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use (cors());
app.use(bodyParser.urlencoded({ extended: false }));


// routes


app.get('/', (req, res) => {
  res.send('this is the home route!');
});
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes); 
app.use("/tenants", authMiddleware(['tenant']), tenantRoutes);
app.use("/managers", authMiddleware(['manager']), managerRoutes);
app.use("/applications", applicationRoutes)


//server

const PORT = process.env.PORT || 4001;;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});