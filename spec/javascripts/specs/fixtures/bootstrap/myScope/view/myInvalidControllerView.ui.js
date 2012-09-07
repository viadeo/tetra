core.view.register("myInvalidControllerView", {
	scope: "myScope",
	use: ["myInvalidController"],
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});