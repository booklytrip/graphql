import pnr from '../pnr.js';

describe('PNR generator', () => {
    it('should be 8 chars long', () => {
        expect(pnr().length).toEqual(8);
    });

    it('should be uppercased alphanumeric value', () => {
        for (let i = 0; i < 100; i++) {
            expect(pnr()).toMatch(/^[A-Z0-9]+$/);
        }
    });

    it('should generate 5000 unique values', () => {
        const items = [];
        for (let i = 0; i < 5000; i++) {
            const item = pnr();
            expect(items.indexOf(item) === -1).toBeTruthy();
            items.push(item);
        }
    });

    it('should attach prefix', () => {
        const prefix = 'AB';
        expect(pnr(8, prefix).substr(0, 2)).toEqual(prefix);
    })
});
