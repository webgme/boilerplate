/*globals define, WebGMEGlobal*/
/*jshint browser: true*/
/**
 * @author brollb / https://github.com/brollb
 */

define(['js/logger',
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames'
], function (Logger,
             CONSTANTS,
             GMEConcepts,
             nodePropertyNames) {

    'use strict';

    var MinimumWorkingControl;

    MinimumWorkingControl = function (options) {

        this._logger = Logger.create('gme:Panels:MinimumWorking:Control', WebGMEGlobal.gmeConfig.client.log);

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;
        this._currentNodeParentId = undefined;

        this._initWidgetEventHandlers();

        this._logger.debug('Created');
    };

    MinimumWorkingControl.prototype._initWidgetEventHandlers = function () {
        this._widget.onNodeClick = function (id) {
            // Change the current active object
            WebGMEGlobal.State.registerActiveObject(id);
        };
    };

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    MinimumWorkingControl.prototype.selectedObjectChanged = function (nodeId) {
        var desc = this._getObjectDescriptor(nodeId),
            self = this;

        this._logger.debug('activeObject nodeId \'' + nodeId + '\'');

        // Remove current territory patterns
        if (this._currentNodeId) {
            this._client.removeUI(this._territoryId);
        }

        this._currentNodeId = nodeId;
        this._currentNodeParentId = undefined;

        if (this._currentNodeId || this._currentNodeId === CONSTANTS.PROJECT_ROOT_ID) {
            // Put new node's info into territory rules
            this._selfPatterns = {};
            this._selfPatterns[nodeId] = {children: 0};  // Territory "rule"

            this._widget.setTitle(desc.name.toUpperCase());

            if (desc.parentId || desc.parentId === CONSTANTS.PROJECT_ROOT_ID) {
                this.$btnModelHierarchyUp.show();
            } else {
                this.$btnModelHierarchyUp.hide();
            }

            this._currentNodeParentId = desc.parentId;

            this._territoryId = this._client.addUI(this, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            this._client.updateTerritory(this._territoryId, this._selfPatterns);

            setTimeout(function () {
                self._selfPatterns[nodeId] = {children: 1};
                self._client.updateTerritory(self._territoryId, self._selfPatterns);
            }, 1000);
        }
    };

    // This next function retrieves the relevant node information for the widget
    MinimumWorkingControl.prototype._getObjectDescriptor = function (nodeId) {
        var nodeObj = this._client.getNode(nodeId),
            baseId,
            baseNode,
            objDescriptor;

        if (nodeObj) {
            objDescriptor = {
                'id': undefined,
                'name': undefined,
                'childrenIds': undefined,
                'parentId': undefined,
                'isConnection': false
            };

            objDescriptor.id = nodeObj.getId();
            objDescriptor.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name);
            objDescriptor.childrenIds = nodeObj.getChildrenIds();
            objDescriptor.childrenNum = objDescriptor.childrenIds.length;
            objDescriptor.parentId = nodeObj.getParentId();
            objDescriptor.isConnection = GMEConcepts.isConnection(nodeId);  // GMEConcepts can be helpful
        }

        return objDescriptor;
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    MinimumWorkingControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            e;

        this._logger.debug('_eventCallback \'' + i + '\' items');

        while (i--) {
            e = events[i];
            switch (e.etype) {
                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    this._onLoad(e.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(e.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    this._onUnload(e.eid);
                    break;
                default:
                    break;
            }
        }

        this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
    };

    MinimumWorkingControl.prototype._onLoad = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._widget.addNode(description);
    };

    MinimumWorkingControl.prototype._onUpdate = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._widget.updateNode(description);
    };

    MinimumWorkingControl.prototype._onUnload = function (gmeId) {
        this._widget.removeNode(gmeId);
    };

    MinimumWorkingControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        this.selectedObjectChanged(activeObjectId);
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    MinimumWorkingControl.prototype.destroy = function () {
        this._detachClientEventListeners();
    };

    MinimumWorkingControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    MinimumWorkingControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    MinimumWorkingControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();
    };

    MinimumWorkingControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
    MinimumWorkingControl.prototype._displayToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].show();
            }
        } else {
            this._initializeToolbar();
        }
    };

    MinimumWorkingControl.prototype._hideToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].hide();
            }
        }
    };

    MinimumWorkingControl.prototype._removeToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    MinimumWorkingControl.prototype._initializeToolbar = function () {
        var toolBar = WebGMEGlobal.Toolbar,
            self = this;

        this._toolbarItems = [];

        this._toolbarItems.push(toolBar.addSeparator());

        /************** Go to hierarchical parent button ****************/
        this.$btnModelHierarchyUp = toolBar.addButton({
            title: 'Go to parent',
            icon: 'glyphicon glyphicon-circle-arrow-up',
            clickFn: function (/*data*/) {
                WebGMEGlobal.State.registerActiveObject(self._currentNodeParentId);
            }
        });
        this._toolbarItems.push(this.$btnModelHierarchyUp);
        this.$btnModelHierarchyUp.hide();

        /************** Checkbox example *******************/

        this.$cbShowConnection = toolBar.addCheckBox({
            title: 'toggle checkbox',
            icon: 'gme icon-gme_diagonal-arrow',
            checkChangedFn: function (data, checked) {
                console.log('Checkbox has been clicked!');
            }
        });

        this._toolbarInitialized = true;
    };

    return MinimumWorkingControl;
});
