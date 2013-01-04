tetra.view.register("myVcView", {
	use: ["myVcController"],
	scope: "myScope",
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});