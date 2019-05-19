export default `
    # Represents a city
    type City implements Node {
        # Represents unique identifier
        id: ID!

        # The IATA city code
        code: String!

        # A name of city
        name (
            # Language that the name should be presented in
            lang: String
        ): String!

        # The country of city
        country: Country!
    }
`;
