jest.mock('bunyan');
jest.mock('elasticsearch');
jest.mock('ioredis');

import { payseraMiddleware } from '../paysera';
import bunyan from 'bunyan';

describe('Paysera middleware', () => {
    const response = {
        set: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
        response.set.mockClear();
        response.status.mockClear();
        response.send.mockClear();
    });

    it('should accept only GET requests', () => {
        const request = {
            method: 'POST',
        };

        payseraMiddleware()(request, response);
        expect(response.status).toHaveBeenCalledWith(405);
        expect(response.send).toHaveBeenCalledWith(
            'Paysera callback supports only GET request.',
        );
    });

    it('should validate received parameters', () => {
        const request = {
            method: 'GET',
            query: {},
        };

        payseraMiddleware()(request, response);
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith(
            'One of required parameters is missing.',
        );
    });
});
