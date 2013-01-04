// Configuration of environnement and dependencies on Viadeo webapp
tetra.extend({
	conf: {
		env: 'jQuery',
		jsVersion: VNS.context.scriptsVersion,
		authCallback: function(){ 
			if(!tns.ajaxBox) {
				tns.ajaxBox = new VNS.util.SecureLoginModalBox();
			}
			tns.ajaxBox.show();
		},
		currentRequestCallback: function() {
			if(tns.ajaxBox) {
				tns.ajaxBox.close();
			}
		},
		api: {
			apiKey: 'applicationName',  
	        status: true, 
	        cookie: true
		},
		enableBootstrap: true
	}
}).start();