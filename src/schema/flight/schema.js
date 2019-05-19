const WayType = `
    # Identifyes flight way type
    enum WayType {
        ONE_WAY,
        ROUND_TRIP
    }
`;

const Flight = `
    # Represents flight
    type Flight {
        # General information about flight.
        general: FlightGeneral

        # Aggegated information of outbound flight segments.
        forwardSector: FlightSector

        # Aggegated information of inbound flight segments.
        # Available only for ROUND_TRIP flight.
        comebackSector: FlightSector
    }
`;

const FlightGeneral = `
    # Represents general flight information
    type FlightGeneral {
        priceKey: ID!
        cachedID: ID!

        # Flight supplier object
        supplier: Supplier
        
        # Identifies flight way type
        wayType: WayType

        departureDate: String
        returnDate: String

        # An information of passenger count
        passengers: FlightPassenger

        # Total flight price inluding transaction fee
        price: Price!
        # The flight price for each passenger type
        pricing: FlightPassengerPricing!

        # Supplier price
        supplierPrice: Price

        # Transaction fee charged by carrier or service provider.
        transactionFee: Price

        # Fee of the service
        serviceFee: Price
    }
`;

const FlightSegment = `
    # A segment is that portion of a journey, from a boarding point of a passenger,
    # to a deplaning point of the given flight. Although the passenger may not leave
    # the plane, it may tough down to take on or let off passengers at several points.
    type FlightSegment {
        # Identifies departure aiport
        departureAirport: Airport

        # Identifies departure time
        departureTime: String

        # Identifies arrival airport
        arrivalAirport: Airport

        # Identifies arrival time
        arrivalTime: String

        # Identifies flight duration of current segment
        duration: Int

        # Identifies stop duration of current segment
        stopDuration: Int

        # Identifies segment that has at least 10 hours stop that transition
        # to the next day after arrival
        nightStop: Boolean

        # Identifies flight number
        flightNumber: String

        # Number of left places for current flight segment
        leftPlaces: Int

        # Identifies carrier
        carrier: Carrier

        # Identifies service supplier
        supplier: String

        # Price for current segment
        price: Price
    }
`;

const FlightSector = `
    # A sector is, a portion of an itinerary, or journey, which may consist
    # of one or more segments.
    type FlightSector {
        # Identifies carrier
        carrier: Carrier!

        # Identifies departure aiport
        departureAirport: Airport

        # Identifies departure time
        departureTime: String

        # Identifies arrival airport
        arrivalAirport: Airport

        # Identifies arrival time
        arrivalTime: String

        # Identifies total number of stops
        stops: Int

        # Total duration between departure and arrival time
        duration: Int

        # Bbaggage information for current flight sector
        baggage: Baggage

        # List of segments that the sector consist of
        segments: [FlightSegment!]!
    }
`;

const FlightPassenger = `
    # Represents information about passenger count
    type FlightPassenger {
        # Adult passengers count (+18 years)
        adults: Int
        # Child passengers count (2 - 17 years)
        children: Int
        # Infant passengers count (0 - 2 years)
        infants: Int
    }
`;

const FlightPassengerPrice = `
    # Flight price for single passenger
    type FlightPassengerPrice {
        # The total price
        total: Float
        # The taxes price
        tax: Float
        # The price without taxes
        base: Float
    }
`;

const FlightPassengerPricing = `
    # Flight price for each passenger type
    type FlightPassengerPricing {
        # Flight price for adult passenger (+18 years)
        adult: FlightPassengerPrice
        # Flight price for child passenger (2 - 17 years)
        child: FlightPassengerPrice
        # Flight price for infant passenger (0 - 2 years)
        infant: FlightPassengerPrice
        # Average price per person
        avg: Float
    }
`;

export default () => [
    WayType,
    Flight,
    FlightGeneral,
    FlightSegment,
    FlightSector,
    FlightPassenger,
    FlightPassengerPrice,
    FlightPassengerPricing,
];
