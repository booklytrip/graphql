import { property } from 'lodash';

export const SearchQuery = {
    id: property('_id'),

    /**
     * Return project object identified by ID
     */
    project: (root, args, context) => {
        return context.ProjectModel.findById(root.project);
    },

    /**
     * Return client's country
     */
    country: (root, args, context) => {
        if (!root.countryCode) {
            return null;
        }

        return context.CountryModel.findOne({ cca2: root.countryCode });
    },

    /**
     * Return creation date as UTC string
     */
    createdAt: (root, args, context) => {
        return root.createdAt.toUTCString();
    },
};

export const SearchQueryQuery = {
    /**
     * Return departure airport object identified by IATA code
     */
    departureAirport: (root, args, context) => {
        return context.AirportModel.findByIataWithCache(root.departureAirport);
    },

    /**
     * Return arrival airport object identified by IATA code
     */
    arrivalAirport: (root, args, context) => {
        return context.AirportModel.findByIataWithCache(root.arrivalAirport);
    },
};
