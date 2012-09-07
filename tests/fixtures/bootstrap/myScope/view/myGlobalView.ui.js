core.view.register("myGlobalView", {
	use: ["myGlobalController"],
	scope: "myScope",
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});