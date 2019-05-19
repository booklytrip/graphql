/**
 * @flow
 */

// import { sortBy, property } from 'lodash';
import { orderBy, property } from 'lodash';

import type { Flight } from '../types';

/**
 * Order flights by price
 *
 * @param {Array} flights - The list of flights to order
 */
export default function(flights: Array<Flight>) {
    return orderBy(
        flights,
        [flight => parseFloat(flight.general.price)],
        ['asc'],
    );
}
