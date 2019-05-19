/**
 * TODO: Add logging
 *
 * @flow
 */

import { isEmpty, isArray, get, find, each, omit, indexOf } from 'lodash';

import logger from '../../lib/logger';
import mailer from '../../lib/mailer';
import { validateAndParseResponse } from '../../connectors/paysera';
import {
    BookingModel,
    FlightModel,
    ProjectModel,
    PaymentModel,
} from '../../models';

// One day in microseconds
const DAY_IN_MSEC = 8640000;

// Paysera response status
const STATUS_SUCCESS = 1;
const STATUS_PENDING = 2;

/**
 * Validate payment details with booked flight
 *
 * @param {Object} booking - A booking details
 * @param {Object} payment - A payment details
 */
const validatePayment = (booking, payment) => {
    // Validate price and currency
    if (Math.floor(booking.totalPrice * 100) !== parseInt(payment.amount, 10)) {
        return "Payment price doesn't match flight price";
    }

    if (
        booking.flight.general.currency.toLowerCase() !==
        payment.currency.toLowerCase()
    ) {
        return "Payment currency doesn't match flight currency.";
    }

    return null;
};

/**
 * Paysera middlware for express which handles callback call from
 * payment server
 */
export function payseraMiddleware() {
    return async (req, res, context) => {
        // Only GET method is allowed
        if (req.method !== 'GET') {
            res
                .set('Allow', 'GET')
                .status(405)
                .send('Paysera callback supports only GET request.');

            return;
        }

        // Verify data and signature parameters
        if (!req.query.data || !req.query.ss1 || !req.query.project) {
            res.status(500).send('One of required parameters is missing.');
            return;
        }

        // Get project object
        const project = await ProjectModel.findById(req.query.project);

        const data = validateAndParseResponse(
            req.query,
            project.payment.paysera,
            paymentMethod,
        );

        // Get booking object
        let booking = await BookingModel.findOne({
            pnr: data.orderid,
            // Because of limitation of PNR it can repeat after some time,
            // so let's limit results by time range
            createdAt: {
                $gte: new Date(Date.now() - DAY_IN_MSEC * 60),
            },
        });

        if (!booking) {
            logger.error(`Booking with PNR ${data.orderid} is not found.`);
            return res.send('OK');
        }

        // Ignore test payments if running in production
        if (
            process.env.NODE_ENV === 'production' &&
            parseInt(data.test, 10) === 1
        ) {
            logger.error('Test payments are not allowed in production');
            return res.send('OK');
        }

        // Don't process futher if payment is already received
        if (indexOf(booking.states, 'PAYMENT') !== -1) {
            logger.info('Payment is already received');
            return res.send('OK');
        }

        // Get list of payment methods for current booking and project
        const paymentMethods = await PaymentModel.getMethodsForBooking(
            booking,
            project,
        );
        const paymentMethod = find(paymentMethods, { id: data.payment });

        // Init payment object
        booking.payment = {
            service: 'paysera',
            method: data.payment,
            amount: parseInt(data.amount, 10) / 100,
            transactionFee: paymentMethod.transactionFee,
            currency: data.currency,
        };

        switch (parseInt(data.status, 10)) {
            // Payment successful
            case STATUS_SUCCESS:
                const error = validatePayment(booking, data);

                if (error) {
                    logger.warn(
                        { booking: booking._id, error },
                        'Received invalid payment request',
                    );

                    booking.payment.status = 'failed';
                    booking.payment.error = error;
                } else {
                    logger.info(
                        { booking: booking._id },
                        'Payment successfully received',
                    );

                    booking.states.addToSet('PAYMENT');
                    booking.payment.status = 'success';
                }
                break;
            // Payment order accepted, but not yet executed
            case STATUS_PENDING:
                booking.payment.status = 'pending';
                break;
            // Payment failed
            default:
                booking.payment.status = 'failed';
        }

        await booking.save();

        // Don't process if booking is already completed
        if (indexOf(booking.states, 'CONFIRMATION') !== -1) {
            logger.info('Booking is already completed');
            return res.send('OK');
        }

        // Do not procees if payment has failed
        if (booking.payment.status !== 'success') {
            return res.send('OK');
        }

        return FlightModel.booking(booking.toObject(), project)
            .then(orders => {
                if (orders.error) {
                    logger.error(
                        `Unable to complete flight because of error: ${orders.error}`,
                    );
                    booking.error = orders.error;
                } else {
                    logger.info(orders, 'Flight orders successfully received');
                    booking.states.addToSet('CONFIRMATION');
                    booking.error = null;

                    // Update booking with received order details
                    each(orders.data, data => {
                        const order = booking.orders.id(data.reference);
                        if (!order) {
                            logger.error(
                                { bookingId: booking.id, orderId: data.id },
                                'Unable to find order with privded ID',
                            );
                        } else {
                            Object.assign(order, omit(data, ['reference']));
                        }
                    });
                }

                return booking.save();
            })
            .then(() => {
                // Send payment confirmation
                mailer.send('paymentReceived', { booking: booking.id });

                // Confirm that we've received payment
                res.send('OK');
            });
    };
}
