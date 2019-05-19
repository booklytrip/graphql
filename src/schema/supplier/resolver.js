import { property } from 'lodash';

/**
 * Resolver for service supplier schema
 */
export const Supplier = {
    /**
     * The unique ID of the object
     */
    id: property('_id'),
};
