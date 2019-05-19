const MarkupSubmissionPlace = `
    # List of markup submission places
    enum MarkupSubmissionPlace {
        # A markup will be applied in a search results
        SEARCH_RESULTS
        # A markup will be applied in a booking process
        SELF_SERVICE
    }
`;

const MarkupType = `
    # List of markup types
    enum MarkupType {
        FIXED
        PERCENTAGE
        MIN_PERCENTAGE
        PERCENTAGE_MAX
        MIN_PERCENTAGE_MAX
    }
`;

const MarkupValue = `
    # The markup value applied on the price
    type MarkupValue {
        # The fixed price value (e.g. 5.99)
        fixed: Float
        # The min price value
        min: Float
        # The max price value
        max: Float
        # The percentage value to increase the price
        percentage: Float
    }
`;

const MarkupGeneralCondition = `
    # The general markup information
    type MarkupGeneralCondition {
        submissionPlace: MarkupSubmissionPlace!
        markupType: MarkupType!
        currency: String!
        value: MarkupValue!
    }
`;

const MarkupPassengerType = `
    # List of passenger types
    enum MarkupPassengerType {
        # Any type
        ALL
        # +18 years
        ADULT
        # 2 - 17 years
        CHILD
        # 0 - 2 years
        INFANT
    }
`;

const MarkupPassengerCondition = `
    # The passenger based condition
    type MarkupPassengerCondition {
        type: MarkupPassengerType!
        count: Int!
    }
`;

const MarkupDepartureType = `
    # List of departure types
    enum MarkupDepartureType {
        # A range of specific dates
        DATE_RANGE
        # A number of days before departure
        DAY
    }
`;

const MarkupDepartureCondition = `
    # A period based condition that applies in specified dates range
    type MarkupDepartureDateRangeCondition {
        type: MarkupDepartureType!
        startDate: String!
        endDate: String!
    }
    
    # A period based condition that applies on specified number of days before departure
    type MarkupDepartureDaysCondition {
        type: MarkupDepartureType!
        days: Int!
    }
    
    # The departure period based condition
    union MarkupDepartureCondition = MarkupDepartureDateRangeCondition | MarkupDepartureDaysCondition
`;

const MarkupPriceRangeCondition = `
    # The price based condition
    type MarkupPriceRangeCondition {
        startPrice: Float
        endPrice: Float
    }
`;

const Markup = `
    # A set of conditions used to increase price
    type Markup implements Node {
        # The markup ID
        id: ID!
        
        # The markup name
        name: String!
        
        # The general markup information
        general: MarkupGeneralCondition!
        
        # The passenger based condition
        passengers: [MarkupPassengerCondition]
        
        # The service supplier based condition
        suppliers: [Supplier]
        
        # The departure period based condition
        departures: [MarkupDepartureCondition]
        
        # The direction type based condition 
        directionType: WayType
        
        # The price based condition
        priceRanges: [MarkupPriceRangeCondition]
        
        # A flag that defines a default markup
        default: Boolean
        
        # The markup creation date
        createdAt: String!
    }
`;

const MarkupValueInput = `
    # The markup value to apply on the price
    input MarkupValueInput {
        # The fixed price value (e.g. 5.99)
        fixed: Float
        # The min price value
        min: Float
        # The max price value
        max: Float
        # The percentage value to increate the price
        percentage: Float
    }
`;

const MarkupGeneralConditionInput = `
    # The general condition information
    input MarkupGeneralConditionInput {
        # A place where markup should be applied
        submissionPlace: MarkupSubmissionPlace!
        
        # A markup type
        markupType: MarkupType!
        
        # The currency condition
        currency: String!
        
        # A markup value to apply
        value: MarkupValueInput!
    }
`;

const MarkupPassengerConditionInput = `
    # The condition allow to set an exception based on number and type of passengers
    input MarkupPassengerConditionInput {
        # A type of a passenger
        type: MarkupPassengerType!
        
        # A number of passengers
        count: Int!
    }
`;

const MarkupDepartureConditionInput = `
    # The condition allow to set an exception based on departure period
    input MarkupDepartureConditionInput {
        # A condition type
        type: MarkupDepartureType!
        
        # A number of days before departure date
        days: Int
        
        # A starting date in a range 
        startDate: String
        # An ending date in a range
        endDate: String
    }
`;

const MarkupPriceRangeConditionInput = `
    # The condition allow to sen an exception based on price range
    input MarkupPriceRangeConditionInput {
        startPrice: Float!
        endPrice: Float!
    }
`;

const MarkupInput = `
    # An input of a markup settings
    input MarkupInput {        
        # The markup name
        name: String!

        # The general condition information
        general: MarkupGeneralConditionInput!

        # The condition allow to set an exception based on number and type of passengers
        passengers: [MarkupPassengerConditionInput]

        # The condition allow to set an exception based on list of specified service suppliers
        suppliers: [String]

        # The condition allow to set an exception based on departure period
        departures: [MarkupDepartureConditionInput]

        # The condition allow to set an exception based on direction type
        directionType: WayType

        # The condition allow to sen an exception based on price range
        priceRanges: [MarkupPriceRangeConditionInput]
    }
`;

const AddMarkupInput = `
    # An input to add a new markup and attach it to the project
    input AddMarkupInput {
        # The project ID
        projectId: ID!

        # The markup settings
        markup: MarkupInput!
    }
`;

const AddMarkupPayload = `
    # A payload for added markup
    type AddMarkupPayload {
        # A new markup object
        markup: Markup!
    }
`;

const UpdateMarkupInput = `
    # An input to update an existing markup
    input UpdateMarkupInput {
        # The project ID
        projectId: ID!
        
        # The markup ID
        markupId: ID!
        
        # The markup settings
        markup: MarkupInput!
    }
`;

const UpdateMarkupPayload = `
    # A payload for updated markup
    type UpdateMarkupPayload {
        # The updated markup object
        markup: Markup!
    }
`;

const DeleteMarkupInput = `
    # An input to delete markup
    input DeleteMarkupInput {
        # The project ID 
        projectId: ID!
        
        # The markup ID
        markupId: ID!
    }
`;

const DeleteMarkupPayload = `
    # The payload of deleted markup
    type DeleteMarkupPayload {
        # The project ID 
        projectId: ID!
        
        # The markup ID
        markupId: ID!
    }
`;

const MoveMarkupInput = `
    # An input to move markup to specified position
    input MoveMarkupInput {
        # The project ID
        projectId: ID!
        
        # The markup ID
        markupId: ID!
        
        # The index where markup to move
        atIndex: Int!
    }
`;

const MoveMarkupPayload = `
    # The payload of moved markup
    type MoveMarkupPayload {
        # The project ID 
        projectId: ID!
        
        # The markup ID
        markupId: ID!
        
        # A new markup position index
        index: Int!
    }
`;

export default () => [
    // Mutation inputs
    MarkupValueInput,
    MarkupGeneralConditionInput,
    MarkupPassengerConditionInput,
    MarkupDepartureConditionInput,
    MarkupPriceRangeConditionInput,
    MarkupInput,
    AddMarkupInput,
    AddMarkupPayload,
    UpdateMarkupInput,
    UpdateMarkupPayload,
    DeleteMarkupInput,
    DeleteMarkupPayload,
    MoveMarkupInput,
    MoveMarkupPayload,

    // Queries
    MarkupType,
    MarkupSubmissionPlace,
    MarkupGeneralCondition,
    MarkupPassengerType,
    MarkupPassengerCondition,
    MarkupDepartureType,
    MarkupDepartureCondition,
    MarkupPriceRangeCondition,
    MarkupValue,
    Markup,
];
