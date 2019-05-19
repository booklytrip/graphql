import { Schema } from 'mongoose';

/**
 * Represents a schema for single bag
 */
const BagSchema = new Schema({
    _id: { id: false },
    price: Number,
    weight: Number,
    dimensions: String,
});

/**
 * Represents baggage groups for single direction
 */
const BaggageSchema = new Schema({
    _id: { id: false },
    // Checked-in baggage
    checked: BagSchema,
    // Carry-on baggage
    cabin: BagSchema,
});

export {
    BaggageSchema,
    BagSchema,
};
