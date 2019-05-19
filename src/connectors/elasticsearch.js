/**
 * Connector for ElasticSearch search engine
 */

import Elasticsearch from 'elasticsearch';
import logger from '../lib/logger';

const logHandler = (config) => {
    const childLogger = logger.child({ connector: 'elasticsearch' });

    return {
        error: childLogger.error.bind(childLogger),
        warning: childLogger.warn.bind(childLogger),
        info: childLogger.info.bind(childLogger),
        debug: childLogger.debug.bind(childLogger),
        trace: (method, requestUrl, body, responseBody, responseStatus) => {
            childLogger.trace({
                method,
                requestUrl,
                body,
                responseBody,
                responseStatus,
            });
        },
        // Logger do not need to be closed
        close: () => {},
    };
};

const elasticsearch = new Elasticsearch.Client({
    host: 'elasticsearch:9200',
    log: logHandler,
});

export default elasticsearch;
