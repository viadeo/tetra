define(['schema-validator'], function(JSV) {

	'use strict';

	return {
		validate: function(data, schema){
			var env = JSV.createEnvironment();
			var results = env.validate(data, schema);

			// TODO format errors
			return results.errors;
		}
	};
});