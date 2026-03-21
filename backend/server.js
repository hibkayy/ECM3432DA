import express from 'express';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/db.js';
import authRoutes from './routes/auth.js';



dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use("/api/users", authRoutes);

connectMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});