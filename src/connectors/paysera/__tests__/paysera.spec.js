import querystring from 'querystring';
import rp from 'request-promise';
import fs from 'fs';
import { map, uniq } from 'lodash';
import {
    buildRequest,
    signature,
    checkSignature,
    validateAndParseResponse,
    encodeSafeUrlBase64,
    getPaymentMethods,
} from '../paysera';

const payseraSettings = {
    id: '74747',
    password: 'a4a8a31750a23de2da88ef6a491dfd5c',
};

describe('Paysera', () => {
    describe('buildRequest', () => {
        it('should generate request data and signature', () => {
            const request = buildRequest(
                {
                    a: 'param1',
                    b: 'param2',
                },
                payseraSettings,
            );
            expect(request.data).toBeDefined();
            expect(request.sign).toBeDefined();
        });
    });

    describe('signature', () => {
        it('should generate signature for data', () => {
            expect(signature('string', payseraSettings.password).length).toBe(
                32,
            );
        });
    });

    describe('checkSignature', () => {
        it('should throw when checking signature and missing parameters', () => {
            expect(() => {
                checkSignature({});
            }).toThrowError(
                'Signature verification requires data, ss1 and settings parameters.',
            );
        });
        it('should return false for invalid signature', () => {
            expect(
                checkSignature(
                    {
                        data: { a: 'param1' },
                        ss1: 'invalid_signature',
                    },
                    payseraSettings.password,
                ),
            ).toBeFalsy();
        });

        it('should return true for valid signature', () => {
            const data = { a: 'param1' };
            expect(
                checkSignature(
                    {
                        data,
                        ss1: signature(data),
                    },
                    payseraSettings.password,
                ),
            ).toBeTruthy();
        });
    });

    describe('validateAndParseResponse', () => {
        it('should throw on response validation for invalid signature', () => {
            expect(() => {
                validateAndParseResponse(
                    {
                        data: { a: 'param1' },
                        ss1: 'invalid_signature',
                    },
                    payseraSettings,
                );
            }).toThrowError("Request signature doesn't match.");
        });

        it('should throw on response validation when project ID is missing', () => {
            const data = encodeSafeUrlBase64(
                querystring.stringify({ a: 'param1' }),
            );
            expect(() => {
                validateAndParseResponse(
                    {
                        data,
                        ss1: signature(data, payseraSettings.password),
                    },
                    payseraSettings,
                );
            }).toThrowError('Project ID not provided.');
        });

        it("should thow on response validation if project ID doesn't match", () => {
            const data = encodeSafeUrlBase64(
                querystring.stringify({ projectid: 2 }),
            );
            expect(() => {
                validateAndParseResponse(
                    {
                        data,
                        ss1: signature(data, payseraSettings.password),
                    },
                    payseraSettings,
                );
            }).toThrowError('Project ID mismatch. Expected 74747, received 2');
        });

        it('should return object with valid response', () => {
            const data = { projectid: '74747' };
            const encodedData = encodeSafeUrlBase64(
                querystring.stringify(data),
            );
            expect(
                validateAndParseResponse(
                    {
                        data: encodedData,
                        ss1: signature(encodedData, payseraSettings.password),
                    },
                    payseraSettings,
                ),
            ).toEqual(data);
        });
    });

    describe('getPaymentMethods', () => {
        beforeEach(() => {
            rp.mockResponse(fs.readFileSync(`${__dirname}/paymentMethods.xml`));
        });

        afterEach(() => {
            rp.resetMocks();
        });

        it('should return payment methods in correct format', () => {
            expect.assertions(1);
            return getPaymentMethods(payseraSettings).then(data => {
                expect(data).toMatchSnapshot();
            });
        });
    });
});
