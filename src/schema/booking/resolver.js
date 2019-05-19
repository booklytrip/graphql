import { map, filter, indexOf, get, property } from 'lodash';

import { NotExists } from '../../errors';

/**
 * Helper for baggage formatting
 */
const formatBaggage = (baggage, currency) => ({
    checked: baggage.checked && {
        ...baggage.checked,
        currency,
    },
    cabin: baggage.cabin && {
        ...baggage.cabin,
        currency,
    },
});

/**
 * The flight booking entity
 */
export const Booking = {
    id: property('_id'),

    /**
     * Provide flight object of current booking
     */
    flight: async (root, args, context) => {
        const { BookingModel, FlightModel, ProjectModel } = context;

        // Update flight each time we make a query untill it will be booked
        const isIncomplete =
            indexOf(root.states, 'RESERVATION') === -1 &&
            indexOf(root.states, 'CONFIRMATION') === -1;

        if (args.refresh && isIncomplete) {
            const project = await ProjectModel.findById(root.project);
            const flight = await FlightModel.findLike(root.flight, project);
            if (!flight) {
                throw new NotExists({
                    data: { type: 'flight' },
                });
            }

            await BookingModel.update({ _id: root._id }, { flight });

            return flight;
        }

        return root.flight;
    },

    /**
     * Return project of the booking 
     */
    project: (root, args, context) => {
        return context.ProjectModel.findById(root.project);
    },

    /**
     * Return list of passengers registered to the flight,
     * including information about picked up baggage.
     */
    passengers: booking => {
        return map(booking.passengers, passenger => ({
            ...passenger,
            flight: booking.flight,
            forwardBaggage:
                passenger.forwardBaggage &&
                formatBaggage(
                    passenger.forwardBaggage,
                    booking.flight.general.currency,
                ),
            comebackBaggage:
                passenger.comebackBaggage &&
                formatBaggage(
                    passenger.comebackBaggage,
                    booking.flight.general.currency,
                ),
        }));
    },

    /**
     * Flight order(s) details received from service provider
     */
    orders: (root, args, context) => {
        return map(root.orders, order => ({
            ...order,
            flight: root.flight,
        }));
    },

    /**
     * Total price of bookig that includes all fees
     */
    totalPrice: (root, args, context) => ({
        amount: root.totalPrice,
        currency: root.flight.general.currency,
    }),

    /**
     * Return list of available payment methods
     */
    paymentMethods: (root, args, context) => {
        return context.PaymentModel.getMethodsForBooking(root, context.project);
    },
};

/**
 * The booking order entity
 */
export const BookingOrder = {
    id: property('_id'),

    /**
     * Return segment supplier if provided, or use general flight supplier if not.
     */
    supplier: (root, args, context) => {
        if (root.supplier) {
            return root.supplier;
        }

        return root.flight.general.supplier;
    },

    /**
     * Filter list of all flight segments and provide only used in current order
     */
    segments: (root, args, context) => {
        const flightSegments = [
            ...root.flight.forwardSegments,
            ...root.flight.comebackSegments,
        ];

        return filter(flightSegments, segment => {
            return indexOf(root.segments, segment._id.toString()) !== -1;
        });
    },
};
