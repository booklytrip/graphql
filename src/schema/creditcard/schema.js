const CreditCardType = `
    # Types of credit cards
    enum CreditCardType {
        # Visa
        VI
        
        # Master Card
        MC
    }
`;

const CreditCard = `
    # A credit card object
    type CreditCard implements Node {
        # The unique card ID
        id: ID!

        # The type of credit card
        type: CreditCardType!

        # A credit card number
        number: String!

        # CVV
        cvv: String!

        # Card expiration date (YYYY-MM)
        expiry: String!

        # 3-D Security
        d3_security: String

        # Billing address
        address: Address!

        # Card holder 
        person: Person!

        # If true, the card will be used by default
        default: Boolean
    }
`;

const AddCreditCardInput = `
    # An input to add a new card
    input AddCreditCardInput {
        # The type of credit card
        type: CreditCardType!

        # A credit card number
        number: String!

        # CVV
        cvv: String!

        # Card expiration date (MM/YYYY)
        expiry: String!

        # 3-D Security
        d3_security: String

        # Billing address
        address: AddressInput!

        # Card holder 
        person: PersonInput!

        # Set true to set default credit card
        default: Boolean
    }
`;

const AddCreditCardPayload = `
    # A payload for added card
    type AddCreditCardPayload {
        # A new credit card object
        creditCard: CreditCard!
    }
`;

const UpdateCreditCardInput = `
    # An input to update existing credit card
    input UpdateCreditCardInput {
        creditCardId: ID!
        
        # The type of credit card
        type: CreditCardType!

        # A credit card number
        number: String!

        # CVV
        cvv: String!

        # Card expiration date (YYYY-MM)
        expiry: String!

        # 3-D Security
        d3_security: String

        # Billing address
        address: AddressInput!

        # Card holder 
        person: PersonInput!

        # Set true to set default credit card
        default: Boolean
    }
`;

const UpdateCreditCardPayload = `
    # A payload for updated credit card
    type UpdateCreditCardPayload {
        # The updated credit card object
        creditCard: CreditCard!
    }
`;

const DeleteCreditCardInput = `
    # An input to delete existing credit card
    input DeleteCreditCardInput {
        # The credit card ID to delete
        creditCardId: ID!
    }
`;

const DeleteCreditCardPayload = `
    # A payload for deleted credit card
    type DeleteCreditCardPayload {
        # The deleted credit card ID
        creditCardId: ID!
    }
`;

export default () => [
    CreditCardType,
    CreditCard,
    AddCreditCardInput,
    AddCreditCardPayload,
    UpdateCreditCardInput,
    UpdateCreditCardPayload,
    DeleteCreditCardInput,
    DeleteCreditCardPayload,
];
