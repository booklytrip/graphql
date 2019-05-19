import { toInlineQueryString } from '../query';

describe('Query', () => {
    it('inline object to pair of key:value elements', () => {
        expect(toInlineQueryString({
            key1: 'value1',
            key2: 'value2',
        })).toEqual('key1:value1/key2:value2');
    });
});
