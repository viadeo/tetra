tetra.view.register("myNonExistantModelView", {
	scope: "myScope",
	use: ["myNonExistantModelController"],
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});