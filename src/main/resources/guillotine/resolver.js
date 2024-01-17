const menuLib = require('./menu');
const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');

exports.HeadlessCms_menu_Resolver = function (graphQL) {
    return function (env) {
        const menuSource = resolveMenuSource(env);

        if (!menuSource) {
            return null;
        }

        if (isMenuAppNotInstalled(menuSource)) {
            return null;
        }

        const localContext = {
            _menuAppSource: JSON.stringify(menuSource),
            _menuAppBasePath: menuSource._path,
        };

        return graphQL.createDataFetcherResult({
            data: __.toScriptValue({}),
            localContext: localContext,
            parentLocalContext: env.localContext,
        });
    }
};

exports.Menu_items_Resolver = function (env) {
    return menuLib.getMenuTree(env);
};

exports.MenuItem_items_Resolver = function (env) {
    return menuLib.getChildrenMenuItems(env, env.source.path);
};

exports.MenuItem_content_Resolver = function (env) {
    return ctxLib.executeInContext(env, function () {
        return contentLib.get({
            key: env.source.id,
        });
    });
};

exports.MenuItem_path_Resolver = function (env) {
    const basePath = env.localContext._menuAppBasePath;
    return basePath === '/' ? env.source.path : env.source.path.replace(basePath, '');
};

function resolveMenuSource(env) {
    return ctxLib.executeInContext(env, function () {
        const key = env.localContext.siteKey || '/';

        if (key === undefined) {
            return null;
        } else if (key === '/') {
            return contentLib.get({
                key: '/',
            });
        } else {
            return contentLib.getSite({
                key: key,
            });
        }
    });
}

function forceArray(value) {
    return Array.isArray(value) ? value : [value];
}

function isMenuAppNotInstalled(holder) {
    return !holder.data.siteConfig ||
           forceArray(holder.data.siteConfig).filter(cfg => cfg && cfg.applicationKey === 'com.enonic.app.menu').length === 0;
}
