import { match, calc, apply, matchAndApply } from '../markup';
import { subDays } from 'date-fns';

describe('Markup', () => {
    describe('Match', () => {
        describe('Default markup', () => {
            it('always match', () => {
                const flight = {
                    general: {
                        price: { currency: 'USD' },
                    },
                };

                const markup = {
                    general: { currency: 'EUR' },
                    default: true,
                };

                expect(match(flight, markup)).toBeTruthy();
            });
        });

        describe('Currency condition', () => {
            it("return FALSE if currency deson't match", () => {
                const flight = {
                    general: {
                        price: { currency: 'EUR' },
                    },
                };

                const markup = {
                    general: { currency: 'USD' },
                };

                expect(match(flight, markup)).toBeFalsy();
            });

            it('return TRUE if currency match', () => {
                const flight = {
                    general: {
                        price: { currency: 'EUR' },
                    },
                };

                const markup = {
                    general: { currency: 'EUR' },
                };

                expect(match(flight, markup)).toBeTruthy();
            });
        });

        describe('Passenger condition', () => {
            it('return TRUE if number of ADULT passengers is equal or greater', () => {
                const flight = {
                    params: { adults: 6 },
                };

                const markup = {
                    passengers: [
                        {
                            type: 'ADULT',
                            count: 5,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it('return TRUE if number of CHILD passengers is equal or greater', () => {
                const flight = {
                    params: { children: 6 },
                };

                const markup = {
                    passengers: [
                        {
                            type: 'CHILD',
                            count: 5,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it('return TRUE if number of INFANT passengers is equal or greater', () => {
                const flight = {
                    params: { infants: 6 },
                };

                const markup = {
                    passengers: [
                        {
                            type: 'INFANT',
                            count: 5,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it('return TRUE if number of ALL types of passengers is equal or greater', () => {
                const flight = {
                    params: {
                        adults: 1,
                        children: 2,
                        infants: 3,
                    },
                };

                const markup = {
                    passengers: [
                        {
                            type: 'ALL',
                            count: 6,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it("return FALSE if number of passengers for one of types doesn't match", () => {
                const flight = {
                    params: {
                        adults: 1,
                        children: 2,
                        infants: 3,
                    },
                };

                const markup = {
                    passengers: [
                        { type: 'ADULT', count: 6 },
                        { type: 'CHILD', count: 6 },
                        { type: 'INFANT', count: 6 },
                        { type: 'ALL', count: 6 },
                    ],
                };

                expect(match(flight, markup)).toBeFalsy();
            });
        });

        describe('Supplier condition', () => {
            it('return TRUE if one of suppliers match', () => {
                const flight = {
                    general: { supplier: 'ryanair' },
                };

                const markup = {
                    suppliers: ['ryanair', 'travelport'],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it('return FALSE if none of suppliers match', () => {
                const flight = {
                    general: { supplier: 'wizzair' },
                };

                const markup = {
                    suppliers: ['ryanair', 'travelport'],
                };

                expect(match(flight, markup)).toBeFalsy();
            });
        });

        describe('Departure condition', () => {
            it('return TRUE if departure date with in range of condition', () => {
                const flight = {
                    forwardSegments: [
                        {
                            departureTime: '2017-11-10 07:30:00',
                        },
                    ],
                };

                const markup = {
                    departures: [
                        {
                            type: 'DATE_RANGE',
                            startDate: '2017-10-01',
                            endDate: '2017-11-30',
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it('return FALSE if departure date is not in range of condition', () => {
                const flight = {
                    forwardSegments: [
                        {
                            departureTime: '2017-09-10 07:30:00',
                        },
                    ],
                };

                const markup = {
                    departures: [
                        {
                            type: 'DATE_RANGE',
                            startDate: '2017-10-01',
                            endDate: '2017-11-30',
                        },
                    ],
                };

                expect(match(flight, markup)).toBeFalsy();
            });

            it('return TRUE if departure date condition match', () => {
                const flight = {
                    forwardSegments: [
                        {
                            departureTime: subDays(new Date(), 2).toString(),
                        },
                    ],
                };

                const markup = {
                    departures: [
                        {
                            type: 'DAY',
                            days: 5,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it("return FALSE if departure date condition doesn't match", () => {
                const flight = {
                    forwardSegments: [
                        {
                            departureTime: subDays(new Date(), 10).toString(),
                        },
                    ],
                };

                const markup = {
                    departures: [
                        {
                            type: 'DAY',
                            days: 5,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeFalsy();
            });
        });

        describe('Price range condition', () => {
            it('return TRUE if price range condition match', () => {
                const flight = {
                    general: { price: '38.98' },
                };

                const markup = {
                    priceRanges: [
                        {
                            startPrice: 20,
                            endPrice: 40,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeTruthy();
            });

            it("return FALSE if price range condition doesn't match", () => {
                const flight = {
                    general: { price: '38.98' },
                };

                const markup = {
                    priceRanges: [
                        {
                            startPrice: 20,
                            endPrice: 30,
                        },
                    ],
                };

                expect(match(flight, markup)).toBeFalsy();
            });
        });
    });

    describe('Calculate', () => {
        it('throws an error if markup type is invalid', () => {
            expect(() => {
                calc(100, {
                    general: {
                        markupType: 'INVALID_TYPE',
                    },
                });
            }).toThrowError('Invalid markup type');
        });

        describe('FIXED', () => {
            it('should add 5 units to the price', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'FIXED',
                            value: {
                                fixed: 5,
                            },
                        },
                    }),
                ).toEqual(105);
            });
        });

        describe('PERCENTAGE', () => {
            it('should add 10% to the price', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'PERCENTAGE',
                            value: {
                                percentage: 10,
                            },
                        },
                    }),
                ).toEqual(110);
            });
        });

        describe('MIN_PERCENTAGE', () => {
            it('should add 10% to the price but return the min value', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'MIN_PERCENTAGE',
                            value: {
                                percentage: 10,
                                min: 150,
                            },
                        },
                    }),
                ).toEqual(150);
            });

            it('should add 20% and ignore the min value', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'MIN_PERCENTAGE',
                            value: {
                                percentage: 20,
                                min: 110,
                            },
                        },
                    }),
                ).toEqual(120);
            });
        });

        describe('PERCENTAGE_MAX', () => {
            it('should add 20% to the price but return the max value', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'PERCENTAGE_MAX',
                            value: {
                                percentage: 20,
                                max: 110,
                            },
                        },
                    }),
                ).toEqual(110);
            });

            it('should add 10% to the price and ignore the max value', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'PERCENTAGE_MAX',
                            value: {
                                percentage: 10,
                                max: 120,
                            },
                        },
                    }),
                ).toEqual(110);
            });
        });

        describe('MIN_PERCENTAGE_MAX', () => {
            it('should add 10% to the price but return the min value', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'MIN_PERCENTAGE_MAX',
                            value: {
                                percentage: 10,
                                min: 120,
                                max: 150,
                            },
                        },
                    }),
                ).toEqual(120);
            });

            it('should add 20% to the price but return the max value', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'MIN_PERCENTAGE_MAX',
                            value: {
                                percentage: 20,
                                min: 100,
                                max: 110,
                            },
                        },
                    }),
                ).toEqual(110);
            });

            it('should add 30% to the price and ignore min and max values', () => {
                expect(
                    calc(100, {
                        general: {
                            markupType: 'MIN_PERCENTAGE_MAX',
                            value: {
                                percentage: 30,
                                min: 100,
                                max: 200,
                            },
                        },
                    }),
                ).toEqual(130);
            });
        });
    });

    describe('Apply', () => {
        it('should apply markup to the flight', () => {
            const flight = {
                params: { adults: 1, children: 2, infants: 3 },
                general: {
                    price: 100,
                    pricing: {
                        adult: { total: 30 },
                        child: { total: 20 },
                        infant: { total: 10 },
                    },
                },
            };

            const markup = {
                general: {
                    markupType: 'FIXED',
                    value: {
                        fixed: 10,
                    },
                },
            };

            expect(apply(flight, markup)).toMatchObject({
                general: { price: 160 },
            });
        });
    });

    describe('Match and apply', () => {
        it('should not mutate the flight object when applying markup', () => {
            const flight = {
                params: { adults: 1, children: 2, infants: 3 },
                general: {
                    supplier: 'ryanair',
                    price: 100,
                    pricing: {
                        adult: { total: 30 },
                        child: { total: 20 },
                        infant: { total: 10 },
                    },
                },
            };

            const markups = [
                {
                    general: {
                        markupType: 'FIXED',
                        value: {
                            fixed: 10,
                        },
                    },
                    suppliers: ['ryanair'],
                },
            ];

            expect(matchAndApply(flight, markups)).not.toBe(flight);
        });

        it('should apply matching markup and return a new flight', () => {
            const flight = {
                params: { adults: 1, children: 2, infants: 3 },
                general: {
                    supplier: 'ryanair',
                    price: 100,
                    pricing: {
                        adult: { total: 30 },
                        child: { total: 20 },
                        infant: { total: 10 },
                    },
                },
            };

            const markups = [
                {
                    general: {
                        markupType: 'FIXED',
                        value: {
                            fixed: 10,
                        },
                    },
                    suppliers: ['ryanair'],
                },
            ];

            expect(matchAndApply(flight, markups)).toMatchObject({
                general: { price: 160 },
            });
        });

        it('should apply only first matching markup and return a new flight', () => {
            const flight = {
                params: { adults: 1, children: 2, infants: 3 },
                general: {
                    supplier: 'ryanair',
                    price: 100,
                    pricing: {
                        adult: { total: 30 },
                        child: { total: 20 },
                        infant: { total: 10 },
                    },
                },
            };

            const markups = [
                {
                    general: {
                        markupType: 'FIXED',
                        value: {
                            fixed: 20,
                        },
                    },
                    priceRanges: [{ startPrice: 90, endPrice: 110 }],
                },
                {
                    general: {
                        markupType: 'FIXED',
                        value: {
                            fixed: 10,
                        },
                    },
                    suppliers: ['ryanair'],
                },
            ];

            expect(matchAndApply(flight, markups)).toMatchObject({
                general: { price: 220 },
            });
        });
    });
});
