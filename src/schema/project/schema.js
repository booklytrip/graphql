const LocalizationSettings = `
    # Localization settings
    type LocalizationSettings {
        # The default language that should be used
        defaultLanguage: String!
        # List of supported languages
        languages: [String]
    }
`;

const LocalizationSettingsInput = `
    # An input for localization settings
    input LocalizationSettingsInput {
        # The default language that should be used
        defaultLanguage: String!
        # List of supported languages
        languages: [String]
    }
`;

const PayseraPaymentMethod = `
    type PayseraPaymentMethod implements Node {
        # Unique payment method ID
        id: ID!
        # Payment method name
        name: String!
        # Payment method logo
        logo: String!
        # The group name that the method belongs to
        group: String!
        # The country for which this method should be used
        country: String!
        # Transaction fee of this payment method
        transactionFee: Float
        # Min. transaction fee of this payment method
        minTransactionFee: Float
        # Max. transaction fee of this payment method
        maxTransactionFee: Float
        # The status of the payment method for current project
        enabled: Boolean
    }
`;

const PayseraSettings = `
    # PaySera settings
    type PayseraSettings {
        # The project ID
        id: String!
        # The project password
        password: String!
        # List of payment methods that provide PaySera
        methods: [PayseraPaymentMethod!]!
    }
`;

const PayseraSettingsInput = `
    # An input for PaySera settings
    input PayseraSettingsInput {
        # The project ID
        id: String!
        # The project password
        password: String!
    }
`;

const PaymentSettings = `
    # Payment settings
    type PaymentSettings {
        # PaySera settings
        paysera: PayseraSettings
    }
`;

const PaymentSettingsInput = `
    # An input for payment settings
    input PaymentSettingsInput {
        # PaySera settings input
        paysera: PayseraSettingsInput
    }
`;

const UpdatePayseraMethodSettingsInput = `
    # An input to update paysera payment method settings
    input UpdatePayseraMethodSettingsInput {
        # An ID of project to update
        projectId: ID!
        # A payment method ID
        methodId: ID!
        # Transaction fee in percent
        transactionFee: Float
        # Min transaction fee for that payment method
        minTransactionFee: Float
        # Max transaction fee for that payment method
        maxTransactionFee: Float
        # Status of the payment method
        enabled: Boolean
    }
`;

const UpdatePayseraMethodSettingsPayload = `
    # A payload for updated payment method
    type UpdatePayseraMethodSettingsPayload {
        method: PayseraPaymentMethod
    }
`;

const ProjectDetails = `
    # Additional project details
    type ProjectDetails {
        # Contact phone number
        phone: String
        # Contanct email address
        email: String
    }
`;

const ProjectSupplierSettings = `
    # Supplier settings relative to project
    type ProjectSupplierSettings {
        # The supplier entity
        supplier: Supplier!
        # Status of supplier relative to project
        enabled: Boolean,
        # Supplier settings relative to project
        settings: [KeyValuePair]
    }
`;

const ProjectSupplierSettingsInput = `
    # An input of project supllier settings
    input ProjectSupplierSettingsInput {
        # The supplier ID
        supplier: ID!
        # Status of supplier relative to project
        enabled: Boolean,
        # Supplier settings relative to project
        settings: [KeyValuePairInput]
    }
`;

const Project = `
    # Represents project details
    type Project implements Node {
        # The project ID
        id: ID!
        
        # The project name
        name: String!
        
        # The URL to the project's frame
        url: String!
        
        # The project visual customization
        theme: String!

        # Additional project details
        details: ProjectDetails
        
        # The project markups rules
        markups: [Markup]

        # Suppliers that project support
        suppliers(
            # Filter suppliers by status
            enabled: Boolean
        ): [ProjectSupplierSettings]!
        
        # Localization settings
        localization: LocalizationSettings

        # Payment settings
        payment: PaymentSettings

        # Search flights by specified criteria
        flights(
            departureAirport: String!
            arrivalAirport: String!
            departureDate: String!
            returnDate: String
            adults: Int = 1
            children: Int = 0
            infants: Int = 0
        ): [Flight]

        # Get specific flight
        flight(
            priceKey: ID!
            cachedID: ID!
        ): Flight

        # Date of project creation
        createdAt: String!
    }
`;

const CreateProjectInput = `
    # An input to create a new project
    input CreateProjectInput {
        # The project name
        name: String!
        
        # The URL to the project's frame
        url: String!
    }
`;

const CreateProjectPayload = `
    # A payload for created project
    type CreateProjectPayload {
        # A created project
        project: Project!
    }
`;

const ProjectDetailsInput = `
    # An input to update project details
    input ProjectDetailsInput {
        # Contact phone number
        phone: String
        # Contact email address
        email: String
    }
`;

const ProjectTheme = `
    # Project theme options
    enum ProjectTheme {
        default
        jelly_bean
        wax_flower
        bubble_gum
        lavander_purple
        moonstone_blue
        ryanair
        wizzair
        airbaltic
    }
`;

const UpdateProjectInput = `
    # An input to update project
    input UpdateProjectInput {
        # The project ID to update
        projectId: ID!
        
        # The name of project
        name: String
        
        # The URL to the project's frame
        url: String

        # The project visual customization
        theme: ProjectTheme

        # Additional project details
        details: ProjectDetailsInput

        # List of suppliers the project support
        suppliers: [ProjectSupplierSettingsInput]

        # An input for localization settings
        localization: LocalizationSettingsInput

        # An input for payment settings
        payment: PaymentSettingsInput
    }
`;

const UpdateProjectPayload = `
    # A payload for updated project
    type UpdateProjectPayload {
        # The project with updated data
        project: Project!
    }
`;

const DeleteProjectInput = `
    # An input to delete project
    input DeleteProjectInput {
        # The project ID to delete
        projectId: ID!
    }
`;

const DeleteProjectPayload = `
    # A payload for project delete
    type DeleteProjectPayload {
        # An ID of deleted project
        projectId: ID!
    }
`;

export default () => [
    LocalizationSettings,
    LocalizationSettingsInput,
    PayseraSettings,
    PayseraPaymentMethod,
    PayseraSettingsInput,
    PaymentSettings,
    PaymentSettingsInput,
    UpdatePayseraMethodSettingsInput,
    UpdatePayseraMethodSettingsPayload,
    ProjectDetails,
    ProjectDetailsInput,
    ProjectSupplierSettings,
    ProjectSupplierSettingsInput,
    ProjectTheme,
    Project,
    CreateProjectInput,
    CreateProjectPayload,
    UpdateProjectInput,
    UpdateProjectPayload,
    DeleteProjectInput,
    DeleteProjectPayload,
];
