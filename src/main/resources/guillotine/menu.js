const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');

const APPLICATION_NAME = 'com-enonic-app-menu';
const MENU_ITEM_OBJECT_KEY = 'menu-item';

exports.getMenuTree = getRootMenuTree;

exports.getChildrenMenuItems = getChildrenMenuItems;

exports.getBreadcrumbs = getBreadcrumbs;

function getRootMenuTree(env) {
    return ctxLib.executeInContext(env, function () {
        const menuSource = JSON.parse(env.localContext._menuAppSource);

        if (menuSource.type === 'portal:site' && isMenuItem(menuSource)) {
            return [createMenuItem(menuSource)];
        } else {
            return getChildMenuItems({
                parentPath: menuSource._path,
                parentChildOrder: menuSource.childOrder
            });
        }
    });
}

function getChildrenMenuItems(env, parentPath) {
    return ctxLib.executeInContext(env, function () {
        const content = contentLib.get({
            key: parentPath,
        });

        return content && getChildMenuItems({
            parentPath: parentPath,
            parentChildOrder: content.childOrder
        }) || [];
    });
}

function getChildMenuItems(params) {
    const menuItems = [];

    const children = contentLib.query({
        count: 1000,
        query: {
            boolean: {
                must: [
                    {
                        term: {
                            field: '_parentPath',
                            value: `/content${params.parentPath === '/' ? '' : params.parentPath}`,
                        },
                    },
                    {
                        term: {
                            field: `x.${APPLICATION_NAME}.${MENU_ITEM_OBJECT_KEY}.menuItem`,
                            value: true,
                        },
                    },
                ]
            }
        },
        sort: params.parentChildOrder
    });

    children.hits.forEach((child) => {
        menuItems.push(createMenuItem(child));
    });

    return menuItems;
}

function createMenuItem(content) {
    const menuItem = content.x[APPLICATION_NAME][MENU_ITEM_OBJECT_KEY];

    return {
        id: content._id,
        title: menuItem.menuName || content.displayName,
        path: content._path,
        name: content._name,
    };
}

function isMenuItem(content) {
    if (!content.x) {
        return false;
    }
    const menuXData = content.x[APPLICATION_NAME];
    if (menuXData && menuXData[MENU_ITEM_OBJECT_KEY]) {
        const menuItemData = menuXData[MENU_ITEM_OBJECT_KEY] || {
            menuItem: false,
        };
        return menuItemData.menuItem;
    }
    return false;
}

function getBreadcrumbs(env, contentPath) {
    return ctxLib.executeInContext(env, function () {
        const menuSource = JSON.parse(env.localContext._menuAppSource);
        const basePath = menuSource._path;

        const fullPath = (basePath !== '/' && !contentPath.startsWith(basePath))
            ? basePath + contentPath
            : contentPath;

        const ancestorPaths = getAncestorPaths(fullPath, basePath);

        const breadcrumbs = [];
        for (const ancestorPath of ancestorPaths) {
            const content = contentLib.get({ key: ancestorPath });
            if (content && isMenuItem(content)) {
                breadcrumbs.push(createMenuItem(content));
            }
        }

        return breadcrumbs;
    });
}

function getAncestorPaths(fullPath, basePath) {
    const paths = [];
    const parts = fullPath.split('/').filter(Boolean);
    const baseParts = basePath === '/' ? [] : basePath.split('/').filter(Boolean);

    for (let i = baseParts.length; i <= parts.length; i++) {
        const path = i === 0 ? '/' : '/' + parts.slice(0, i).join('/');
        paths.push(path);
    }

    return paths;
}
