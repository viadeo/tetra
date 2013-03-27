define(["./_base/kernel"], function(kernel) {

	return {
		start: function() {
			kernel.start();
			console.log("Starting model");
		}
	};

});