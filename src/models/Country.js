/**
 * Schema of country
 *
 * Database and schema were taken from:
 * https://mledoze.github.io/countries/
 */

import Mongoose, { Schema } from 'mongoose';
import { RedisDataLoader, mongoDataLoader } from '../lib/dataLoaders';

/**
 * Represents schema of country name
 */
const CountryNameSchema = new Schema({
    _id: { id: false },
    // Common name in english
    common: String,
    // Official name in english
    official: String,
    // List of all native names
    //    key: three-letter ISO 639-3 language code
    //    value: name object
    //       key: official - official name translation
    //       key: common - common name translation
    native: Object,
});

/**
 * Represents schema of country
 */
const CountrySchema = new Schema({
    name: CountryNameSchema,
    // Code ISO 3166-1 alpha-2
    cca2: String,
    // Code ISO 3166-1 numeric
    ccn3: String,
    // Code ISO 3166-1 alpha-3
    cca3: String,
    // ISO 4217 currency code(s)
    currency: [String],
    // Calling code(s)
    callingCode: [String],
    // Capital city
    capital: String,
    // Region (e.g. "Europe")
    region: String,
    // Subregion (e.g. "Western Europe")
    subregion: String,
    // List of official languages
    //    key: three-letter ISO 639-3 language code
    //    value: name of the language in english
    languages: Object,
    // List of translations in format of { lang: text }
    translations: Object,
    // Latitude and longitude
    coordinates: [Number],
    // Name of residents
    demonym: String,
    // Landlocked status
    landlocked: Boolean,
    // Land borders
    borders: [String],
    // Land area in square km
    area: Number,
});

// DataLoaders objects
const loaders = {};

/**
 * Find country by cca2 and use cache if possible
 */
CountrySchema.statics.findByCca2WithCache = function (cca2) {
    if (!loaders.cca2) {
        // Setup caching of cities by cca2 using DataLoader
        loaders.cca2 = new RedisDataLoader(
            'country',
            mongoDataLoader('cca2', this, { cache: false }),
            { expire: 1800 }, // Cache for 30 minutes
        );
    }

    return loaders.cca2.load(cca2);
}

const CountryModel = Mongoose.model('countries', CountrySchema);

export {
    CountrySchema,
    CountryModel,
};
