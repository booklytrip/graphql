/**
 * An API for payment gateway Paysera
 *
 * Offical API Documentation: https://developers.paysera.com/en/payments/current
 *
 * @flow
 */

import crypto from 'crypto';
import querystring from 'querystring';
import rp from 'request-promise';
import { parseString as parseXMLString } from 'xml2js';
import { chain, has, map, isNil, toLower, each, get } from 'lodash';
import baseLogger from '../../lib/logger';

import { toInlineQueryString } from '../../lib/query';

import type { PayseraSettings } from '../../types';
import type {
    Request,
    Response,
    PaymentMethodsQuery,
    PayRequest,
} from './types';

// Server URL for payment request
const PAY_URL = 'https://www.paysera.com/pay';
// Server URL for payment methods request
const METHODS_URL = 'https://www.paysera.com/new/api/paymentMethods';

const logger = baseLogger.child({ connector: 'paysera' });

/**
 * Generate signature for specified data
 *
 * @param {String} data - A data to sign
 */
export const signature = (data: string, password: string): string =>
    crypto.createHash('md5').update(`${data}${password}`).digest('hex');

/**
 * Checks response signature
 *
 * @param {Object} response - A response object
 */
export const checkSignature = (
    response: Response,
    settings: PayseraSettings,
): boolean => {
    if (!has(response, 'data') || !has(response, 'ss1') || isNil(settings)) {
        throw new Error(
            'Signature verification requires data, ss1 and settings parameters.',
        );
    }

    return signature(response.data, settings.password) === response.ss1;
};

/**
 * Ecodes string to url-safe-base64
 *
 * url-safe-base64 is same as base64, but + is replaced to - and / to _
 *
 * @param {String} value - A string to encode
 */
export const encodeSafeUrlBase64 = (value: string): string =>
    new Buffer(value).toString('base64').replace('+', '-').replace('/', '_');

/**
 * Encodes string to url-safe-base64
 *
 * url-safe-base64 is same as base64, but + is replaced to - and / to _
 *
 * @param {String} encodedValue - A value to decode
 */
export const decodeSafeUrlBase64 = (encodedValue: string): string =>
    new Buffer(
        encodedValue.replace('-', '+').replace('/', '_'),
        'base64',
    ).toString();

/**
 * Generate request data and signature
 *
 * @param {Array} request - An array with request parameters
 */
export const buildRequest = (
    request: Object,
    settings: PayseraSettings,
): Request => {
    const data = encodeSafeUrlBase64(querystring.stringify(request));

    return {
        data,
        sign: signature(data, settings.password),
    };
};

/**
 * Parse received response and check if signature matches.
 *
 * @param {Object} response - A response object
 */
export const validateAndParseResponse = (
    response: Object,
    settings: PayseraSettings,
): Response => {
    if (!checkSignature(response, settings)) {
        throw new Error("Request signature doesn't match.");
    }

    const data = querystring.parse(decodeSafeUrlBase64(response.data));
    if (!has(data, 'projectid')) {
        throw new Error('Project ID not provided.');
    }

    if (data.projectid !== settings.id) {
        throw new Error(
            `Project ID mismatch. Expected ${settings.id}, received ${data.projectid}`,
        );
    }

    return data;
};

/**
 * Get list of available payments
 *
 * @param {Object} settings - The pyasra settings 
 * @param {Object} query    - The query with creterias for payment methods
 */
export const getPaymentMethods = (
    settings: PayseraSettings,
    query: ?PaymentMethodsQuery,
): Array<Object> => {
    const queryStr = toInlineQueryString({
        ...(query || {}),
        language: get(query, 'language', 'en'),
    });

    return rp(`${METHODS_URL}/${settings.id}/${queryStr}`)
        .then(
            xml => {
                // Take XML string and convert it to Object
                return new Promise((resolve, reject) => {
                    parseXMLString(xml, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            },
            error => {
                logger.error(error, 'Unable to parse response from Paysera');
            },
        )
        .then(data => {
            const methods = [];

            each(data.payment_types_document.country, country => {
                each(country.payment_group, group => {
                    each(group.payment_type, type => {
                        methods.push({
                            id: type.$.key,
                            name: type.title[0]._,
                            logo: type.logo_url[0]._,
                            group: group.$.key,
                            country: toLower(country.$.code),
                        });
                    });
                });
            });

            return methods;
        });
};

/**
 * Builds payment link
 *
 * @param {PayRequest}      query - The query to build payment links
 * @param {Payserasettings} settings - Paysera settings and credentials
 */
export const getPaymentLink = (
    query: PayRequest,
    settings: PayseraSettings,
): string => {
    const request = buildRequest(
        {
            projectid: settings.id,
            orderid: query.orderId,
            paytext: query.text,
            payment: query.payment,
            accepturl: query.acceptUrl,
            cancelurl: query.cancelUrl,
            callbackurl: query.callbackUrl,
            amount: query.price.amount * 100,
            currency: query.price.currency,
            p_email: query.email,
            test: process.env.NODE_ENV !== 'production',
        },
        settings,
    );

    return `${PAY_URL}/?${querystring.stringify(request)}`;
};
