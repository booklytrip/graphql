// @flow

import { chain, isNil } from 'lodash';

/**
 * Build query string using specified parameters
 *
 * @param {Object} params - Object with pair of keys and values
 * Send authenticated query request to API server
 *
 * @param {Object} params - Query parameters to send to the server
 */
export const toInlineQueryString = (params: Object): string => (
    chain(params)
        .reduce((result, value, key) => {
            if (isNil(value)) {
                return result;
            }
            return `${result}/${key}:${value}`;
        }, '')
        .trim('/')
        .value()
);
