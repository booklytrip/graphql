/**
 * Connector for MongoDB database
 */

import Mongoose from 'mongoose';
import logger from '../lib/logger';

Mongoose.connect('mongodb://mongodb:27017/irs');
const db = Mongoose.connection;

db.on('error', (error) => {
    logger.error(error, 'MongoDB connection error');
});

db.once('open', () => {
    logger.info('Successfuly connected to MongoDB');
});
