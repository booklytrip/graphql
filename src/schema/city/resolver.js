/**
 * @flow
 */

import type { Context } from '../../types';
import { get, isEmpty } from 'lodash';

export const City = {
    code: city => city.cityCode,
    name: (city, args, context: Context) => {
        if (args.lang && !isEmpty(get(city, ['translations', args.lang]))) {
            return city.translations[args.lang];
        }

        return city.name;
    },
    country: (city, args, context: Context) =>
        context.CountryModel.findByCca2WithCache(city.countryCode),
};
