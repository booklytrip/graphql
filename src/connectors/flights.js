/**
 * The API for interaction with flights microservice
 *
 * @flow
 */

import { map, pick, trimStart } from 'lodash';
import rp from 'request-promise';

import statsd from '../lib/statsd';
import baseLogger from '../lib/logger';
import config from '../config';

import { NotExists } from '../errors';

import type {
    SearchFlightsQuery,
    FlightIdentity,
    Flight,
    BookingQuery,
    BookingStatus,
} from '../types';

const logger = baseLogger.child({ connector: 'flights' });

/**
 * Send request to Flights API server
 *
 * @param {String} path  - Resource path relative to base URL
 * @param {Object} query - Query to send to the API
 */
const request = (path: string, query: Object) => {
    logger.debug(query, 'Sending request to Flights API');

    return rp
        .post({
            uri: `${config.flightsUrl}/${trimStart(path, '/')}`,
            body: query,
            json: true,
        })
        .then(data => {
            logger.debug(data, 'Received response from Flights API');
            return data;
        });
};

/**
 * Search flights using specified list of criterias
 *
 * @param {Object} query - Key-valued object with criterias
 */
export const search = (query: SearchFlightsQuery): Promise<Array<Flight>> => {
    logger.info(query, 'Sending flights search request');
    statsd.increment('flights.search.request');

    const start = new Date();
    return request('flights', query).then(({ params, prices }) => {
        const resultsCount = prices ? prices.length : 0;
        logger.info(
            `Received search results from Flights API (flights: ${resultsCount})`,
        );
        statsd.timing('flights.search.duration', start);
        statsd.counter('flights.search.results', resultsCount);

        return map(prices, flight =>
            Object.assign({}, flight, {
                params: pick(params, ['adults', 'children', 'infants']),
            }),
        );
    });
};

/**
 * Requests information of specific flight identified by
 * cachedID and priceKey parameters
 *
 * @param {String} query - A query object with cachedID and priceKey keys that identifies flight
 */
export const flight = (query: FlightIdentity): Flight => {
    logger.info(query, 'Sending flight details request');
    statsd.increment('flights.details.request');

    const start = new Date();
    return request('flight', query).then(res => {
        if (res.status !== 'success') {
            throw new NotExists({
                message: res.message,
            });
        }

        logger.info('Received flight details response');
        statsd.timing('flights.details.duration', start);

        return res.data;
    });
};

/**
 * Book flight(s) provided in the query
 *
 * @param {Object} query - A query with all required information for booking
 */
export const booking = (query: BookingQuery): Promise<Array<BookingStatus>> => {
    logger.info('Received booking request');
    statsd.increment('flights.booking.request');

    const start = new Date();
    return request('booking', query).then(res => {
        logger.info('Received flight booking response');
        statsd.timing('flights.booking.timing', start);

        return res;
    });
};

/**
 * Check-in passengers for specified booking
 */
export const checkin = query => {
    logger.info('Received check-in request');

    return request('checkin', query).then(res => {
        logger.info('Received check-in response');
        return res;
    });
};
