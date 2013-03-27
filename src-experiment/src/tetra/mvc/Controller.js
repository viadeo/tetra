define(['tetra/_base/kernel', 'tetra/bus', 'tetra/orm'], function(kernel, bus, orm) {

	function Controller(name, params) {
		// TODO This is where we can chang the value of this
		var constr = params.constr(this, bus, orm); // Call the constructor

		this.scope = params.scope;
		this.events = (constr) ? constr.events : {};
		this.methods = (constr) ? constr.methods : {};
	}

	Controller.prototype = {

	};

	return Controller;
});