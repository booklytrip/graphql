/**
 * System configuration
 */
import { merge } from 'lodash';

const config = {
    // Common configuration for all types of environment
    common: {
        sentry: {
            url:
                'https://<SECRET_KEY>@sentry.io/<ID>',
            sampleRate: 1, // send 100% of events
        },
        statsd: {
            host: 'monitoring.booklytrip.com',
            prefix: 'graphql.development.',
        },
        mailer: {
            url: 'http://mailer:5000',
        },
    },

    // Configuration per environment
    development: {
        hostname: 'booklytrip.local:3000',
        payseraCallbackUrl: 'http://<ID>.ngrok.io/paysera',
        flightsUrl: 'http://localhost:4000',
        jwtSecret: '<SECRET_KEY>',
        sentry: {
            sampleRate: 0, // send 0% of events
        },
    },
    production: {
        hostname: 'booklytrip.com',
        payseraCallbackUrl: 'http://graphql.booklytrip.com:8080/paysera',
        flightsUrl: 'http://flights:4000',
        jwtSecret:
            '<SECRET_KEY>',
    },
    staging: {
        hostname: 'booklytrip.com',
        payseraCallbackUrl: 'http://graphql.booklytrip.com:8080/paysera',
        flightsUrl: 'http://flights:4000',
        jwtSecret:
            '<SECRET_KEY>',
    },
};

export default merge(
    {},
    config.common,
    config[process.env.NODE_ENV || 'development'],
);
