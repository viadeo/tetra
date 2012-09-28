tetra.view.register("myNonExistantControllerView", {
	scope: "myScope",
	use: ["myControllerThatDoesntExist"],
	constr: function(me, app, _) {
		return {
			events: {}
		};
	}
});