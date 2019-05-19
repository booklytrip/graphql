/**
 * Search expectation:
 *
 * 1. Search by iata, icao, city.code, country.code and give higher priority to
 *    documents that match (NOTE: idealy if some docs match, other could be ignored).
 * 2. Search by city.name or city.translations.* and put this documents on the second place
 * 3. Search by airport name,  country.name, country.translations without scoring at all
 * 4. Fuzzy search by airport name, city.name, country.name, country.translations without
 *    scoring at all (NOTE: idealy this results should be included if there is no other results)
 *
 * @flow
 */

import { ElasticSearch } from '../../connectors';

export default function(value: string, limit: number) {
    return ElasticSearch.search({
        index: 'airports',
        type: 'airport',
        size: limit,
        body: {
            query: {
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: value,
                                fields: [
                                    'iata',
                                    'icao',
                                    'city.code',
                                    'country.code',
                                ],
                                boost: 3,
                            },
                        },
                        {
                            multi_match: {
                                query: value,
                                fields: ['city.name', 'city.translations.*'],
                                type: 'phrase_prefix',
                                boost: 2,
                            },
                        },
                        {
                            constant_score: {
                                query: {
                                    multi_match: {
                                        query: value,
                                        fields: [
                                            'name',
                                            'translations.*',
                                            'country.name',
                                            'country.translations.*',
                                        ],
                                        type: 'phrase_prefix',
                                    },
                                },
                            },
                        },
                        {
                            constant_score: {
                                query: {
                                    multi_match: {
                                        query: value,
                                        fields: [
                                            'name',
                                            'translations.*',
                                            'city.name',
                                            'country.name',
                                            'city.translations.*',
                                            'country.translations.*',
                                        ],
                                        fuzziness: 1,
                                        prefix_length: 3,
                                        max_expansions: 100,
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    });
}
