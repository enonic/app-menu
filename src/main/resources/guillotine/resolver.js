const menuLib = require('./menu');
const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');

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

exports.MenuItem_content_Resolver = function (env) {
    return ctxLib.executeInContext(env, function () {
        const content = contentLib.get({
            key: env.source.id,
        });

        const ctx = ctxLib.get();

        const copy = JSON.parse(JSON.stringify(content));

        copy._branch = ctx.branch;
        copy._project = ctx.repository.replace('com.enonic.cms.', '');

        return copy;
    });
};
