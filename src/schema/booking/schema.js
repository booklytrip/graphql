const BookingState = `
    # Possible states of the booking
    enum BookingState {
        # Payment was received
        PAYMENT
        # Flights were reserved
        RESERVATION
        # Booking is confirmed
        CONFIRMATION
        # Passenger were checked-in
        CHECK_IN
        # Flight documents were received
        DOCUMENTS
    } 
`;

const Booking = `
    # Represents booking entity
    type Booking implements Node {
        # Represents a booking ID
        id: ID!

        # List of states that the booking has passed
        states: [BookingState!]!

        # The project that this booking is attached to
        project: Project!

        # Represents Passenger Name Record (PNR)
        pnr: ID!

        # Represents a flight passengers list
        passengers: [Passenger]!

        # Represents a flight contact person information
        contact: Contact!

        # Represents booked flight details
        flight(
            # Refresh flight if orders was not completed
            refresh: Boolean
        ):Flight! 

        # Represents payment information of booking
        payment: Payment

        # Get list of available payment methods for current booking
        paymentMethods: [PaymentMethod]

        # Represents list of orders received from service providers
        orders: [BookingOrder]

        # Total price of booking that includes all fees. The value may 
        # change on different stages of booking process
        totalPrice: Price!

        # An error that has occurred during booking proccess
        error: String
        
        # Date of booking creation
        createdAt: String!
    }
`;

const PaymentMethod = `
    # Represents payment method such as PayPal, DebitCard, etc.
    type PaymentMethod {
        # Represents unique identity of payment method
        id: ID!

        # A name of group that payment method belongs to
        group: String!

        # Identifies payment method name
        name: String!

        # A link to logo image of payment method
        logo: String!

        # Country code where the payment method perates
        country: String!

        # Transaction fee for this payment method
        transactionFee: Float!
        
        # A link to payment method
        link: String!
    }
`;

const BookingOrder = `
    type BookingOrder implements Node {
        # Unique order ID
        id: ID!
        
        # Passenger name record of the flight supplier company
        pnr: String
        
        # Service provider
        provider: String
        
        # Supplier of the flight / flight company
        supplier: String!
        
        # Segments that the order covers
        segments: [FlightSegment!]!

        # Check-in status
        checkin: CheckinStatus
    }
`;

const CreateBookingInput = `
    # Input type for booking request
    input CreateBookingInput {
        # Flight identification
        priceKey: ID!
        cachedID: ID!

        # A contact person information
        contact: ContactInput!

        # A list of passengers
        passengers: [PassengerInput]!
    }
`;

const CreateBookingPayload = `
    # A payload for created booking
    type CreateBookingPayload {
        # A new booking object
        booking: Booking!
    }
`;

const UpdateBookingInput = `
    # An input to update booking
    input UpdateBookingInput {
        # An ID that identifies booking to update
        bookingId: ID!

        # A contact person information
        contact: ContactInput

        # A list of passengers
        passengers: [PassengerInput]

        # A payment details
        payment: PaymentMethodInput
    }
`;

const UpdateBookingPayload = `
    # A payload for updated booking
    type UpdateBookingPayload {
        # The new booking object
        booking: Booking!
    }
`;

const UpdateBookingOrderInput = `
    # An input to update booking order identified by ID
    input UpdateBookingOrderInput {
        # The order ID to update
        orderId: ID!
        
        # The order PNR
        pnr: String
        
        # The order service provider
        provider: String!
    }
`;

const UpdateBookingOrderPayload = `
    # A payload for updated booking order
    type UpdateBookingOrderPayload {
        # The updated booking order object
        order: BookingOrder
    }
`;

const OrderBookingFlightsInput = `
    # An input to order booking flights
    input OrderBookingFlightsInput {
        # The booking ID
        bookingId: ID!
    }
`;

const OrderBookingFlightsPayload = `
    # A payload for booking order flights request
    type OrderBookingFlightsPayload {
        # A new booking information about orders
        booking: Booking!
    }
`;

const ConfirmBookingInput = `
    # An input to confirm booking
    input ConfirmBookingInput {
        # The bookingID
        bookingId: ID!
    }
`;

const ConfirmBookingPayload = `
    # A payload for booking confirmation request
    type ConfirmBookingPayload {
        # The confirmed booking
        booking: Booking!
    }
`;

export default () => [
    Booking,
    BookingOrder,
    BookingState,
    PaymentMethod,
    CreateBookingInput,
    CreateBookingPayload,
    UpdateBookingInput,
    UpdateBookingPayload,
    UpdateBookingOrderInput,
    UpdateBookingOrderPayload,
    OrderBookingFlightsInput,
    OrderBookingFlightsPayload,
    ConfirmBookingInput,
    ConfirmBookingPayload,
];
