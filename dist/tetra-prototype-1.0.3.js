// ------------------------------------------------------------------------------
// Tetra.js
// Javascript MVC framework to build asynchronous webapp on client and server
//
// Author: Olivier Hory
// Contributors: Cormac Flynn, Yannick Croissant, Sylvain Faucherand
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

// Tetra namespace
// ------------------------------------------------------------------------------
var tns = {};

// Tetra structure
// ------------------------------------------------------------------------------
var tetra = (function() {
	
	// Settings:
	// - default environnement
	// - scripts and ajax calls default locations
	// ----------------------------------------
	var _conf = {
		env: 'jQuery',
		enableBootnode: false,
		bootnodeEvents: ["click", "mouseover", "focus"],
		
		APPS_PATH : '/javascript/tetramvc/apps',
		GLOBAL_PATH : '/javascript/tetramvc',
		COMP_PATH : '/resource/comp',
		FETCH_URL : '/javascript/tetramvc/model/{name}/fetch.json',
		FETCH_METHOD : 'GET',
		SAVE_URL : '/javascript/tetramvc/model/{name}/save.json',
		SAVE_METHOD : 'POST',
		DEL_URL : '/javascript/tetramvc/model/{name}/delete.json',
		DEL_METHOD : 'DELETE',
		RESET_URL : '/javascript/tetramvc/model/{name}/reset.json',
		RESET_METHOD : 'PUT'
	};
	
	// Core modules of current instance
	// ----------------------------------------
	
	// Extendable objects
	var
		_, // "_" abstracted library
		_started = false,
		_tmp = {}, // all modules awaiting to be started
		_core = {}, // public modules
		_mod = {}, // internal modules
		_notImplem = function(mod, fct) {
			if(fct) {
				_mod.debug.log('module ' + mod + ' : function ' + fct + ' not implemented', 'all', 'error');
			} else {
				_mod.debug.log('module ' + mod + ' not implemented', 'all', 'error');
			}
		}
	;
	
	_mod.lib = _ = (typeof $ !== 'undefined') ? $ : null;
	_mod.dep = { // dependencies loader
		define: function() { _notImplem('dep', 'define'); },
		undef: function() { _notImplem('dep', 'undef'); },
		require: function() { _notImplem('dep', 'require'); }
	};
	_mod.orm = function() { // orm + ajax requester
		_notImplem('orm');
		return {
			type: 'interface',
			save: function() { _notImplem('orm', 'save'); },
			fetch: function() { _notImplem('orm', 'fetch'); },
			del: function() { _notImplem('orm', 'del'); },
			reset: function() { _notImplem('orm', 'reset'); },
			notify: function() { _notImplem('orm', 'notify'); }
		};
	};
	
	
	// PIPES for notifications
	// --------------------
	_mod.pipe = {
		page: {
			notify: function(message, data) {
				_mod.debug.log('page : ' + message, 'all', 'log', data);
				tetra.controller.notify(message, data);
				return this;
			}
		},
	
		appBuilder: function(target, scope) {
			if(target === 'view') {
				return {
					notify: function(message, data) {
						_mod.debug.log('app ' + scope + ' : ' + target + ' : ' + message, scope, 'log', data);
						tetra.view.notify(message, data, scope);
						return this;
					}
				};
			} else {
				return {
					notify: function(message, data) {
						_mod.debug.log('app ' + scope + ' : ' + target + ' : ' + message, scope, 'log', data);
						tetra.controller.notify(message, data, scope);
						return this;
					},
					exec: function() { // actionName, ctrlName (optional), data, cbk
						var
							args = [],
							i = 0,
							len = arguments.length
						;
						for(; i < len; i++) {
							args.push(arguments[i]);
						}
						args.push(scope);
						return tetra.controller.exec.apply(this, args);
					}
				};
			}
		}
	};
	
	
	// MVC interface
	// Implemented by native modules view, controller and model
	// --------------------
	_core.view = {
		register: function() { _notImplem('view', 'register'); },
		destroy: function() { _notImplem('view', 'destroy'); },
		notify: function() { _notImplem('view', 'notify'); },
		debug: {}
	};
	
	_core.controller = {
		register: function() { _notImplem('controller', 'register'); },
		destroy: function() { _notImplem('controller', 'destroy'); },
		notify: function() { _notImplem('controller', 'notify'); },
		modelNotify: function() { _notImplem('controller', 'modelNotify'); },
		exec: function() { _notImplem('controller', 'exec'); },
		debug: {}
	};
	
	_core.model = {
		register: function() { _notImplem('model', 'register'); },
		destroy: function() { _notImplem('model', 'destroy'); },
		debug: {}
	};
	
	
	// Logger + debugger
	// --------------------
	_core.debug = (function(){
		var
			_debugApp = {},
			debugLog = function(msg, scope, type, data) {
				scope = scope || 'all';
				if(typeof window.console !== 'undefined' && (_debugApp[scope] || (scope !== 'all' && _debugApp.all))){
					data = data || '';
					type = type || 'log';
					try {
						console[type](msg, data);
					} catch(e){}
				}
			}
		;
		
		_mod.debug = {
			log: function() {}
		};
		
		return {
			enable: function(scope) {
				scope = scope || 'all';
				_debugApp[scope] = true;
				
				// Allow access to underscore lib outside of tetra apps
				window._ = _;
				
				// Initialize internal and external debug objects
				_mod.debug = {
					log : debugLog
				};
				_core.debug = {
					enable : this.enable,
						
					man : function() {
						debugLog('Tetra.js ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
						debugLog('> debug enabled');
						debugLog('> man specs > tetra.debug.man()');
						debugLog('	# View specs			> tetra.debug.view.man()');
						debugLog('	# Controller specs		> tetra.debug.controller.man()');
						debugLog('	# Model specs			> tetra.debug.model.man()');
						debugLog('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
						
						return true;
					},
					
					view: _core.view.debug,
					
					ctrl : _core.controller.debug,
					
					model: _core.model.debug
				};
			}
		};
	})();
	
	// Extend core functionality with new modules
	// --------------------
	_core.extend = (function() {
		
		var
			_add = function(name, module) {
				if(name === 'conf') {
					for(var attr in module) {
						_conf[attr] = module[attr];
					}
				} else {
					if(_started) {
						_addModule(name, module);
					} else {
						_tmp[name] = module;
						_mod.debug.log('Module "'+ name +'" defined');
					}
				}
			},
			
			_addModule = function(name, module) {
				if(typeof _core[name] !== 'undefined') {
					_core[name] = module(_conf, _mod, _);
					_mod.debug.log('Tetra module "'+ name +'" loaded');
				} else {
					if(name === 'lib') {
						_mod[name] = _ = module(_conf, _mod, _);
					} else {
						_mod[name] = module(_conf, _mod, _);
					}
					_mod.debug.log('Extension module "'+ name +'" loaded');
				}
			},
			
			_extend = function() {
				if(typeof arguments[0] !== 'undefined') {
					if(typeof arguments[0] === 'string') {
						_add(arguments[0], arguments[1]);
					} else {
						for(var name in arguments[0]) {
							_add(name, arguments[0][name]);
						}
					}
				}
				
				return _core;
			},
			
			_start = function() {
				_started = true;
				
				// start all module in the temporary stack
				for(var name in _tmp) {
					_addModule(name, _tmp[name]);
				}
				
				// empty the temporary module stack
				_tmp = [];
			}
		;
		
		// Start the core when all dependencies and conf are set
		// --------------------
		_core.start = _start;
		
		return _extend;
	})();
	
	
	// Initialization of core
	// --------------------
	
	// Public functions
	return _core;
	
})();

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	exports = module.exports = {};
	exports.tns = tns;
	exports.tetra = tetra;
}

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
	if(typeof jQuery !== "undefined") {
		
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
		
		if(!tns.libs) tns.libs = [];
		tns.libs.push((function($){return{
			name: "jQuery",
			s: $,
			elm: function(domElm) {
				return $(domElm);
			},
		//	hasClass:		"hasClass",
		//	addClass:		"addClass",
		//	removeClass:	"removeClass",
		//	attr:			"attr",
		//	parents:		"parents",
		//	find:			"find",
		//	is:				"is",
		//	
		//	val:			"val",
		//	html:			"html",
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
		//	siblings: 		"siblings",
		//	prev: 			"prev",
		//	next: 			"next",
		//	
		//	append: 		"append",
		//	prepend: 		"prepend",
		//	before: 		"before",
		//	after: 			"after",
		//	replaceWith: 	"replaceWith",
		//	remove: 		"remove",
		//	
		//	animate: 		"animate",
		//  css:			"css",
		//  height:			"height",
		//  width:			"width",
		//  offset:         "offset",
		//	
		//	ready: 			"ready",
		//	bind: 			"bind",
		//  unbind:			"unbind",
			
			ajax: function(url, options) {
				var
					params = options.data,
					reqParams = {},
					p
				;
				
				if(options.type === "delete" || options.type === "put") {
					options.headers["X-HTTP-Method-Override"] = options.type;
					options.data._method = options.type;
					options.type = "post";
				}
				
				// remove object parameters that must not be sent to the server
				if(!options.headers["Content-Type"] || options.headers["Content-Type"].indexOf("application/x-www-form-urlencoded") === 1) {
					for(p in params) {
						if(!params.hasOwnProperty(p) || params[p] === null) continue;
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
					create: options.create,
					complete: options.complete,
					success: options.success,
					error: options.error
				});
			},
			initApi: function(conf) {
				VD.init(conf);
				_VDinit = true;
			},
			api: function(url, options) {
				if(!_VDinit) {
					options.error(500, {errors:["API client not initialized"]});
					return false;
				}
				
				VD.api(
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
				options.error(500, {errors:["not implemented"]});
			},
			/*bind: function(eventName, callback) {
				if(eventName === "domLoaded") {
					eventName = "ready";
				}
				
				$(this).bind(eventName, callback);
			},
			unbind: function(eventName, callback) {
				if(eventName === "domLoaded") {
					eventName = "ready";
				}
				
				$(this).unbind(eventName, callback);
			},*/
			extend: $.extend,
			inArray: $.inArray,
			toJSON: JSON.stringify,
			parseJSON: $.parseJSON,
			trim: $.trim
		};})(jQuery));
	}
})();
// ------------------------------------------------------------------------------
// Tetra.js
//
// Prototype connector for libAbstracted module
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
	if(typeof Prototype !== "undefined") {
		
		delete(Array.prototype.toJSON);
		// Remove the dash from CSS properties and camel-case them
		function _toCamelCase(str) {
			return str.replace(/\-[a-z]/g, function(s){
				return s.toUpperCase().replace("-","");
			});
		}
		
		// Insert an element or array of elements into the dom. Expects an
		// element or an object that specifies the position e.g.
		//	{
		//		before: "ddfsdf"
		//	}
		function _insert(content, position) {
			for(var i = 0, len = this.length; i < len; i++) {
				var 
					targetContent = (typeof content === "string") ? content : $(content).clone(),
					targetNode = this[i]
				;
				
				if(!targetNode.insert) {
					targetNode = $(targetNode);
				}
				if(position) {
					var targetObj = {};
					targetObj[position] = targetContent;
					targetNode.insert(targetObj);		
				} else {
					targetNode.insert(targetContent);
				}
			}
			
			return this;
		}
		
		function _booleanFct(fct, arg) {
			if(!this || (!this.splice && !this[fct]) || this.length === 0 || (this.splice && !this[0][fct])) {
				return false;
			}
			if(this.splice) {
				for(var i = 0, len = this.length; i < len; i++) {
					if(this[i][fct].apply(this[i], arg)) return true;
				}
				return false;
			} else {
				return this[fct].apply(this, arg);
			}
		}
		
		function _chainableFct(fct, arg) {
			if(!this || (!this.splice && !this[fct]) || this.length === 0 || (this.splice && !this[0][fct])) {
				return this;
			}
			if(this.splice) {
				for(var i = 0, len = this.length; i < len; i++) {
					var elt = Element.extend(this[i]);
					elt[fct].apply(elt, arg);
				}
				return this;
			} else {
				return this[fct].apply(this, arg);
			}
		}

		// API client
		var _VDinit = false;
		
		if(!tns.libs) tns.libs = [];
		tns.libs.push({
			name: "Prototype",
			s: $,
			elm: function(domElm) {
				return Element.extend(domElm);
			},
			hasClass: function() {
				return _booleanFct.call(this, "hasClassName", arguments);
			},
			addClass: function() {
				return _chainableFct.call(this, "addClassName", arguments);
			},
			removeClass: function() {
				return _chainableFct.call(this, "removeClassName", arguments);
			},
			attr: function(name, value) {
				if(this && !this.splice) {
					if(typeof value === "undefined") { 
						return this.getAttribute(name);
					} else {
						this.setAttribute(name, value);
						return this;
					}
				}
				
				return null;
			},
			parents: function(selector) {
				var parents = (this && !this.splice && this.ancestors) ? this.ancestors() : [];
				
				if(selector) {
					for(var p = 0, len = parents.length; p < len;) {
						if(!parents[p].match(selector)) {
							parents.splice(p,1);
							len--;
						} else p++;
					}
				}
				
				return parents;
			},
			find: function() {
				return _chainableFct.call(this, "select", arguments);
			},
			is: function() {
				return _booleanFct.call(this, "match", arguments);
			},
			val: function(value) {
				if(typeof value === "undefined") { 
					return this.value;
				} else {
					this.value = value;
					return this;
				}
			},
			html: function(markup) {
				if(typeof markup === "undefined") { 
					return this.innerHTML;
				} else {
					this.innerHTML = markup;
					return this;
				}
			},
			serialize: function(getObj) {
				return this.serialize(getObj);
			},
			siblings: function() {
				return _chainableFct.call(this, "siblings", arguments);
			},
			prev: function() {
				return _chainableFct.call(this, "previous", arguments);
			},
			next: function() {
				return _chainableFct.call(this, "next", arguments);
			},
			append: function(content) {
				return _insert.call(this, content);
			},
			prepend: function(content) {
				return _insert.call(this, content, "top");
			},
			before: function(content) {
				if(this && this.length > 0) {
					return _insert.call(this, content, "before");
				}
				
				var div = document.createElement("div");
				div.innerHTML = content;
				
				return div.childNodes;			
			},
			after: function(content) { 
				if(this && this.length > 0) {
					return _insert.call(this, content, "after");
				} 
				
				var div = document.createElement("div");
				div.innerHTML = content;
				
				return div.childNodes;
			},
			replaceWith: 	function(content) {
				for(var i = 0, len = this.length; i < len; i++) {
					this[i].replace(content);
				}
				
				return this;
			},
			css: function() {
				var map = {};
				
				if(typeof arguments[0] === "string") {
					if(arguments.length === 1) {
						return this.getStyle(arguments[0]);
					}
					else if(arguments.length === 2) {
						map[_toCamelCase(arguments[0])] = arguments[1];
					}
				}
				
				if(typeof arguments[0] === "object") {
					for(var rule in arguments[0]) {
						map[_toCamelCase(rule)] = arguments[0][rule];
					}
				}
				
				if(map.hasOwnProperty("float")) {
					map.cssFloat = map["float"];
					delete map["float"];
				}
				this.setStyle(map);
				
				return this;
			},
			height: function() {
				return this.getHeight();
			},
			width: function() {
				return this.getWidth();
			},
			offset: function(coords) {
				return this.cumulativeOffset(coords);
			},
			remove: function() {
				for(var i = 0, len = this.length; i < len; i++) {
					this[i].remove();
				}
				
				return this;
			},
			animate: function() {
				var
					arg = arguments,
					properties = arg[0],
					duration = 400,
					easing = 'swing',
					complete
				;
				
				if(arg[1]) {
					if(typeof arg[1] === 'object') {
						if(arg[1].duration) duration = arg[1].duration;
						if(arg[1].easing) easing = arg[1].easing;
						if(arg[1].complete) complete = arg[1].complete;
					} else {
						duration = arg[1];
						if(arg[2]) easing = arg[2];
						if(arg[3]) complete = arg[3];
					}
				}
			
				// mapping with scriptaculous
				
			},
			ready: function(callback) {
				Event.observe(document, "dom:loaded", callback);
			},
			bind: function(eventName, callback) {
				if(this.splice) {
					for(var i = 0, len = this.length; i < len; i++) {
						Event.observe(this[i], eventName, callback);
					}
				} else {
					Event.observe(this, eventName, callback);
				}
			},
			unbind: function(eventName, callback) {
				if(eventName === "ready") {
					Event.stopObserving(document, "dom:loaded", callback);
					return;
				}
				
				if(this.splice) {
					for(var i = 0, len = this.length; i < len; i++) {
						Event.stopObserving(this[i], eventName, callback);
					}
				} else {
					Event.stopObserving(this, eventName, callback);
				}
			},
			ajax: function(url, options) {
				if(options.type === "delete" || options.type === "put") {
					options.headers["X-HTTP-Method-Override"] = options.type;
				}
				
				new Ajax.Request(url,
					{
						method: options.type,
						requestHeaders: options.headers,
						parameters: options.data,
						postBody: options.processData ? "" : options.data,
						onCreate: options.create,
						onComplete: options.complete,
						onSuccess: function(transport) {
							var respObj = transport.responseText;
							
							if (transport.responseJSON) {
								respObj = transport.responseJSON;
							}/*
							else if(transport.responseXML) {
								respObj = transport.responseXML;
							}*/
							
							options.success(respObj);	
						},
						onFailure: options.error
					});
			},
			initApi: function(conf) {
				VD.init(conf);
				_VDinit = true;
			},
			api: function(url, options) {
				if(!_VDinit) {
					options.error(500, {errors:["API client not initialized"]});
					return false;
				}
				
				VD.api(
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
				options.error(500, {errors:["not implemented"]});
			},
			extend: function(obj, mixin) {
				return (obj) ? Object.extend(obj, mixin) : mixin;
			},
			inArray: function(value, array) {
				return (array) ? array.indexOf(value) : -1;
			},
			toJSON: Object.toJSON,
			parseJSON: function(str) {
				return str.evalJSON();
			},
			trim: function(str) {
				return (str) ? str.strip() : "";
			}
		});
	}
})();
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
	return (function(libs) {
		
		var
			_exposedDOMFcts = ['attr', 'is', 'val', 'html', 'serialize', 'css', 'height', 'width', 'offset'],
			_exposedDOMFctsOnArray = ['hasClass', 'addClass', 'removeClass', 'append', 'prepend', 'before', 'after', 'replaceWith', 'remove', 'animate', 'bind', 'unbind', 'ready'],
			_exposedDOMFctsWithExtendedOutput = ['parents', 'find', 'siblings', 'prev', 'next'],
			_exposedHelpers = ['elm', 'ajax', 'initApi', 'api', 'initMysql', 'mysql', 'extend', 'toJSON', 'parseJSON', 'inArray', 'trim', 'render', 'send', 'jsonSend'],
			
			_helpers = {},
			
			_addDOMFct = function(list, elt, name, fct) {
				if(typeof fct !== 'undefined') list[name] = function() { return fct.apply(elt, arguments); };
				return list;
			},
			
			_addDOMFctWithExtendedOutput = function(list, elt, name, fct) {
				if(typeof fct !== 'undefined') list[name] = function() { return _(fct.apply(elt, arguments)); };
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
							domElm = Sizzle(selector);
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
						libFct = (typeof l[_exposedDOMFcts[f]] === "string") ? elt[l[_exposedDOMFcts[f]]] : l[_exposedDOMFcts[f]];
						_addDOMFct(elmFcts, elt, _exposedDOMFcts[f], libFct);
					}
					
					len = _exposedDOMFctsOnArray.length;
					for(var g = 0; g < len; g++) {
					   libFct = (typeof l[_exposedDOMFctsOnArray[g]] === "string") ? domElm[l[_exposedDOMFctsOnArray[g]]] : l[_exposedDOMFctsOnArray[g]];
						_addDOMFct(elmFcts, domElm, _exposedDOMFctsOnArray[g], libFct);
					}
					
					len = _exposedDOMFctsWithExtendedOutput.length;
					for(var h = 0; h < len; h++) {
					   libFct = (typeof l[_exposedDOMFctsWithExtendedOutput[h]] === "string") ? elt[l[_exposedDOMFctsWithExtendedOutput[h]]] : l[_exposedDOMFctsWithExtendedOutput[h]];
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
			
			// special event listener helpers
			var _convertEventName = function(eventName) {
				if(eventName === 'clickout') {
					return 'click';
				} else {
					var addEvent = !!document.addEventListener;
					if (!addEvent && eventName === 'focus') {
						return 'focusin';
					} else if (!addEvent && eventName === 'blur') {
						return 'focusout';
					}
				}
				return eventName;
			};
			
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
tetra.extend('dep', function(_conf, _mod, _) {
	
	requirejs.config({
	    //By default load any module IDs from js/lib
	    baseUrl: _conf.APPS_PATH,
	    enforceDefine: true,
		urlArgs: _conf.jsVersion ? 'v=' + _conf.jsVersion : '',
	    //except, if the module ID starts with "app",
	    //load it from the js/app directory. paths
	    //config is relative to the baseUrl, and
	    //never includes a ".js" extension since
	    //the paths config could be for a directory.
	    paths: {
	        g: _conf.GLOBAL_PATH,
	        comp: _conf.COMP_PATH
	    }
	});
	
	return {
		define: define,
		undef: requirejs.undef,
		require: require
	};
	
});
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

	// Simple JavaScript Templating
	// John Resig - http://ejohn.org/ - MIT Licensed
	(function(){
	  var
		cache = {},
		left = (_conf.tmpl && _conf.tmpl.left) ? _conf.tmpl.left : "{%",
		right = (_conf.tmpl && _conf.tmpl.right) ? _conf.tmpl.right : "%}",
		key = (_conf.tmpl && _conf.tmpl.right) ? _conf.tmpl.right[0] : "%",
		rg1 = new RegExp("'(?=[^" + key + "]*" + right + ")", "g"),
		rg2 = new RegExp(left + "[=-](.+?)" + right, "g")
	  ;
	  
	  this.tmpl = function tmpl(str, data, tag){
		
		try {
		    // Figure out if we're getting a template, or if we need to
		    // load the template - and be sure to cache the result.
		    var fn = !/\W/.test(str) ?
		      cache[str] = cache[str] ||
		        tmpl(document.getElementById(str).innerHTML) :
		     
		      // Generate a reusable function that will serve as a template
		      // generator (and which will be cached).
		      new Function("obj",
		        "var p=[],print=function(){p.push.apply(p,arguments);};" +
		       
		        // Introduce the data as local variables using with(){}
		        "with(obj){p.push('" +
		       
		        // Convert the template into pure JavaScript
		        /*str
		          .replace(/[\r\t\n]/g, " ")
		          .split("<%").join("\t")
		          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
		          .replace(/\t=(.*?)%>/g, "',$1,'")
		          .split("\t").join("');")
		          .split("%>").join("p.push('")
		          .split("\r").join("\\'")
		      + "');}return p.join('');");*/
		        str.replace(/[\r\t\n]/g, " ")
				   .replace(rg1,"\t")
				   .split("'").join("\\'")
				   .split("\t").join("'")
				   .replace(rg2, "',$1,'")
				   .split(left).join("');")
				   .split(right).join("p.push('")
			  + "');}return p.join('');");
		    
		    // Provide some basic currying to the user
		    return data ? fn( data ) : fn;
		} catch(err) {
		    if(typeof console !== "undefined") {
		        console.error(err.message, err);
		    }
		    
		    return "";
		}
	  };
	})();
	
	var
		_tmplStack = {},
		
		_component = function(uid, scope, ctrl, parentid) {
			return function(actionName, data, ctrlName) {
				if(!data) data = {};
				if(!ctrlName && ctrl) ctrlName = ctrl;
				
				if(_tmplStack[uid]) {
					var
						id = ctrlName ? 'tmpl_' + ctrlName + '_' + actionName : 'tmpl_' + actionName,
						cid = parentid? parentid + '_' + _tmplStack[uid].comp[parentid].countid++ : id + '_' + _tmplStack[uid].countid++
					;
					
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
			
			if(_tmplStack[uid].count == 0) {
				
				// Render the full template
				_tmplStack[uid].countid = 0;
				html = tmpl(_tmplStack[uid].id, _tmplStack[uid].data);
				
				if(_tmplStack[uid]) {
					// Return generated html to the view callback
					_tmplStack[uid].cbk(html);
					
					// Remove template from stack
					delete _tmplStack[uid];
				}
				
			} else if(isComp) {
				
				var
					comp = _tmplStack[uid].comp[cid]
				;
				
				// Evaluate the component of all his children are available
				if(comp.html === false && comp.count == 0) {
					_tmplStack[uid].comp[cid].countid = 0;
					comp.html = tmpl(comp.id, comp.data);
					_tmplStack[uid].count--;
				}
				
				// Render the parent template
				if(comp.html !== false) {
					if(comp.parentid) {
						_render(uid, comp.parentid, ctrl, true);
					} else {
						_render(uid, undefined, ctrl, false);
					}
				}
			}
		}
	;
	
	return function(template, data, callback, scope, uid, cid) {
		var
			now = new Date(),
			tpl = template.split('/'),
			id = (/\W/.test(template.replace('/',''))) ? template : (tpl.length == 1) ? 'tmpl_' + tpl[0] : 'tmpl_' + tpl[0] + '_' + tpl[1],
			cid = cid ? cid : id,
			isComp = (uid && _tmplStack[uid].comp[cid] && _tmplStack[uid].comp[cid].html === false),
			html = ""
		;
		
		// Break when the template is not in the DOM
		if(document.getElementById(id) === null && !/\W/.test(id)) {
			throw new Error("the HTML template '"+ id +"' is missing in the DOM.");
		}
		
		// Initialize the root template on the stack
		if(!uid) {
			uid = cid + '_' + now.getTime();
			_tmplStack[uid] = {id: id, data: data, comp: {}, count: 0, countid: 0, cbk: callback};
		}
		
		// Process the current template
		data.component = _component(uid, scope, tpl[0], isComp ? cid : undefined);
		html = tmpl(id, data);
		
		if(_tmplStack[uid]) {
			
			// Store directly evaluated template
			if(isComp) {
				var
					comp = _tmplStack[uid].comp[cid]
				;
				
				if(comp.count == 0) {
					_tmplStack[uid].comp[cid].html = html;
					if(_tmplStack[uid].comp[cid].parentid) {
						_tmplStack[uid].comp[_tmplStack[uid].comp[cid].parentid].count--;
					}
					_tmplStack[uid].count--;
				}
			}
			
			// Try to render after each evaluation
			_render(uid, cid, (tpl.length == 1) ? tpl[0] : undefined, isComp);
		}
	};
	
});
// ------------------------------------------------------------------------------
// Tetra.js
// Native view functions of Tetra.js
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
tetra.extend('view', function(_conf, _mod, _) {
	
	var
		_views = {}, // view objects
		_comp = {}, // loaded components
		_debug
	;
	
	
	// Event listeners
	// --------------------
	var
		_listenedEvents = {},
		
		_windowEvents = {},
		
		_nonBubblingEvents = {
			change: ['input', 'select'],
			submit: ['form'],
			scroll: ['div', 'textarea', 'ul'],
			select: ['input']
		},
		
		_nonBubblingLimited = {
			change: true,
			submit: true,
			select: true
		},
		
		_mouseout = {},
		_clickout = {},
		
		_isBubblingSupported = function(eventName) {
			var elm = document.createElement('div');
			eventName = 'on' + eventName;
			
			var isSupported = (eventName in elm);
			if (!isSupported) {
				elm.setAttribute(eventName, 'return;');
				isSupported = (typeof elm[eventName] === 'function');
			}
			
			elm = null;
			return isSupported;
		},

		_callClickout = function(e, target) {
			
			var
				viewName,
				thisView,
				selector,
				elm,
				isCurClass,
				hasParents
			;

			// call clickout callbacks
			for(viewName in _clickout) {
				for(selector in _clickout[viewName]) {
					if(_clickout[viewName][selector]) {
						thisView = _views[viewName];

						if(_.toggleLib) _.toggleLib(thisView.has_);
						
						isCurClass = _(e.target).hasClass('cur-clickout');
						hasParents = _(e.target).parents('.cur-clickout').length > 0;
						
						if(!isCurClass && !hasParents) {
							elm = _(selector + '.cur-clickout');
							_mod.debug.log('view ' + viewName + ' : call clickout callback on ' + selector, thisView.scope, 'info');
							elm.removeClass('cur-clickout');
							thisView.events.user.clickout[selector](e,(thisView.has_) ? elm : _(elm[0])[0]);
						}
						
						_clickout[viewName][selector] = false;
					}
				}
			}
		},
		
		_callEventListener = function(e, target, boot) {
			
			var
				eventName = e.type,
				found = false,
				listenedEvents
			;
			
			if (eventName === 'click' && e.button && e.button === 2) { 
				return;
			}
			
			if (eventName === 'focusin') {
				eventName = 'focus';
			}
			else if (eventName === 'focusout') {
				eventName = 'blur';
			}
			
			boot = (typeof boot === 'undefined') ? true : false;
			
			if(!boot) { 
				_mod.debug.log('view : call ' + eventName + ' listener', 'all', 'info');
			}
			
			listenedEvents = _listenedEvents[eventName];
			if(typeof listenedEvents !== 'undefined' && listenedEvents.length > 0) {
				var 
					emptyFnc = function(){},
					elm,
					path,
					m
				;
				
				for(var i = 0, len = listenedEvents.length; i < len; i++) {
					var
						viewName = listenedEvents[i],
						thisView = _views[viewName],
						userEvents,
						mouseOverCalled = false,
						from, fromTarget
					;
					
					if((typeof thisView.root === 'undefined' && e.target.tagName !== 'HTML' && e.target.parentNode && e.target.parentNode.tagName) ||
							(target.parents('#' + thisView.root).length > 0)) {
						
						if(eventName === 'click') {
							_callClickout(e, target);
						}

						userEvents = thisView.events.user[eventName];
						for(var selector in userEvents) {
							if(userEvents.hasOwnProperty(selector)) {
								elm = target;
								if(typeof elm.is === 'function' && !elm.is(selector)) {
									if(typeof elm.parents === 'function') {
										elm = elm.parents(selector);
										elm = (elm.length > 0) ? _(elm[0]) : false;
									}
								}
								
								if(elm) {
									
									// init clickout callback
									if(eventName === 'click') {
										
										if(typeof thisView.events.user.clickout !== 'undefined' &&
											typeof thisView.events.user.clickout[selector] !== 'undefined' &&
											(!elm.hasClass('cur-clickout') || typeof _clickout[viewName] === 'undefined' || typeof _clickout[viewName][selector] === 'undefined')) {
											
											if(!_clickout[viewName]) _clickout[viewName] = {};
											if(!_clickout[viewName][selector]) _clickout[viewName][selector] = true;

											elm.addClass('cur-clickout');
										}
									}
									
									// mouseover spam removing (equivalent to mouseenter)
									else if(eventName === 'mouseover') {
										if(_.toggleLib) _.toggleLib(thisView.has_);
										
										if(elm.hasClass('cur-mouseover') && elm.hasClass('cur-mouse-'+ viewName.replace('/', '-'))) {
											elm = false;
										} else {
											if(typeof thisView.events.user.mouseout !== 'undefined' && 
												typeof thisView.events.user.mouseout[selector] != 'undefined') {
												elm.addClass('cur-mouseover').addClass('cur-mouse-'+ viewName.replace('/', '-'));
											}
										}
									}
									
									// mouseout spam removing (equivalent to mouseleave)
									else if (eventName === 'mouseout') {
										from = e.relatedTarget || e.toElement;
										fromTarget = _(from);

										// continue if mouse is in browser
										if(from && from.nodeName !== "HTML") {

											// clean event if mouse is in mouseover element
											if(fromTarget.hasClass('cur-mouseover') || fromTarget.parents('.cur-mouseover').length > 0) {
												elm = false;
											} else {
												elm.removeClass('cur-mouseover').removeClass('cur-mouse-'+ viewName.replace('/', '-'));
											}
										}
									}
									
									// scroll event cleaning on parent element
									else if (eventName === 'scroll') {
										if(!target.is(selector)) elm = false;
									}
									
								}
								
								if(elm) {
									// TODO Lot of matching and DOM access here
									if(!(target.hasClass('no-prevent') || target.parents('.no-prevent').length > 0 || elm.is('body') || 
											((elm.is('input') || elm.is('textarea')) &&
											(eventName === 'keydown' || elm.attr('type') === 'checkbox' ||
											elm.attr('type') === 'radio')))) {
										e.preventDefault();
									}
									
									_mod.debug.log('view ' + viewName + ' : call ' + eventName +
											' callback on ' + selector, thisView.scope, 'info');
									
									if(!thisView.has_) {
										elm = _(elm[0])[0];
									}
									
									if(_.toggleLib) _.toggleLib(thisView.has_);
									
									userEvents[selector](e, elm);
									
									found = true;
								}
							}
						}
					}
				}
				
				if (boot && !found) {
					_callBootnode(e, target);
				}
			} else if (boot) {
				_callBootnode(e, target);
			}
		},
		
		_convertEventName = function(eventName) {
			if(eventName === 'clickout') {
				return 'click';
			} else {
				var addEvent = !!document.addEventListener;
				if (!addEvent && eventName === 'focus') {
					return 'focusin';
				} else if (!addEvent && eventName === 'blur') {
					return 'focusout';
				}
			}
			return eventName;
		},
		
		_bindEvent = function(elm, eventName, callback) {
            eventName = _convertEventName(eventName);
			// Special case for focus and blur under modern browsers
			if(eventName === 'focus' || eventName === 'blur') {
				document.addEventListener(eventName, callback, true);
			} else {
				_(elm).bind(eventName, callback);
			}
		},
		
		_unbindEvent = function(elm, eventName, callback) {
            eventName = _convertEventName(eventName);
			// Special case for focus and blur under modern browsers
			if(eventName === 'focus' || eventName === 'blur') {
				document.removeEventListener(eventName, callback, true);
			} else {
				_(elm).unbind(eventName, callback);
			}
		},
		
		_eventListenerCallback = function(e){
			_callEventListener(e, _(e.target));
		},
		
		_addEventListener = function(eventName) {
		    if(eventName === 'clickout') {
		        eventName = 'click';
            }
			
			if(typeof _listenedEvents[eventName] === 'undefined') {
				_listenedEvents[eventName] = [];
				
				if(typeof _nonBubblingEvents[eventName] !== 'undefined' &&
						(typeof _nonBubblingLimited[eventName] === 'undefined' || !_isBubblingSupported(eventName))) {
				    
					if(_conf.domLoaded) {
						_addNonBubblingEventListener(eventName);
					} else {
						_(document).ready(function(){
							_addNonBubblingEventListener(eventName);
						});
					}
				} else {
					_bindEvent(document, eventName, _eventListenerCallback);
				}
				
				_mod.debug.log('view : now listening ' + eventName, 'all', 'info');
			}
		},
		
		_addNonBubblingEventListener = function(eventName, elements) {
			if(typeof elements === 'undefined') {
				elements = _('body').find(_nonBubblingEvents[eventName].join(','));
			}
			for(var i = 0, len = elements.length; i < len; i++) {
				_bindEvent(elements[i], eventName, _eventListenerCallback);
			}
		},
		
		_removeNonBubblingEventListener = function(eventName, elements) {
			if(typeof elements === 'undefined') {
				elements = _('body').find(_nonBubblingEvents[eventName].join(','));
			}
			for(var i = 0, len = elements.length; i < len; i++) {
				_unbindEvent(elements[i], eventName, _eventListenerCallback);
			}
		},
		
		_customNonBubblingEventListener =  function(eventName, elements) {
			if(_conf.domLoaded && typeof _nonBubblingEvents[eventName] !== 'undefined' &&
				(typeof _nonBubblingLimited[eventName] === 'undefined' || !_isBubblingSupported(eventName))) {
				
				_addNonBubblingEventListener(eventName, elements);
			}
		}
	;
	
	
	// Bootnode feature
	// --------------------
	var
		_bootnodeEvents = _conf.bootnodeEvents,
		
		_callBootnode = function(e, target) {
			var 
				bootnode,
				viewName,
				compName,
				appPath,
				eventName,
				ev
			;
			
			// Retrict loading to the events defined in the array _bootnodeEvents
			if(e.type && e.target.parentNode && e.target.parentNode.tagName && _.inArray(e.type.toLowerCase(), _bootnodeEvents) !== -1) {
				bootnode = target.hasClass('bootnode') ? target : target.parents('.bootnode');
				if (bootnode.length > 0) {
					viewName = bootnode.attr('data-view');
					compName = bootnode.attr('data-comp');
					eventName = e.type;
					
					ev = _.extend({}, e);
					ev.type = eventName;
					ev.preventDefault = function(){};
					
					if(typeof viewName != 'undefined') {
						if(bootnode.attr('data-event') === eventName && typeof _views[viewName] === 'undefined') {
							e.preventDefault();
							
							bootnode.addClass('loading');

							appPath = viewName.split('/');
							
							_mod.dep.require([appPath[0] +'/view/'+ appPath[1] +'.ui'], function() {
								bootnode.removeClass('loading');
								_callEventListener(ev, target, false);
							});
						}
					} else if(typeof compName != 'undefined') {
						if(bootnode.attr('data-event') === eventName && typeof _comp[compName] === 'undefined') {
							_comp[compName] = true;
							
							bootnode.addClass('loading');
							_mod.dep.require(['comp/'+ compName], function() {
								bootnode.removeClass('loading');
								_callEventListener(ev, target, false);
							});
						}
					}
				}
			}
		},
		
		_initBootnode = function() {
			for(var i = 0, len = _bootnodeEvents.length; i < len; i++) {
				_addEventListener(_bootnodeEvents[i]);
			}
		}
	;
	
	
	// DEBUG functions
	// --------------------
	_debug = function(scope) {
		return _mod.pipe.appBuilder('view', scope);
	};

	_debug.retrieve = function(scope, name) {
		return _views[scope + "/" + name];
	};
	
	_debug.list = function() {
		var list = {};
		for(var name in _views) {
			if(_views.hasOwnProperty(name)) {
				_mod.debug.log(_views[name].scope + ' / ' + name);
				if(typeof list[_views[name].scope] === 'undefined') {
					list[_views[name].scope] = [];
				}
				list[_views[name].scope].push(name);
			}
		}
		return list;
	};
	
	_debug.msg = function(viewName) {
		var 
			msgs = [],
			controllerEvents = _views[viewName].events.controller
		;
		for(var msg in controllerEvents) {
			if(controllerEvents.hasOwnProperty(msg)) {
				_mod.debug.log(msg);
				msgs.push(msg);
			}
		}
		return msgs;
	};
	
	_debug.man = function() {
		_mod.debug.log('Tetra.js ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		_mod.debug.log('> View specs:');
		_mod.debug.log('		- notify app views as a controller		> tetra.debug.view(scope).notify(message, data)');
		_mod.debug.log('		- list all views and their scope		> tetra.debug.view.list()');
		_mod.debug.log('		- list all controller messages listened > tetra.debug.view.msg(viewName)');
		_mod.debug.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		
		return true;
	};
	
	
	// Instantiation
	// --------------------
	var Builder = function(params) {
		var 
			me = this,
			has_ = (params.constr.length > 2)
		;
		
		if(_.toggleLib) _.toggleLib(has_);
		
		var
			app = _mod.pipe.appBuilder('controller', params.scope),
			constr = params.constr(this, app, _)
		;
		
		this.has_ = has_;
		this.scope = params.scope;
		this.root = params.root;
		this.events = constr.events;
		this.methods = constr.methods;
		this.listen = _customNonBubblingEventListener;
		
		return this;
	};
	
	
	// Registers a view when *all* its dependencies have been loaded.
	var _register =  function(viewName, params) {
		
		_views[viewName] = new Builder(params);			
		
		_mod.debug.log('view ' + viewName + ' : registered', _views[viewName].scope, 'info');
		
		var eventName;
		if(_views[viewName].events.user) {
			var userEvents = _views[viewName].events.user;
			for(eventName in userEvents) {
				if(userEvents.hasOwnProperty(eventName)) {
					_addEventListener(eventName, viewName);
					
					_mod.debug.log('view ' + viewName + ' : listening ' + eventName, _views[viewName].scope, 'info');
					if(eventName !== 'clickout') _listenedEvents[eventName].push(viewName);
				}
			}
		}
		
		if(_views[viewName].events.window) {
			var windowEvents = _views[viewName].events.window;
			for(eventName in windowEvents) {
				if(windowEvents.hasOwnProperty(eventName)) {
					if(typeof _windowEvents[eventName] === 'undefined') { 
						_windowEvents[eventName] = [];
					}
					
					_bindEvent(window, eventName, windowEvents[eventName]);
					
					_mod.debug.log('view ' + viewName + ' : listening ' + eventName, _views[viewName].scope, 'info');
					_windowEvents[eventName].push(viewName);
				}
			}
		}
		
		if(typeof _views[viewName].methods !== 'undefined' &&
				typeof _views[viewName].methods.init !== 'undefined') {
			if(!_conf.hasOwnProperty("disableViewInit") || !_conf.disableViewInit) {
				_views[viewName].methods.init();
			} 
		}
		
		return _views[viewName];
	};
	
	
	// Initialisation of environnement
	// --------------------
	
	// Verify whether the domLoaded event has been fired. Resolves an issue where models were not loaded as the
	// event had already been fired; we now instead check on the value of this boolean.
	if(_conf.env !== 'Node') {
		_(document).ready(function(){
			_conf.domLoaded = true;
		});
	}
	
	// Default Listeners
	if(_conf.enableBootnode) {
		_initBootnode();
	}
	
	
	// Interface implementation
	// --------------------
	return {
		
		register: function(name, params) {
			// Registers a view
			// Note that at a minimum a view must be given a name, and a params object literal with
			// the following structure
			//
			// {
			//	scope: 'theScope',
			//  constr: function(me, app) {
			//		return {
			//			events: {}
			//		};
			//  }
			// }
			
			var
				viewName = params.scope + '/' + name
			;
			
			if(!name || !params) {
				throw new Error(
						"tetra.view.register(name, params) : " + 
						"name and params are both required arguments");
			}
			
			if(!params.hasOwnProperty('scope') || !params.hasOwnProperty('constr')) {
				throw new Error(
						"tetra.view.register(name, params) : " + 
						"params must define a scope attribute and a constr method");
			}
			
			if(_views[viewName]) {
				throw new Error(
						"A view with the scope/name " + viewName + " already exists");
			}
			
			var deps = [];
			if(typeof params.use !== 'undefined') {
				for(var i = 0, len = params.use.length; i < len; i++) {
					deps.push(params.scope +'/controller/'+ params.use[i] +'.ctrl');
				}
			}
			
			_mod.dep.define(params.scope + '/view/' + name +'.ui', deps, function(require) {
				_register(viewName, params);
			});
			
			_mod.dep.require([params.scope + '/view/' + name +'.ui']);
		},
		
		destroy: function(name, scope) {
			var 
				viewName = scope + '/' + name,
				events,
				isBubbling,
				i,
				len
			;
			
			for(var eventName in _listenedEvents) {
				if(_listenedEvents.hasOwnProperty(eventName)) {
					events = _listenedEvents[eventName];
					
					isBubbling = true;
					if((typeof _nonBubblingEvents[eventName] !== 'undefined') &&
							(typeof _nonBubblingLimited[eventName] === 'undefined' || !_isBubblingSupported(eventName))) {
						isBubbling = false;
					}
						
					for(i = 0, len = events.length; i < len; i++) {
						if(events[i] === viewName) {
							if(!isBubbling) {
								_removeNonBubblingEventListener(eventName);
							}
							events.splice(i,1);
						}
					}
					
					if(!isBubbling && _listenedEvents[eventName].length === 0) { 
						delete _listenedEvents[eventName];
					}
				}
			}
			
			for(eventName in _windowEvents) {
				if(_windowEvents.hasOwnProperty(eventName)) {
					events = _windowEvents[eventName];
					for(i = 0, len = events.length; i < len; i++) {
						if(events[i] === viewName) {
							_unbindEvent(window, eventName, _views[viewName].events.window[eventName]);
							events.splice(i,1);
						}
					}
				}
			}
			
			_mod.dep.undef(scope + '/view/' + name +'.ui');
			
			delete _views[viewName];
		},
		
		// Notifies all views in the given scope with the message/data, as if we were a controller
		notify: function(message, data, scope) {
			var view, viewScope, viewController;
			
			for(var name in _views) {
				if(_views.hasOwnProperty(name)) {
					view = _views[name];
					viewScope = view.scope;
					
					if(view.events.controller) {
						viewController = view.events.controller;
							
						if(viewScope === scope &&
								typeof viewController !== 'undefined' && 
								typeof viewController[message] !== 'undefined') {
							
							_mod.debug.log('view ' + name + ' : exec ' + message, scope, 'info');
							
							if(_.toggleLib) _.toggleLib(view.has_);
							
							viewController[message](data, _mod.pipe.appBuilder('controller', scope));
						}
					}
				}
			}
		},
		
		debug: _debug
	};
});

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
		    var ctrl = _controllers[scope + "/" + name];
		    if(ctrl) {
		        ctrl.actions = _actions[scope + "/" + name];
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
			_mod.debug.log('		- notify app controllers as a view		> tetra.debug.ctrl.app(scope).notify(message, data)');
			_mod.debug.log('		- notify all as a controller			> tetra.debug.ctrl.page.notify(message, data)');
			_mod.debug.log('		- list all controllers with their scope	> tetra.debug.ctrl.list()');
			_mod.debug.log('		- list all view messages listened		> tetra.debug.ctrl.msg(ctrlName)');
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
		this.events = constr.events;
		this.methods = constr.methods;
		
		_actions[ctrlName] = constr.actions;
		
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
		//	scope: 'theScope',
		//  constr: function(me, app, page, orm) {
		//		return {
		//			events: {}
		//		};
		//  }
		// }
		register: function(name, params) {
			
			if(_conf.env === 'Node') params.scope = 'node';
			
			var
				ctrlName = params.scope + '/' + name
			;
			
			if(!name || !params) {
				throw new Error(
						"tetra.controller.register(name, params) : " + 
						"name and params are both required arguments");
			}
			
			if(!params.hasOwnProperty('scope') || !params.hasOwnProperty('constr')) {
				throw new Error(
						"tetra.controller.register(name, params) : " + 
						"params must define a scope attribute and a constr method");
			}

			if(_controllers[ctrlName]) {
				throw new Error(
						"A controller with the scope/name " + ctrlName + " already exists");
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
			if(typeof ctrlName != 'string') {
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
					if (!template) template = defaultTmpl;
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

// ------------------------------------------------------------------------------
// Tetra.js
// Native model functions of Tetra.js
// -------------------------------------------------------------------------------
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
tetra.extend('model', function(_conf, _mod, _) {
	
	var
		_models = {}, // model definitions
		_classes = {}, // model classes
		_debug
	;
	
	
	// ORM
	// Manage ajax requests and operations on objects
	// ------------------------------------------------------------------------------
	tetra.extend('orm', function(_conf, _mod, _) {
		
		// Caching module used in Node.js environnement
		if(typeof _mod.cache !== 'undefined') {
			var cache = _mod.cache;
		}
		
		// Special data management system for API or in Node.js environnement
		if(_conf.api) {
			_.initApi(_conf.api);
		} else if(_conf.mysql) {
			_.initMysql(_conf.mysql);
		}
		
		// ORM helpers
		var
			_isJSON = function(data) {
			    data = _.trim(data);
			    if(!data || data.length === 0) {
			        return false;
			    }
				return (/^[\],:{}\s]*$/
		                		.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
		                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
		                        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
			},
			
			_successCbk = function(cbk) {
				return function(respObj) {
					if(typeof respObj === 'string') {
						if (_isJSON(respObj)) {
							respObj = JSON.parse(respObj);
						}
					}
					cbk(respObj);
				};
			},
			
			_errorCbk = function(cbk, cbk401) {
				return function(resp) {
					var respObj;
					if (_isJSON(resp.responseText)) {
						respObj = JSON.parse(resp.responseText);
					}
					cbk(resp.status, respObj ? respObj : {});
					
					if(resp.status === 401 || resp.status === 403) {
						cbk401(resp);
					}
				};
			}
		;
		
		// AJAX REQUESTER
		var _requester = (function() {
		
			var
				stack = [],
				requesting = false
			;
			
			var proceed = function() {
				if(!requesting && stack.length > 0) {
					_requester.request(stack[0].src, stack[0].url, stack[0].options);
					stack.shift();
				}
			};
		
			return {
				queue: function(src, url, options) {
					if(_conf.env === 'Node') {
						_requester.request(src, url, options);
					} else {
						stack.push({src: src, url: url, options: options});
						proceed();
					}
				},
				
				request: function(src, url, options){
					
					if(_.toggleLib) _.toggleLib(true);
					
					var defaultOptions = {};
					
					requesting = true;
					tetra.currentRequest = function(){
						_requester.queue(src, url, options);
						if(_conf.currentRequestCallback) {
							_conf.currentRequestCallback();
						}
					};
					
					if(_conf.env === 'Node' && _conf.api && _conf.api.access_token) {
						defaultOptions = {
							data : {
								access_token: _conf.api.access_token
							}
						};
					} else {
						defaultOptions = {
							processData: (options.headers['Content-Type'] && options.headers["Content-Type"].indexOf("application/json") === 0) ? false : true,
							create : function(req) {
								src.model.notify('call')({
									req: req,
									obj: src.obj ? src.obj : {}
								});
							},
							complete : function(req) {
								src.model.notify('complete')({
									req: req,
									obj: src.obj ? src.obj: {}
								});
								requesting = false;
								proceed();
							}
						};
					}
					
					if(typeof _conf.authCallback !== 'undefined') {
						defaultOptions.error401 = _conf.authCallback;
					}
					
					defaultOptions.success = _successCbk(options.success);
					defaultOptions.error = _errorCbk(options.error, defaultOptions.error401);
					
					if(src.model.type === 'ajax') {
						return _.ajax(url, _.extend(options, defaultOptions));
					} else if(src.model.type === 'api') {
						return _.api(url, _.extend(options, defaultOptions));
					} else if(src.model.type === 'mysql') {
						return _.mysql(url, _.extend(options, defaultOptions));
					}
					
					return false;
				}
			};
		})();
		
		return function(scope) {
			
			return function(name) {
				
				var
					model = _models[scope +'/'+ name] || _models['g/'+ name]
				;
				
				var			
					_create = function(attributes, skipValid, skipCache) {
						var classes = _classes[scope +'/'+ name] || _classes['g/' + name];
						var obj = new classes();
						obj.update(attributes, skipValid);
						
						model.objects[obj.get('ref')] = obj;
						if((obj.get('id') !== 0)) {
							model.ids[obj.get('id')] = obj.get('ref');
						
							if(cache && (typeof skipCache === 'undefined' || (typeof skipCache !== 'undefined' && !skipCache))) {
								var cacheKey = 'NODE:' + scope +'-'+ name + '-id-' + obj.get('id');
								cache.set(cacheKey, attributes, _conf.cacheTimeout, function(err, data) {
									if(_conf.env === 'Node') _mod.debug.log('ORM: SAVE: store "' + cacheKey + '"', 'all', 'log', attributes);
								});
							}
						}
	
						_mod.debug.log('model ' + scope +'/'+ name + ' : object ' + obj.get('ref') + ' created', 'all', 'info');
						
						_notify('create')(obj);
						return obj;
					},
					
					// Saves the object to the server
					_save = function(attributes, success) {
						
						var
							id = attributes.id,
							obj = model.objects[attributes.ref]
						;
						
						// Directly notify controllers
						_notify('save')(obj);
						
						_requester.queue({model:this, obj:obj}, _buildUrl(model.req.save, attributes), {
							type : model.req.save.method,
							headers : model.req.save.headers,
							data : _buildData(model.req.save, attributes),
							success : function(respObj){
								
								// A successful save response should have the following format: 
								// 
								//	{
								//		status: "SUCCESS",
								//		data: {
								//			59: {"id": 59, ...}
								//		}
								//	}
								//
								// In the case of a problem other than a server error/404, the correct response
								// format is as below. The alerts object should contain the list of attributes that have provoked
								// the fail, along with an associated error message:
								//
								//	{
								//		status: "FAIL",
								//		data: {
								//			59: {"id": 59, ...}
								//		},
								//		alerts: {
								//	  	"attr1": "alert message 1",
								//	  	"attr2": "alert message 2"
								//		}
								//	}
	
								// An empty or undefined response is valid for a SAVE
								respObj = respObj || {};
								
								if(typeof respObj === 'string') {
									respObj = {
										status: 'SUCCESS', 
										data: {
											"0": {
												html: respObj
											}
										}
									};
								}
	
								if(respObj.status === 'FAIL') {
									_notify('alert')({
										type: 'save',
										alerts: respObj.alerts ? respObj.alerts : {}, obj: obj
									}, respObj);
								} else {
									if(typeof respObj.data !== 'undefined') {
										
										// Get object
										for(var objId in respObj.data) { break; }
										
										if(typeof objId !== 'undefined') {
											
											// Manage object creation case
											// TODO Viadeo specific thing here
											if(id === 0) {
												// Clean model cache
												model.cache = {};
	
												// Update object id
												obj.set('id', objId);
												model.ids[obj.get('id')] = obj.get('ref');
												
												if(cache) {
													attributes.id = objId;
													var cacheKey = 'NODE:' + scope +'-'+ name + '-id-' + obj.get('id');
													cache.set(cacheKey, attributes, _conf.cacheTimeout, function(err, data) {
														if(_conf.env === 'Node') _mod.debug.log('ORM: SAVE: store "' + cacheKey + '"', 'all', 'log', attributes);
													});
												}
											}
											
											// Update object and confirm creation
											obj.update(respObj.data[objId]);
										}
									}
									
									if(typeof success !== 'undefined') {
										success(obj, respObj);
									} else {
										_notify('saved')(obj, respObj);
									}
								}
							},
							error : function(code, respObj) {
								// A server error response should ideally have the following format:
								// 
								//	{
								//		status: "FAIL",
								//		errors: [
								//		"error message x",
								//		"error message y"
								//		]
								//	}
								_notify('error')({
									type: 'save',
									errorCode: code,
									errors: respObj.errors ? respObj.errors : [],
									obj: obj
								}, respObj);
								obj.revert();
							}
						});
					},
					
					_fetch = function(cond, success, that) {
						
						// Directly notify controllers
						_notify('fetch')(cond);
						
						var uriParams = cond.uriParams;
						_requester.queue({model:(that)?that:this}, _buildUrl(model.req.fetch, cond), {
							type : model.req.fetch.method,
							headers : model.req.fetch.headers,
							data : _buildData(model.req.fetch, cond),
							success : function(respObj){
								//	{
								//		status: "SUCCESS",
								//		data: {
								//			4: {},
								//			9: {},
								//			37: {}
								//		},
								//		count: 3
								//	}
								//
								// or manage custom format using model.req.fetch.parser(resp, col) in your class definition
								
								// Build result collection
								if(respObj && (!respObj.status || respObj.status !== "FAIL")) {
									var 
										ids = [],
										col = [], 
										data
									;
									
									if(typeof model.req.fetch.parser !== 'undefined') {
										if(uriParams) cond.uriParams = uriParams;
										data = model.req.fetch.parser(respObj, {}, cond);
										respObj = {data: data, count:(respObj && respObj.count) ? respObj.count : 0};
									} else if(model.req.type === 'mysql') {
										var i = 0;
										data = {};
										for(; i < respObj.length; i++) {
											data[respObj[i][model.req.dbTable.id]] = respObj[i];
										}
										respObj = {data: data};
									}
									for(var id in respObj.data) {
										if(respObj.data.hasOwnProperty(id)) {
											ids.push(id);
											respObj.data[id].id = id;
											col.push(_create(respObj.data[id]));
										}
									}
									
									/* Store id list in cache */
									if(_conf.env === 'Node') delete cond.access_token;
									cond.uriParams = uriParams;
									var condSign = JSON.stringify(cond);
									
									if(_conf.env === 'Node') _mod.debug.log('ORM: FETCH ' + scope +'/'+ name + ' with cond: ' + condSign, 'all', 'log');
	
									if(cache) {
										var cacheKey = 'NODE:' + scope +'-'+ name + '-req-' + condSign;
										cache.set(cacheKey, ids, _conf.cacheTimeout, function(err, data) {
											if(_conf.env === 'Node') _mod.debug.log('ORM: FETCH: store "' + cacheKey + '"', 'all', 'log', ids);
										});
									} else {
										model.cache[condSign] = ids;
									}
								
									// Store meta data in model
									if(typeof respObj !== "string") {
										for(var key in respObj) {
											if(respObj.hasOwnProperty(key)) {
												if(key !== 'status' && key !== 'data' &&
														key !== 'alerts' && key !== 'errors') {
													model.meta[key] = respObj[key];
												}
											}
										}
									}
									
									if(typeof success !== 'undefined') {
										success(col);
									} else {
										_notify('append')(col);
									}
								} else {
									cond.uriParams = uriParams;
									_notify('alert')({
										type: 'fetch',
										alerts: respObj && respObj.alerts ? respObj.alerts : {},
										cond: cond
									}, respObj);
								}
							},
							error : function(code, respObj) {
								//  {
								//		status: "FAIL",
								//		errors: [
								//			"error message x",
								//			"error message y"
								//		]
								//  }
								cond.uriParams = uriParams;
								_notify('error')({
									type: 'fetch',
									errorCode: code,
									errors: respObj && respObj.errors ? respObj.errors : [],
									cond: cond
								}, respObj);
							}
						});
					},
					
					// Retrieve an object by its id (returned by the server). Note that you must chain a call
					// to _find to a success callback
					_find = function(id, success) {
						if(typeof model.ids[id] === 'undefined') {
							var that = this;
							_fetch({id: id}, (success) ? function(col){ success(col[0]); } : undefined, that);
						} else {
							success(model.objects[model.ids[id]]);
						}
					},
					
					// Retrieve an object by its reference (generated by tetra.js). Will return the object, so no need
					// for a success callback
					_findByRef = function(ref, success) {
						success(model.objects[ref] || null);
					},
					
					// Retrieve a local object by passing in a cond object
					// that represents the expected structure and values of the
					// object in question. Again, should chain to a success callback
					_findByCond = function(cond, success) {
						var 
							col = [],
							objs = model.objects,
							match
						;
						for(var ref in objs) {
							if(objs.hasOwnProperty(ref)) {
								match = true;
								for(var key in cond) {
									if(cond.hasOwnProperty(key)) {
										if(objs[ref].get(key) != cond[key]) {
											match = false;
											break;
										}
									}
								}
								if(match) {
									col.push(objs[ref]);
								}
							}
						}
						
						if(col.length <= 1) {
							success(col[0] || null);
						} else {
							success(col);
						}
					},
					
					_select = function(cond, success) {
						// Manage parameters order to get the same signature of the request
						if(cond.uriParams) {
							var uriParams = cond.uriParams;
							delete cond.uriParams;
							cond.uriParams = uriParams;
						}
						
						var
							condSign = JSON.stringify(cond)
						;
						
						if(_conf.env === 'Node') _mod.debug.log('ORM: SELECT ' + scope +'/'+ name + ' with cond: ' + condSign, 'all', 'log');
						
						if(cache) {
							var cacheKey = 'NODE:' + scope +'-'+ name + '-req-' + condSign;
							cache.get(cacheKey, function(err, data) {
								if(_conf.env === 'Node') _mod.debug.log('ORM: SELECT: retrieve "' + cacheKey + '"', 'all', 'log', data);
								_selectCbk(cond, data, success, this);
							});
						} else {
							_selectCbk(cond, model.cache[condSign], success, this);
						}
					},
	
					_selectCbk = function(cond, cachedList, fct, that) {
						if(!cachedList) {
							if(_conf.env === 'Node') _mod.debug.log('ORM: SELECT: data retrieved from server', 'all', 'log');
	
							/* Request server to get data */
							_fetch(cond,(fct)? function(col){fct(col);} : undefined, that);
							
						} else {
							if(_conf.env === 'Node') _mod.debug.log('ORM: SELECT: data retrieved from cache:', 'all', 'log', cachedList);
	
							// Build result collection
							var
								col = [],
								i = 0,
								len = cachedList.length,
								keys = []
							;
							
							if(len === 0 || !cache) {
								for(i = 0; i < len; i++) {
									col.push(model.objects[model.ids[cachedList[i]]]);
								}
								if(fct) {
									fct(col);
								} else {
									_notify('append')(col);
								}
							} else {
								for(i = 0; i < len; i++) {
									keys.push('NODE:' + scope +'-'+ name + '-id-' + cachedList[i]);
								}
								cache.get(keys, function(err, data) {
									var
										col = [],
										i
									;							
									for(i in data) {
										col.push(_create(data[i], false, true));
									}
									
									if(fct) {
										fct(col);
									} else {
										_notify('append')(col);
									}
								});
							}
						}
					},
					
					_del = function(ref, attr, success) {
						
						var obj = model.objects[ref];
						_notify('delete')(obj);
						
						if(typeof attr === 'undefined') {
							attr = {id: obj.get('id')};
						}
						
						_requester.queue({model:this}, _buildUrl(model.req.del, attr), {
							type : model.req.del.method,
							headers : model.req.del.headers,
							data : _buildData(model.req.del, attr),
							success : function(respObj){
								
								//	{
								//		status: "SUCCESS"
								//	}
								//
								// or
								//
								//	{
								//		status: "FAIL",
								//		alerts: {
								//			"attr1": "alert message 1",
								//			"attr2": "alert message 2"
								//		}
								//	}
								
								// An empty or undefined response is valid for a delete
								respObj = respObj || {};
								
								if(respObj.status === 'SUCCESS' || typeof respObj.status === 'undefined') {
									// confirm deletion
									if(typeof success !== 'undefined') {
										success(obj, respObj);
									} else {
										_notify('deleted')(obj, respObj);
									}
									
									// delete object in cache
									delete model.ids[obj.get('id')];
									delete model.objects[ref];
									if(cache) {
										var cacheKey = 'NODE:' + scope +'-'+ name + '-id-' + obj.get('id');
										cache.del(cacheKey, function(err, data) {
											if(_conf.env === 'Node') _mod.debug.log('ORM: DEL: delete "' + cacheKey + '"', 'all', 'log', data);
										});
									}
								} else {
									_notify('alert')({
										type: 'delete',
										alerts: respObj.alerts ? respObj.alerts : {},
										obj: obj
									}, respObj);
								}
							},
							error : function(code, respObj) {
								//	{
								//		status: "FAIL",
								//		errors: [
								//	   	 "error message x",
								//			"error message y"
								//		]
								//	}
								_notify('error')({
									type: 'delete',
									errorCode: code,
									errors: respObj.errors ? respObj.errors : [],
									obj: obj
								}, respObj);
								
								// delete object in cache
								delete model.ids[obj.get('id')];
								delete model.objects[ref];
							}
						});
					},
					
					_notify = function(type) {
						
						return function() {
							_mod.debug.log('model ' + scope +'/'+ name + ' : ' + type, 'all', 'log', arguments[0]);
							tetra.controller.modelNotify(name, type, arguments);
						};
					},
					
					_reset = function(cond, success){
						_notify('reset')(model.objects);
						model.ids = {};
						model.objects = {};
						
						_requester.queue({model:this}, _buildUrl(model.req.reset, cond), {
							type : model.req.reset.method,
							headers : model.req.reset.headers,
							data : _buildData(model.req.reset, cond),
							success : function(respObj){
							
								// An empty or undefined response is valid for a reset
								respObj = respObj || {};
								
								if(respObj.status && respObj.status === "FAIL") {
									_notify('alert')({
										type: 'reset',
										alerts: respObj.alerts ? respObj.alerts : {}
									}, respObj);
								} else {
									if(typeof success !== 'undefined') {
										success(name, respObj);
									} else {
										_notify('resetted')(name, respObj);
									}
								}
							},
							error : function(code, respObj) {
								//	{
								//		status: "FAIL",
								//		errors: [
								//			"error message x",
								//	   	 "error message y"
								//		]
								//	}
	
								_notify('error')({
									type: 'reset', 
									errorCode: code, 
									errors: respObj.errors ? respObj.errors : [],
									data: cond
								}, respObj);
							}
						});
					},
					
					_length = function() {
						var 
							count = 0,
							objs = model.objects
						;
						for(var key in objs) {
							if(objs.hasOwnProperty(key)) {
								count++;
							}
						}
						return count;
					},
					
					_getMeta = function(name) {
						return model.meta[name];
					},
					
					// Builds a URL for an ORM request. Pass true as the final parameter to omit the timestamp
					// (though I'm not sure how this will yet be exposed in a useful way)
					_buildUrl = function(reqObj, cond, omitTimestamp) {
						var
							url = reqObj.url,
							now
						;
						
						if(model.req.type === 'mysql') {
							return model.req.dbTable;
						}
						
						if(typeof reqObj.uriParams !== 'undefined') {
							for(var i = 0, len = reqObj.uriParams.length; i < len; i++) {
								if(typeof cond[reqObj.uriParams[i]] !== 'undefined') {
									url = url.replace('{'+i+'}', cond[reqObj.uriParams[i]]);
								} else {
									url = url.replace('{'+i+'}', cond.uriParams[reqObj.uriParams[i]]);
								}
							}
							if(typeof cond.uriParams !== 'undefined') {
								delete cond.uriParams;
							}
						}
						
						if(!omitTimestamp) {
							now = new Date();
							if(url.indexOf('?') < 0) {
								url += '?ts=' + now.getTime();
							} else {
								url += '&ts=' + now.getTime();
							}
						}
						
						return url;
					},
					
					_buildData = function(reqObj, params) {
						if(reqObj.headers["Content-Type"] && reqObj.headers["Content-Type"].indexOf("application/json") === 0) {
							return JSON.stringify(_.extend(params, reqObj.params));
						} else {
							return _.extend(params, reqObj.params);
						}
					}
				;
				
				return {
					type: model.req.type,
					create: function(attr) {
						return _create(attr, true);
					},
					save: _save,
					fetch: _fetch,
					find: _find,
					findByRef: _findByRef,
					findByCond: _findByCond,
					select: _select,
					del: _del,
					reset: _reset,
					notify: _notify,
					length: (function(){return _length();})(),
					getMeta: _getMeta
				};
			};
		};
	});
	
	
	// DEBUG functions
	// --------------------
	_debug = function(scope, name) {
		return _mod.orm(scope)(name);
	};
	
	_debug.list = function() {
		var list = [], name;
		for(name in _models) {
			if(_models.hasOwnProperty(name)) {
				_mod.debug.log(name);
				list.push(name);
			}
		}
		return list;
	};
			
	_debug.retrieve = function(scope, name) {
		return _models[scope +'/'+ name];
	};
	
	_debug.man = function() {
		_mod.debug.log('Tetra.js ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		_mod.debug.log('> Model specs:');
		_mod.debug.log('		- retrieve an object and its ref		> tetra.debug.model(modelName).findByRef(ref)');
		_mod.debug.log('		- notify all controllers as a model		> tetra.debug.model(modelName).notify(type)(data)');
		_mod.debug.log('			  * types : call, complete, create, fetch, append, save, saved, delete, deleted, reset, resetted, error');
		_mod.debug.log('		- list all models						> tetra.debug.model.list()');
		_mod.debug.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		
		return true;
	};
	
	
	// Constructor of the class for the model
	// --------------------
	var Builder = function(name, params) {
		
		var 
			modelName = name,
			modelScope = params.scope,
			modelAttr = params.attr,
			modelMethods = params.methods
		;
		
		return function() {
			
			var attr = _.extend({
					ref: 0,
					id: 0
				}, modelAttr);
			
			var bckAttr = {};
			for(var a in attr) {
				if(attr.hasOwnProperty(a)) {
					bckAttr[a] = attr[a];
				}
			}
			
			var methods = _.extend({
				
				// Retrieve an attribute from an object as described by the model
				get: function(attrName) {
					return attr[attrName];
				},
				
				// Retrieve all attributes from an object as described by the model
				getAll: function() {
					return attr;
				},
				
				// Set the value of an attribute
				set: function(attrName, value) {
					bckAttr[attrName] = attr[attrName];
					if(typeof attr[attrName] !== 'undefined') {
						attr[attrName] = value;
					}
					return this;
				},
				
				// Modify the values of multiple attributes at once
				update: function(attributes, skipValid) {
					if(skipValid || validAttr(attributes, this)) {
						for(var attrName in attributes) {
							this.set(attrName, attributes[attrName]);
						}
					   
						return this;
					} else {
						return {save:function(){}};
					}					  
				},
				
				// Revert the values of all object attributes to their original values
				revert: function() {
					attr = bckAttr;
				},
				
				// Save the object to the server. Will call the ORM.
				save: function(params, success) {
					if(validAttr(attr, this)) {
						_mod.orm(modelScope)(modelName).save(_.extend(attr, params), success);
						return attr.id;
					} else {
						return false;
					}
				},
				
				// Delete the object from the server. Will call the ORM.
				remove: function(params, success) {
					_mod.orm(modelScope)(modelName).del(attr.ref, _.extend(attr, params), success);
				}
			}, modelMethods(attr));
			
			var genRef = function() {
				attr.ref = (new Date()).getTime() + '-' + Math.ceil(Math.random()*1001);
				methods.ref = attr.ref;
			};
			
			var validAttr = function(attributes, obj) {
				var errors = [];
				
				if(typeof methods.validate !== 'undefined') {
					var curAttr = {};
					for(var attrName in attr) {
						if(attr.hasOwnProperty(attrName)) {
							if(typeof attributes[attrName] !== 'undefined') {
								curAttr[attrName] = attributes[attrName];
							}
							else {
								curAttr[attrName] = attr[attrName];
							}
						}
					}
					
					errors = methods.validate(curAttr, errors);
				
					if(errors.length > 0) {
						tetra.controller.modelNotify(modelName, 'invalid', [{attr: errors, obj: obj}]);
						return false;
					} 
				}
				
				return true;
			};
			
			genRef();
			if(typeof methods.init === 'function') {
				methods.init();
			}
			
			return methods;
		};
	};
	
	
	// Instantiation of an object of the model
	// --------------------
	var oModel = function(name, params) {
		
		if(typeof params.req === 'undefined') {
			params.req = {};
		}
		
		var defObj = _.extend({
				objects: {},
				ids: {},
				cache: {},
				meta: {}
			}, params);

		if(typeof defObj.req.type === 'undefined') {
			defObj.req.type = 'ajax';
		}
		
		defObj.req.fetch = _.extend({
			url : _conf.FETCH_URL.replace('{name}', name),
			method : _conf.FETCH_METHOD,
			headers : {},
			params : {}
		}, params.req.fetch);
		
		defObj.req.save = _.extend({
			url : _conf.SAVE_URL.replace('{name}', name),
			method : _conf.SAVE_METHOD,
			headers : {},
			params : {}
		}, params.req.save);
		
		defObj.req.del = _.extend({
			url : _conf.DEL_URL.replace('{name}', name),
			method : _conf.DEL_METHOD,
			headers : {},
			params : {}
		}, params.req.del);
		
		defObj.req.reset = _.extend({
			url : _conf.RESET_URL.replace('{name}', name),
			method : _conf.RESET_METHOD,
			headers : {},
			params : {}
		}, params.req.reset);
		
		for(var reqType in defObj.req) {
			if(defObj.req.hasOwnProperty(reqType)) {
				var reqObj = defObj.req[reqType];
				if(reqObj.hasOwnProperty('headers')) {
					if(reqObj.headers["Content-type"]) {
						reqObj.headers["Content-Type"] = reqObj.headers["Content-type"];
						delete reqObj.headers["Content-type"];
					}
					if(reqObj.headers["Content-Type"] && !/charset/.test(reqObj.headers["Content-Type"])) {
						reqObj.headers["Content-Type"] = reqObj.headers["Content-Type"] + ";charset=utf-8";
					}
					if(!reqObj.headers.Accept) {
						reqObj.headers.Accept = "*/*";
					}
				}
			}
		}
		
		// Block anything other than POST/PUT for Save operations
		var saveMethod = params.req.save.method.toUpperCase();
		if(saveMethod !== "POST" && saveMethod !== "PUT") {
			throw new Error("A 'save' can only be performed using POST or PUT");
		}
		
		// Block anything other than POST/DELETE for Delete operations
		var delMethod = params.req.del.method.toUpperCase();
		if(delMethod !== "POST" && delMethod !== "DELETE") {
			throw new Error("A 'delete' can only be performed using POST or DELETE");
		}
		
		// Block anything other than POST/PUT for Reset operations
		var resetMethod = params.req.reset.method.toUpperCase();
		if(resetMethod !== "PUT" && resetMethod !== "POST") {
			throw new Error("A 'reset' can only be performed using PUT or POST");
		}
		
		return defObj;
	};
	
	
	// Interface implementation
	// --------------------
	return {
		// Registers a model.
		// Note that, at the minimum, the model must be given a name and an empty params object literal 
		register: function(name, params) {
			params = params || {};
			if(_conf.env === 'Node') params.scope = 'node';
			if(!params.scope) params.scope = 'g';

			var
				modelName = params.scope + '/' + name
			;
			
			if(!name) {
				throw new Error(
						"tetra.model.register(name, params) : " + 
						"Name is a required argument");
			}
			
			if(_models[modelName] || _models['g/' + name]) {
				throw new Error(
						"A model with the name " + name + " already exists");
			}
			
			_mod.dep.define(params.scope +'/model/'+ name +'.class', function() {
				
				_models[modelName] = oModel(name, params);
				
				_mod.debug.log('model ' + modelName + ' : registered', 'all', 'info');
				
				_classes[modelName] = new Builder(name, params);
				
				_mod.debug.log('model ' + modelName + ' : associated class generated', 'all', 'info');
				
				return _models[modelName];
			});
			
			_mod.dep.require([params.scope +'/model/'+ name +'.class']);
		},
		
		destroy: function(name, scope) {
			if(!scope) {scope = 'g';}
			var modelName = scope + '/' + name;
			
			_mod.dep.undef(scope +'/model/'+ name +'.class');
			
			delete _models[modelName];
		},
		
		debug: _debug
	};
});