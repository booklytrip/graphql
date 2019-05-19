/**
 * Calculate markup based on original price and markup
 * configuration.
 *
 * @flow
 */

import {
    isEmpty,
    some,
    every,
    sum,
    has,
    toLower,
    first,
    find,
    cloneDeep,
    merge,
    round,
    reduce,
    pick,
} from 'lodash';

import { isWithinRange, differenceInDays } from 'date-fns';
import { getPassengersCount } from '../schema/flight/helpers';

import type {
    Flight,
    Markup,
    MarkupPassengerCondition,
    MarkupDepartureCondition,
    MarkupPriceRangeCondition,
} from '../types';

/**
 * Match flight by number of passengers
 *
 * @param {Object} flight    - The flight object
 * @param {Object} passenger - The passenger condition
 */
const passengerCondition = (
    flight: Flight,
    passenger: MarkupPassengerCondition,
) => {
    switch (passenger.type) {
        case 'ADULT':
            return flight.params.adults >= passenger.count;
        case 'CHILD':
            return flight.params.children >= passenger.count;
        case 'INFANT':
            return flight.params.infants >= passenger.count;
        case 'ALL':
            const total = sum([
                flight.params.adults,
                flight.params.children,
                flight.params.infants,
            ]);
            return total >= passenger.count;
        default:
            return false;
    }
};

/**
 * Match flight against supplier condition
 *
 * @param {Object} flight   - The flight object
 * @param {String} supplier - The supplier name
 */
const supplierCondition = (flight: Flight, supplier: string) => {
    return toLower(flight.general.supplier) === toLower(supplier);
};

/**
 * Match flight against departure conditions
 *
 * @param {Object} flight    - The flight object
 * @param {Object} departure - The departure condition object
 */
const departureCondition = (
    flight: Flight,
    departure: MarkupDepartureCondition,
) => {
    const departureTime = first(flight.forwardSegments).departureTime;
    if (departure.type === 'DATE_RANGE') {
        return isWithinRange(
            departureTime,
            departure.startDate,
            departure.endDate,
        );
    } else if (departure.type === 'DAY') {
        return (
            Math.abs(differenceInDays(departureTime, new Date())) <=
            departure.days
        );
    }

    return false;
};

/**
 * Match flight against price range conditions
 *
 * @param {Object} flight     - The flight object
 * @param {Object} priceRange - The price range condition object
 */
const priceRangeCondition = (
    flight: Flight,
    priceRange: MarkupPriceRangeCondition,
) => {
    const price = parseFloat(flight.general.price, 10);
    return price >= priceRange.startPrice && price <= priceRange.endPrice;
};

/**
 * Try to much specified flight to the markup and return
 * true or false depending if the markup matches.
 *
 * @param {Object} flight - The flight object
 * @param {Object} markup - The markup object
 */
const match = (flight: Flight, markup: Markup) => {
    // Default markup should always match
    if (markup.default) {
        return true;
    }

    // Match currency condition
    if (has(flight, 'general.price.currency')) {
        if (flight.general.price.currency !== markup.general.currency) {
            return false;
        }
    }

    // Match passenger conditions
    if (!isEmpty(markup.passengers)) {
        if (!every(markup.passengers, i => passengerCondition(flight, i))) {
            return false;
        }
    }

    // Match supplier conditions
    if (!isEmpty(markup.suppliers)) {
        if (!some(markup.suppliers, i => supplierCondition(flight, i))) {
            return false;
        }
    }

    // Match departure conditions
    if (!isEmpty(markup.departures)) {
        if (!some(markup.departures, i => departureCondition(flight, i))) {
            return false;
        }
    }

    // Match price range condition
    if (!isEmpty(markup.priceRanges)) {
        if (!some(markup.priceRanges, i => priceRangeCondition(flight, i))) {
            return false;
        }
    }

    return true;
};

/**
 * Calculate markup based on original price and markup
 * configuration.
 *
 * @param {Number} price  - The orifinal price
 * @param {Object} markup - The matching markup
 */
const calc = (price: number, markup: Markup) => {
    const { markupType, value } = markup.general;
    switch (markupType) {
        // Add fixed price value
        case 'FIXED':
            return price + value.fixed;
        // Increase price by some percentage
        case 'PERCENTAGE':
            return round(price + price * value.percentage / 100, 2);
        // return price + price * value.percentage / 100;
        // Increase price by some percentage but return a min value
        // if resulting value is smaller
        case 'MIN_PERCENTAGE': {
            const markupPrice = round(
                price + price * value.percentage / 100,
                2,
            );
            if (markupPrice < value.min) {
                return value.min;
            }

            return markupPrice;
        }
        // Increate price by some percentage but limit it to specified
        // the max value
        case 'PERCENTAGE_MAX': {
            const markupPrice = round(
                price + price * value.percentage / 100,
                2,
            );
            if (markupPrice > value.max) {
                return value.max;
            }

            return markupPrice;
        }
        // Increate price by some percentage but limit it to specified
        // max value or increase to min value if resulting value is smaller
        case 'MIN_PERCENTAGE_MAX': {
            const markupPrice = round(
                price + price * value.percentage / 100,
                2,
            );
            if (markupPrice < value.min) {
                return value.min;
            } else if (markupPrice > value.max) {
                return value.max;
            }

            return markupPrice;
        }
        // Throw an error if markup type is not handled
        default:
            throw new Error('Invalid markup type');
    }
};

/**
 * Calculate a new price for the flight using specified markup,
 * and return a new flight object.
 *
 * This method doesn't try to match markup conditions to the flight.
 * If you need to match markup criterias, use: matchAndApply
 *
 * @param {Object} flight - The flight object
 * @param {Object} markup - The markup object
 */
const apply = (flight: Flight, markup: Markup) => {
    const passengersTypes = {
        adults: 'adult',
        children: 'child',
        infants: 'infant',
    };

    // Calculate total price including markup based on individual price of each passenger
    let price = 0;
    if (isEmpty(flight.general.pricing)) {
        const passengersCount = getPassengersCount(flight);
        const pricePerPassenger = flight.general.price / passengersCount;

        for (let i = 0; i < passengersCount; i++) {
            price += calc(parseFloat(pricePerPassenger, 10), markup);
        }
    } else {
        price = reduce(
            Object.keys(passengersTypes),
            (value, passenger) => {
                const passengers = parseInt(flight.params[passenger], 10);
                if (passengers === 0) {
                    return value;
                }

                const passengerPrice =
                    flight.general.pricing[passengersTypes[passenger]];

                const priceWithMarkup = calc(
                    parseFloat(passengerPrice.total, 10),
                    markup,
                );
                const totalPrice = priceWithMarkup * passengers;

                return totalPrice + value;
            },
            0,
        );
    }

    return merge(cloneDeep(flight), {
        general: {
            price: round(price, 2),
            originalPrice: flight.general.price,
        },
    });
};

/**
 * Match list of markups against specified flight and apply matching
 * markup. If no markup will match, the original flight will be returned.
 *
 * @param {Object} fligth  - The flight object
 * @param {Array}  markups - The list of markups
 */
const matchAndApply = (flight: Flight, markups: Array<Markup>) => {
    const matchingMarkup = find(markups, markup => match(flight, markup));
    if (matchingMarkup) {
        return apply(flight, matchingMarkup);
    }

    return flight;
};

export { match, calc, apply, matchAndApply };
