tetra.controller.register("myVcmController", {
	use: ["myVcmModel"],
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