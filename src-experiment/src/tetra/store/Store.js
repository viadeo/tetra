define(['tetra/_base/Component', 'tetra/_base/kernel', 'promise'], function(Component, kernel, promise) {

	function _success(data) {
		data = data || {};
		return {
			status: 'SUCCESS',
			data: data
		};
	}

	function _fail(data, errors) {
		data = data || {};
		return {
			status: 'FAIL',
			data: data
		};
	}

	return kernel.extend(Component, {

		data: {},

		validator: {
			validate: function() {
				return [];
			}
		},

		fetch: function(id) {
			var deferred = promise.defer();
			if(id && this.data[id]) {
				deferred.resolve(this.data[id]);
			} else {
				deferred.reject(id);
			}

			return deferred.promise;
		},

		remove: function(obj) {
			var deferred = promise.defer();
			if(obj.id) {
				delete this.data[obj.id];
				deferred.resolve(obj);
			} else {
				deferred.reject(obj);
			}

			return deferred.promise;
		},

		save: function(obj, params) {
			var deferred = promise.defer();

			if(obj.id) {
				var errors = this.validator.validate(obj);
				if(!errors.length) {
					obj.ref = kernel.generateGUID();
					this.data[obj.id] = obj;

					deferred.resolve(_success(obj));
				} else {
					deferred.reject(_fail(obj, errors));
				}
			} else {
				deferred.reject(_fail(obj));
			}

			return deferred.promise;
		},

		reset: function(params) {

		},

		constructor: function(validator) {
			this.validator = validator;
		}
	});
});
