import maxmind from 'maxmind';

// Open geo-location database of maxmind
const lookup = maxmind.openSync(`${__dirname}/../../data/maxmind.mmdb`);

export default lookup;
