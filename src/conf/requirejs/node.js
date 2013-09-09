// ------------------------------------------------------------------------------
// Tetra.js
//
// Dependencies loader using require.js
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
tetra.extend('dep', function (_conf, _mod, _) {

    var requirejs = require('requirejs');

    requirejs.config({
        //By default load any module IDs from js/lib
        baseUrl:_conf.APPS_PATH,
        enforceDefine:true,
        //except, if the module ID starts with "app",
        //load it from the js/app directory. paths
        //config is relative to the baseUrl, and
        //never includes a ".js" extension since
        //the paths config could be for a directory.
        paths:{
            node:_conf.APPS_PATH,
            g:_conf.GLOBAL_PATH,
            comp:_conf.COMP_PATH
        },

        //Pass the top-level main.js/index.js require
        //function to requirejs so that node modules
        //are loaded relative to the top-level JS file.
        nodeRequire:require
    });

    return {
        define:requirejs.define,
        undef:requirejs.undef,
        require:requirejs
    };

});
