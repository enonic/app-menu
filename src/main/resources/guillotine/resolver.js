const menuLib = require('./menu');
const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');

exports.HeadlessCms_getMenu_Resolver = function (graphQL) {
    return function (env) {
        return graphQL.createDataFetcherResult({
            data: __.toScriptValue({}),
            localContext: {
                currentContentKey: env.args.contentKey,
            },
            parentLocalContext: env.localContext,
        });
    }
};

exports.Menu_menuItems_Resolver = function (env) {
    return menuLib.getMenuTree(env);
};

exports.MenuItem_getChildren_Resolver = function (env) {
    return menuLib.getChildrenMenuItems(env, env.source.path);
};

exports.MenuItem_url_Resolver = function (env) {
    return portalLib.pageUrl({
        id: env.source.id,
        type: env.args.type,
    });
};

exports.MenuItem_content_Resolver = function (env) {
    return ctxLib.executeInContext(env, function () {
        return contentLib.get({
            key: env.source.id,
        });
    });
};
