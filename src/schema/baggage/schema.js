const Baggage = `
    # Represents information for cabin and checked baggage
    type Baggage {
        # Identifies list cabin baggage options
        cabin: [Bag]

        # Identifies list of checked baggage options
        checked: [Bag]
    }
`;

const Bag = `
    # Represents information of single bag
    type Bag {
        # Identifies bag price
        price: Price!

        # Identifies weight allowance
        weight: Float!

        # Identifies max dimensions
        dimensions: String
    }
`;

const BagInput = `
    # Represents a single bag input
    input BagInput {
        price: Float!
        weight: Float!
    }
`;

const BaggageInput = `
    # Represents baggage input for single direction
    input BaggageInput {
        # A checked type baggage
        checked: BagInput
        # A bag that's taken in cabin
        cabin: BagInput
    }
`;

export default () => [
    Bag,
    BagInput,
    Baggage,
    BaggageInput,
];
