/*jshint node:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

var testFixture = require('../../globals');

describe('NewPlugin', function () {
    var gmeConfig = testFixture.getGmeConfig(),
        runPlugin = testFixture.runPlugin,
        openContext = testFixture.WebGME.openContext,
        expect = testFixture.expect,
        pluginName = 'NewPlugin';

    it('should run using local storage with no pluginConfig', function (done) {
        var managerConfig = {
                pluginName: pluginName,
                projectName: 'testProject',
                branchName: 'master',
                activeNode: '/960660211',
            },
            pluginConfig = {},
            options = {
                localStorage: true,
                importProject: './test/assets/sm_basic.json'
            };
        runPlugin(gmeConfig, managerConfig, pluginConfig, options, function (err, result/*, storage*/) {
            expect(err).to.equal(null);

            expect(result.success).to.equal(true);
            done();
        });
    });

    it('should run using serveruserstorage with no pluginConfig', function (done) {
        var managerConfig = {
                pluginName: pluginName,
                projectName: 'testProject',
                branchName: 'master',
                activeNode: '/960660211',
            },
            pluginConfig = {},
            options = {
                localStorage: false, // This requires that the database is connected
                overwrite: true,
                importProject: './test/assets/sm_basic.json'
            };
        runPlugin(gmeConfig, managerConfig, pluginConfig, options, function (err, result/*, storage*/) {
            expect(err).to.equal(null);

            expect(result.success).to.equal(true);
            done();
        });
    });

    it('should run using local storage and change name', function (done) {
        var projectName = 'testProject',
            nodePath = '/960660211',
            branchName = 'master',
            managerConfig = {
                pluginName: pluginName,
                projectName: projectName,
                branchName: branchName,
                activeNode: nodePath,
            },
            pluginConfig = {},
            options = {
                localStorage: true,
                importProject: './test/assets/sm_basic.json'
            };
        runPlugin(gmeConfig, managerConfig, pluginConfig, options, function (err, result, storage) {
            var contextParams = {};
            expect(err).to.equal(null);
            expect(result.success).to.equal(true);

            contextParams.projectName = projectName;
            contextParams.branchName = branchName;
            contextParams.nodePaths = [nodePath];
            openContext(storage, gmeConfig, contextParams, function (err, context) {
                var nodeName;
                expect(err).to.equal(null);

                expect(context.nodes).to.have.keys(nodePath);
                nodeName = context.core.getAttribute(context.nodes[nodePath], 'name');

                expect(nodeName).to.equal('newNameFromNewPlugin');
                done();
            });
        });
    });

    it('should run using serveruserstorage and change name', function (done) {
        var projectName = 'testProject',
            nodePath = '/960660211',
            branchName = 'master',
            managerConfig = {
                pluginName: pluginName,
                projectName: projectName,
                branchName: branchName,
                activeNode: nodePath,
            },
            pluginConfig = {},
            options = {
                localStorage: false,
                overwrite: true,
                importProject: './test/assets/sm_basic.json'
            };
        runPlugin(gmeConfig, managerConfig, pluginConfig, options, function (err, result, storage) {
            var contextParams = {};
            expect(err).to.equal(null);
            expect(result.success).to.equal(true);

            contextParams.projectName = projectName;
            contextParams.branchName = branchName;
            contextParams.nodePaths = [nodePath];
            openContext(storage, gmeConfig, contextParams, function (err, context) {
                var nodeName;
                expect(err).to.equal(null);

                expect(context.nodes).to.have.keys(nodePath);
                nodeName = context.core.getAttribute(context.nodes[nodePath], 'name');

                expect(nodeName).to.equal('newNameFromNewPlugin');
                done();
            });
        });
    });
});