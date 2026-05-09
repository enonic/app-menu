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
                    breadcrumbs: {
                        type: graphQL.list(graphQL.reference('Breadcrumb')),
                        args: {
                            path: graphQL.GraphQLString,
                        },
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
            },
            Breadcrumb: {
                description: 'Breadcrumb',
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
                breadcrumbs: resolverLib.Menu_breadcrumbs_Resolver,
            },
            MenuItem: {
                path: resolverLib.MenuItem_path_Resolver,
                content: resolverLib.MenuItem_content_Resolver,
                items: resolverLib.MenuItem_items_Resolver,
            },
            Breadcrumb: {
                path: resolverLib.Breadcrumb_path_Resolver,
                content: resolverLib.Breadcrumb_content_Resolver,
            },
        },
    }
};

