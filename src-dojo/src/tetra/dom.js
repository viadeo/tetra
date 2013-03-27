define(["./_base/kernel", "dojo/dom", "dojo/has"], function(kernel, dom, has) {

	return {
		start:function() {
			kernel.start();
			console.log("Starting dom");
		},

		updateTitle:function() {
			var title = dom.byId("title");
			if(has("ie-event-behavior")) {
				require(["dojo/dom-style"], function(domStyle) {
					console.log("Firing IE event");
					domStyle.set(title, "fontSize", "100px");
				});
			} else {
				require(["dojo/_base/fx"], function(fx) {
					console.log("Firing FX event");
					fx.animateProperty({
						node:title,
						properties:{
							fontSize: { end:100, units:"px" }
						},
						duration: 1000
					}).play();
				});
			}
		}
	};

});