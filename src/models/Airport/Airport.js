/**
 * @flow
 */

import Mongoose, { Schema } from 'mongoose';
import search from './search';
import { map, find, filter } from 'lodash';
import { RedisDataLoader, mongoDataLoader } from '../../lib/dataLoaders';
/**
 * Represents airport information schema
 */
const AirportSchema = new Schema({
    // Name of airport. May or may not container the City name.
    name: String,
    // A 3-letter IATA city code
    cityCode: String,
    // Code ISO 3166-1 alpha-2
    countryCode: String,
    // 3-letter FAA code, for airports located in Country "United States of America".
    // 3-letter IATA code, for all other airports.
    iata: String,
    // 4-letter ICAO code.
    icao: String,
    // List of translations in format of { lang: text }
    translations: Object,
    // Timezone name where airport operates in
    timezone: String,
});

// DataLoaders objects
const loaders = {};

/**
 * Search airports by specified term
 *
 * @param {String} value - A term to use for search
 */
AirportSchema.statics.search = async function(value: string, limit: number) {
    if (!loaders.id) {
        // Setup caching of airports by _id code using DataLoader
        loaders.id = new RedisDataLoader(
            'airport',
            mongoDataLoader('_id', this, { cache: false }),
            { expire: 1800 }, // Cache for 30 minutes
        );
    }

    const searchResults = await search(value, limit || 10);
    const searchResultsIds = map(searchResults.hits.hits, result =>
        result._id.toString(),
    );

    return loaders.id
        .loadMany(searchResultsIds)
        .then(results => filter(results, r => r !== null))
        .then(results =>
            map(searchResults.hits.hits, result => ({
                _score: result._score,
                airport: find(results, r => r._id.toString() === result._id),
            })),
        );
};

/**
 * Find airport by IATA code and use cache if possible
 */
AirportSchema.statics.findByIataWithCache = function(iata) {
    if (!loaders.iata) {
        // Setup caching of airports by IATA code using DataLoader
        loaders.iata = new RedisDataLoader(
            'airport',
            mongoDataLoader('iata', this, { cache: false }),
            { expire: 1800 }, // Cache for 30 minutes
        );
    }

    return loaders.iata.load(iata);
};

const AirportModel = Mongoose.model('airports', AirportSchema);

export { AirportSchema, AirportModel };
