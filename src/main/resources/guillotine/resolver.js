const menuLib = require('./menu');
const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');

exports.HeadlessCms_menu_Resolver = function (graphQL) {
    return function (env) {
        return graphQL.createDataFetcherResult({
            data: __.toScriptValue({}),
            localContext: {
                ariaLabel: env.args.ariaLabel,
                currentContentKey: env.args.contentKey,
            },
            parentLocalContext: env.localContext,
        });
    }
};

exports.Menu_menuItems_Resolver = function (env) {
    return menuLib.getMenuTree(env);
};

exports.Menu_ariaLabel_Resolver = function (env) {
    return env.localContext && env.localContext.ariaLabel || 'menu';
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
