import * as mongoose from 'mongoose';
import { app } from './app';
import * as dotenv from 'dotenv';

const start = async () => {
    dotenv.config();
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }

    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDb');
    } catch (err) {
      console.error(err);
    }
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  };
  
  start();
  