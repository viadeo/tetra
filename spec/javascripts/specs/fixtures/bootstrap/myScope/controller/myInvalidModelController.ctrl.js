core.controller.register("myInvalidModelController", {
	scope: "myScope",
	use: ["myInvalidModel"],
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});