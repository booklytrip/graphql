## Unreleased

* Add middleware for PaySera which handles callback from payment server and change payment state of related booking
* Add method to query list of available payments for specific price amount and country
* Replace npm with yarn package manager
* Added mutation to order flight tickets
* Split schema, resolvers and connectors to multiple files for simplicity and ease of use
* Migrated to apollo-server version 0.3.0
* Integrated ElasticSearch engine to search airports across multiple fields for
specified term.
