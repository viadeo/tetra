require({cache:{
'tetra/dom':function(){
define("tetra/dom", ["./_base/kernel", "dojo/dom", "dojo/has"], function(kernel, dom, has) {

	return {
		start:function() {
			kernel.start();
			0 && console.log("Starting dom");
		},

		updateTitle:function() {
			var title = dom.byId("title");
			if(has("ie-event-behavior")) {
				require(["dojo/dom-style"], function(domStyle) {
					0 && console.log("Firing IE event");
					domStyle.set(title, "fontSize", "100px");
				});
			} else {
				require(["dojo/_base/fx"], function(fx) {
					0 && console.log("Firing FX event");
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
},
'tetra/_base/kernel':function(){
define([], function() {

	return {
		start: function() {
			0 && console.log("Starting");
		}
	};

});
}}});
require(["tetra/dom"], function(dom) {

	dom.start();
	dom.updateTitle();

});