const Phone = `
    # Represents a phone number with country code
    type Phone {
        # A phone numer
        number: String!
        # Represents country information
        country: Country
    }
`;

const PhoneInput = `
    # Input for phone number which includes country code
    input PhoneInput {
        # A phone numer
        number: String!
        # Represents country code in ISO 3166-1 format
        countryCode: String!
    }
`;

export default () => [
    Phone,
    PhoneInput,
];
