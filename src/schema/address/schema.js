const Address = `
    # An address object
    type Address {
        # An address street
        street: String!
        
        # The postal code
        postcode: String!
        
        # The country code
        countryCode: String!
        
        # The city name
        city: String!
    }
`;

const AddressInput = `
    # An input to mutate address object
    input AddressInput {
        # An address street
        street: String!
        
        # The postal code
        postcode: String!
        
        # The country code
        countryCode: String!
        
        # The city name
        city: String!
    }
`;

export default () => [Address, AddressInput];
