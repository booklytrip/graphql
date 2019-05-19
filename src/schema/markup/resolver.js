import { property } from 'lodash';

/**
 * Resolver for markup schema
 */
export const Markup = {
    /**
     * Return unique ID of the makrup
     */
    id: property('_id'),

    /**
     * Return list of suppliers objets
     */
    suppliers: (root, args, context) => {
        return context.SupplierModel.find({
            _id: { $in: root.suppliers },
        });
    },

    /**
     * Return creation date in UTC format
     */
    createdAt: (root, args, context) => root.createdAt.toUTCString(),
};

/**
 * Resolver for markup departure condition
 */
export const MarkupDepartureCondition = {
    __resolveType: (obj, context, info) => {
        if (obj.type === 'DATE_RANGE') {
            return 'MarkupDepartureDateRangeCondition';
        }
        if (obj.type === 'DAY') {
            return 'MarkupDepartureDaysCondition';
        }
    },
};
