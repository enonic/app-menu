const ctxLib = require('/lib/ctx');
const contentLib = require('/lib/xp/content');

const APPLICATION_NAME = 'com-enonic-app-menu';
const MENU_ITEM_OBJECT_KEY = 'menu-item';

exports.getMenuTree = getRootMenuTree;

exports.getChildrenMenuItems = getChildrenMenuItems;

function getRootMenuTree(env) {
    return ctxLib.executeInContext(env, function () {
        if (env.localContext.siteKey === '/') {
            const project = contentLib.get({
                key: '/'
            });

            return getChildMenuItems({
                parentPath: project._path,
                parentChildOrder: project.childOrder
            });
        } else {
            const site = contentLib.getSite({
                key: env.localContext.siteKey,
            });

            if (!site) {
                return [];
            }

            if (site.type === 'portal:site' && isMenuItem(site)) {
                return [createMenuItem(site)];
            } else {
                return getChildMenuItems({
                    parentPath: site._path,
                    parentChildOrder: site.childOrder
                });
            }
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
        type: content.type,
        content: content,
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
