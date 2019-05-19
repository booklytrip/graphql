export const Payment = {
    price: (root, args, context) => ({
        amount: root.amount,
        currency: root.currency,
    }),
};
