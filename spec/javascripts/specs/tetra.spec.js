// Testing the MVC `tetra` functionality
// ======================================

// For documentation, see
// 
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/

describe("public methods on the global 'tetra' object", function() {

	"use strict";
	
	// Test `tetra` global object integrity
	// -------------------------------------
	describe("the tetra MVC global object", function() {
		
		it("should have all expected public methods", function() {			
			expect(tetra.model).toBeDefined();
			expect(tetra.model.register).toBeDefined("as register should be a public method");
			expect(tetra.model.destroy).toBeDefined("as destroy should be a public method");
			
			expect(tetra.view).toBeDefined();
			expect(tetra.view.notify).toBeDefined("as notify should be a public method");
			expect(tetra.view.register).toBeDefined("as register should be a public method");
			expect(tetra.view.destroy).toBeDefined("as destroy should be a public method");
			
			expect(tetra.controller).toBeDefined();
			expect(tetra.controller.modelNotify).toBeDefined("as modelNotify should be a public method");
			expect(tetra.controller.notify).toBeDefined("as notify should be a public method");
			expect(tetra.controller.exec).toBeDefined("as exec should be a public method");
			expect(tetra.controller.register).toBeDefined("as register should be a public method");
			expect(tetra.controller.destroy).toBeDefined("as destroy should be a public method");
		});
		
		it("should be able to turn on debug mode", function() {
		    delete tetra.debug.man;
		    delete tetra.debug.view;
		    delete tetra.debug.ctrl;
		    delete tetra.debug.model;
		    
			expect(tetra.debug.man).toBeUndefined();
			tetra.debug.enable("blarg");
			expect(tetra.debug.man).toBeDefined();
		});
		
		it("should print out the man text to the console", function() {
		    tetra.debug.enable("blarg");
		    var result = tetra.debug.man();
		    expect(result).toBeTruthy();
		    
		    result = false;
		    result = tetra.debug.view.man();
		    expect(result).toBeTruthy();
		    
		    result = false;
            result = tetra.debug.ctrl.man();
            expect(result).toBeTruthy();
            
            result = false;
            result = tetra.debug.model.man();
            expect(result).toBeTruthy();
		});
	});
	
	describe("the tetra MVC debug mode", function() {

		afterEach(function(){
			tetra.model.destroy("myModel");
			tetra.controller.destroy("myController", "myScope");
			tetra.view.destroy("myView", "myScope");
		});
		
		it("should be able to list all models, views and controllers", function(){
			tetra.model.register("myModel", {});
			tetra.controller.register("myController", {
				scope: "myScope",
				constr: function(me, app, page, orm) {
					return {
						events: {}
					};
				}
			});
			tetra.view.register("myView", {
				scope: "myScope",
				constr: function(me, app) {
					return {
						events: {}
					};
				}
			});
			
			var models = tetra.debug.model.list();
			expect(models).toContain("g/myModel");
			expect(models.length).toBe(1);
			
			var controllers = tetra.debug.ctrl.list();
			expect(controllers.myScope).toBeDefined();
			expect(controllers.myScope[0]).toBe("myScope/myController");
			expect(VNS.test.getObjectLength(controllers)).toBe(1);
			
			var views = tetra.debug.view.list();
			expect(views.myScope).toBeDefined();
			expect(views.myScope[0]).toBe("myScope/myView");
			expect(VNS.test.getObjectLength(views)).toBe(1);
		});
		
		
		it("should be able to retrieve a particular model, view or controller", function(){
			tetra.model.register("myModel", {});
			tetra.controller.register("myController", {
				scope: "myScope",
				constr: function(me, app, page, orm) {
					return {
						events: {}
					};
				}
			});
			tetra.view.register("myView", {
				scope: "myScope",
				constr: function(me, app) {
					return {
						events: {}
					};
				}
			});
			
			var myModel = tetra.debug.model.retrieve("myImaginaryModel");
			expect(myModel).toBeUndefined();
			myModel = tetra.debug.model.retrieve("g", "myModel");
			expect(myModel).toBeDefined();
			
			var myController = tetra.debug.ctrl.retrieve("myNonExistantScope", "myController");
			expect(myController).toBeUndefined();
			myController = tetra.debug.ctrl.retrieve("myScope", "myController");
			expect(myController).toBeDefined();
			
			var myView = tetra.debug.view.retrieve("myNonExistantScope", "myView");
			expect(myView).toBeUndefined();
			myView = tetra.debug.view.retrieve("myScope", "myView");
			expect(myView).toBeDefined();
		});
	});
});