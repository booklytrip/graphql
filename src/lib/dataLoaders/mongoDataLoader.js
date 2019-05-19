/**
 * A thin layer around DataLoader that query data from mongodb
 * and normalize results.
 *
 * USAGE:
 * const loader = mongoDataLoader('_id', Cities);
 *
 * // Load city with ID "1"
 * loader.load(1);
 *
 * @flow
 */

import DataLoader from 'dataloader';
import { toString } from 'lodash';

type Options = {
    cache?: boolean,
};

/**
 * @param {String} field   - The name of field name to query by
 * @param {Object} model   - The mongoose collection model
 * @param {Object} options - The object with options
 */
export default function(field: string, model: Object, options: Options) {
    return new DataLoader(
        keys =>
            new Promise((resolve, reject) => {
                model.find({ [field]: { $in: keys } }, (error, docs) => {
                    if (error) {
                        return reject(error);
                    }

                    const results = new Map();
                    docs.forEach(result =>
                        results.set(toString(result[field]), result.toObject()),
                    );

                    return resolve(
                        keys.map(
                            key =>
                                results.get(key) ||
                                new Error(`Key not found: ${key}`),
                        ),
                    );
                });
            }),
        options || {},
    );
}
