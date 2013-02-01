// Overriding some globals for the purposes of the tests. 
//
// Note: pay particular attention to the DIR paths at the bottom of the file

(function(){

    "use strict";

 // Setup the VNS object. This must come *before* the call to tetra.extend
    var VNS = (typeof VNS === 'undefined') ? {} : VNS;

    VNS.context = {
        scriptsVersion : "test"
    };
    VNS.util = {
        AjaxPopupBox : function() {
            this.init = true;
        }
    };
    VNS.misc = {
        helper : {
        // Nothing to do
        }
    };
    VNS.os = {};

    // Setup the tetra default values
    tetra.extend({
		conf : {
			env : 'jQuery',
			jsVersion : VNS.context.scriptsVersion,
			authCallback : function() {
				tns.ajaxBox = new VNS.util.AjaxPopupBox(
						'/r/account/authentication/', {
							callback : 'tns.currentRequest',
							allowEscape : false,
							popupVar : 'tns.ajaxBox'
						});
			},
			currentRequestCallback : function() {
				if (tns.ajaxBox) {
					tns.ajaxBox.close();
				}
			},
			enableBootnode : true,
			APPS_PATH : '/test/fixtures/bootstrap',
			GLOBAL_PATH : '/test/fixtures/global',
            COMP_PATH : '/test/fixtures/comp'
		}
	}).start();

    // Enable debug mode, with a random string to suppress console messages
    tetra.debug.enable("blarg");
    
    // Override the requirejs onError, to prevent 404 load exceptions in the console
    requirejs.onError = function(err) {
        if(err.requireType === "scripterror") {
            if (typeof console !== "undefined") {
                console.warn("Requirejs failed to load the module(s)", err.requireModules, "with error", err);
            }
        } else {
            throw err;
        }
    };
})();