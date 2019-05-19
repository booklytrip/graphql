import orderFlights from '../orderFlights';

describe('orderFlights', () => {
    it('should order flights by price', () => {
        expect(
            orderFlights([
                { general: { price: 3 } },
                { general: { price: 1 } },
                { general: { price: 2 } },
            ]),
        ).toEqual([
            { general: { price: 1 } },
            { general: { price: 2 } },
            { general: { price: 3 } },
        ]);
    });

    it('should order flights by price with decimals', () => {
        expect(
            orderFlights([
                { general: { price: 103.98 } },
                { general: { price: 127.02 } },
                { general: { price: 117.98 } },
            ]),
        ).toEqual([
            { general: { price: 103.98 } },
            { general: { price: 117.98 } },
            { general: { price: 127.02 } },
        ]);
    });
});
