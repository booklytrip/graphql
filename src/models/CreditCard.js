/**
 * Schema of CreditCard model
 */

import Mongoose, { Schema } from 'mongoose';

const AddressSchema = new Schema({
    _id: { id: false },
    countryCode: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        require: true,
    },
    street: {
        type: String,
        require: true,
    },
    postcode: {
        type: String,
        require: true,
    },
});

const PersonSchema = new Schema({
    _id: { id: false },
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        enum: ['MR', 'MRS', 'MS'],
        require: true,
    },
});

const CreditCardSchema = new Schema({
    // The reference to the agency
    agency: {
        type: String,
        required: true,
    },
    // Credit card type
    type: {
        type: String,
        required: true,
        enum: ['VI', 'MC'],
    },
    // Credit card number
    number: {
        type: String,
        required: true,
    },
    // Credit card CVV code
    cvv: {
        type: String,
        required: true,
    },
    // Credit card expiry date
    expiry: {
        type: String,
        required: true,
    },
    // Credit card 3-D Security
    d3_security: {
        type: String,
    },
    // Card holder address (billing address)
    address: {
        type: AddressSchema,
        require: true,
    },
    // Card holder person
    person: {
        type: PersonSchema,
        required: true,
    },
    // If set as true, the card will be used by default
    default: {
        type: Boolean,
    },
});

// Add hook that reset default flag from other cards
// if updated card is a new default
CreditCardSchema.pre('save', function(next, done) {
    if (this.default) {
        this.constructor.update(
            { default: true, _id: { $ne: this.id }, agency: this.agency },
            { default: false },
            { multi: true },
            (error, response) => {
                next();
            },
        );
    }
});

const CreditCardModel = Mongoose.model('creditcard', CreditCardSchema);

export { CreditCardSchema, CreditCardModel };
