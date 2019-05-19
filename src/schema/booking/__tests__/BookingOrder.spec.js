import { BookingOrder } from '../resolver';

describe.skip('BookingOrder Resolver', () => {
    describe('pnr', () => {
        it('should return PNR for ryanair', () => {
            const data = {
                data: {
                    order: {
                        pnr: '302666',
                        code: 'WF5NGI',
                    },
                },
                provider: 'waavo',
                supplier: 'ryanair',
            };

            expect(BookingOrder.pnr(data)).toEqual('302666');
        });

        it('should return PNR for traveport', () => {
            const data = {
                data: {
                    code: 'WFHT8N',
                    price: {
                        price: '144.98',
                        currency: 'EUR',
                    },
                    segments: [
                        {
                            airEquipType: '735',
                            terminal: 'A',
                            arrivalAirport: 'VKO',
                            departureAirport: 'RIX',
                        },
                    ],
                    lastTicketingTime: '2017-07-03 23:59:00',
                    locatorCode: 'NFX1WQ',
                    universalLocatorCode: 'EMCN61',
                    status: 'success',
                },
                provider: 'waavo',
                supplier: 'travelport',
            };

            expect(BookingOrder.pnr(data)).toEqual('NFX1WQ');
        });
    });
});
