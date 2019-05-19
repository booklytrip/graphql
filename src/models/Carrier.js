import Mongoose, { Schema } from 'mongoose';
import { RedisDataLoader, mongoDataLoader } from '../lib/dataLoaders';

import { BagSchema } from './Baggage';

/**
 * Represents carrier information schema
 */
const CarrierSchema = new Schema({
    // Identifies carrier IATA code
    code: String,
    // Identifies company name
    name: String,
    // The min age starting from passenger allowed to travel alone
    minAge: Number,
    // If true, online checkin is required
    onlineCheckin: {
        type: Boolean,
        default: false,
    },
    // Carry-on baggage
    cabinBaggage: BagSchema,
});

// DataLoader objects
const loaders = {};

/**
 * Find carrier by code and use cache if possible
 */
CarrierSchema.statics.findByCodeWithCache = function(code) {
    if (!loaders.code) {
        // Setup caching of carrier by code using DataLoader
        loaders.code = new RedisDataLoader(
            'carrier',
            mongoDataLoader('code', this, { cache: false }),
            { expire: 1800 }, // Cache for 30 minutes
        );
    }

    return loaders.code.load(code);
};

const CarrierModel = Mongoose.model('carriers', CarrierSchema);

export { CarrierSchema, CarrierModel };
