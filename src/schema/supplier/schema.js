const Supplier = `
    # A service supplier object
    type Supplier implements Node {
        # The unique ID of the supplier
        id: ID!

        # The unique string identifying supplier
        key: String!

        # Short descriptive name of the supplier
        name: String!

        # Set of settings fields
        fields: [String]
    }
`;

export default () => [Supplier];
