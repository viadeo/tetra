tetra.view.register("myVcmView", {
	use: ["myVcmController"],
	scope: "myScope",
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});
