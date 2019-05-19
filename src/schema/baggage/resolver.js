import { castArray } from 'lodash';

export const Baggage = {
    cabin: baggage => {
        if (baggage.cabin) {
            return castArray(baggage.cabin);
        }
    },
    checked: baggage => {
        if (baggage.checked) {
            return castArray(baggage.checked);
        }
    },
};

export const Bag = {
    price: bag => ({
        amount: bag.price,
        currency: bag.currency,
    }),
    weight: bag => bag.weight,
};
