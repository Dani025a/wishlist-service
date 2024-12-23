import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/wishlistRoutes';


dotenv.config();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api', routes);

export default app;
