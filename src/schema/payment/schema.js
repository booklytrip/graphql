const PaymentStatus = `
    # Identifies payment status
    enum PaymentStatus {
        # Payment completed successfully
        success,
        # Payment is awaiting for confirmation
        pending,
        # Payment has failed
        failed
    }
`;

const Payment = `
    # Represents payment details
    type Payment {
        # Identifies service that processed this payment
        service: String!

        # A status of payment
        status: PaymentStatus!
        
        # Payment method
        method: String!
        
        # A payment price
        price: Price!

        # A transaction fee of current payment method
        transactionFee: Float!

        # Date when payment was received
        receivedAt: String!
    }
`;

const PaymentMethodInput = `
    # An input to update payment method of provided booking
    input PaymentMethodInput {
        # The amount that was paid
        amount: Float
    }
`;

export default () => [Payment, PaymentStatus, PaymentMethodInput];
