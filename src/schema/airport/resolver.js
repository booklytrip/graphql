/**
 * @flow
 */

import { isEmpty, get, property } from 'lodash';

export const Airport = {
    id: property('_id'),
    code: property('iata'),

    /**
     * Return airport name in specified language.The original 
     * name will be used by default.
     */
    name: (root, args, context) => {
        if (args.lang && !isEmpty(get(root, ['translations', args.lang]))) {
            return root.translations[args.lang];
        }

        return root.name;
    },

    /**
     * Return country object where the airports operates
     */
    country: (root, args, context) => {
        return context.CountryModel.findByCca2WithCache(root.countryCode);
    },

    /**
     * Return city object where the airport operates
     */
    city: (root, args, context) => {
        return context.CityModel.findByCityCodeWithCache(root.cityCode);
    },
};
