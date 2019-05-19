const Language = `
    # Represents a language information
    type Language {
        # Three-letter ISO 639-3 language code
        code: String!
        # Name of the language in english
        name: String!
    }
`;

const CountryName = `
    # Represents country name
    type CountryName {
        common: String!
        official: String!
    }
`;

const Country = `
    # Represents information about country
    type Country implements Node {
        # The unique country ID
        id: ID!
        
        # Represents information about country
        name(
            # Language that the value should be presented in
            lang: String
        ): CountryName!
        # Code ISO 3166-1 alpha-2
        cca2: String!
        # Code ISO 3166-1 numeric
        ccn3: String!
        # Code ISO 3166-1 alpha-3
        cca3: String!
        # ISO 4217 currency code(s)
        currency: [String]!
        # Calling code(s)
        callingCode: [String]!
        # Capital city
        capital: String!
        # Region (e.g. "Europe")
        region: String!
        # List of official languages
        languages: [Language]!
        # Nationality of the country
        demonym: String!
    }
`;

export default () => [Language, CountryName, Country];
