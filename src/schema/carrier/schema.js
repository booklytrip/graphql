export default `
    # Represents a carrier
    type Carrier implements Node {
        # Represents unique identifier
        id: ID!

        # Identifies carrier IATA code
        code: String!

        # Identifies company name
        name: String!

        # The minimal age of passenger allowed to travel alone
        minAge: Int

        # If true, online check-in is required
        onlineCheckin: Boolean
    }
`;
