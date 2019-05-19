/**
 * @flow
 */

import { getPaymentMethods, getPaymentLink } from '../connectors/paysera';
import {
    map,
    pick,
    find,
    chain,
    round,
    partition,
    includes,
    filter,
    differenceBy,
    indexOf,
} from 'lodash';
import config from '../config';

import type { PaymentMethodsQuery, Project, Booking } from '../types';

/**
 * Get payment methods settings for provided project
 * 
 * @param {Object} project - The project to get settings for 
 */
export const getMethodsSettings = async (project: Project) => {
    const { paysera } = project.payment;

    // Get list of all payment methods
    const paymentMethods = await getPaymentMethods({
        id: paysera.id,
        password: paysera.password,
    });

    // Split payment methods on two groups. The first group contain
    // only methods that repeats.
    const globalMethods = chain(paymentMethods)
        .filter(method => {
            return (
                filter(paymentMethods, ({ id }) => id === method.id).length > 1
            );
        })
        .uniqBy('id')
        .map(paymentMethod => ({
            ...paymentMethod,
            country: 'global',
        }))
        .sortBy('name')
        .value();

    // The second group contain only unique methods
    const otherMethod = chain(paymentMethods)
        .differenceBy(globalMethods, 'id')
        .sortBy('country')
        .value();

    // Merge two groups of payment methods and for each payment method,
    // provide settings for the project
    return map([...globalMethods, ...otherMethod], method => {
        const settings = find(paysera.methods, {
            id: method.id,
        });

        return Object.assign({}, method, settings || {});
    });
};

/**
 * Calculate transaction fee for specified method and price
 * 
 * @param {Array}  methods   - List of transaction methods
 * @param {String} methodId - Transaction method ID that we are claculating price for
 * @param {Float}  price    - Price to calculate transaction fee for
 */
export const calcTransactionFee = (methods, methodId, price) => {
    const method = find(methods, { id: methodId });

    let transactionFee = price * method.transactionFee / 100;
    if (method.minTransactionFee && transactionFee < method.minTransactionFee) {
        transactionFee = method.minTransactionFee;
    } else if (
        method.maxTransactionFee &&
        transactionFee > method.maxTransactionFee
    ) {
        transactionFee = method.maxTransactionFee;
    }

    return round(transactionFee, 2);
};

/**
 * Get list of payment methods for specific booking. Each method will
 * contain a link that should be used to make a payment for specific booking.
 */
export const getMethodsForBooking = async (
    booking: Booking,
    project: Project,
) => {
    const { paysera } = project.payment;

    // You can provide callback URL over env variable
    // which useful for testing
    const callbackUrl =
        process.env.PAYSERA_CALLBACK_URL || config.payseraCallbackUrl;

    // Get list of all payment methods
    const paymentMethods = await getPaymentMethods({
        id: paysera.id,
        password: paysera.password,
    });

    return (
        chain(paymentMethods)
            // Filter pyament methods enabled in current project
            .filter(paymentMethod => {
                const paymentSettings = find(paysera.methods, {
                    id: paymentMethod.id,
                });
                return (
                    paymentSettings !== undefined &&
                    paymentSettings.enabled === true
                );
            })
            .uniqBy('id')
            .map(paymentMethod => {
                // Get transaction fee for booking and this payment method
                const transactionFee = calcTransactionFee(
                    paysera.methods,
                    paymentMethod.id,
                    booking.flight.general.price,
                );

                // Calculate final price which includes transaction fee
                const priceWithTransactionFee =
                    booking.totalPrice + transactionFee;

                const returnUrl = `http://${project.id}.${config.hostname}/booking/service/${booking._id}`;
                const link = getPaymentLink(
                    {
                        orderId: booking.pnr,
                        price: {
                            amount: priceWithTransactionFee,
                            currency: booking.flight.general.currency,
                        },
                        text: project.name,
                        payment: paymentMethod.id,
                        email: booking.contact.email,
                        cancelUrl: `${returnUrl}/cancel`,
                        acceptUrl: `${returnUrl}/confirm`,
                        callbackUrl: `${callbackUrl}?project=${project.id}`,
                    },
                    project.payment.paysera,
                );

                const multi =
                    filter(paymentMethods, item => item.id === paymentMethod.id)
                        .length > 1;

                const country = multi ? 'global' : paymentMethod.country;

                return {
                    ...paymentMethod,
                    country,
                    link,
                    transactionFee,
                };
            })
            .value()
    );
};
