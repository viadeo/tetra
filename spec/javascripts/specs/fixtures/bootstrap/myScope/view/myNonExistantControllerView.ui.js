core.view.register("myNonExistantControllerView", {
	scope: "myScope",
	use: ["myControllerThatDoesntExist"],
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});