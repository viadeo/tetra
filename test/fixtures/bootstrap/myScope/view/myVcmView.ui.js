core.view.register("myVcmView", {
	use: ["myVcmController"],
	scope: "myScope",
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});