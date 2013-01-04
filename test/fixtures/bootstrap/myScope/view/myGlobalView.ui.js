tetra.view.register("myGlobalView", {
	use: ["myGlobalController"],
	scope: "myScope",
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});