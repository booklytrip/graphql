const SearchQueryQuery = `
    # The query of the search query
    type SearchQueryQuery {
        # Depature airport
        departureAirport: Airport!
        # Arrival airport
        arrivalAirport: Airport!
        # The departure date
        departureDate: String!
        # Return date if that's a round-trip query
        returnDate: String
        # Number of adult passengers (+18 years)
        adults: Int!
        # Number of children passengers (2 - 17 years)
        children: Int!
        # Number of infant passengers (0 - 2 years)
        infants: Int!
    }
`;

const SearchQuery = `
    # The search query object
    type SearchQuery implements Node {
        # The unique ID of the supplier
        id: ID!

        # The project of the search query
        project: Project!

        # The query itself of the search query
        query: SearchQueryQuery!

        # The number of flight results returned in time
        # when search query was executed
        results: Int!

        # The time that the request has taken
        duration: Int!

        # The client IP address
        ipAddress: String!

        # The client's country
        country: Country

        # The date and time when the search query was requested
        createdAt: String!
    }
`;

const SearchQueriesConnection = `
    type SearchQueriesConnection {
        pageInfo: PageInfo!
        edges: [SearchQueryEdge]
    }
`;

const SearchQueryEdge = `
    type SearchQueryEdge {
        cursor: String!
        node: SearchQuery
    }
`;

export default () => [
    SearchQuery,
    SearchQueryQuery,
    SearchQueriesConnection,
    SearchQueryEdge,
];
