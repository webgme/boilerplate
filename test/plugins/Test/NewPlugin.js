/*jshint node:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

var testFixture = require('../../../node_modules/webgme/test/_globals'),
    getGmeConfig = require('../../getconfig');

describe('NewPlugin', function () {
    var gmeConfig = getGmeConfig(),
        runPlugin = testFixture.runPlugin,
        expect = testFixture.expect,
        logger = testFixture.logger.fork('NewPlugin'),
        PluginCliManager = require('../../../node_modules/webgme/src/plugin/climanager'),
        Q = testFixture.Q,
        projectName = 'NewPluginProject',
        branchName = 'master',
        storage,
        project,
        gmeAuth,
        commitHash,
        pluginName = 'NewPlugin';

    before(function (done) {
        testFixture.clearDBAndGetGMEAuth(gmeConfig, projectName)
            .then(function (gmeAuth_) {
                gmeAuth = gmeAuth_;
                // This uses in memory storage. Use testFixture.getMongoStorage to persist to database.
                storage = testFixture.getMemoryStorage(logger, gmeConfig, gmeAuth);
                return storage.openDatabase();
            })
            .then(function () {
                var importParam = {
                    projectSeed: './test/assets/sm_basic.json',
                    projectName: projectName,
                    branchName: branchName,
                    logger: logger,
                    gmeConfig: gmeConfig
                };

                return testFixture.importProject(storage, importParam);
            })
            .then(function (importResult) {
                project = importResult.project;
                commitHash = importResult.commitHash;
                return project.createBranch('test1', commitHash);
            })
            .nodeify(done);
    });

    after(function (done) {
        storage.closeDatabase()
            .then(function () {
                return gmeAuth.unload();
            })
            .nodeify(done);
    });

    it('should run with no pluginConfig', function (done) {
        var manager = new PluginCliManager(null, logger, gmeConfig),
            pluginConfig = {
            },
            context = {
                project: project,
                commitHash: commitHash,
                branchName: 'test1',
                activeNode: '/960660211',
            };

        manager.executePlugin(pluginName, pluginConfig, context, function (err, pluginResult) {
            expect(err).to.equal(null);
            expect(typeof pluginResult).to.equal('object');
            expect(pluginResult.success).to.equal(true);

            project.getBranchHash('test1')
                .then(function (branchHash) {
                    expect(branchHash).to.not.equal(commitHash); // It should have updated the branch
                })
                .nodeify(done);
        });
    });
});