core.view.register("myRegisterNameDoesntMatchTheFileNameView", {
	scope: "myScope",
	constr: function(me, app, page, orm) {
		return {
			events: {}
		};
	}
});