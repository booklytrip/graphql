export default `
    type Mutation {
        # Authenticate user and sign a new token
        login(input: UserLoginInput!): UserLoginPayload

        # Create a new agency and administrator user
        createAgency(input: CreateAgencyInput!): CreateAgencyPayload
        
        # Create a new project
        createProject(input: CreateProjectInput!): CreateProjectPayload
        
        # Update an existing project
        updateProject(input: UpdateProjectInput!): UpdateProjectPayload
        
        # Delete a project
        deleteProject(input: DeleteProjectInput!): DeleteProjectPayload
        
        # Create a new booking
        createBooking(input: CreateBookingInput!): CreateBookingPayload
        
        # Update existing booking
        updateBooking(input: UpdateBookingInput!): UpdateBookingPayload

        # Place an order for specified booking
        orderBookingFlights(input: OrderBookingFlightsInput!): OrderBookingFlightsPayload
                 
        # Update booking order identified by ID
        updateBookingOrder(input: UpdateBookingOrderInput!): UpdateBookingOrderPayload

        # Update passenger details
        updatePassenger(input: UpdatePassengerInput!): UpdatePassengerPayload
        
        # Make check-in of specified booking
        checkin(input: CheckinInput!): CheckinPayload

        # Make confirmation of provided booking
        confirmBooking(input: ConfirmBookingInput!): ConfirmBookingPayload

        # Add a new markup attached to specified project
        addMarkup(input: AddMarkupInput!): AddMarkupPayload
        
        # Update existing markup
        updateMarkup(input: UpdateMarkupInput!): UpdateMarkupPayload
        
        # Delete a markup
        deleteMarkup(input: DeleteMarkupInput!): DeleteMarkupPayload
        
        # Move markup to specified position
        moveMarkup(input: MoveMarkupInput!): MoveMarkupPayload

        # Add a new credit card
        addCreditCard(input: AddCreditCardInput!): AddCreditCardPayload

        # Update existing credit card
        updateCreditCard(input: UpdateCreditCardInput!): UpdateCreditCardPayload

        # Delete a credit card
        deleteCreditCard(input: DeleteCreditCardInput!): DeleteCreditCardPayload

        # Update paysera transaction settings
        updatePayseraMethodSettings(input: UpdatePayseraMethodSettingsInput!): UpdatePayseraMethodSettingsPayload 
    }
`;
