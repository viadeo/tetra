// Overriding some globals for the purposes of the tests. 
//
// Note: pay particular attention to the DIR paths at the bottom of the file

(function(){

    "use strict";
    
    var VNS = (typeof VNS === 'undefined') ? {} : VNS;
    
    VNS.context = {
            scriptsVersion: "test"
    };
    VNS.util = {
        AjaxPopupBox : function() {
            this.init = true;
        }
    };
    VNS.misc =  {
        helper: {
            // Nothing to do
        }
    };
    VNS.os = {};
    
    // Setup the core default values
    core.extend({
    	conf: {
    		env: 'jQuery',
    		jsVersion: VNS.context.scriptsVersion,
    		authCallback: function(){ 
    			core.ajaxBox = 
    				new VNS.util.AjaxPopupBox('/r/account/authentication/', { 
    						callback : 'core.currentRequest', 
    						allowEscape : false, 
    						popupVar: 'core.ajaxBox' 
    				});
    		},
    		currentRequestCallback: function() {
    			if(core.ajaxBox) {
    				core.ajaxBox.close();
    			}
    		},
    		enableBootstrap: true,
    		APPS_PATH : '/src/test/javascript/fixtures/bootstrap',
    		GLOBAL_PATH : '/src/test/javascript/fixtures/global',
        	disableViewInit: true
    	}
    }).start();
    
    // Enable debug mode, with a random string to suppress console messages
    core.debug.enable("blarg");
})();