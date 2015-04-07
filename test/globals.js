/*globals requireJS*/
/*jshint node:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

global.TESTING = true;

// This flag will make sure the config.test.js is being used
process.env.NODE_ENV = 'test';

//adding a local storage class to the global Namespace
var WebGME = require('webgme'),
    gmeConfig = require('../config'),
    getGmeConfig = function () {
        'use strict';
        // makes sure that for each request it returns with a unique object and tests will not interfere
        if (!gmeConfig) {
            // if some tests are deleting or unloading the config
            gmeConfig = require('../config');
        }
        return JSON.parse(JSON.stringify(gmeConfig));
    },
    importProject = require('../node_modules/webgme/src/bin/import'),
    expect = require('chai').expect,
    _runPlugin = require('../node_modules/webgme/src/server/runplugin');

WebGME.addToRequireJsPaths(gmeConfig);

/**
 * Executes the given plugin
 * @param {object} _gmeConfig - global webgme configuration
 *
 * @param {object} managerConfig - configuration for plugin-manager
 * @param {string} managerConfig.pluginName - name of plugin
 * @param {string} managerConfig.projectName - name of project
 * @param {string} [managerConfig.branchName] - name of branch - defaults to master
 * @param {string} [managerConfig.activeNode] - path to node in activeNode
 * @param {string} [managerConfig.activeSelection] - paths to nodes in activeSelection - defaults to []
 *
 * @param {object} [pluginConfig] - configuration for the specific plugin (if not given defaults are used)
 *
 * @param {object} options - configuration for plugin-manager
 * @param {boolean} [options.localStorage] - uses a local storage not connected or persisted to mongodb
 * @param {string} [options.importProject] - path to exported webgme-project that will be imported.
 * @param {string} [options.overwrite] - if importing to mongodb overwrite project if it exist.
 * @param {function} callback
 */
function runPlugin(_gmeConfig, managerConfig, pluginConfig, options, callback) {
    var Storage,
        jsonProject;

    if (options.localStorage) {
        Storage = WebGME.localStorage;
    } else {
        Storage = WebGME.serverUserStorage;
    }

    managerConfig.branchName = managerConfig.branchName || 'master';

    function callPluginMain(storage) {
        _runPlugin.main(storage, _gmeConfig, managerConfig, pluginConfig, function (err, result) {
            callback(err, result, storage);
        });
    }

    if (options.importProject) {
        try {
            jsonProject = JSON.parse(require('fs').readFileSync(options.importProject, 'utf-8'));
        } catch (err) {
            callback('unable to load project file: ' + err);
            return;
        }
        importProject.import(Storage, _gmeConfig, managerConfig.projectName, jsonProject, managerConfig.branchName, options.overwrite,
            function(err, importData) {
                if (err) {
                    callback(err);
                    return;
                }
                callPluginMain(importData.storage);
            }
        );
    } else {
        callPluginMain(new Storage({globConf: _gmeConfig}));
    }
};

module.exports = {
    WebGME: WebGME,
    getGmeConfig: getGmeConfig,
    expect: expect,

    runPlugin: runPlugin
};