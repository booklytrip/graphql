/**
 * @flow
 */

// List of chars used for PNR generation
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generate PNR (Passenger Name Record) using alphanumeric
 * uppercased chars.
 *
 * @param {Number} size   - Number of chars
 * @param {String} prefix - Add few leading chars to PNR
 */
export default function (size: number = 8, prefix: string = 'BT') {
    const chars = [prefix];
    for (let i = 0; i < size - prefix.length; i++) {
        const char = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        chars.push(char);
    }

    return chars.join('');
};
