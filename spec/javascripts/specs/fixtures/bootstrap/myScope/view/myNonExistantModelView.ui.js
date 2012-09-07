core.view.register("myNonExistantModelView", {
	scope: "myScope",
	use: ["myNonExistantModelController"],
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});