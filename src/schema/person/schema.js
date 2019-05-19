const PersonTitle = `
    # List titles of person
    enum PersonTitle {
        # Men, regardless of marital status
        MR
        # Married women
        MRS
        # Women, regardless of marital status
        MS
    }
`;

const Person = `
    # A person object
    type Person {
        # A title used before name
        title: PersonTitle!
        
        # The person first name
        firstName: String!
        
        # The person last name
        lastName: String!
    }
`;

const PersonInput = `
    # An input to mutate person
    input PersonInput {
        # A title used before name
        title: PersonTitle!
        
        # The person first name
        firstName: String!
        
        # The person last name
        lastName: String!
    }
`;

export default () => [PersonTitle, Person, PersonInput];
