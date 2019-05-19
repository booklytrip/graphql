import { Context } from '../../types';

export const Phone = {
    country: (root, args, context: Context) => {
        return context.CountryModel.findOne({ cca2: root.countryCode });
    },
};
