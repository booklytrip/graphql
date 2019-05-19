/**
 * The StatsD client
 */

import StatsD from 'statsd-client';
import config from '../config';

const client = new StatsD(config.statsd);

export default client;
