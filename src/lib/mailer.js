/**
 * Trigger mailing service to send email
 * 
 * @flow
 */

import rp from 'request-promise';
import logger from './logger';
import config from '../config';

import type { MailType } from '../types';

export const send = (type: MailType, data: Object) => {
    logger.info({ type, data }, 'Sending email');
    return rp({ uri: `${config.mailer.url}/${type}`, json: true, qs: data });
};

export default { send };
