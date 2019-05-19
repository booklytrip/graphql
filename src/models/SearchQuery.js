/**
 * Model store search queries
 */

import Mongoose, { Schema } from 'mongoose';
import { maxmind } from '../connectors';

const SearchQueryQuery = new Schema({
    _id: { id: false },
    departureAirport: {
        type: String,
        required: true,
    },
    arrivalAirport: {
        type: String,
        required: true,
    },
    departureDate: {
        type: String,
        required: true,
    },
    returnDate: {
        type: String,
    },
    adults: {
        type: Number,
        required: true,
    },
    children: {
        type: Number,
        required: true,
    },
    infants: {
        type: Number,
        required: true,
    },
});

const SearchQuerySchema = new Schema({
    // An agency ID of the project
    agency: {
        type: String,
        required: true,
    },
    // An IP address of the client that made request
    ipAddress: {
        type: String,
        required: true,
    },
    project: {
        type: String,
        required: true,
    },
    // The search query that client made
    query: {
        type: SearchQueryQuery,
        required: true,
    },
    results: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

// Add virtual function that identifies country code by IP address
SearchQuerySchema.virtual('countryCode').get(function() {
    const location = maxmind.get(this.ipAddress);
    if (!location) {
        return null;
    }

    return location.country.iso_code;
});

const SearchQueryModel = Mongoose.model('searchqueries', SearchQuerySchema);

export { SearchQuerySchema, SearchQueryModel };
