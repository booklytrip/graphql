// @flow

type PriceType = {
    amount: number,
    currency: string,
};

export type Request = {
    data: string,
    sign: string,
};

export type Response = {
    data: string,
    ss1: string,
    projectid: string,
};

export type PaymentMethodsQuery = {
    country: ?string,
    currency: ?string,
    amount: ?number,
    language: ?string,
};

export type PayRequest = {
    orderId: string,
    price: PriceType,
    text: string,
    payment: string,
    email: string,
    acceptUrl: string,
    cancelUrl: string,
    callbackUrl: string,
};
