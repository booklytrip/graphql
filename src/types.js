/**
 * @flow
 */

export type ID = string;

export type User = Object;

export type Context = {
    user: Object,
    Airport: Function,
    Booking: Function,
    Carrier: Function,
    Country: Function,
    Project: Function,
    Flight: Object,
    Payment: Object,
};

export type DirectionType = 'ONE_WAY' | 'ROUND_TRIP';

export type SearchFlightsQuery = {
    projectID: ID,
    departureAirport: string,
    arrivalAirport: string,
    departureDate: string,
    returnDate?: string,
    adults: number,
    children: number,
    infants: number,
};

export type FlightIdentity = {
    projectID: string,
    cachedID: string,
    priceKey: string,
};

export type Country = {
    name: CountryName,
    cca2: string,
    ccn3: string,
    cca3: string,
    currency: Array<string>,
    callingCode: Array<string>,
    capital: string,
    region: string,
    language: Array<Language>,
};

export type Airport = {
    id: ID,
    name: string,
    code: string,
    city: string,
    country: Country,
};

export type FlightGeneral = {
    wayType: WayType,
    supplier: string,
    departureDate: string,
    returnData?: string,
    price: Price,
    transactionFee: Price,
};

export type FlightSegment = {
    departureAirport: Airport,
    departureTime: Object,
    arrivalAirport: Airport,
    arrivalTime: Object,
    duration: string,
    flightNumber: string,
    leftPlaces: number,
    carrier: Carrier,
    supplier: string,
    price: Price,
};

export type FlightSector = {
    departureAirport: Airport,
    departureTime: string,
    arrivalAirport: Airport,
    arrivalTime: string,
    stops: number,
    duration: string,
    baggage: Baggage,
};

export type FlightParams = {
    adults: number,
    children: number,
    infants: number,
};

export type Flight = {
    params: FlightParams,
    general: FlightGeneral,
    forwardSegments: Array<FlightSegment>,
    comebackSegments?: Array<FlightSegment>,
    forwardSector: FlightSector,
    comebackSector: FlightSector,
};

export type Booking = Object;

export type Price = {
    amount: number,
    currency: string,
};

export type SegmentType = 'forward' | 'comeback';

export type Segment = {
    supplier: string,
    carrier: string,
    price: Price,
    departureAirport: string,
    departureTime: string,
    arrivalAirport: string,
    arrivalTime: string,
    duration: string,
    type: SegmentType,
};

export type Address = {
    countryCode: string,
    city: string,
    address: string,
    postcode: string,
};

export type PersonType = 'ADULT' | 'CHILD' | 'INFANT';
export type PersonTitle = 'MR' | 'MRS' | 'MS';

export type Person = {
    firstName: string,
    lastName: string,
    title: PersonTitle,
    type?: PersonType,
};

export type CreditCard = {
    type: string,
    number: string,
    cvv: string,
    expiry: string,
    d3_security?: string,
} & Address &
    Person;

export type Phone = {
    countryCode: string,
    callingCode: string,
    number: string,
};

export type Contact = {
    email: string,
    fullName: string,
    phone: Phone,
};

export type Bag = {
    price: number,
    weight: number,
};

export type Baggage = {
    checked: Bag,
    cabin: Bag,
};

export type CheckinStatus = 'NOT_REQUIRED' | 'PENDING' | 'CONFIRMED';

export type Passenger = {
    forwardBaggage: Baggage,
    comebackBaggage: Baggage,
    checkin: CheckinStatus,
    checkedInAt: Object,
} & Person;

export type BookingQuery = {
    card: CreditCard,
    reference: string,
    supplier: string,
    contact: Contact,
    passengers: Array<Passenger>,
    orders: Array<Object>,
} & FlightIdentity;

export type BookingStatus = {
    code: string,
    pnr: string,
};

export type PaymentMethodsQuery = {
    amount: number,
    currency: string,
    reference: string,
    bookingId: string,
};

export type DocumentType = 'PASSPORT' | 'IDENTITY_CARD';

export type CheckinInput = {
    bookingId: string,
    passengerId: string,
    nationality: string,
    birthDate: string,
    documentType: DocumentType,
    number: string,
    issueCountry: string,
    issueDate: string,
    expirationDate: string,
};

export type MarkupSubmissionPlace = 'SEARCH_RESULTS' | 'SELF_SERVICE';
export type MarkupType =
    | 'FIXED'
    | 'PERCENTAGE'
    | 'MIN_VALUE_AND_PERCENTAGE'
    | 'MAX_VALUE_AND_PERCENTAGE'
    | 'MIN_MAX_VALUE_AND_PERCENTAGE';

export type MarkupValue = {
    fixed: number,
    min: number,
    max: number,
    percentage: number,
};

export type MarkupGeneralCondition = {
    submissionPlace: MarkupSubmissionPlace,
    markupType: MarkupType,
    currency: string,
    value: MarkupValue,
};

export type MarkupPassengerType = 'ALL' | 'ADULT' | 'CHILD' | 'INFANT';
export type MarkupPassengerCondition = {
    type: MarkupPassengerType,
    count: number,
};

export type MarkupDepartureType = 'DATE_RAGE' | 'DAY';
export type MarkupDepartureDateRangeCondition = {
    type: MarkupDepartureType,
    startDate: string,
    endDate: string,
};

export type MarkupDepartureDaysCondition = {
    type: MarkupDepartureType,
    days: number,
};

export type MarkupDepartureCondition =
    | MarkupDepartureDateRangeCondition
    | MarkupDepartureDaysCondition;

export type MarkupPriceRangeCondition = {
    startPrice: number,
    endPrice: number,
};

export type Markup = {
    id: ID,
    name: string,
    general: MarkupGeneralCondition,
    passengers?: Array<MarkupPassengerCondition>,
    suppliers?: Array<string>,
    departures?: Array<MarkupDepartureCondition>,
    directionType?: DirectionType,
    priceRanges?: Array<MarkupPriceRangeCondition>,
    default: boolean,
    createdAt: string,
};

// Settings of PaySera payment methods
export type PayseraMethodSettings = {
    id: ID,
    enabled: boolean,
};

// Settings of PaySera payment gateway
export type PayseraSettings = {
    // PaySera project ID
    id: ID,
    // PaySera project password
    password: string,
    // PaySera payment methods settings
    methods: [PayseraMethodSettings],
};

// Settings of various payment gateways
export type PaymentSettings = {
    paysera: PayseraSettings,
};

// Project details section
export type ProjectDetils = {
    phone: string,
    email: string,
};

export type Project = {
    id: ID,
    // Name of the project
    name: string,
    // The URL of the frame where this project is hosted
    url: string,
    // Project payment settings
    payment: PaymentSettings,
    details: ProjectDetils,
};

// Type of emails
export type MailType =
    | 'reservationCreated'
    | 'paymentReceived'
    | 'bookingConfirmed';
