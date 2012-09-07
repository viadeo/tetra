// Testing the MVC `core` functionality
// ======================================

// For documentation, see
// 
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/

describe("public methods on the global 'core' object", function() {

	"use strict";
	
	// Test `core` global object integrity
	// -------------------------------------
	describe("the core MVC global object", function() {
		
		it("should have all expected public methods", function() {			
			expect(core.model).toBeDefined();
			expect(core.model.register).toBeDefined("as register should be a public method");
			expect(core.model.destroy).toBeDefined("as destroy should be a public method");
			
			expect(core.view).toBeDefined();
			expect(core.view.notify).toBeDefined("as notify should be a public method");
			expect(core.view.register).toBeDefined("as register should be a public method");
			expect(core.view.destroy).toBeDefined("as destroy should be a public method");
			
			expect(core.controller).toBeDefined();
			expect(core.controller.modelNotify).toBeDefined("as modelNotify should be a public method");
			expect(core.controller.notify).toBeDefined("as notify should be a public method");
			expect(core.controller.exec).toBeDefined("as exec should be a public method");
			expect(core.controller.register).toBeDefined("as register should be a public method");
			expect(core.controller.destroy).toBeDefined("as destroy should be a public method");
		});
		
		it("should be able to turn on debug mode", function() {
		    delete core.debug.man;
		    delete core.debug.view;
		    delete core.debug.ctrl;
		    delete core.debug.model;
		    
			expect(core.debug.man).toBeUndefined();
			core.debug.enable("blarg");
			expect(core.debug.man).toBeDefined();
		});
	});
	
	describe("the core MVC debug mode", function() {

		afterEach(function(){
			core.model.destroy("myModel");
			core.controller.destroy("myController", "myScope");
			core.view.destroy("myView", "myScope");
		});
		
		it("should be able to list all models, views and controllers", function(){
			core.model.register("myModel", {});
			core.controller.register("myController", {
				scope: "myScope",
				constr: function(me, app, page, orm) {
					return {
						events: {}
					};
				}
			});
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app) {
					return {
						events: {}
					};
				}
			});
			
			var models = core.debug.model.list();
			expect(models).toContain("g/myModel");
			expect(models.length).toBe(1);
			
			var controllers = core.debug.ctrl.list();
			expect(controllers.myScope).toBeDefined();
			expect(controllers.myScope[0]).toBe("myScope/myController");
			expect(VNS.test.getObjectLength(controllers)).toBe(1);
			
			var views = core.debug.view.list();
			expect(views.myScope).toBeDefined();
			expect(views.myScope[0]).toBe("myScope/myView");
			expect(VNS.test.getObjectLength(views)).toBe(1);
		});
		
		
		it("should be able to retrieve a particular model, view or controller", function(){
			core.model.register("myModel", {});
			core.controller.register("myController", {
				scope: "myScope",
				constr: function(me, app, page, orm) {
					return {
						events: {}
					};
				}
			});
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app) {
					return {
						events: {}
					};
				}
			});
			
			var myModel = core.debug.model.retrieve("myImaginaryModel");
			expect(myModel).toBeUndefined();
			myModel = core.debug.model.retrieve("g", "myModel");
			expect(myModel).toBeDefined();
			
			var myController = core.debug.ctrl.retrieve("myNonExistantScope", "myController");
			expect(myController).toBeUndefined();
			myController = core.debug.ctrl.retrieve("myScope", "myController");
			expect(myController).toBeDefined();
			
			var myView = core.debug.view.retrieve("myNonExistantScope", "myView");
			expect(myView).toBeUndefined();
			myView = core.debug.view.retrieve("myScope", "myView");
			expect(myView).toBeDefined();
		});
	});
});