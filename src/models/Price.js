import { Schema } from 'mongoose';

const PriceSchema = new Schema({
    _id: { id: false },
    currency: String,
    amount: Number,
});

export { PriceSchema };