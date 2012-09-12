// ------------------------------------------------------------------------------
// Tetra.js
//
// Simple ORM
// Manage ajax requests in an evenemential environnement
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
tetra.extend('orm', function(_conf, _mod, _) {
	
	return function(resource) {
		
		var
			_request = function(type, msgs) {
			
				return function(data, method, options) {
					
					// Directly notify controllers
					if(msgs[0] !== '') {
						_notify(msgs[0])(data);
					}
					
					$.ajax({
						url: _conf[type.toUpperCase() +'_URL'].replace('{name}', resource),
						type: method ? method : _conf[type.toUpperCase() +'_METHOD'],
						headers: (options && options.headers) ? options.headers : {},
						data: data,
						traditional: true,
						processData: (options && options.headers['Content-Type'] && options.headers["Content-Type"].indexOf("application/json") === 0) ? false : true,
						create: function(req) {
							_notify('call')({
								req: req,
								data: data
							});
						},
						complete: function(req) {
							_notify('complete')({
								req: req,
								data: data
							});
						},
						success: function(resp) {
							if(msgs[1] !== '') {
								_notify(msgs[1])(resp);
							}
						},
						error: function(jqxhr) {
							_notify('error')({
								type: 'ajax',
								errorCode: jqxhr.status,
								data: data
							}, jqxhr);
						}
					});
				};
			},
		
			_notify = function(type) {
				return function() {
					_mod.debug.log('resource ' + resource + ' : ' + type, 'all', 'log', arguments[0]);
					tetra.controller.modelNotify(resource, type, arguments);
				};
			}
		;
		
		return {
			type: 'ajax',
			save: function() {
				_request('save', ['update', 'stored']).apply(this, arguments);
			},
			fetch: function() {
				_request('fetch', ['', 'append']).apply(this, arguments);
			},
			del: function() {
				_request('delete', ['remove', 'deleted']).apply(this, arguments);
			},
			reset: function() {
				_request('reset', ['reset', 'reseted']).apply(this, arguments);
			},
			notify: _notify
		};
	};
});