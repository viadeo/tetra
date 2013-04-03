define([], function() {

	// A base object from which all others MVC objects extend
	// ==========================================

	var Component = function() {
		console.log("Calling base constructor");
	};

	Component.prototype = {

		destroy: function() {
			console.log("destroying");
		}
	};

	return Component;
});