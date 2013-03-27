define(['tetra/_base/kernel', 'tetra/_base/Component', 'when'], function(kernel, Component, when) {



	return kernel.extend(Component, {

		data: {},

		fetch: function(params) {

		},

		remove: function(obj) {
			var deferred = when.defer();
			if(obj.id) {
				delete this.data[obj.id];
				deferred.resolve(obj);
			} else {
				deferred.reject(obj);
			}

			return deferred.promise;
		},

		save: function(obj) {
			var deferred = when.defer();
			if(obj.id) {
				obj.ref = kernel.generateGUID();
				this.data[obj.id] = obj;
				deferred.resolve(obj);
			} else {
				deferred.reject(obj);
			}

			return deferred.promise;
		},

		reset: function(params) {

		}
	});
});
