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
				map.cssFloat = map.float;
				delete map.float;
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
})();