const AirportSearchResult = `
    # The airports search result
    type AirportSearchResult {
        # The result score
        _score: Float!

        # The airport object
        airport: Airport!
    }
`;

const Airport = `
    # Represents an airport object
    type Airport implements Node {
        # Represents unique identifier
        id: ID!

        # Name of airport. Mau or may not container the City name.
        name(
            # Language that the name should be presented in
            lang: String
        ): String!

        # Airport code (iata or icao, in that order first available).
        code: String!

        # Country where airport is located.
        country: Country!

        # Main city served by airport.
        city: City!

        # 3-letter FAA code, for airports located in Country "United States of America".
        # 3-letter IATA code, for all other airports.
        iata: String

        # 4-letter ICAO code.
        icao: String

        # Timezone that airport operates in.
        timezone: String
    }
`;

export default () => [Airport, AirportSearchResult];
