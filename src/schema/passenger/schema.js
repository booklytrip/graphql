const DocumentType = `
    # List of document types
    enum DocumentType {
        PASSPORT
        IDENTITY_CARD
    }
`;

const PassengerType = `
    # List of passenger types
    enum PassengerType {
        # +18 years
        ADULT
        # 2 - 17 years
        CHILD
        # 0 - 2 years
        INFANT
    }
`;

const Passenger = `
    # Represents details of single passanger
    type Passenger implements Node {
        # Unique passenger ID
        id: ID!
        
        # Type of passenger 
        type: PassengerType!
        
        # Passenger title
        title: PersonTitle!

        # The first name of the passenger
        firstName: String!

        # The last name of the passenger
        lastName: String!

        # Passenger demonym or nationality
        nationality: String

        # Passenger date of birth
        birthDate: String

        # Document type required for checkin
        documentType: DocumentType

        # Doucment number required for checkin
        documentNumber: String

        # Document issue country required for checkin
        documentIssueCountry: String

        # Document issue date required for checkin
        documentIssueDate: String

        # expiration date required for checkin
        documentExpirationDate: String

        # Passenger checkin status
        checkin: CheckinStatus

        # Baggage details
        forwardBaggage: Baggage
        comebackBaggage: Baggage
    }
`;

const PassengerInput = `
    # Input for passenger details
    input PassengerInput {
        type: PassengerType!
        title: PersonTitle!
        firstName: String!
        lastName: String!

        # Baggage details
        forwardBaggage: BaggageInput
        comebackBaggage: BaggageInput
    }
`;

const UpdatePassengerInput = `
    # An input to update passenger details
    input UpdatePassengerInput {
        # Passenger ID to update
        passengerId: ID!
        
        # Type of passenger 
        type: PassengerType
         
        # Passenger title
        title: PersonTitle

        # The first name of the passenger
        firstName: String

        # The last name of the passenger
        lastName: String

        # Passenger demonym or nationality
        nationality: String

        # Passenger date of birth
        birthDate: String

        # Document type required for checkin
        documentType: DocumentType

        # Doucment number required for checkin
        documentNumber: String

        # Document issue country required for checkin
        documentIssueCountry: String

        # Document issue date required for checkin
        documentIssueDate: String

        # expiration date required for checkin
        documentExpirationDate: String

        # Baggage details
        forwardBaggage: BaggageInput
        comebackBaggage: BaggageInput
    }
`;

const UpdatePassengerPayload = `
    # Payload for updated passenger
    type UpdatePassengerPayload {
        # The new passenger object
        passenger: Passenger!
    }
`;

export default () => [
    DocumentType,
    PassengerType,
    Passenger,
    PassengerInput,
    UpdatePassengerInput,
    UpdatePassengerPayload,
];
