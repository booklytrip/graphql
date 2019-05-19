/**
 * @flow
 */

import { Flights as FlightsAPI } from '../connectors';
import {
    map,
    merge,
    filter,
    isEmpty,
    indexOf,
    find as lfind,
    every,
    isNil,
    isEqual,
    pick,
    first,
    last,
    each,
    fromPairs,
} from 'lodash';
import { format as formatDate } from 'date-fns';
import Promise from 'bluebird';

import { matchAndApply as matchAndApplyMarkup } from '../lib/markup';
import orderFlights from '../lib/orderFlights';

import { CountryModel } from './Country';
import { ProjectModel } from './Project';
import { SupplierModel } from './Supplier';
import { CreditCardModel } from './CreditCard';

import type {
    SearchFlightsQuery,
    FlightIdentity,
    Flight,
    BookingQuery,
    BookingStatus,
    Project,
    Booking,
} from '../types';

const getMarkups = async project => {
    if (!project.markups) {
        return [];
    }

    return await Promise.map(project.markups, async markup => {
        const suppliers = await Promise.map(markup.suppliers, supplierId => {
            return SupplierModel.findById(supplierId);
        });

        return Promise.resolve({
            ...(markup.toObject !== undefined ? markup.toObject() : markup),
            suppliers: map(suppliers, o => o.key),
        });
    });
};

export const find = async (query: SearchFlightsQuery, project: Project) => {
    let flights = await FlightsAPI.search(query);

    // Apply markups to the list of flights
    const markups = await getMarkups(project);
    if (!isEmpty(markups)) {
        flights = map(flights, flight => matchAndApplyMarkup(flight, markups));
    }

    // Return ordered list of flights
    return orderFlights(flights);
};

export const findOneByIdentity = async (
    identity: FlightIdentity,
    project: Project,
) => {
    let flight = await FlightsAPI.flight(identity).then(data => ({
        ...data.fare,
        params: data.params,
        baggage: data.baggagesDetailed,
    }));

    // Apply markup to the flight
    const markups = await getMarkups(project);
    if (!isEmpty(markups)) {
        flight = matchAndApplyMarkup(flight, markups);
    }

    return flight;
};

/**
 * Find another or the same flights that is similar to specified
 */
export const findLike = async (flight: Flight, project: Project) => {
    // Get list of suppliers
    const suppliers = filter(flight.suppliers, o => o.enabled);
    const suppliersKeys = await SupplierModel.find({
        _id: { $in: map(suppliers, o => o.supplier) },
    }).then(data => map(data, o => o.key));

    const query: SearchFlightsQuery = {
        suppliers: suppliersKeys,
        adults: flight.params.adults,
        infants: flight.params.infants,
        children: flight.params.children,
        departureAirport: first(flight.forwardSegments).departureAirport,
        arrivalAirport: last(flight.forwardSegments).arrivalAirport,
        departureDate: formatDate(
            first(flight.forwardSegments).departureTime,
            'YYYY-MM-DD',
        ),
        returnDate:
            !isEmpty(flight.comebackSegments) &&
            formatDate(
                first(flight.comebackSegments).departureTime,
                'YYYY-MM-DD',
            ),
        projectID: project._id,
    };

    // Generate list of all segments
    const srcSegments = [
        ...flight.forwardSegments,
        ...flight.comebackSegments,
    ].map(segment => ({
        ...segment,
        departureTime: formatDate(segment.departureTime, 'YYYY-MM-DD HH:mm:ss'),
        arrivalTime: formatDate(segment.arrivalTime, 'YYYY-MM-DD HH:mm:ss'),
    }));

    // List of fields to use when making comparison
    const pickFields = [
        'departureAirport',
        'arrivalAirport',
        'departureTime',
        'arrivalTime',
        'duration',
        'flightNumber',
        'carrier',
        'supplier',
    ];

    return (
        FlightsAPI.search(query)
            // Filter by suppliers
            .then(flights => {
                return filter(flights, item => {
                    const dstSegments = [
                        ...item.forwardSegments,
                        ...item.comebackSegments,
                    ];
                    // Compare each segment with list of segments of source flight
                    return every(srcSegments, (segment, idx) => {
                        return (
                            !isNil(dstSegments[idx]) &&
                            isEqual(
                                pick(segment, pickFields),
                                pick(dstSegments[idx], pickFields),
                            )
                        );
                    });
                });
            })
            .then(flights => {
                if (!isEmpty(flights)) {
                    return findOneByIdentity(
                        {
                            cachedID: flights[0].general.cachedID,
                            priceKey: flights[0].general.priceKey,
                        },
                        project,
                    );
                }

                return null;
            })
            .then(flight => {
                if (flight) {
                    // Resture original ID of each segment
                    each(
                        [...flight.forwardSegments, ...flight.comebackSegments],
                        (segment, idx) => {
                            segment._id = srcSegments[idx]._id;
                        },
                    );
                }

                return flight;
            })
    );
};

// The function adds type key with specified value to each segment
const segmentWithType = type => segments =>
    map(segments, segment => ({ ...segment, type }));

/**
* Make booking request to book specified flight
* 
* @param {Object} booking - The booking request
*/
export const booking = async (
    booking: Booking,
    project: Project,
): BookingStatus => {
    // Get default credit card of agency of provided project
    const card = await CreditCardModel.findOne({
        agency: project.agency,
        default: true,
    });

    // Get phone calling code for provided country
    const callingCode = (await CountryModel.findOne({
        cca2: booking.contact.phone.countryCode,
    })).callingCode;

    // Group all segments in single list
    const segments = [
        ...segmentWithType('forward')(booking.flight.forwardSegments),
        ...segmentWithType('comeback')(booking.flight.comebackSegments),
    ];

    // Provide settings for each supplier found in segments
    const suppliersSettings = fromPairs(
        await Promise.map(segments, segment => {
            return SupplierModel.findOne({
                key: segment.supplier,
            }).then(supplier => {
                const supplierSettings = lfind(project.suppliers, settings => {
                    // console.log(supplier.supplier, supplier._id.toString());
                    return settings.supplier === supplier._id.toString();
                });

                if (supplierSettings && supplierSettings.settings) {
                    // Transform key-value pairs into object
                    const settings = fromPairs(
                        map(supplierSettings.settings, item => [
                            item.key,
                            item.value,
                        ]),
                    );
                    return [segment.supplier, settings];
                }
            });
        }),
    );

    // Prepare list of orders with details of each segment
    const orders = map(booking.orders, order => {
        const orderSegments = map(order.segments, segmentId => {
            return lfind(segments, segment => {
                return segment._id.toString() === segmentId;
            });
        });

        return {
            ...order,
            segments: orderSegments,
        };
    });

    const query: BookingQuery = {
        cachedID: booking.flight.general.cachedID,
        priceKey: booking.flight.general.priceKey,
        supplier: booking.flight.general.supplier,
        suppliers: suppliersSettings,
        contact: merge(booking.contact, {
            phone: { callingCode: callingCode[0] },
            // We provide project email address as contact, because we don't want
            // the client to see actual price, which may be different
            email: project.details.email,
        }),
        passengers: booking.passengers,
        payment: {
            amount: booking.payment.amount,
            currency: booking.payment.currency,
        },
        orders,
        card,
    };

    return FlightsAPI.booking(query);
};

/**
 * Check-in passengers for each order for provided booking
 * 
 * @param {Object} booking - The booking to checkin
 */
export const checkin = async (booking: Booking) => {
    // Get project of provided booking
    const project = await ProjectModel.findById(booking.project);

    // Get phone calling code for provided country
    const callingCode = (await CountryModel.findOne({
        cca2: booking.contact.phone.countryCode,
    })).callingCode;

    // Group all segments in single list
    const segments = [
        ...segmentWithType('forward')(booking.flight.forwardSegments),
        ...segmentWithType('comeback')(booking.flight.comebackSegments),
    ];

    const query = {
        contact: merge(booking.contact, {
            phone: { callingCode: callingCode[0] },
            // We provide project email address as contact, because we don't want
            // the client to see actual price, which may be different
            email: project.details.email,
        }),
        passengers: booking.passengers,
        orders: booking.orders,
        segments,
    };

    return FlightsAPI.checkin(query);
};
