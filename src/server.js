/**
 * The GraphQL microservice represents thin layer between API consumers
 * and internal and external microservices.
 *
 * @flow
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { formatError } from 'apollo-errors';
import { payseraMiddleware } from './middleware/paysera';
import { authMiddleware } from './middleware/auth';
import * as Schema from './schema/schema';
import * as Resolvers from './schema/resolver';
import logger from './lib/logger';
import os from 'os';
import Raven from 'raven';
import config from './config';

import * as models from './models';

// Init GraphQL express based server
const PORT = process.env.PORT || 8080;

// Define mode server is running in
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Init sentry client
Raven.config(
    config.sentry.url,
    Object.assign({}, config.sentry, {
        environment: process.env.NODE_ENV,
    }),
).install();

// Init web server
const server = express();

const executableSchema = makeExecutableSchema({
    typeDefs: Object.values(Schema),
    resolvers: Resolvers,
});

// Add CORS middleware
server.use(cors());
server.enable('trust proxy');

// Add paysera endpoint
server.use('/paysera', payseraMiddleware());

// Add GraphQL endpoint
server.use('/graphql', bodyParser.json());
server.use('/graphql', authMiddleware);

// Find user by ID provided in decoded token and pass
// it with context
server.use('/graphql', async (req, res, done) => {
    req.context = req.context || {};
    if (req.auth) {
        const user = await models.UserModel.findById(req.auth.id);
        req.context.user = user;
    }
    done();
});

// Find agency that this user administrates and pass it
// with context aswell
server.use('/graphql', async (req, res, done) => {
    req.context = req.context || {};
    if (req.context.user) {
        const agency = await models.AgencyModel.findOne({
            administrator: req.context.user.id,
        });
        req.context.agency = agency;
    }
    done();
});

// Find project by provided ID in header and pass it with context
server.use('/graphql', async (req, res, done) => {
    req.context = req.context || {};
    if (req.get('PROJECT_ID')) {
        const project = await models.ProjectModel.findById(
            req.get('PROJECT_ID'),
        );
        req.context.project = project;
    }

    done();
});

// TODO: Verify that we have user or project

server.use('/graphql', (req, res, done) => {
    graphqlExpress({
        formatError: error => {
            Raven.captureException(error);
            return formatError(error);
        },
        schema: executableSchema,
        context: Object.assign({}, models, {
            ...req.context,
            request: req,
        }),
    })(req, res, done);
});

// Add GraphiQL endpoint
server.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Run server
server.listen(PORT, () => {
    logger.info(
        `GraphQL Server is running now as ${process.env
            .NODE_ENV} on http://${os.hostname()}:${PORT}/graphql`,
    );
});
