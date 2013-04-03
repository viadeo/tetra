define(['tetra/_base/Component', 'tetra/store/Store', './Validator', 'tetra/_base/kernel', 'bus'], function(Component, Store, Validator, kernel, bus) {

	'use strict';

	// A model backed by an in-memory store
	// ====================================

	return kernel.extend(Component, {

		store: null,

		data: {},

		// A copy of the last state of the model object
		lastData: {},

		// Data modification methods
		// -------------------------

		// Get all attributes
		getAll: function() {
			return this.data;
		},

		getByRef: function(ref) {
			// TODO
		},

		// Get/Set the value of an attribute
		// Call attr(name) to retrieve a value
		// Call attr(name, value) to set a single attribute
		// Call attr(obj) with some JSON to set a collection of values
		attr: function() {
			var attributes = {};
			if(arguments.length === 1) {
				if(typeof arguments[0] === "string") {
					return this.data[arguments[0]];
				} else {
					attributes = arguments[0];
				}
			} else if(arguments.length === 2) {
				attributes[arguments[0]] = arguments[1];
			}

			for(var name in attributes) {
				if(attributes.hasOwnProperty(name) && this.validator.isValidAttribute(name)) {
					if(this.data.hasOwnProperty(name)) {
						this.lastData[name] = this.data[name];
					}
					this.data[name] = attributes[name];
				}
			}

			return this;
		},

		// Revert an attribute change
		rollback: function() {
			this.data = this.lastData; // TODO Is this correct? Passing by reference
		},

		// Store modification methods
		// ----------------------------

		// Save the object to the store and return a promise
		// TODO Insert messaging
		save: function(params, callback) {
			var self = this;
			var promise = this.store.save(this.data, params);

			bus.publish('model.saving');

			promise.then(
				// SUCCESS
				function(res) {
					for(var id in res.data) { break; }
					self.attr(res.data[id]);
					self.attr('id', id);
					if(typeof callback === 'function') {
						callback(self, res);
					}

					bus.publish('model.saved', self);
				},

				// FAIL
				function(res) {
					bus.publish('model.failed', self);
				}
			);

			return promise;
		},

		// Delete the object from the store and return a promise
		remove: function(params) {
			// TODO Only need to pass the id ?
			// TODO Remove from cache ? 
			return this.store.remove(this.data, params);
		},

		// Find an item in the store, returning a promise
		// TODO Merge with query ?
		fetch: function(id, parser) {

			// TODO Fire 'fetching' message

			var defer = store.fetch(id);
			defer.then(
				// SUCCESS
				function(res) {
					if(typeof parser === 'function') {
						res.data = parser(res.data);    // TODO Check this
					}
				},
				// FAIL
				function(res) {

				}
			);


			return defer;
		},

		// Lifecycle methods
		// -------------------

		constructor: function(params) {
			this.data = {};
			this.lastData = {};

			// TODO How is id set in the old model
			kernel.mixin(params.schema, {
				id: {
					"default": 0,
					"type": "number"
				},
				ref: {
					"default": kernel.generateGUID(),
					"type": "string"
				}
			});

			this.validator = new Validator(params.schema, params.validate);
			this.store = new Store(this.validator);

			// Call init
			params.init = params.init || function(){};
			params.init();

			// TODO Send 'create' message here, to the 'model' stream
		},

		destroy: function() {
			this.store = null;
			this.schema = null;
			this.validator = null;
		}
	});
});