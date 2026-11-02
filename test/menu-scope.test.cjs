const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

function loadResolver(contentLib) {
    const filename = path.join(__dirname, '../src/main/resources/guillotine/resolver.js');
    const exports = {};

    vm.runInNewContext(readFileSync(filename, 'utf8'), {
        exports,
        __: {
            toScriptValue(value) {
                return value;
            },
        },
        require(id) {
            if (id === './menu') {
                return {};
            }
            if (id === '/lib/ctx') {
                return {
                    executeInContext(env, callback) {
                        return callback();
                    },
                };
            }
            if (id === '/lib/xp/content') {
                return contentLib;
            }
            throw new Error(`Unexpected require: ${id}`);
        },
    }, { filename });

    return exports;
}

function createFixture() {
    const calls = [];
    const siteConfig = [{ applicationKey: 'com.enonic.app.menu' }];
    const resolver = loadResolver({
        get({ key }) {
            calls.push(['get', key]);
            return {
                _path: '/',
                data: { siteConfig },
            };
        },
        getSite({ key }) {
            calls.push(['getSite', key]);
            return {
                _path: key,
                data: { siteConfig },
            };
        },
    }).HeadlessCms_menu_Resolver({
        createDataFetcherResult(params) {
            return params;
        },
    });

    return {
        calls,
        resolve(localContext) {
            return resolver({ localContext });
        },
    };
}

for (const [name, context, expectedCall, expectedPath] of [
    ['Guillotine 9 scope', { scopeKey: '/site' }, ['getSite', '/site'], '/site'],
    ['Guillotine 8 site', { siteKey: '/legacy-site' }, ['getSite', '/legacy-site'], '/legacy-site'],
    ['null Guillotine 9 scope with Guillotine 8 site', { scopeKey: null, siteKey: '/legacy-site' }, ['getSite', '/legacy-site'], '/legacy-site'],
    ['project scope', {}, ['get', '/'], '/'],
    ['root Guillotine 9 scope', { scopeKey: '/' }, ['get', '/'], '/'],
]) {
    test(`${name} resolves the expected menu source`, () => {
        const fixture = createFixture();
        const result = fixture.resolve(context);

        assert.deepEqual(fixture.calls, [expectedCall]);
        assert.equal(result.localContext._menuAppBasePath, expectedPath);
    });
}

test('Guillotine 9 scope takes precedence over the legacy Guillotine 8 site', () => {
    const fixture = createFixture();
    const result = fixture.resolve({ scopeKey: '/scope', siteKey: '/legacy-site' });

    assert.deepEqual(fixture.calls, [['getSite', '/scope']]);
    assert.equal(result.localContext._menuAppBasePath, '/scope');
});
