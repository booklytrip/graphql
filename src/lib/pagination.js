/**
 * The cursor based pagination 
 */

import { Buffer } from 'buffer';
import { map } from 'lodash';

export default async function({ model, first, after, sort }) {
    // Encode cursor from base64
    const cursor = Buffer.from(after || '', 'base64').toString('ascii');

    // Get list of search queries that goes after provided cursor
    const searchQueries = await model
        .find()
        .sort(sort)
        .limit(first);

    if (cursor) {
        searchQueries.where('_id').gt(cursor);
    }

    // Prepare list of edges with cursor for each node
    const edges = map(searchQueries, searchQuery => ({
        cursor: Buffer.from(searchQuery._id.toString()).toString('base64'),
        node: searchQuery,
    }));

    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    const hasNextPage = endCursor
        ? (await model
              .where('_id')
              .gt(Buffer.from(endCursor, 'base64').toString('ascii'))
              .sort(sort)
              .count()) > 0
        : false;

    return {
        edges,
        pageInfo: {
            endCursor,
            hasNextPage,
        },
    };
}
