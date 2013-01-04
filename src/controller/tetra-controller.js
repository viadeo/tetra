// ------------------------------------------------------------------------------
// Tetra.js
// Native controller functions of Tetra.js
// ------------------------------------------------------------------------------
// Copyright (c) Viadeo/APVO Corp., Olivier Hory and other Tetra contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// ------------------------------------------------------------------------------
tetra.extend('controller', function(_conf, _mod, _) {

    'use strict';

    var
        _controllers = {}, // controller objects
        _actions = {}, // actions for templating feature
        _debug
        ;


    // DEBUG functions
    // --------------------
    _debug = {
        page: _mod.pipe.page,

        app: function(scope) {
            return _mod.pipe.appBuilder('controller', scope);
        },

        list: function() {
            var list = {};
            for(var name in _controllers) {
                if(_controllers.hasOwnProperty(name)) {
                    _mod.debug.log(_controllers[name].scope + ' / ' + name);
                    if(typeof list[_controllers[name].scope] === 'undefined') {
                        list[_controllers[name].scope] = [];
                    }
                    list[_controllers[name].scope].push(name);
                }
            }
            return list;
        },

        retrieve : function(scope, name) {
            var ctrl = _controllers[scope + '/' + name];
            if(ctrl) {
                ctrl.actions = _actions[scope + '/' + name];
            }

            return ctrl;
        },

        msg: function(ctrlName) {
            var
                msgs = [],
                viewEvents
                ;
            if(_controllers[ctrlName] && _controllers[ctrlName].events.view) {
                viewEvents = _controllers[ctrlName].events.view;
                for(var msg in viewEvents) {
                    if(viewEvents.hasOwnProperty(msg)) {
                        _mod.debug.log(msg);
                        msgs.push(msg);
                    }
                }
            } else {
                _mod.debug.log(ctrlName + ' was not found');
            }

            return msgs;
        },

        man : function() {
            _mod.debug.log('Tetra.js ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            _mod.debug.log('> Controller specs:');
            _mod.debug.log('        - notify app controllers as a view        > tetra.debug.ctrl.app(scope).notify(message, data)');
            _mod.debug.log('        - notify all as a controller            > tetra.debug.ctrl.page.notify(message, data)');
            _mod.debug.log('        - list all controllers with their scope    > tetra.debug.ctrl.list()');
            _mod.debug.log('        - list all view messages listened        > tetra.debug.ctrl.msg(ctrlName)');
            _mod.debug.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

            return true;
        }
    };


    // Instantiation
    // --------------------
    var Builder = function(ctrlName, params) {
        var
            me = this,
            app = _mod.pipe.appBuilder('view', params.scope),
            constr = params.constr(me, app, _mod.pipe.page, _mod.orm(params.scope))
            ;

        this.scope = params.scope;
        this.events = (constr) ? constr.events : {};
        this.methods = (constr) ? constr.methods : {};

        _actions[ctrlName] = (constr) ? constr.actions : {};

        return this;
    };


    // Registers a controller when *all* its dependencies have been loaded.
    var _register = function(ctrlName, params) {
        _controllers[ctrlName] = new Builder(ctrlName, params);

        _mod.debug.log('controller ' + ctrlName + ' : registered', _controllers[ctrlName].scope, 'info');

        if(typeof _controllers[ctrlName].methods !== 'undefined' &&
            typeof _controllers[ctrlName].methods.init !== 'undefined') {
            _controllers[ctrlName].methods.init();
        }

        return _controllers[ctrlName];
    };


    // Interface implementation
    // --------------------
    return {
        // Registers a controller
        // Note that at a minimum a controller must be given a name, and a params object literal with
        // the following structure
        //
        // {
        //    scope: 'theScope',
        //  constr: function(me, app, page, orm) {
        //        return {
        //            events: {}
        //        };
        //  }
        // }
        register: function(name, params) {

            if(_conf.env === 'Node') {
                params.scope = 'node';
            }

            var
                ctrlName = params.scope + '/' + name
                ;

            if(!name || !params) {
                throw new Error(
                    'tetra.controller.register(name, params) : ' +
                        'name and params are both required arguments');
            }

            if(!params.hasOwnProperty('scope') || !params.hasOwnProperty('constr')) {
                throw new Error(
                    'tetra.controller.register(name, params) : ' +
                        'params must define a scope attribute and a constr method');
            }

            // TODO Require should manage this
            if(_controllers[ctrlName]) {
                if(typeof console !== 'undefined') {
                    console.warn('controller ' + ctrlName + ' already registered');
                }
                return;
            }

            var deps = [], modelName;
            if(typeof params.use !== 'undefined') {
                for(var i = 0, len = params.use.length; i < len; i++) {
                    modelName = params.use[i];
                    if(modelName.substring(0,2) === 'g/') {
                        modelName = modelName.substring(2);
                        deps.push('g/model/'+ modelName +'.class');
                    } else {
                        deps.push(params.scope +'/model/'+ modelName +'.class');
                    }
                }
            }

            _mod.dep.define(params.scope + '/controller/' + name +'.ctrl', deps, function() {
                _register(ctrlName, params);
            });

            _mod.dep.require([params.scope + '/controller/' + name +'.ctrl']);
        },

        destroy: function(name, scope) {
            var ctrlName = scope + '/' + name;

            _mod.dep.undef(scope + '/controller/' + name +'.ctrl');

            delete _controllers[ctrlName];
        },

        // Notification from views in the given scope
        notify: function(message, data, scope) {
            scope = scope || 'all';

            var ctrl, ctrlScope, ctrlListener;

            for(var name in _controllers) {
                if(_controllers.hasOwnProperty(name)) {
                    ctrl = _controllers[name];
                    ctrlScope = ctrl.scope;

                    if(scope !== 'all' && ctrl.events.view || ctrl.events.controller) {
                        ctrlListener = (scope !== 'all') ? ctrl.events.view : ctrl.events.controller;

                        if((scope === 'all' || scope === ctrlScope) &&
                            typeof ctrlListener[message] !== 'undefined') {
                            _mod.debug.log('ctrl ' + name + ' : exec ' + message, scope, 'info');
                            ctrlListener[message](data);
                        }
                    }
                }
            }
        },

        // Notification from models in the given scope
        modelNotify: function(modelName, type, args) {
            var thisCtrl;
            for(var ctrlName in _controllers) {
                if(_controllers.hasOwnProperty(ctrlName)) {
                    thisCtrl = _controllers[ctrlName];
                    if(thisCtrl.events && typeof thisCtrl.events.model !== 'undefined' &&
                        typeof thisCtrl.events.model[modelName] !== 'undefined') {
                        _mod.debug.log('ctrl ' + ctrlName + ' : model ' + modelName + ' ' + type, thisCtrl.scope, 'info');
                        if(typeof thisCtrl.events.model[modelName][type] !== 'undefined') {
                            thisCtrl.events.model[modelName][type].apply(thisCtrl, args);
                        }
                    }
                }
            }
        },

        exec: function(actionName, ctrlName, data, callback, scope, uid, cid) {
            var defaultTmpl;
            if(typeof ctrlName !== 'string') {
                cid = uid;
                uid = scope;
                scope = callback;
                callback = data;
                data = ctrlName;
                ctrlName = undefined;

                defaultTmpl = actionName;
            } else {
                var ctrlId = scope + '/' + ctrlName;
                defaultTmpl = ctrlName + '/' + actionName;
            }

            var
                _render = function(data, template) {
                    if (!template) {
                        template = defaultTmpl;
                    }
                    _mod.tmpl(template, data, callback, scope, uid, cid);
                },

                _execute = function() {
                    if(ctrlId && _actions[ctrlId] && _actions[ctrlId][actionName]) {
                        _actions[ctrlId][actionName](data, _render);
                    } else {
                        _render(data);
                    }
                }
                ;

            if(ctrlName) {
                _mod.dep.require([scope + '/controller/' + ctrlName +'.ctrl'], _execute);
            } else {
                _execute();
            }
        },

        debug: _debug
    };
});