/**
 * The wrapper for DataLoader that use redis for caching long term results.
 * It's also possible to specify expire duration for keys.
 *
 * USAGE:
 * const loader = new ReidsDataLoader(
 *     'my_prefix',
 *      new DataLoader(loaderFn, {
 *         // Caching should be teruned off
 *         caching: false,
 *      }),
 *      {
 *         // Number of seconds to store keys
 *         expire: 60,
 *      }
 * );
 *
 * // Load value with key "1"
 * loader.load(1);
 *
 * @flow
 */

import DataLoader from 'dataloader';
import redis from '../../connectors/redis';

type RedisDataLoaderOptions = {
    expire?: number,
};

// The common errors
const KEY_REQUIRED_ERROR = new Error('Key parameter is required');
const VALUE_REQUIRED_ERROR = new Error('Value parameter is required');

class RedisDataLoader {
    prefix: string;
    options: RedisDataLoaderOptions;
    loader: Object;

    /**
     * @param {String} prefix     - The prefix before each key
     * @param {Object} userLoader - The DataLoader object to load values if they are not in cache yet
     * @param {Object} options    - The object with options
     */
    constructor(
        prefix: string,
        userLoader: Object,
        options?: RedisDataLoaderOptions,
    ) {
        this.prefix = prefix;
        this.options = options || {};

        this.loader = new DataLoader(
            keys =>
                new Promise((resolve, reject) => {
                    redis.mget(
                        keys.map(key => `${prefix}.${key}`),
                        (error, results) => {
                            if (error) {
                                return reject(error);
                            }

                            resolve(
                                results.map(async (result, index) => {
                                    if (result !== null) {
                                        return JSON.parse(result);
                                    }

                                    return await userLoader
                                        .load(keys[index])
                                        .then(r =>
                                            this._set(keys[index], r).then(
                                                () => r,
                                            ),
                                        );
                                }),
                            );
                        },
                    );
                }),
            {
                cache: false,
            },
        );
    }

    _set(key: string, value: any) {
        const prefixKey = `${this.prefix}.${key}`;
        const multi = redis.multi();

        multi.set(prefixKey, JSON.stringify(value));
        if (this.options.expire) {
            multi.expire(prefixKey, this.options.expire);
        }

        return multi.exec();
    }

    load(key: string) {
        return key ? this.loader.load(key) : Promise.reject(KEY_REQUIRED_ERROR);
    }

    loadMany(keys: Array<string>) {
        return keys
            ? this.loader.loadMany(keys)
            : Promise.reject(KEY_REQUIRED_ERROR);
    }

    prime(key: string, value: any) {
        if (!key) {
            return Promise.reject(KEY_REQUIRED_ERROR);
        }

        if (value === undefined) {
            return Promise.reject(VALUE_REQUIRED_ERROR);
        }

        redis
            .setex(
                `${this.prefix}.${key}`,
                this.options.expire || 60,
                JSON.stringify(value),
            )
            .then(() => this.loader.clear(key).prime(key, value));
    }

    clear(key: string) {
        return key
            ? redis.del(key).then(this.loader.clean(key))
            : Promise.reject(KEY_REQUIRED_ERROR);
    }
}

export default RedisDataLoader;
