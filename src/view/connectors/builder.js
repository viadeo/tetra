// ------------------------------------------------------------------------------
// Tetra.js
//
// Abstracted lib to use available javascript library (jQuery, Prototype, ...)
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
tetra.extend('lib', function(_conf, _mod, _) {

    'use strict';

    return (function(libs) {

        var
            _exposedDOMFcts = ['attr', 'prop', 'is', 'val', 'html', 'serialize', 'css', 'height', 'width', 'offset'],
            _exposedDOMFctsOnArray = ['hasClass', 'addClass', 'removeClass', 'append', 'prepend', 'before', 'after', 'replaceWith', 'remove', 'animate', 'bind', 'unbind', 'ready'],
            _exposedDOMFctsWithExtendedOutput = ['parents', 'find', 'siblings', 'prev', 'next', 'clone', 'children'],
            _exposedHelpers = ['elm', 'ajax', 'initApi', 'api', 'initMysql', 'mysql', 'extend', 'toJSON', 'parseJSON', 'inArray', 'trim', 'render', 'send', 'jsonSend', 'browser', 'support'],

            _helpers = {},

            _addDOMFct = function(list, elt, name, fct) {
                if(typeof fct !== 'undefined'){
                    list[name] = function() { return fct.apply(elt, arguments); };
                }
                return list;
            },

            _addDOMFctWithExtendedOutput = function(list, elt, name, fct) {
                if(typeof fct !== 'undefined'){
                    list[name] = function() { return _(fct.apply(elt, arguments)); };
                }
                return list;
            },

            _addHelper = function(list, name, fct) {
                list[name] = fct;
                return list;
            },

            i = 0,
            envLib = _conf.env,
            lib = false,
            libLen = libs.length,
            libList = {},
            _lList = {},
            l
            ;

        for(; i < libLen; i++) {

            l = libs[i];
            libList[l.name] = l;

            var
                _l = function(selector) {

                    var
                        domElm = l.elm([]),
                        elt = domElm,
                        elmFcts = {}
                        ;

                    if(selector && typeof selector !== 'undefined') {

                        if(typeof selector === 'string') {
                            domElm = new Sizzle(selector);
                        } else if(selector.splice) {
                            domElm = selector;
                        } else {
                            domElm = [selector];
                        }

                        domElm = l.elm(domElm);

                        if(domElm.length > 0) {
                            elt = domElm[0];
                            if(l.name === 'Prototype' && !elt.hasClassName) {
                                elt = l.elm(elt);
                            }
                        }

                    }

                    var libFct;
                    for(var f = 0, len = _exposedDOMFcts.length; f < len; f++) {
                        libFct = (typeof l[_exposedDOMFcts[f]] === 'string') ? elt[l[_exposedDOMFcts[f]]] : l[_exposedDOMFcts[f]];
                        _addDOMFct(elmFcts, elt, _exposedDOMFcts[f], libFct);
                    }

                    len = _exposedDOMFctsOnArray.length;
                    for(var g = 0; g < len; g++) {
                        libFct = (typeof l[_exposedDOMFctsOnArray[g]] === 'string') ? domElm[l[_exposedDOMFctsOnArray[g]]] : l[_exposedDOMFctsOnArray[g]];
                        _addDOMFct(elmFcts, domElm, _exposedDOMFctsOnArray[g], libFct);
                    }

                    len = _exposedDOMFctsWithExtendedOutput.length;
                    for(var h = 0; h < len; h++) {
                        libFct = (typeof l[_exposedDOMFctsWithExtendedOutput[h]] === 'string') ? elt[l[_exposedDOMFctsWithExtendedOutput[h]]] : l[_exposedDOMFctsWithExtendedOutput[h]];
                        _addDOMFctWithExtendedOutput(elmFcts, elt, _exposedDOMFctsWithExtendedOutput[h], libFct);
                    }

                    domElm = l.extend(domElm, elmFcts);

                    return domElm;
                }
                ;

            // generic helpers
            for(var f = 0, len = _exposedHelpers.length; f < len; f++) {
                var libHelper = l[_exposedHelpers[f]];
                _addHelper(_helpers, _exposedHelpers[f], libHelper);
            }

            // switch on the best lib connector according to the context
            _helpers.toggleLib = function(isAllLibCapable) {
                _init(isAllLibCapable);
                l = lib;
            };

            _lList[l.name] = l.extend(_l, _helpers);
        }

        var _init = function(isAllLibCapable) {
            var prefLib = envLib;
            if(!isAllLibCapable) {
                prefLib = 'Prototype';
            }

            if(!lib || prefLib !== lib.name) {
                lib = (libList[prefLib]) ? libList[prefLib] : libs[0];
                _ = _lList[lib.name];
            }

            return _;
        };

        return _init();

    })(tns.libs);
});
