/*jshint node:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

/*jshint node:true, mocha:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

var testFixture = require('../../globals');

describe('NewPlugin', function () {
    var gmeConfig = testFixture.getGmeConfig(),
        runPlugin = testFixture.runPlugin,
        pluginName = 'NewPlugin';

    it('should run using local storage with no pluginConfig', function (done) {
        var managerConfig = {
                pluginName: pluginName,
                projectName: 'testProject',
                branch: 'master',
                activeNode: '/960660211',
            },
            pluginConfig,
            options = {
                localStorage: true,
                importProject: './test/assets/sm_basic.json'
            };
        runPlugin(gmeConfig, managerConfig, pluginConfig, options, function (err, result) {
            if (err) {
                done(new Error(err));
                return;
            }

            if (result.success !== true) {
                done(new Error('Plugin failed'));
                return;
            }
            done();
        });
    });

    it('should run using serveruserstorage with no pluginConfig', function (done) {
        var managerConfig = {
                pluginName: pluginName,
                projectName: 'testProject',
                branch: 'master',
                activeNode: '/960660211',
            },
            pluginConfig,
            options = {
                localStorage: false, // This requires that the database is connected
                overwrite: true,
                importProject: './test/assets/sm_basic.json'
            };
        runPlugin(gmeConfig, managerConfig, pluginConfig, options, function (err, result) {
            if (err) {
                done(new Error(err));
                return;
            }

            if (result.success !== true) {
                done(new Error('Plugin failed'));
                return;
            }
            done();
        });
    });
});