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
		enableBootstrap: false,
		
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
