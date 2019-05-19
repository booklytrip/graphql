/**
 * Schema of city
 */

import Mongoose, { Schema } from 'mongoose';
import { RedisDataLoader, mongoDataLoader } from '../lib/dataLoaders';

const CitySchema = new Schema({
    name: String,
    cityCode: String,
    countryCode: String,
    translations: Object,
});

// DataLoaders objects
const loaders = {};

/**
 * Find country by cityCode and use cache if possible
 */
CitySchema.statics.findByCityCodeWithCache = function(cityCode) {
    if (!cityCode) {
        return null;
    }

    if (!loaders.cityCode) {
        // Setup caching of cities by cityCode using DataLoader
        loaders.cityCode = new RedisDataLoader(
            'city',
            mongoDataLoader('cityCode', this, { cache: false }),
            { expire: 1800 }, // Cache for 30 minutes
        );
    }

    return loaders.cityCode.load(cityCode);
};

const CityModel = Mongoose.model('cities', CitySchema);

export { CitySchema, CityModel };
