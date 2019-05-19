/**
 * The schema for project settings to markup flight prices
 *
 * @flow
 */

import { Schema } from 'mongoose';

const MarkupValue = new Schema({
    _id: { id: false },
    fixed: Number,
    min: Number,
    max: Number,
    percentage: Number,
});

const GeneralConditionSchema = new Schema({
    _id: { id: false },
    submissionPlace: {
        type: String,
        enum: ['SEARCH_RESULTS', 'SELF_SERVICE'],
    },
    markupType: {
        type: String,
        enum: [
            'FIXED',
            'PERCENTAGE',
            'MIN_PERCENTAGE',
            'PERCENTAGE_MAX',
            'MIN_PERCENTAGE_MAX',
        ],
    },
    currency: String,
    value: MarkupValue,
});

const PassengerConditionSchema = new Schema({
    type: {
        type: String,
        enum: ['ADULT', 'CHILD', 'INFANT'],
    },
    count: Number,
});

const DepartureConditionSchema = new Schema({
    type: {
        type: String,
        enum: ['DATE_RANGE', 'DAY'],
    },
    startDate: Date,
    endDate: Date,
    days: Number,
});

const PriceRangeConditionSchema = new Schema({
    startPrice: Number,
    endPrice: Number,
});

const MarkupSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    directionType: {
        type: String,
        require: true,
    },
    default: {
        type: Boolean,
    },
    general: {
        type: GeneralConditionSchema,
        require: true,
    },
    passengers: [PassengerConditionSchema],
    suppliers: [String],
    departures: [DepartureConditionSchema],
    priceRanges: [PriceRangeConditionSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export {
    GeneralConditionSchema,
    PassengerConditionSchema,
    DepartureConditionSchema,
    PriceRangeConditionSchema,
    MarkupSchema,
};
