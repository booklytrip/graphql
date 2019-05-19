/**
 * @flow
 */

import moment from 'moment-timezone';
import { differenceInSeconds, isSameDay } from 'date-fns';
import { find } from 'lodash';

import type { Flight, FlightSegment } from '../../types';

/**
 * Return segment from list of segments following right before specified segment.
 *
 * The previous segment will be considered the segment where arrival airport is equal
 * to departure airport of specified segment.
 *
 * @param {Array}  segments - The list of segments
 * @param {Object} segment - The current segment
 */
export const prevSegment = (
    segments: Array<FlightSegment>,
    segment: FlightSegment,
) => {
    // If there one or non items in the list, there won't be result we are looking for
    if (segments.length < 2) {
        return null;
    }

    return find(
        segments,
        item => item.arrivalAirport === segment.departureAirport,
    );
};

export const setAirportTimeZone = async (model, iata, time) => {
    const airport = await model.findByIataWithCache(iata);
    return moment
        .tz(moment.utc(time).format('YYYY-MM-DD HH:mm:ss'), airport.timezone)
        .format();
};

/**
 * Change provided segment to amtch required form
 * @param {Object} model    - An airport model
 * @param {Array}  segments - A list of all flight segments for single direction
 * @param {Object} segment  - The segment we are measuring stop duration for
 */
export const formatSegment = (
    model: Object,
    segments: Array<FlightSegmentType>,
    segment: FlightSegmentType,
) => {
    let stopDuration = null;
    let nightStop = false;

    const departureSegment = prevSegment(segments, segment);
    if (departureSegment) {
        const arrivalTime = departureSegment.arrivalTime;
        const departureTime = segment.departureTime;

        // Calculate time that passenger should wait between two segments
        stopDuration = differenceInSeconds(departureTime, arrivalTime);

        // Stop that takes more then 10 hours and transition to the next day after
        // arrival is encounted as a night stop and may require to book a hotel.
        if (!isSameDay(departureTime, arrivalTime) && stopDuration >= 36000) {
            nightStop = true;
        }
    }

    return {
        ...segment,
        stopDuration,
        nightStop,
    };
};

/**
 * Count total number of passengers in provided flight
 * 
 * @param {Object} flight - The flight object
 */
export const getPassengersCount = (flight: Flight) => {
    return (
        (parseInt(flight.params.adults, 10) || 0) +
        (parseInt(flight.params.children, 10) || 0) +
        (parseInt(flight.params.infants, 10) || 0)
    );
};
