/**
 * The connector for redis server
 */
import Redis from 'ioredis';

const redis = new Redis(6379, 'redis');

export default redis;
