core.view.register("myInvalidModelView", {
	scope: "myScope",
	use: ["myInvalidModelController"],
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});