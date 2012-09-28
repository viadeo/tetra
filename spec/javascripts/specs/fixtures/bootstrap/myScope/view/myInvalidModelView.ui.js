tetra.view.register("myInvalidModelView", {
	scope: "myScope",
	use: ["myInvalidModelController"],
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});