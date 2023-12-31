const resolverLib = require('./resolver');

exports.extensions = function (graphQL) {
    return {
        types: {
            Menu: {
                description: 'Menu',
                fields: {
                    menuItems: {
                        type: graphQL.list(graphQL.reference('MenuItem')),
                    },
                }
            },
            MenuItem: {
                description: 'Menu Item',
                fields: {
                    id: {
                        type: graphQL.GraphQLString,
                    },
                    title: {
                        type: graphQL.GraphQLString,
                    },
                    path: {
                        type: graphQL.GraphQLString,
                    },
                    name: {
                        type: graphQL.GraphQLString,
                    },
                    url: {
                        type: graphQL.GraphQLString,
                        args: {
                            type: graphQL.reference('UrlType'),
                        }
                    },
                    type: {
                        type: graphQL.GraphQLString,
                    },
                    children: {
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
                    getMenu: {
                        type: graphQL.reference('Menu'),
                        args: {
                            contentKey: graphQL.nonNull(graphQL.GraphQLString),
                        }
                    },
                });
            },
        },
        resolvers: {
            HeadlessCms: {
                getMenu: resolverLib.HeadlessCms_getMenu_Resolver(graphQL),
            },
            Menu: {
                menuItems: resolverLib.Menu_menuItems_Resolver,
            },
            MenuItem: {
                content: resolverLib.MenuItem_content_Resolver,
                children: resolverLib.MenuItem_getChildren_Resolver,
                url: resolverLib.MenuItem_url_Resolver,
            },
        },
    }
};

