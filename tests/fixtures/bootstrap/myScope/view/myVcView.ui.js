core.view.register("myVcView", {
	use: ["myVcController"],
	scope: "myScope",
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});