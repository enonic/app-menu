const contextLib = require('/lib/xp/context');

exports.executeInContext = function (env, callbackFn) {
    const oldContext = contextLib.get();
    const defaultRepository = oldContext.repository;
    const defaultBranch = oldContext.branch;

    return contextLib.run({
        repository: env.localContext && env.localContext.__targetProject
                    ? `com.enonic.cms.${env.localContext.__targetProject}`
                    : defaultRepository,
        branch: env.localContext && env.localContext.__targetBranch || defaultBranch,
    }, callbackFn);
};
