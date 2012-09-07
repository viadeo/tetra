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
		left = "<%",
		right = "%>",
		key = "%",
		rg1 = new RegExp("'(?=[^" + key + "]*" + right + ")", "g"),
		rg2 = new RegExp(left + "[=-](.+?)" + right, "g")
	  ;
	 
	  this.tmpl = function tmpl(str, data, tag){
		
		if(tag) {
			left = tag.left || left;
			right = tag.right || right;
			key = tag.right[0] || key;
			rg1 = new RegExp("'(?=[^" + key + "]*" + right + ")", "g");
			rg2 = new RegExp(left + "[=-](.+?)" + right, "g");
		}
		
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
		_tmplConf = {left: '{%', right: '%}'}
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
						if(parentid) _tmplStack[uid].comp[parentid].count++;
						
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
				if(_tmplStack[uid]) return _tmplStack[uid].comp[cid].html;
			};
		},
		_render = function(uid, cid, ctrl, isComp) {
			var html = "";
			
			if(_tmplStack[uid].count == 0) {
				
				// Render the full template
				_tmplStack[uid].countid = 0;
				html = tmpl(_tmplStack[uid].id, _tmplStack[uid].data, _tmplConf);
				
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
					comp.html = tmpl(comp.id, comp.data, _tmplConf);
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
		html = tmpl(id, data, _tmplConf);
		
		if(_tmplStack[uid]) {
			
			// Store directly evaluated template
			if(isComp) {
				var
					comp = _tmplStack[uid].comp[cid]
				;
				
				if(comp.count == 0) {
					_tmplStack[uid].comp[cid].html = html;
					if(_tmplStack[uid].comp[cid].parentid) _tmplStack[uid].comp[_tmplStack[uid].comp[cid].parentid].count--;
					_tmplStack[uid].count--;
				}
			}
			
			// Try to render after each evaluation
			_render(uid, cid, (tpl.length == 1) ? tpl[0] : undefined, isComp);
		}
	};
	
});