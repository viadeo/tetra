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
		
		_mouse = {},
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
						mouseOverCalled = false
					;
					
					if((typeof thisView.root === 'undefined' && e.target.tagName !== 'HTML' && e.target.parentNode && e.target.parentNode.tagName) ||
							(target.parents('#' + thisView.root).length > 0)) {
						
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
									
									// clickout management
									if(eventName === 'click') {

										// call clickout callbacks
										var curViewName, curView, curSelector, curElm, isCurClass, hasParents;
										for(curViewName in _clickout) {
											for(curSelector in _clickout[curViewName]) {
												if(_clickout[curViewName][curSelector]) {
													curView = _views[curViewName];

													if(_.toggleLib) _.toggleLib(curView.has_);
													
													isCurClass = _(e.target).hasClass('cur-clickout');
													hasParents = _(e.target).parents('.cur-clickout').length > 0;
													
													if(!isCurClass && !hasParents) {
														curElm = _(curSelector + '.cur-clickout');
														_mod.debug.log('view ' + curViewName + ' : call clickout callback on ' + curSelector, curView.scope, 'info');
														curElm.removeClass('cur-clickout')
														curView.events.user.clickout[curSelector](e,(curView.has_) ? curElm : _(curElm[0])[0]);
													}
												}
											}
										}

										// init clickout callback
										if(typeof thisView.events.user.clickout !== 'undefined' &&
											typeof thisView.events.user.clickout[selector] !== 'undefined' &&
											(!elm.hasClass('cur-clickout') || typeof _clickout[viewName] === 'undefined' || typeof _clickout[viewName][selector] === 'undefined') {
											
											if(!_clickout[viewName]) _clickout[viewName] = {};
											if(!_clickout[viewName][selector]) _clickout[viewName][selector] = true;
											
											elm.addClass('cur-clickout');
										}
									}
									
									// mouseout spam removing (equivalent to mouseleave)
									else if(eventName === 'mouseover') {
										if(_.toggleLib) _.toggleLib(thisView.has_);
										
										if(elm.hasClass('cur-mouseout') && elm.hasClass('cur-mouse-'+ viewName.replace('/', '-'))) {
											elm = false;
										} else {
											for(m in _mouse) {
												_mouse[m].view.events.user.mouseout[_mouse[m].selector](_mouse[m].event, (_mouse[m].view.has_) ? _mouse[m].elm : _mouse[m].elm[0]);
												_mouse[m].elm.removeClass('cur-mouseout').removeClass('cur-mouse-'+ _mouse[m].viewName);
												delete _mouse[m];
											}
											if(typeof thisView.events.user.mouseout !== 'undefined' && 
												typeof thisView.events.user.mouseout[selector] != 'undefined') {
												elm.addClass('cur-mouseout').addClass('cur-mouse-'+ viewName.replace('/', '-'));
											}
										}
										
										mouseOverCalled = true;
									}
									
									else if (eventName === 'mouseout') {
										var ev = _.extend({},e);
										
										ev.type = eventName;
										ev.target = e.target;
										ev.preventDefault = emptyFnc;
										
										_mouse[viewName + '/' + selector] = {
											view: thisView,
											viewName: viewName.replace('/', '-'),
											event: ev,
											elm: elm,
											selector: selector
										};
										
										elm = false;
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
					
					if(eventName === 'mouseover' && !mouseOverCalled && target.parents('.cur-mouseout').length === 0) {
						for(m in _mouse) {
							_mouse[m].view.events.user.mouseout[_mouse[m].selector](_mouse[m].event, (_mouse[m].view.has_) ? _mouse[m].elm : _mouse[m].elm[0]);
							_mouse[m].elm.removeClass('cur-mouseout').removeClass('cur-mouse-'+ _mouse[m].viewName);
							delete _mouse[m];
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