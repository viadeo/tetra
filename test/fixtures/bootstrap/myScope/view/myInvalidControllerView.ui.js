tetra.view.register("myInvalidControllerView", {
	scope: "myScope",
	use: ["myInvalidController"],
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});
