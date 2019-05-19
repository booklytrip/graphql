/**
 * Setup logger
 *
 * @flow
 */
import bunyan from 'bunyan';

const logger = bunyan.createLogger({
    name: 'graphql',
    stream: process.stdout,
    level: process.env.LOG_LEVEL || 'info',
});

export default logger;
