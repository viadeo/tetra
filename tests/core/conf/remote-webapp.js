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
    
    // Setup the tetra default values
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
    		enableBootstrap: true,
    		APPS_PATH : '/src/test/javascript/fixtures/bootstrap',
    		GLOBAL_PATH : '/src/test/javascript/fixtures/global',
        	disableViewInit: true
    	}
    }).start();
    
    // Enable debug mode, with a random string to suppress console messages
    tetra.debug.enable("blarg");
})();