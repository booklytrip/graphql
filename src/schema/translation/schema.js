const TranslationLanguage = `
    # Represents list of available languages
    enum TranslationLanguage { en, lv, ru }
`;

const Translation = `
    type Translation {
        # The language for provided text
        language: TranslationLanguage!

        # The text on specified language
        text: String
    }
`;

export default () => [
    TranslationLanguage,
    Translation,
];
