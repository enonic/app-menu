const menuLib = require('./menu');
const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');

exports.HeadlessCms_menu_Resolver = function (graphQL) {
    return function (env) {
        return graphQL.createDataFetcherResult({
            data: __.toScriptValue({}),
            localContext: {
                siteKey: env.localContext.siteKey || '/',
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

exports.MenuItem_content_Resolver = function (env) {
    return ctxLib.executeInContext(env, function () {
        return contentLib.get({
            key: env.source.id,
        });
    });
};
