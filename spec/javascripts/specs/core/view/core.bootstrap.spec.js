// Testing the MVC core bootstrap functionality
// ====================================

// For documentation, see
// 
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/

// Note that
//  * Just like in the view tests, focus/blur are not behaving correctly under IE8 and under
//  * page IDs appear to be loaded as global variables, so be careful of the naming of your local vars

describe("the core MVC bootstrap mode", function() {

	"use strict";

	var
		d = document,
		_asyncLoaderTimeout = 5000
	;

	// Setting up a bootstrapped component
	// ----------------------------------------
	describe("setting up a bootstrapped page component", function(){
		
		beforeEach(function() {
			// Enable debug on a non-existent scope, to suppress messages
			loadFixtures("bootstrap.html");
		});
		
		afterEach(function() {
			core.view.destroy("myClickView", "myScope");
			core.view.destroy("myMouseoverView", "myScope");
			core.view.destroy("myFocusView", "myScope");
			core.view.destroy("myVcView", "myScope");
			core.view.destroy("myVcmView", "myScope");
			core.view.destroy("myNonExistantControllerView", "myScope");
			core.view.destroy("myRegisterNameDoesntMatchTheFileNameView", "myScope");
			core.view.destroy("myGlobalView", "myScope");
			
			core.controller.destroy("myVcController", "myScope");
			core.controller.destroy("myVcmController", "myScope");
			core.controller.destroy("myGlobalController", "myScope");
			core.model.destroy("myVcmModel", "myScope");
			core.model.destroy("myGlobalModel");
		});
		
		it("should load the resources for bootstrapped components invoked via a click event handler", function(){
			var 
				views,
				node
			;

			runs(function() {
				views = core.debug.view.list();
				node = d.getElementById("bootstrapClickTestNode");
				expect(views.myScope).toBeUndefined();
				
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});

			waitsFor(function() {
				views = core.debug.view.list();
				return views.myScope && views.myScope[0] === "myScope/myClickView";
			}, _asyncLoaderTimeout);
		});
		
		it("should load the resources for bootstrapped components invoked via a mouseover event handler", function(){
			var 
				views,
				node
			;
		
			runs(function() {
				views = core.debug.view.list();
				node = d.getElementById("bootstrapMouseoverTestNode");
				expect(views.myScope).toBeUndefined();
				
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "mouseover");
				node = null;
			});
	
			waitsFor(function() {
				views = core.debug.view.list();
				return views.myScope && views.myScope[0] === "myScope/myMouseoverView";
			}, _asyncLoaderTimeout);
		});

		it("should load the resources for bootstrapped components invoked via a focus event handler", function(){
			var 
				node,
				go = node && node.focus && (typeof node.focus === "function"),
				views;
			
			if(go) {
				runs(function() {
					views = core.debug.view.list();
					node = d.getElementById("bootstrapFocusTestNode");
					expect(views.myScope).toBeUndefined();
					
					// Trigger the dependency loading
					VNS.test.triggerEvent(node, "focus");
					node = null;
				});
		
				waitsFor(function() {
					views = core.debug.view.list();
					return views.myScope && views.myScope[0] === "myScope/myFocusView";
				}, _asyncLoaderTimeout);
			}
		});
		
		it("should load a view and its referenced controller for a bootstrapped component", function(){
			var 
				views,
				controllers,
				node
			;

			runs(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				node = d.getElementById("bootstrapVCTestNode");
				expect(views.myScope).toBeUndefined();
				expect(controllers.myScope).toBeUndefined();
				
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				return views.myScope && views.myScope[0] === "myScope/myVcView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myVcController";
			}, _asyncLoaderTimeout);
		});	
		
		it("should load a view, its controller & its model for a bootstrapped component", function(){
			var 
				views,
				controllers,
				models,
				node
			;

			runs(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				models = core.debug.model.list();
				node = d.getElementById("bootstrapVCMTestNode");
				
				expect(views.myScope).toBeUndefined();
				expect(controllers.myScope).toBeUndefined();
				expect(models).not.toContain("myScope/myVcmModel");
			
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				models = core.debug.model.list();
				return views.myScope && views.myScope[0] === "myScope/myVcmView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myVcmController" &&
					   models[0] === "myScope/myVcmModel";
			}, _asyncLoaderTimeout);
		});
		
		it("should load a view, its controller & its global model for a bootstrapped component", function(){
			var 
				views,
				controllers,
				models,
				node
			;

			runs(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				models = core.debug.model.list();
				node = d.getElementById("bootstrapGlobalTestNode");
				
				expect(views.myScope).toBeUndefined();
				expect(controllers.myScope).toBeUndefined();
				expect(models).not.toContain("g/myGlobalModel");
			
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				models = core.debug.model.list();

				return views.myScope && views.myScope[0] === "myScope/myGlobalView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myGlobalController" &&
					   models[0] === "g/myGlobalModel";
			}, _asyncLoaderTimeout);
		});

		// ### Error states ###
	
		it("should not attempt to reload components already loaded for a bootstrapped component", function(){
			var 
				scriptTagsLength,
				className,
				views,
				controllers,
				models,
				node,
				alreadyLoadedNode
			;

			runs(function() {
				node = d.getElementById("bootstrapVCMTestNode");
				alreadyLoadedNode = d.getElementById("bootstrapAlreadyLoadedTestNode");
			
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = core.debug.view.list();
				controllers =  core.debug.ctrl.list();
				models = core.debug.model.list();
				return views.myScope && views.myScope[0] === "myScope/myVcmView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myVcmController" &&
					   models[0] === "myScope/myVcmModel";
			}, _asyncLoaderTimeout);
			
			runs(function(){
				scriptTagsLength = VNS.test.query("script[id]").length;
				className = alreadyLoadedNode.className;
				
				// Trigger the dependency loading, though they should already be present
				VNS.test.triggerEvent(alreadyLoadedNode, "click");
			});
			
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(alreadyLoadedNode.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				alreadyLoadedNode = null;
			});
		});
		
		it("should fail to load resources for bootstrapped components invoked via mouseout", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = d.getElementById("bootstrapMouseoutTestNode");
				className = node.className;
				
				VNS.test.triggerEvent(node, "mouseout");
			});
			
			

			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(0, "as all scripts should have been destroyed");
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});
	
		it("should fail to load resources for bootstrapped components invoked via mousemove", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = d.getElementById("bootstrapMousemoveTestNode");
				className = node.className;
				VNS.test.triggerEvent(node, "mousemove");
			});

			
			
			runs(function() {
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(0, "as all scripts should have been destroyed");
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});
	
		it("should fail to load resources for bootstrapped components invoked via dblClick", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstraponDblClickTestNode");
				className = node.className;
				
				VNS.test.triggerEvent(node, "dblClick");
			});

			
			
			runs(function() {
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(0, "as all scripts should have been destroyed");
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});
	
		it("should fail to load resources for bootstrapped components invoked via change", function(){
			var 
				views,
				node, 
				className
			;
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapChangeTestNode");
				className = node.className;

				VNS.test.triggerEvent(node, "change");
			});

			
			
			runs(function() {
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(0, "as all scripts should have been destroyed");
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});
	
		it("should fail to load resources for bootstrapped components invoked via keydown", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapKeyDownNode");
				className = node.className;

				VNS.test.triggerEvent(node, "keydown");
			});
			
			
			
			runs(function() {
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(0, "as all scripts should have been destroyed");
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});

		it("should fail to load resources for bootstrapped components invoked via blur", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapBlurNode");
				className = node.className;
				
				VNS.test.triggerEvent(node, "blur");
			});
			
			
			
			runs(function() {
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(0, "as all scripts should have been destroyed");
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});

		it("should fail to register a component when the view cannot be found", function() {
			var 
				views,
				node,
				scriptsLength,
				lastScriptsLength
			;
		
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapNonExistantTestNode");
				lastScriptsLength = VNS.test.query("script[id]").length;
				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			// Wait until all scripts have been attached
			waitsFor(function() {
				scriptsLength = VNS.test.query("script[id]").length;
				if(scriptsLength !== lastScriptsLength) {
					lastScriptsLength = scriptsLength;
					return false;
				}
				return true;
			});
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = null;
			});

		});
	
		it("should fail to register a component when the view's controller cannot be found", function() {
			var 
				views,
				controllers,
				node,
				scriptsLength,
				lastScriptsLength
			;
	
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = core.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapNonExistantControllerTestNode");
				lastScriptsLength = VNS.test.query("script[id]").length;
				
				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			// Wait until all scripts have been attached
			waitsFor(function() {
				scriptsLength = VNS.test.query("script[id]").length;
				if(scriptsLength !== lastScriptsLength) {
					lastScriptsLength = scriptsLength;
					return false;
				}
				return true;
			});
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = core.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				node = null;
			});
		});
	
		it("should fail to register a component when the controller's model cannot be found", function() {
			var 
				views,
				controllers,
				models,
				node,
				scriptsLength,
				lastScriptsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = core.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				models = core.debug.model.list();
				expect(models.length).toBe(0);
				
				node = d.getElementById("bootstrapNonExistantModelTestNode");
				lastScriptsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});
			
			
	
			// Wait until all scripts have been attached
			waitsFor(function() {
				scriptsLength = VNS.test.query("script[id]").length;
				if(scriptsLength !== lastScriptsLength) {
					lastScriptsLength = scriptsLength;
					return false;
				}
				return true;
			});
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = core.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				models = core.debug.model.list();
				expect(models.length).toBe(0);
				node = null;
			});
		});

		it("should fail to load dependencies when the scope does not match the directory name", function() {
			var 
				views,
				node,
				scriptsLength,
				lastScriptsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				expect(views.myMissingScope).toBeUndefined();
				
				node = d.getElementById("bootstrapIncorrectScopeTestNode");
				lastScriptsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			// Wait until all scripts have been attached
			waitsFor(function() {
				scriptsLength = VNS.test.query("script[id]").length;
				if(scriptsLength !== lastScriptsLength) {
					lastScriptsLength = scriptsLength;
					return false;
				}
				return true;
			});
			
			runs(function(){
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				expect(views.myMissingScope).toBeUndefined();
				node = null;
			});
		});
	
		it("should fail when a bootstrapped component does not possess the 'bootnode' class", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapNoBootnodeTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;
				
				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});

		it("should fail when a bootstrapped component possesses an empty 'data-view' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapNoViewTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;
		
				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});

		it("should fail when a bootstrapped component does not possess the 'data-view' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapViewNotPresentTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();

				node = null;
			});
		});

		it("should fail when a bootstrapped component possesses an empty 'data-event' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapNoEventTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();

				node = null;
			});
		});
	
		it("should fail when a bootstrapped component does not possess the 'data-event' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapEventNotPresentTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;
				
				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
	
				node = null;
			});
		});

		it("should fail when the view contains invalid JavaScript", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapInvalidViewTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
	
				node = null;
			});
		});

		it("should fail when the controller contains invalid JavaScript", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapInvalidControllerTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
	
				node = null;
			});
		});

		it("should fail when the model contains invalid JavaScript", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootstrapInvalidModelTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = core.debug.view.list();
				expect(views.myScope).toBeUndefined();
	
				node = null;
			});
		});
	});
});