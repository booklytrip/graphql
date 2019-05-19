const Contact = `
    # A person contact information
    type Contact {
        email: String!
        fullName: String!
        phone: Phone!
    }
`;

const ContactInput = `
    # Input for contact persont informatio
    input ContactInput {
        email: String!
        fullName: String!
        phone: PhoneInput!
    }
`;

export default () => [
    Contact,
    ContactInput,
];
