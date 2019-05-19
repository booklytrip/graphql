export default `
    type Query {
        # Get currently authenticated user
        viewer: User
        
        # Search airports that matches specified term
        searchAirports(term: String! limit: Int): [AirportSearchResult]

        # Get information of airport with specified IATA code
        airport(iata: String!): Airport

        # Get single carried details
        carrier(code: String!): Carrier

        # Get list of available suppliers
        suppliers: [Supplier]

        # Get list of countries
        countries: [Country]

        # Get specific project information
        project(id: ID!): Project

        # Get specific booking information
        booking(id: ID!): Booking
    }
`;
