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

(function(){
    tetra.extend('dep', function (_conf, _mod, _) {
        requirejs.config({
            //By default load any module IDs from js/lib
            baseUrl: getStaticURL(_conf, _conf.APPS_PATH),
            enforceDefine:true,
	        waitSeconds: 10,
            urlArgs:_conf.jsVersion ? 'v=' + _conf.jsVersion : '',
            //except, if the module ID starts with "app",
            //load it from the js/app directory. paths
            //config is relative to the baseUrl, and
            //never includes a ".js" extension since
            //the paths config could be for a directory.
            paths:{
                g:getStaticURL(_conf, _conf.GLOBAL_PATH),
                comp:getStaticURL(_conf, _conf.COMP_PATH)
            }
        });

        return {
            define:define,
            undef:requirejs.undef,
            require:require
        };
    });

    function getStaticURL(_conf, url) {
        return (_conf.BOOTNODE_HOST) ? _conf.BOOTNODE_HOST + url : url;
    }
})();
