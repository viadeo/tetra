// ------------------------------------------------------------------------------
// Tetra.js
//
// Node.js connector for libAbstracted module
// used for advanced js methods
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

module.exports = function(api) {

	function is_plain_obj( obj ){
	   if( !obj ||
		   {}.toString.call( obj ) !== '[object Object]' ||
		   obj.nodeType ||
		   obj.setInterval ){
		 return false;
	   }

	   var has_own                   = {}.hasOwnProperty;
	   var has_own_constructor       = has_own.call( obj, 'constructor' );
	   var has_is_property_of_method = has_own.call( obj.constructor.prototype, 'isPrototypeOf' );

	   // Not own constructor property must be Object
	   if( obj.constructor &&
		   !has_own_constructor &&
		   !has_is_property_of_method ){
		 return false;
	   }

	   // Own properties are enumerated firstly, so to speed up,
	   // if last one is own, then all properties are own.
	   var key;
	   for( key in obj ){}

	   return key === undefined || has_own.call( obj, key );
	}

	function _extend() {
		  var target = arguments[ 0 ] || {};
		  var i      = 1;
		  var length = arguments.length;
		  var deep   = false;
		  var options, name, src, copy, copy_is_array, clone;

	  // Handle a deep copy situation
	  if( typeof target === 'boolean' ){
		deep   = target;
		target = arguments[ 1 ] || {};
		// skip the boolean and the target
		i = 2;
	  }

	  // Handle case when target is a string or something (possible in deep copy)
	  if( typeof target !== 'object' && typeof target !== 'function' ){
		target = {};
	  }

	  for( ; i < length; i++ ){
		// Only deal with non-null/undefined values
		if(( options = arguments[ i ]) != null ){
		  // Extend the base object
		  for( name in options ){
			src  = target[ name ];
			copy = options[ name ];

			// Prevent never-ending loop
			if( target === copy ){
			  continue;
			}

			// Recurse if we're merging plain objects or arrays
			if( deep && copy && ( is_plain_obj( copy ) || ( copy_is_array = Array.isArray( copy )))){
			  if( copy_is_array ){
				copy_is_array = false;
				clone = src && Array.isArray( src ) ? src : [];
			  }else{
				clone = src && is_plain_obj( src)  ? src : {};
			  }

			  // Never move original objects, clone them
			  target[ name ] = extend( deep, clone, copy );

			// Don't bring in undefined values
			}else if( copy !== undefined ){
			  target[ name ] = copy;
			}
		  }
		}
	  }

	  // Return the modified object
	  return target;
	}
	
	function _inArray( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	}
	
	// Mysql client
	var
		_mysql = require('mysql'),
		_myCli
	;
	
	if(!tns.libs) tns.libs = [];
	tns.libs.push({
		name: "Node",
		
	//	s: $j,
	//	elm: function(domElm) {
	//		// not implemented
	//	},
	//	hasClass:		"hasClass", // not implemented
	//	addClass:		"addClass", // not implemented
	//	removeClass:	"removeClass", // not implemented
	//	attr:			"attr", // not implemented
	//	parents:		"parents", // not implemented
	//	find:			"find", // not implemented
	//	is:				"is", // not implemented
	//	
	//	val:			"val", // not implemented
	//	html:			"html", // not implemented
	//	serialize:		function(getObj){}, // not implemented
	//	
	//	siblings: 		"siblings", // not implemented
	//	prev: 			"prev", // not implemented
	//	next: 			"next", // not implemented
	//	
	//	append: 		"append", // not implemented
	//	prepend: 		"prepend", // not implemented
	//	before: 		"before", // not implemented
	//	after: 			"after", // not implemented
	//	replaceWith: 	"replaceWith", // not implemented
	//	remove: 		"remove", // not implemented
	//	
	//	animate: 		"animate", // not implemented
	//  css:			"css", // not implemented
	//  height:			"height", // not implemented
	//  width:			"width", // not implemented
	//  offset:         "offset", // not implemented
		
		ajax: function(url, options) {
			return api.call(options.method, url, options.data, options.success, options.error);
		},
		initApi: function(conf) {},
		api: function(url, options) {
			return api.call(options.method, url, options.data, options.success, options.error);
		},
		initMysql: function(conf) {
			_myCli = _mysql.createClient(conf);
		},
		mysql: function(dbTable, options) {
			var
				query = '',
				attr,			
				pairs = [],
				values = []
			;
			
			if(!_myCli) {
				options.error(500, {errors:["mySQL client not initialized"]});
				return false;
			}
			
			for(attr in options.data) {
				if((attr !== 'id' || dbTable.id === 'id') && options.data.hasOwnProperty(attr)) {
					values.push(options.data[attr]);
					pairs.push(attr +'=?');
				}
			}
			
			if(options.method === 'GET') {
				query = 'SELECT * FROM '+ dbTable.name +' WHERE '+ pairs.join(' AND ');
			} else if(options.method === 'POST') {
				if(options.data.id !== 0) {
					query = 'INSERT INTO '+ dbTable.name +' SET '+ pairs.join(', ');					
				} else {
					query = 'UPDATE '+ dbTable.name +' SET '+ pairs.join(' AND ') +' WHERE '+ dbTable.id +'=?';
					values.push(options.data.id);
				}
			} else if(options.method === 'DELETE') {
				query = 'DELETE FROM '+ dbTable.name +' WHERE '+ pairs.join(' AND ');
			}
			
			_myCli.query(query, values, function(err, results) {
				if (err) {
					options.error(err.number, {errors:err});
				} else {
					options.success(results);
				}
			});
		},
		
	//	bind: function(eventName, callback) {
	//		// not implemented
	//	},
	//	unbind: function(eventName, callback) {
	//		// not implemented
	//	},
	
		extend: _extend,
		inArray: _inArray,
		toJSON: JSON.stringify,
		parseJSON: JSON.parse,
		trim: function(str) {
			return text == null ?
				"" :
				str.replace(/^\s*|\s*$/g, '');
		}
	});
};
