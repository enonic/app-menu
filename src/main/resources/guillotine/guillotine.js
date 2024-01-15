const resolverLib = require('./resolver');

exports.extensions = function (graphQL) {
    return {
        types: {
            Menu: {
                description: 'Menu',
                fields: {
                    items: {
                        type: graphQL.list(graphQL.reference('MenuItem')),
                    },
                }
            },
            MenuItem: {
                description: 'Menu Item',
                fields: {
                    title: {
                        type: graphQL.GraphQLString,
                    },
                    path: {
                        type: graphQL.GraphQLString,
                    },
                    name: {
                        type: graphQL.GraphQLString,
                    },
                    items: {
                        type: graphQL.list(graphQL.reference('MenuItem')),
                    },
                    content: {
                        type: graphQL.reference('Content'),
                    }
                }
            }
        },
        creationCallbacks: {
            HeadlessCms: function (params) {
                params.addFields({
                    menu: {
                        type: graphQL.reference('Menu'),
                    },
                });
            },
        },
        resolvers: {
            HeadlessCms: {
                menu: resolverLib.HeadlessCms_menu_Resolver(graphQL),
            },
            Menu: {
                items: resolverLib.Menu_items_Resolver,
            },
            MenuItem: {
                content: resolverLib.MenuItem_content_Resolver,
                items: resolverLib.MenuItem_items_Resolver,
            },
        },
    }
};

