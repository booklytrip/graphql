## GraphQL Microservice

GraphQL is a thin layer between API consumers and multiple internal and external
microservices.

## Getting Started

#### `yarn start`
Runs the app in development mode.
Open http://localhost:8080/graphiql to view GraphiQL (GraphQL UI) in the browser.

To make GraphQL requests from client library use http://localhost:8080/graphql endpoint.

#### `yarn test`
Runs the test watcher in an interactive mode.

#### `yarn build`
Builds the app for production to the `build` folder.

## ENV Variables
* `PORT` - Specifies port the app should be listening for (default 8080)
* `LOG_LEVEL` - Specifies logging level (fatal, error, warn, info, debug, trace)

## Logging
Service use `bunyan` library for loggin, which prints all app events to console in JSON format. To manipulate with output format you can use `./node_modules/.bin/bunyan` CLI tool.

## Developer Resources
* Bunyan logger - https://github.com/trentm/node-bunyan
* GraphQL documentation - http://graphql.org
* GraphQL server - http://dev.apollodata.com/tools/graphql-server/index.html
