// ------------------------------------------------------------------------------
// Tetra.js
//
// jQuery connector for libAbstracted module
// used for DOM access and advanced js methods
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

(function(){

    'use strict';

    if(typeof jQuery !== 'undefined') {

        var _isJSON = function(data) {
            data = $.trim(data);
            if(!data || data.length === 0) {
                return false;
            }
            return (/^[\],:{}\s]*$/
                .test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
        };

        // API client
        var _VDinit = false;

        if(!tns.libs){
            tns.libs = [];
        }
        tns.libs.push((function($){return{
            name: 'jQuery',
            s: $,
            elm: function(domElm) {
                return $(domElm);
            },
            //    hasClass:        "hasClass",
            //    addClass:        "addClass",
            //    removeClass:    "removeClass",
            //    attr:            "attr",
            //    parents:        "parents",
            //    find:            "find",
            //    is:                "is",
            //
            //    val:            "val",
            //    html:            "html",
            serialize: function(getObj) {
                var
                    str = '',
                    obj = {},
                    n,
                    v
                    ;

                if(getObj) {
                    $.each( $(this).serializeArray(), function(i,o){
                        n = o.name;
                        v = o.value;

                        obj[n] = obj[n] === undefined ? v
                            : $.isArray( obj[n] ) ? obj[n].concat( v )
                            : [ obj[n], v ];
                    });

                    return obj;
                } else {
                    str = $(this).serialize();
                    return str;
                }
            },

            //
            //    siblings:         "siblings",
            //    prev:             "prev",
            //    next:             "next",
            //
            //    append:         "append",
            //    prepend:         "prepend",
            //    before:         "before",
            //    after:             "after",
            //    replaceWith:     "replaceWith",
            //    remove:         "remove",
            //
            //    animate:         "animate",
            //  css:            "css",
            //  height:            "height",
            //  width:            "width",
            //  offset:         "offset",
            //
            //    ready:             "ready",
            //    bind:             "bind",
            //  unbind:            "unbind",

            ajax: function(url, options) {
                var
                    params = options.data,
                    reqParams = {},
                    p
                    ;

                if(options.type === 'delete' || options.type === 'put') {
                    options.headers['X-HTTP-Method-Override'] = options.type;
                    options.data._method = options.type;
                    options.type = 'post';
                }

                // remove object parameters that must not be sent to the server
                if(!options.headers['Content-Type'] || options.headers['Content-Type'].indexOf('application/x-www-form-urlencoded') === 1) {
                    for(p in params) {
                        if(!params.hasOwnProperty(p) || params[p] === null){
                            continue;
                        }
                        if(typeof params[p] !== 'object' || params[p].splice) {
                            reqParams[p] = params[p];
                        }
                    }
                } else {
                    reqParams = params;
                }

                $.ajax({
                    url: url,
                    type: options.type,
                    headers: options.headers,
                    data: reqParams,
                    traditional: true,
                    processData: options.processData,
                    beforeSend: options.beforeSend,
                    complete: options.complete,
                    success: options.success,
                    error: options.error
                });
            },
            initApi: function(conf) {
		        window.VD.init(conf);
		        _VDinit = true;
            },
            api: function(url, options) {
                if(!_VDinit) {
                    options.error(500, {errors:['API client not initialized']});
                    return false;
                }

                window.VD.api(
                    url,
                    options.type,
                    options.data,
                    function(resp) {
                        options.success(resp);
                        // TODO error ?!
                    }
                );
            },
            mysql: function(dbTable, options) {
                options.error(500, {errors:['not implemented']});
            },

            support: $.support,
	        browser: $.browser,
            extend: $.extend,
	        inArray: $.inArray,
            toJSON: JSON.stringify,
            parseJSON: $.parseJSON,
            trim: $.trim
        };})(jQuery));
    }
})();
