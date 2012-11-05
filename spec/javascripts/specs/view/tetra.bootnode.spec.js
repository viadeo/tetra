// Testing the MVC tetra bootnode functionality
// ====================================

// For documentation, see
//
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/

// Note that
//  * Just like in the view tests, focus/blur are not behaving correctly under IE8 and under
//  * page IDs appear to be loaded as global variables, so be careful of the naming of your local vars

describe("the tetra bootnode mode", function() {

	"use strict";

	var
		d = document,
		_asyncLoaderTimeout = 5000
	;

	// Setting up a bootnoded component
	// ----------------------------------------
	describe("setting up a bootnoded page component", function(){
		
		beforeEach(function() {
			// Enable debug on a non-existent scope, to suppress messages
			loadFixtures("bootnode.html");
		});
		
		afterEach(function() {
			tetra.view.destroy("myClickView", "myScope");
			tetra.view.destroy("myMouseoverView", "myScope");
			tetra.view.destroy("myFocusView", "myScope");
			tetra.view.destroy("myVcView", "myScope");
			tetra.view.destroy("myVcmView", "myScope");
			tetra.view.destroy("myNonExistantControllerView", "myScope");
			tetra.view.destroy("myRegisterNameDoesntMatchTheFileNameView", "myScope");
			tetra.view.destroy("myGlobalView", "myScope");
			
			tetra.controller.destroy("myVcController", "myScope");
			tetra.controller.destroy("myVcmController", "myScope");
			tetra.controller.destroy("myGlobalController", "myScope");
			tetra.model.destroy("myVcmModel", "myScope");
			tetra.model.destroy("myGlobalModel");
		});
		
		it("should load the resources for bootnoded components invoked via a click event handler", function(){
			var 
				views,
				node
			;

			runs(function() {
				views = tetra.debug.view.list();
				node = d.getElementById("bootnodeClickTestNode");
				expect(views.myScope).toBeUndefined();
				
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});

			waitsFor(function() {
				views = tetra.debug.view.list();
				return views.myScope && views.myScope[0] === "myScope/myClickView";
			}, _asyncLoaderTimeout);
		});
		
		it("should load the resources for bootnoded components invoked via a mouseover event handler", function(){
			var 
				views,
				node
			;
		
			runs(function() {
				views = tetra.debug.view.list();
				node = d.getElementById("bootnodeMouseoverTestNode");
				expect(views.myScope).toBeUndefined();
				
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "mouseover");
				node = null;
			});
	
			waitsFor(function() {
				views = tetra.debug.view.list();
				return views.myScope && views.myScope[0] === "myScope/myMouseoverView";
			}, _asyncLoaderTimeout);
		});

		it("should load the resources for bootnoded components invoked via a focus event handler", function(){
			var 
				node,
				go = node && node.focus && (typeof node.focus === "function"),
				views;
			
			if(go) {
				runs(function() {
					views = tetra.debug.view.list();
					node = d.getElementById("bootnodeFocusTestNode");
					expect(views.myScope).toBeUndefined();
					
					// Trigger the dependency loading
					VNS.test.triggerEvent(node, "focus");
					node = null;
				});
		
				waitsFor(function() {
					views = tetra.debug.view.list();
					return views.myScope && views.myScope[0] === "myScope/myFocusView";
				}, _asyncLoaderTimeout);
			}
		});
		
		it("should load a view and its referenced controller for a bootnoded component", function(){
			var 
				views,
				controllers,
				node
			;

			runs(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				node = d.getElementById("bootnodeVCTestNode");
				expect(views.myScope).toBeUndefined();
				expect(controllers.myScope).toBeUndefined();
				
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				return views.myScope && views.myScope[0] === "myScope/myVcView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myVcController";
			}, _asyncLoaderTimeout);
		});	
		
		it("should load a view, its controller & its model for a bootnoded component", function(){
			var 
				views,
				controllers,
				models,
				node
			;

			runs(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				models = tetra.debug.model.list();
				node = d.getElementById("bootnodeVCMTestNode");
				
				expect(views.myScope).toBeUndefined();
				expect(controllers.myScope).toBeUndefined();
				expect(models).not.toContain("myScope/myVcmModel");
			
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				models = tetra.debug.model.list();
				return views.myScope && views.myScope[0] === "myScope/myVcmView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myVcmController" &&
					   models[0] === "myScope/myVcmModel";
			}, _asyncLoaderTimeout);
		});
		
		it("should load a view, its controller & its global model for a bootnoded component", function(){
			var 
				views,
				controllers,
				models,
				node
			;

			runs(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				models = tetra.debug.model.list();
				node = d.getElementById("bootnodeGlobalTestNode");
				
				expect(views.myScope).toBeUndefined();
				expect(controllers.myScope).toBeUndefined();
				expect(models).not.toContain("g/myGlobalModel");
			
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				models = tetra.debug.model.list();

				return views.myScope && views.myScope[0] === "myScope/myGlobalView" &&
					   controllers.myScope && controllers.myScope[0] === "myScope/myGlobalController" &&
					   models[0] === "g/myGlobalModel";
			}, _asyncLoaderTimeout);
		});
		
		it("should handle the data-comp attribute", function(){
		   // TODO Implement 
		    // TODO Look at COMP_PATH in tetra.js
		});

		// ### Error states ###
	
		it("should not attempt to reload components already loaded for a bootnoded component", function(){
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
				node = d.getElementById("bootnodeVCMTestNode");
				alreadyLoadedNode = d.getElementById("bootnodeAlreadyLoadedTestNode");
			
				// Trigger the dependency loading
				VNS.test.triggerEvent(node, "click");
				node = null;
			});
	
			waitsFor(function() {
				views = tetra.debug.view.list();
				controllers =  tetra.debug.ctrl.list();
				models = tetra.debug.model.list();
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
		
		it("should fail to load resources for bootnoded components invoked via mouseout", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = d.getElementById("bootnodeMouseoutTestNode");
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
	
		it("should fail to load resources for bootnoded components invoked via mousemove", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function() {
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = d.getElementById("bootnodeMousemoveTestNode");
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
	
		it("should fail to load resources for bootnoded components invoked via dblClick", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeonDblClickTestNode");
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
	
		it("should fail to load resources for bootnoded components invoked via change", function(){
			var 
				views,
				node, 
				className
			;
			
			runs(function(){
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeChangeTestNode");
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
	
		it("should fail to load resources for bootnoded components invoked via keydown", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeKeyDownNode");
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

		it("should fail to load resources for bootnoded components invoked via blur", function(){
			var 
				views,
				node,
				className
			;
			
			runs(function(){
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeBlurNode");
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeNonExistantTestNode");
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
				views = tetra.debug.view.list();
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = tetra.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeNonExistantControllerTestNode");
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = tetra.debug.ctrl.list();
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = tetra.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				models = tetra.debug.model.list();
				expect(models.length).toBe(0);
				
				node = d.getElementById("bootnodeNonExistantModelTestNode");
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				controllers = tetra.debug.ctrl.list();
				expect(controllers.myScope).toBeUndefined();
				
				models = tetra.debug.model.list();
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				expect(views.myMissingScope).toBeUndefined();
				
				node = d.getElementById("bootnodeIncorrectScopeTestNode");
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				expect(views.myMissingScope).toBeUndefined();
				node = null;
			});
		});
	
		it("should fail when a bootnoded component does not possess the 'bootnode' class", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeNoBootnodeTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;
				
				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});

		it("should fail when a bootnoded component possesses an empty 'data-view' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeNoViewTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;
		
				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				node = null;
			});
		});

		it("should fail when a bootnoded component does not possess the 'data-view' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeViewNotPresentTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();

				node = null;
			});
		});

		it("should fail when a bootnoded component possesses an empty 'data-event' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeNoEventTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});
	
			
			
			runs(function(){
				// No loading class should have been added, and there should be the same number of scripts
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();

				node = null;
			});
		});
	
		it("should fail when a bootnoded component does not possess the 'data-event' attribute", function() {
			var 
				views,
				node,
				className,
				scriptTagsLength
			;
			
			runs(function() {
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeEventNotPresentTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;
				
				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeInvalidViewTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeInvalidControllerTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
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
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
				
				node = d.getElementById("bootnodeInvalidModelTestNode");
				className = node.className;
				scriptTagsLength = VNS.test.query("script[id]").length;

				VNS.test.triggerEvent(node, "click");
			});

			runs(function(){
				expect(node.className).toEqual(className);
				expect(VNS.test.query("script[id]").length).toBe(scriptTagsLength);
				
				views = tetra.debug.view.list();
				expect(views.myScope).toBeUndefined();
	
				node = null;
			});
		});
	});
});