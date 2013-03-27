define(['./kernel'], function(kernel) {

	function _register(resource) {

		// TODO Cache here based on declared type

		return resource;
	}

	var declare = function(types, callback) {
		var type = (typeof types.splice === 'function') ? kernel.mixin(types) : types;
		var Object = kernel.clone(type);
		Object.callback = callback;

		return Object;
	};

	return declare;
});