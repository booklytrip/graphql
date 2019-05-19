/**
 * @flow
 */

import {
    isEmpty,
    get,
    pick,
    first,
    last,
    split,
    map,
    round,
    ceil,
    uniqBy,
    property,
} from 'lodash';
import { format as formatDate, differenceInSeconds } from 'date-fns';
import moment from 'moment';

import {
    setAirportTimeZone,
    formatSegment,
    prevSegment,
    getPassengersCount,
} from './helpers';

import type { Flight as FlightType } from '../../types';

/**
 * Resolver of flight object
 */
export const Flight = {
    /**
     * The flight general section
     */
    general: (root, args, context) => {
        return root;
    },

    /**
     * The outbound sector of the flight
     */
    forwardSector: (root, args, context) => ({
        segments: root.forwardSegments,
        baggage: get(root, 'baggage.forward', {}),
        currency: root.general.currency,
    }),

    /**
     * The inbound sector of the flight
     */
    comebackSector: (root, args, context) => {
        // For ONE_WAY trip the comebackSegment will not be provided
        if (!isEmpty(root.comebackSegments)) {
            return {
                segments: root.comebackSegments,
                baggage: get(root, 'baggage.comeback', {}),
                currency: root.general.currency,
            };
        }
    },
};

/**
 * The general section of flight
 */
export const FlightGeneral = {
    /**
     * The combination of fields that identifies flight
     */
    cachedID: property('general.cachedID'),
    priceKey: property('general.priceKey'),

    /**
     * Provide flight supplier object
     */
    supplier: (root, args, context) => {
        return context.SupplierModel.findOne({ key: root.general.supplier });
    },

    /**
     * Provide flight price including transaction fee and markups
     */
    price: (root, args, context) => {
        // Apply transaction fee if it's available
        const price = ceil(
            root.general.price + (root.general.transactionFee || 0),
            2,
        );

        return {
            amount: price,
            currency: root.general.currency,
        };
    },

    /**
     * The flight price provided by supplier without any markups
     */
    supplierPrice: (root, args, context) => ({
        amount: root.general.originalPrice,
        currency: root.general.currency,
    }),

    /**
     * The supplier transaction fee. Avaiable only for few (usualy lowcosters) suppliers.
     */
    transactionFee: (root, args, context) => ({
        amount: root.general.transactionFee ? root.general.transactionFee : 0,
        currency: root.general.currency,
    }),

    /**
     * The price includes transaction fee, but does not include markups
     */
    serviceFee: (root, args, context) => ({
        amount:
            root.general.price -
            root.general.originalPrice +
            root.general.transactionFee,
        currency: root.general.currency,
    }),

    /**
     * Provide number of passengers for each type of passenger
     */
    passengers: (root, args, context) => {
        return pick(root.params, ['adults', 'children', 'infants']);
    },

    /**
     * The flight type (one-way / round-trip)
     */
    wayType: (root, args, context) => {
        return isEmpty(root.comebackSegments) ? 'ONE_WAY' : 'ROUND_TRIP';
    },

    /**
     * The date when flight outbound from source destination
     */
    departureDate: (root, args, context) => {
        return moment
            .utc(first(root.forwardSegments).departureTime)
            .format('YYYY-MM-DD');
    },

    /**
     * The date when flight inbound to source destination
     */
    returnDate: (root, args, context) => {
        if (!isEmpty(root.comebackSegments)) {
            const departureTime = last(root.comebackSegments).departureTime;
            return moment.utc(departureTime).format('YYYY-MM-DD');
        }
    },

    /**
     * Price details for each type of passengers
     */
    pricing: (root, args, context) => {
        return root;
    },
};

/**
 * Resolver for single flight sector.
 * 
 * DEFINITON: Segment is portion of an itinerary, or journey, 
 * which may consist of one or more legs or segments.
 */
export const FlightSector = {
    /**
     * The list of segments that the sector consist of
     */
    segments: (root, args, context) => {
        const { segments, ...segment } = root;
        return map(root.segments, segment => ({ ...segment, segments }));
    },

    /**
     * Return an entity of departure airport.
     */
    departureAirport: (root, args, context) => {
        const code = first(root.segments).departureAirport;
        return context.AirportModel.findByIataWithCache(code);
    },

    /**
     * Return an entity of arrival airport
     */
    arrivalAirport: (root, args, context) => {
        const code = last(root.segments).arrivalAirport;
        return context.AirportModel.findByIataWithCache(code);
    },

    /**
     * The departure time of first segment
     */
    departureTime: (root, args, context) => {
        return moment
            .utc(first(root.segments).departureTime)
            .format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * The arrival time of last segment
     */
    arrivalTime: (root, args, context) => {
        return moment
            .utc(last(root.segments).arrivalTime)
            .format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * The total number of stops that the segment consist of
     */
    stops: (root, args, context) => {
        return root.segments.length - 1;
    },

    /**
     * Return duration in seconds between first and last segments
     */
    duration: async (root, args, context) => {
        const departureSegment = first(root.segments);
        const departureTime = await setAirportTimeZone(
            context.AirportModel,
            departureSegment.departureAirport,
            departureSegment.departureTime,
        );

        const arrivalSegment = last(root.segments);
        const arrivalTime = await setAirportTimeZone(
            context.AirportModel,
            arrivalSegment.arrivalAirport,
            arrivalSegment.arrivalTime,
        );

        return differenceInSeconds(arrivalTime, departureTime);
    },

    /**
     * Supported baggage options for current flight
     */
    baggage: async (root, args, context) => {
        const { baggage, segments, currency } = root;
        const carrierCode = first(segments).carrier;
        const carrier = await context.CarrierModel.findByCodeWithCache(
            carrierCode,
        );

        return {
            checked: !isEmpty(baggage) ? uniqBy(baggage, 'price') : null,
            cabin: carrier.cabinBaggage && {
                ...carrier.cabinBaggage,
                currency,
            },
        };
    },

    /**
     * Return en entity of carrier for the first segment of the flight
     */
    carrier: (root, args, context) => {
        const code = first(root.segments).carrier;
        return context.CarrierModel.findByCodeWithCache(code);
    },
};

/**
 * Resolver for single flight segment
 * 
 * DEFINITION: A segment is that portion of a journey, from a boarding
 * point of a passenger, to a deplaning point of the given flight. 
 * Although the passenger may not leave the plane, it may tough down to
 * take on or let off passengers at several points, so that a segment may
 * be made up of a leg or group of legs.
 */
export const FlightSegment = {
    /**
     * An entity of departure airport
     */
    departureAirport: (root, args, context) => {
        return context.AirportModel.findByIataWithCache(root.departureAirport);
    },

    /**
     * An entity of arrival airport
     */
    arrivalAirport: (root, args, context) => {
        return context.AirportModel.findByIataWithCache(root.arrivalAirport);
    },

    /**
     * An entity of carrier of current segment
     */
    carrier: (root, args, context) => {
        return context.CarrierModel.findByCodeWithCache(root.carrier);
    },

    /**
     * The total price for current segment without transaction fee
     */
    price: (root, args, context) => ({
        amount: root.price,
        currency: root.currency,
    }),

    /**
     * The flight duration in number of seconds
     */
    duration: (root, args, context) => {
        const parts = split(root.duration, ':');

        return (
            // Hours
            parseInt(parts[0], 10) * 3600 +
            // Minutes
            parseInt(parts[1], 10) * 60 +
            // Seconds
            parseInt(parts[2], 10)
        );
    },

    /**
     * The stop duration in seconds between current and the next segment
     */
    stopDuration: async (root, args, context) => {
        const { segments, ...segment } = root;

        if (segments.length < 2) {
            return null;
        }

        const arrivalSegment = segment;
        const departureSegment = prevSegment(segments, segment);

        if (!departureSegment) {
            return null;
        }

        const departureTime = await setAirportTimeZone(
            context.AirportModel,
            departureSegment.departureAirport,
            departureSegment.departureTime,
        );

        const arrivalTime = await setAirportTimeZone(
            context.AirportModel,
            arrivalSegment.arrivalAirport,
            arrivalSegment.arrivalTime,
        );

        return differenceInSeconds(arrivalTime, departureTime);
    },
};

/**
 * Resolver for flight pricing details
 */
export const FlightPassengerPricing = {
    /**
     * Return flight price for adult passenger including his portion of transaction fee
     */
    adult: (root, args, context) => {
        const transactionFee = root.general.transactionFee || 0;
        const price =
            root.general.pricing.adult +
            transactionFee / getPassengersCount(root);
        return ceil(price, 2);
    },

    /**
     * Return flight price for child passenger including his portion of transaction fee
     */
    child: (root, args, context) => {
        const transactionFee = root.general.transactionFee || 0;
        const price =
            root.general.pricing.child +
            transactionFee / getPassengersCount(root);
        return ceil(price, 2);
    },

    /**
     * Return flight price for infant passenger including his portion of transaction fee
     */
    infant: (root, args, context) => {
        const transactionFee = root.general.transactionFee || 0;
        const price =
            root.general.pricing.infant +
            transactionFee / getPassengersCount(root);
        return ceil(price, 2);
    },

    /**
     * Return average price for all passengers inculding transaction fee
     */
    avg: (root, args, context) => {
        const transactionFee = root.general.transactionFee || 0;
        const price =
            (root.general.price + transactionFee) / getPassengersCount(root);
        return ceil(price, 2);
    },
};
