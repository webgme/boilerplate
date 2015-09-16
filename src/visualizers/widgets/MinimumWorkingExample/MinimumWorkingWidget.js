/*globals define, WebGMEGlobal*/
/*jshint browser: true*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'js/logger',
    'css!./styles/MinimumWorkingWidget.css'
], function (Logger) {
    'use strict';

    var MinimumWorkingWidget,
        WIDGET_CLASS = 'minimum-working-viz';

    MinimumWorkingWidget = function (container) {
        this._logger = Logger.create('gme:Widgets:MinimumWorking:MinimumWorkingWidget', WebGMEGlobal.gmeConfig.client.log);

        this._el = container;

        this.nodes = {};
        this._initialize();

        this._logger.debug('MinimumWorkingWidget ctor finished');
    };

    MinimumWorkingWidget.prototype._initialize = function () {
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);

        // Create a dummy header 
        this._el.append('<h3>Visualizer Events:</h3>');

        // Registering to events can be done with jQuery (as normal)
        this._el.on('dblclick', function (event) {
            event.stopPropagation();
            event.preventDefault();
            self.onBackgroundDblClick();
        });
    };

    MinimumWorkingWidget.prototype.onWidgetContainerResize = function (width, height) {
        console.log('Widget is resizing...');
    };

    // Adding/Removing/Updating items
    MinimumWorkingWidget.prototype.addNode = function (desc) {
        if (desc) {
            // Add node to a table of nodes
            var node = document.createElement('div'),
                label = 'children';

            if (desc.childrenIds.length === 1) {
                label = 'child';
            }

            this.nodes[desc.id] = desc;
            node.innerHTML = 'Adding node "' + desc.name + '" (click to view). It has ' + 
                desc.childrenIds.length + ' ' + label + '.';

            this._el.append(node);
            node.onclick = this.onNodeClick.bind(this, desc.id);
        }
    };

    MinimumWorkingWidget.prototype.removeNode = function (gmeId) {
        var desc = this.nodes[gmeId];
        this._el.append('<div>Removing node "'+desc.name+'"</div>');
        delete this.nodes[gmeId];
    };

    MinimumWorkingWidget.prototype.updateNode = function (desc) {
        if (desc) {
            console.log('Updating node:', desc);
            this._el.append('<div>Updating node "'+desc.name+'"</div>');
        }
    };

    /* * * * * * * * Visualizer event handlers * * * * * * * */

    MinimumWorkingWidget.prototype.onNodeClick = function (id) {
        // This currently changes the active node to the given id and
        // this is overridden in the controller.
    };

    MinimumWorkingWidget.prototype.onBackgroundDblClick = function () {
        this._el.append('<div>Background was double-clicked!!</div>');
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    MinimumWorkingWidget.prototype.destroy = function () {
    };

    MinimumWorkingWidget.prototype.onActivate = function () {
        console.log('MinimumWorkingWidget has been activated');
    };

    MinimumWorkingWidget.prototype.onDeactivate = function () {
        console.log('MinimumWorkingWidget has been deactivated');
    };

    return MinimumWorkingWidget;
});
