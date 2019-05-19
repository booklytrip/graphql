const CheckinInput = `
    # Send checkin request for specified booking
    input CheckinInput {
        # The booking ID to make checkin for
        bookingId: ID!
    }
`;

const CheckinPayload = `
    # The payload for checkin request
    type CheckinPayload {
        # The booking object with information about checkin
        booking: Booking
    }
`;

const CheckinStatus = `
    # List of check-in statuses
    enum CheckinStatus {
        # Checkin is not required
        NOT_REQUIRED
        # Checkin is pending
        PENDING
        # Checkin was confirmed
        CONFIRMED
    }
`;

export default () => [CheckinInput, CheckinPayload, CheckinStatus];
