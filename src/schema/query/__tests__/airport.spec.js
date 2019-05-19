import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import * as schema from '../../schema';
import * as resolvers from '../../resolver';

describe('airport', async () => {
    const executableSchema = makeExecutableSchema({
        typeDefs: Object.values(schema),
        resolvers,
    });

    it('should return an airport', async () => {
        const query = `
            query Q {
                airport(iata: "RIX") {
                    name
                }
            }
        `;

        const AirportModel = {
            findOne: () => ({
                iata: 'RIX',
                name: 'Riga',
            }),
        };

        const rootValue = {};
        const context = { AirportModel };

        const result = await graphql(
            executableSchema,
            query,
            rootValue,
            context,
        );

        expect(result.data.airport).toMatchSnapshot();
    });
});
