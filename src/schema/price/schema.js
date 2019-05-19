const Price = `
    # Represents price
    type Price {
        # Price as a float number with two decimals.
        amount: Float!

        # Currency in ISO 4217 format.
        currency: String!
    }
`;

const PriceInput = `
    # Represents a price input
    input PriceInput {
        # Price as a float number with two decimals.
        amount: Float!

        # Currency in ISO 4217 format.
        currency: String!
    }
`;

export default () => [Price, PriceInput];
