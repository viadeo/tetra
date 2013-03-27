define(['tetra/_base/kernel', 'tetra/validator', 'tetra/store/Store', 'tetra/_base/Component'], function(kernel, validator, Store, Component) {

	// A model backed by an in-memory store
	// ====================================

	// Fill empty attributes with default values, per the schema
	function _init(data, schema) {
		return data;
	}

	return kernel.extend(Component, {

		store: null,

		// JSONSchema stub
		// Properties are filled in when the object is created
		schema: {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"type": "object",
			"properties": {}
		},

		data: {},

		// A copy of the last state of the model object
		cache: {},

		// Data modification methods
		// -------------------------

		// Get all attributes
		getAll: function() {
			return this.data;
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
				if(attributes.hasOwnProperty(name) && this.schema.properties[name]) {
					this.cache[name] = this.data[name];
					this.data[name] = attributes[name];
				}
			}

			return this;
		},

		// Revert the data to their previous values
		revert: function() {
			this.data = this.cache; // TODO Is this correct? Passing by reference
		},

		// Custom model validations
		// Override in the instance
		validate: function(data, errors) {
			return errors;
		},

		// TODO Use JSONSchema validator
		isValid: function() {
			var errors = validator.check(this.data, this.schema);
			errors = this.validate(this.data, errors);

			// TODO Emit here

			return errors.length;
		},

		// Store modification methods
		// ----------------------------

		// Save the object to the store
		save: function(params) {
			// TODO We need to return a promise
			if(this.isValid()) {
				return this.store.save(_init(this.data, this.schema), params);
			}

			return false;
		},

		// Delete the object from the store.
		remove: function(params) {
			// TODO Only need to pass the id ?
			return this.store.remove(this.data, params);
		},

		findById: function(id) {
			return store.fetch(id);
		},

		findByRef: function(ref) {
			// TODO
		},

		// Find an object matching the query
		query: function() {
			// TODO
		},

		// Lifecycle methods
		// -------------------

		constructor: function(params) {
			this.store = new Store();

			console.log("constructor params", params);

			this.schema.properties = params.schema;

			// Call init
			params.init = params.init || function(){};
			params.init();
		}
	});
});