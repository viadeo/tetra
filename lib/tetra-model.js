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