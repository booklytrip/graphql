import { get, isNil } from 'lodash';

export const Country = {
    name: (country, args, context) => {
        if (args.lang && !isNil(get(country, ['translations', args.lang]))) {
            return {
                ...country,
                common: country.translations[args.lang],
            };
        }

        return country.name;
    },
    languages: country => country.languages,
};
