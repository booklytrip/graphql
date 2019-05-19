const User = `
    # Authenticated user details
    type User {
        id: ID!
        email: String!
        fullName: String!

        agency: Agency
        
        createdAt: String!
    }
`;

const CreateUserInput = `
    # Create a new user
    input CreateUserInput {
        # User email address, used for authentication
        email: String!
        # A password user for authetnication
        password: String!
        # User first and last name
        fullName: String!
    }
`;

const CreateUserPayload = `
    # Response for new user registration
    type CreateUserPayload {
        # Authentication token can be used to immediately authenticate a new user
        token: String!
        # User details
        user: User
    }
`;

const UserLoginInput = `
    # User credentails required for authentication
    input UserLoginInput {
        username: String!
        password: String!
    }
`;

const UserLoginPayload = `
    # Response for user authentication request
    type UserLoginPayload {
        # Authentication token
        token: String!
        # User details
        user: User!
    }
`;

export default () => [
    User,
    CreateUserInput,
    CreateUserPayload,
    UserLoginInput,
    UserLoginPayload,
];
