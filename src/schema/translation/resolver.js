// NOTE: Not sure that we can use this solution, maybe just in some cases
// because there are cases when translation is require for whole object, like
// country name which represents object with common and official names.
export const Translation = {
    language: translation => translation.language,
    text: translation => translation.text,
};
