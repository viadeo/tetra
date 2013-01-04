// ------------------------------------------------------------------------------
// Tetra.js
//
// Templating system
// * Client side (client-micro-tmpl.js) use John Resig micro-templating system
// with a special component management
// * Server side (node.js) use ejs templating system module for Express.js
// * Separators: {% and %} in both implementation
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
tetra.extend('tmpl', function(_conf, _mod, _) {

    'use strict';

    // Rendering functions
    // -------------------------------
    var
        zlib = require('zlib'), // Gzip library for Node

        _tmpl = function(res, template, data, cbk, gzip) {
            if(gzip) {
                res.render(_conf.APPS_PATH + '/view/' + template, data, function(err, data) {
                    _send(res, data, 200, true);
                });
            } else {
                res.render(_conf.APPS_PATH + '/view/' + template, data, cbk);
            }
        },

        _send = function(res, data, headers, gzip) {
            if(gzip) {
                zlib.gzip(data, function(err, data) {
                    res.set({'Content-Type': 'text/html; charset: utf-8', 'Content-Encoding': 'gzip'});
                    res.send(data);
                });
            } else {
                res.set(headers);
                res.send(data);
            }
        },

        _jsonSend = function(res, data, headers, gzip) {
            if(gzip) {
                zlib.gzip(data, function(err, data) {
                    res.set({'Content-Type': 'text/html; charset: utf-8', 'Content-Encoding': 'gzip'});
                    res.json(data);
                });
            } else {
                res.set(headers);
                res.json(data);
            }
        }
        ;

    var
        _ctx = {}, // rendering context
        _tmplStack = {},

        _head = JSON.parse(fs.readFileSync(_conf.APPS_PATH + '/view/_head.json', 'utf8')), // default headers
        _loadHeader = function(uid, actionName, ctrlName) {
            try {
                var actionHead = {};
                if(ctrlName) {
                    actionHead = JSON.parse(fs.readFileSync(_conf.APPS_PATH + '/view/' + ctrlName + '/_head/' + actionName + '.json', 'utf8'));
                } else {
                    actionHead = JSON.parse(fs.readFileSync(_conf.APPS_PATH + '/view/_head/' + actionName + '.json', 'utf8'));
                }
                _tmplStack[uid].head = _.extend(_tmplStack[uid].head, actionHead);
            } catch(err) { /* not existing file */ }
        },

        _component = function(uid, scope, ctrl, parentid) {
            return function(actionName, data, ctrlName) {
                if(!data){
                    data = {};
                }
                if(!ctrlName && ctrl){
                    ctrlName = ctrl;
                }

                var id, cid;

                if(_tmplStack[uid]) {
                    id = ctrlName ? ctrlName + '/' + actionName : actionName;
                    cid = parentid? parentid + '_' + _tmplStack[uid].comp[parentid].countid++ : id + '_' + _tmplStack[uid].countid++;

                    _loadHeader(uid, actionName, ctrlName);

                    // Intialize and call component
                    if(!_tmplStack[uid].comp[cid]) {
                        _tmplStack[uid].count++;
                        if(parentid) {
                            _tmplStack[uid].comp[parentid].count++;
                        }

                        // Add component to the stack
                        _tmplStack[uid].comp[cid] = {id: id, data: data, count: 0, countid: 0, parentid: parentid, html: false};

                        // Execute the action of the component
                        if(ctrlName) {
                            tetra.controller.exec(actionName, ctrlName, data, undefined, scope, uid, cid);
                        } else {
                            tetra.controller.exec(actionName, data, undefined, scope, uid, cid);
                        }
                    }
                }

                // Return generated html if available or false if the response is pending
                if(_tmplStack[uid]) {
                    return _tmplStack[uid].comp[cid].html;
                }
            };
        },

        _render = function(uid, cid, ctrl, isComp) {
            var html = "";
            var data;

            if(_tmplStack[uid].count === 0) {

                // Render the full template
                _tmplStack[uid].countid = 0;
                _tmpl(_tmplStack[uid].res, _tmplStack[uid].id, _tmplStack[uid].data, function(err, html) {
                    if(_tmplStack[uid]) {
                        data = _tmplStack[uid].data;

                        // Return gzipped html to the client
                        if(typeof data.layout === 'undefined' || data.layout != false) {
                            data.head = _tmplStack[uid].head;
                            data.body = html;
                            _tmpl(_tmplStack[uid].res, (data.layout) ? data.layout : 'layout', data, function(err, html) {
                                _send(_tmplStack[uid].res, html, 200, true);
                            });
                        } else {
                            _send(_tmplStack[uid].res, html, 200, true);
                        }

                        // Remove template from stack
                        delete _tmplStack[uid];
                    }
                });

            } else if(isComp) {

                var
                    comp = _tmplStack[uid].comp[cid]
                    ;

                // Evaluate the component of all his children are available
                if(comp.html === false && comp.count === 0) {

                    _tmplStack[uid].comp[cid].countid = 0;
                    _tmpl(_tmplStack[uid].res ,comp.id, comp.data, function(err, data) {
                        if(typeof err === 'undefined') {
                            comp.html = data;
                            _tmplStack[uid].count--;

                            if(comp.html !== false) {
                                if(comp.parentid) {
                                    _render(uid, comp.parentid, ctrl, true);
                                } else {
                                    _render(uid, undefined, ctrl, false);
                                }
                            }
                        }
                    });
                }

                // Render the parent template
                else if(comp.html !== false) {
                    if(comp.parentid) {
                        _render(uid, comp.parentid, ctrl, true);
                    } else {
                        _render(uid, undefined, ctrl, false);
                    }
                }
            }
        }
        ;

    return function(template, data, res, scope, uid, cid) {

        var
            now = new Date(),
            tpl = template.split('/'),
            id = (/\W/.test(template.replace('/',''))) ? template : (tpl.length === 1) ? tpl[0] : tpl[0] + '/' + tpl[1]
        ;

        cid = cid || id;

        var
            isComp = (!!uid && !!_tmplStack[uid] && !!_tmplStack[uid].comp && !!_tmplStack[uid].comp[cid] && _tmplStack[uid].comp[cid].html === false),
            html = ""
        ;

        // Initialize the root template on the stack
        if(!uid) {
            uid = cid + '_' + now.getTime();
            _tmplStack[uid] = {id: id, data: data, comp: {}, count: 0, countid: 0, res: res, head: _.extend({}, _head)};
        }

        // Process the current template
        data.component = _component(uid, scope, tpl[0], isComp ? cid : undefined);
        _tmpl(_tmplStack[uid].res, id, data, function(err, data) {
            html = data;

            if(_tmplStack[uid]) {
                // Store directly evaluated template
                if(isComp) {
                    var
                        comp = _tmplStack[uid].comp[cid]
                        ;
                    if(comp.count === 0) {
                        _tmplStack[uid].comp[cid].html = html;
                        if(_tmplStack[uid].comp[cid].parentid) {
                            _tmplStack[uid].comp[_tmplStack[uid].comp[cid].parentid].count--;
                        }
                        _tmplStack[uid].count--;
                    }
                }

                // Try to render after each evaluation
                _render(uid, cid, (tpl.length === 1) ? tpl[0] : undefined, isComp);
            }
        });
    };

});
