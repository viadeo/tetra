define(function(){

	// Core functions for Tetra
	// ========================

	if(!Object.create) {
		var F = function(){};
	}

	return {

		// Object creation
		// ----------------

		// Create a new object from a prototype
		// TODO Maybe make this private, as complex type behaviours could be
		// confusing, see http://elsamman.com/?p=32
		create: function(proto) {
			if(Object.create) {
				return Object.create(proto);
			}

			F.prototype = proto;
			return new F();
		},

		// Create a new extension of an existing prototype
		// Inspired by Stapes.js
		extend: function(Base, extension) {
			extension = extension || {};

			var realConstructor = extension.hasOwnProperty("constructor") ? extension.constructor : function(){};

			function constructor() {
				if(!(this instanceof constructor)) {
					throw new Error('Instantiate components with the "new" keyword');
				}

				realConstructor.apply(this, arguments);
			}

			var kernel = this;
			constructor.prototype = kernel.create(Base.prototype);
			constructor.prototype.constructor = constructor;
			constructor.parent = Base.prototype;

			for(var key in extension) {
				if(key !== 'constructor' && key !== 'parent') {
					constructor.prototype[key] = extension[key];
				}
			}

			return constructor;
		},

		// TODO Maybe remove recursion ? Probably inefficient

		// Mix together two objects
		mixin: function self() {
			var args =  Array.prototype.slice.apply(arguments);
			if(!args || args.length <= 1) {
				return (args.length) ? args[0] : {};
			}

			var source = args.splice(1, 1)[0];
			for(var prop in source) {
				if(source.hasOwnProperty(prop)) {
					args[0][prop] = source[prop];
				}
			}

			return self.apply(this, args);
		},

		// Utility functions
		// -----------------

		// See http://stackoverflow.com/a/2117523/152809
		// Create a new unique identifier
		generateGUID: function() {
			return new Date().getTime() + '-' + Math.ceil(Math.random()*1001);
		}
	};
});