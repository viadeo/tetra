core.controller.register("myNonExistantModelController", {
	scope: "myScope",
	use: ["myModelThatDoesntExist"],
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});