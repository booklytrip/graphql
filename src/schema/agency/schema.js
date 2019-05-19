const Agency = `
    type Agency implements Node {
        # The unqiue agency ID
        id: ID!
        
        # The agency name
        name: String!
        
        # An administartor of the agency
        administrator: User!
        
        # Get list of bookings across all projects of the agency
        bookings: [Booking]

        # Get list of all projects of the agency
        projects: [Project]

        # Get list of credit cards of the agency
        creditCards: [CreditCard]

        # Search queries logs of this agency
        searchQueries (
            first: Int!
            after: String
        ): SearchQueriesConnection!

        # Date of agency registration
        createdAt: String!
    }
`;

const CreateAgencyInput = `
    # An input to create a new agency
    input CreateAgencyInput {
        # The agency name (or company name)
        name: String!
        
        # The agency administrator
        administrator: CreateUserInput!
    }
`;

const CreateAgencyPayload = `
    # Response of new agency creation
    type CreateAgencyPayload {
        # A new agency entity
        agency: Agency!
        
        # A new agency administrator
        administrator: CreateUserPayload!
    }
`;

export default () => [Agency, CreateAgencyInput, CreateAgencyPayload];
