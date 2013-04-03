define(['validator-connector'], function(connector) {

	'use strict';

	var Validator = function(schemaProperties, onSaveValidation) {
		this.schema.properties = schemaProperties;
		this.onSaveValidation = onSaveValidation || function(){return [];};
	};

	Validator.prototype = {

		schema : {
			"$schema": "http://json-schema.org/draft-03/schema#",
			"type": "object",
			"properties": {

			}
		},

		// TODO Set defaults according to the schema
		setDefaults: function(obj) {
			return obj;
		},

		isValidAttribute: function(name) {
			return this.schema.properties[name];
		},

		validate: function(obj) {
			var typeErrors = connector.validate(obj, this.schema);
			var onSaveErrors = this.onSaveValidation(obj);

			return onSaveErrors.join(typeErrors);
		}
	};

	return Validator;
});