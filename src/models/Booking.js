/**
 * @flow weak
 */

import Mongoose, { Schema } from 'mongoose';
import PNR from '../lib/pnr';
import { round, each, get, indexOf } from 'lodash';

import { BaggageSchema } from './Baggage';
import { CarrierModel } from './Carrier';

/**
 * Represents a schema for a passenger
 */
const PassengerSchema = new Schema({
    type: {
        type: String,
        enum: ['ADULT', 'INFANT', 'CHILD'],
    },
    title: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    nationality: {
        type: String,
        required: false,
    },
    birthDate: {
        type: Date,
        required: false,
    },
    documentType: {
        type: String,
        enum: ['PASSPORT', 'IDENTITY_CARD'],
        required: false,
    },
    documentNumber: {
        type: String,
        required: false,
    },
    documentIssueCountry: {
        type: String,
        required: false,
    },
    documentIssueDate: {
        type: Date,
        required: false,
    },
    documentExpirationDate: {
        type: Date,
        required: false,
    },
    forwardBaggage: {
        type: BaggageSchema,
        required: false,
    },
    comebackBaggage: {
        type: BaggageSchema,
        required: false,
    },

    // checkin: {
    //     type: String,
    //     enum: ['PENDING', 'CONFIRMED', 'ERROR'],
    //     required: false,
    // },
    // // Date when checkin data was filled
    // checkedInAt: {
    //     type: Date,
    //     required: false,
    // },
});

/**
 * Represents schema for phone number which includes a country code
 */
const PhoneSchema = new Schema({
    _id: { id: false },
    countryCode: String,
    number: String,
});

/**
 * Represents schema for person contanct information
 */
const ContactSchema = new Schema({
    _id: { id: false },
    email: String,
    fullName: String,
    phone: PhoneSchema,
});

/**
 * Represents single flight segment
 */
const FlightSegment = new Schema({
    departureAirport: String,
    departureTime: Date,
    arrivalAirport: String,
    arrivalTime: Date,
    duration: String,
    flightNumber: String,
    leftPlaces: Number,
    carrier: String,
    supplier: String,
    currency: String,
    price: Number,
});

/**
 * Represents schema for general information about flight
 */
const FlightGeneral = new Schema({
    _id: { id: false },

    priceKey: String,
    cachedID: String,

    supplier: String,
    currency: String,
    transactionFee: Number,
    price: Number,
    originalPrice: Number,
});

/**
 * Represents a schema for flight which may consist ONE_WAY or ROUND_TRIP directions
 */
const FlightSchema = new Schema({
    _id: { id: false },
    params: {
        adults: Number,
        children: Number,
        infants: Number,
    },
    general: FlightGeneral,
    comebackSegments: [FlightSegment],
    forwardSegments: [FlightSegment],
});

/**
 * Represent schema for payment details
 */
const PaymentSchema = new Schema({
    _id: { id: false },
    // Payment gateway
    service: {
        type: String,
        enum: ['paysera', 'manual'],
        default: 'manual',
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        required: true,
    },
    // Payment method like VISA, MC, cash
    method: {
        type: String,
        default: 'manual',
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionFee: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
    },
    // Possible error message if payment has failed
    error: {
        type: String,
        required: false,
    },
    // Date and time when payment was received
    receivedAt: {
        type: Date,
        default: Date.now,
    },
});

const OrderSchema = new Schema({
    // Passenger reservation number
    pnr: String,
    // Provide of the service
    provider: String,
    // Supplier of the flight (flight company)
    supplier: String,
    // Segments that this order cover
    segments: [String],
    // Check-in status for current order
    checkin: {
        type: String,
        enum: ['NOT_REQUIRED', 'PENDING', 'CONFIRMED'],
        default: 'NOT_REQUIRED',
    },
    // Response from supplier service
    response: Object,
});

/**
 * Get PNR from response object provided by
 * service provider and save it in order object.
 */
OrderSchema.pre('save', function(next) {
    // If that's a new order, set correct check-in status
    if (this.isNew) {
        const suppliers = ['ryanair', 'wizzair'];
        if (indexOf(suppliers, this.supplier) !== -1) {
            this.checkin = 'PENDING';
        }
    }

    if (this.isModified('response')) {
        if (!this.pnr) {
            switch (this.supplier) {
                case 'travelport':
                    this.pnr = get(this, 'response.locatorCode');
                    break;
                case 'ryanair':
                    this.pnr = get(this, 'response.info.pnr');
                    break;
                // NOTE: That works for ryanair and wizzair, so we expect that it may
                // work for most cases
                default:
                    this.pnr = get(this, 'response.order.pnr');
                    break;
            }
        }
    }

    next();
});

/**
 * Represents a booking schema
 */
const BookingSchema = new Schema({
    // List bookings states that the booking has passed
    states: {
        type: [String],
        enum: [
            'PAYMENT',
            'RESERVATION',
            'CHECK_IN',
            'CONFIRMATION',
            'DOCUMENTS',
        ],
    },
    // The project ID that the booking is related to
    project: {
        type: String,
        required: true,
    },
    // The internal passenger reservation number
    pnr: {
        type: String,
        index: true,
    },
    // The flight object received from flight's API
    flight: FlightSchema,
    // Passenger contact details
    contact: ContactSchema,
    // List of all passengers registered on the flight
    passengers: {
        type: [PassengerSchema],
        index: true,
    },
    // Payment details
    payment: PaymentSchema,
    // Flight(s) reservation details
    orders: [OrderSchema],
    error: {
        type: String,
        required: false,
    },
    // The date when booking was created
    createdAt: {
        type: Date,
        default: new Date(),
        index: true,
    },
    // The last time the booking was updated
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Calculate baggage price for all flight directions
export const sumBaggagePrice = (passenger, type) => {
    let totalPrice = null;

    [
        get(passenger, `forwardBaggage.${type}.price`),
        get(passenger, `comebackBaggage.${type}.price`),
    ].forEach(price => {
        if (price && parseFloat(price) > 0) {
            if (totalPrice === null) {
                totalPrice = price;
            } else {
                totalPrice += price;
            }
        }
    });

    return totalPrice;
};

/**
 * Add virtual field with claculated total price
 * of the booking.
 */
BookingSchema.virtual('totalPrice').get(function() {
    let totalPrice = null;

    if (this.flight) {
        totalPrice = this.flight.general.price;
    }

    // Add service provider transaction fee
    if (this.flight.general.transactionFee) {
        totalPrice += this.flight.general.transactionFee;
    }

    // Add payment transaction fee to flight price
    if (this.payment) {
        totalPrice += this.payment.transactionFee;
    }

    // Get total baggage price
    const baggagePrice = { cabin: null, checked: null };
    each(this.passengers, passenger => {
        ['cabin', 'checked'].forEach(type => {
            const price = sumBaggagePrice(passenger, type);
            if (price !== null) {
                if (!baggagePrice[type]) {
                    baggagePrice[type] = price;
                } else {
                    baggagePrice[type] += price;
                }
            }
        });
    });

    // Add baggage price to the total price
    if (baggagePrice.cabin) {
        totalPrice += baggagePrice.cabin;
    }
    if (baggagePrice.checked) {
        totalPrice += baggagePrice.checked;
    }

    return round(totalPrice, 2);
});

/**
 * Make sure that PNR is unique in range of last 300 days
 *
 * @param {String} pnr - Passenger name record
 * @param {Object} doc - A document object
 */
const validatePNR = async (pnr: string, doc: Object) => {
    const DAY_IN_MSEC = 8640000;
    const item = await doc.constructor.findOne({
        pnr,
        createdAt: {
            $gte: new Date(Date.now() - DAY_IN_MSEC * 300),
        },
    });

    return !!item;
};

/**
 * Pre-save hook sets createdAt date for a new document
 */
BookingSchema.pre('save', function(next) {
    // Generate a new PNR when creating a new booking
    if (this.isNew) {
        let pnr = null;
        do {
            pnr = PNR();
        } while (!validatePNR(pnr, this));

        this.pnr = pnr;
    }

    next();
});

const BookingModel = Mongoose.model('booking', BookingSchema);

export { BookingSchema, BookingModel };
