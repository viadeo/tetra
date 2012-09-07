core.controller.register("myGlobalController", {
	use: ["g/myGlobalModel"],
	scope: "myScope",
	constr: function(me, app, page, orm) {
		return {
			events: {},
			methods: {
				init : function() {
					
				}
			}
		};
	}
});