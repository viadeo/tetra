// Configuration of environnement and dependencies on Viadeo webapp
tetra.extend({
	conf: {
		env: 'jQuery',
		jsVersion: VNS.context.scriptsVersion,
		authCallback: function(){ 
			tns.ajaxBox = 
				new VNS.util.AjaxPopupBox('/r/account/authentication/', { 
						callback : 'tns.currentRequest', 
						allowEscape : false, 
						popupVar: 'tns.ajaxBox' 
				});
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