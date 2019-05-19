/**
 * Any common types
 */

const Node = `
    # An object with an ID
    interface Node {
        # ID of the object
        id: ID!
    }
`;

const PageInfo = `
    # Information about pagination in a connection.
    type PageInfo {
        # When paginating forwards, the cursor to continue.
        endCursor: String
        # When paginating forwards, are there more items?
        hasNextPage: Boolean!
    }
`;

const KeyValuePair = `
    # A key-value Pair structure could be used for entities
    # with dynamic structure, like settings.
    type KeyValuePair {
        # The identity key
        key: String!
        # The value assigned to key
        value: String!
    }
`;

const KeyValuePairInput = `
    # An input for key-value structure
    input KeyValuePairInput {
        # The identity key
        key: String!
        # The value assigned to key
        value: String!
    }
`;

export default () => [Node, PageInfo, KeyValuePair, KeyValuePairInput];
