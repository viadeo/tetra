// Testing the MVC tetra templating functionality

describe("templating; ", function() {

	"use strict";
	
	// Instantiation
	// ------------------
	describe("controller template evaluation", function() {

		beforeEach(function(){
			loadFixtures("templating.html");
		});
		
		afterEach(function(){
			tetra.view.destroy("myView", "myScope");
			
			tetra.controller.destroy("myFirstCtrl", "myScope");
			tetra.controller.destroy("myCtrl", "myScope");
			tetra.controller.destroy("otherCtrl", "myScope");
			tetra.controller.destroy("otherCtrl", "outOfTheScope");
			
			tetra.model.destroy("myModel", "myScope");
		});
		
		it("should evaluate a simple template", function() {			
			var spy = sinon.spy();
			
			// Creates myScope/myController			
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {
					actions : {
						'box': function(data, render) {
							render({title: 'Template', message: data});
						}
					}
				};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('box', 'myCtrl', "Hello world!", function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should evaluate a simple template without controller", function() {
			var spy = sinon.spy();
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('box', {title: 'Template', message: 'Hello world!'}, function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should evaluate a simple template in a javascript string", function() {
			var spy = sinon.spy();
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('<div id="box"><h1>{%=title%}</h1><p>{%=message%}</p></div>', {title: 'Template', message: 'Hello world!'}, function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should evaluate a simple template in a javascript string called in actions", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController			
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {
					actions : {
						'box': function(data, render) {
							render({title: 'Template', message: data}, '<div id="box2"><h1>{%=title%}</h1><p>{%=message%}</p></div>');
						}
					}
				};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('box', 'myCtrl', "Hello world!", function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box2"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should evaluate a template with component inclusion", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {
					actions : {
						'article': function(data, render) {
							render({title: 'Template', message: data});
						},
						
						'title': function(data, render) {
							render(data);
						}
					}
				};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('article', 'myCtrl', "Hello world!", function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should evaluate a template in another controller", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {
					actions : {
						'box': function(data, render) {
							render({title: 'Template', message: data});
						}
					}
				};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('box', 'myCtrl', "Hello world!", function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should not evaluate a template in a controller outside of the scope", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('otherCtrl', {
				scope : 'outOfTheScope',
				constr : function(me, app, page, orm) { return {
					events : {
						view: {}
					},
					actions : {
						'box': function(data, render) {
							spy(data);
							render({title: 'Template', message: data});
						}
					}
				};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('box', 'otherCtrl', "Hello world!", function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			tetra.controller.notify("display a box", "Hello world!", "myScope");
			expect(spy.called).toBeFalsy();
		});
		
		it("should call directly the render function if action is not defined", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('box', 'myCtrl', {title: 'Template', message: "Hello world!"}, function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should call directly the render function if action is not defined with component inclusion", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('article', 'myCtrl', {title: 'Template', message: "Hello world!"}, function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="box"><h1>Template</h1><p>Hello world!</p></div>');
		});
		
		it("should evaluate a template function with multiple inclusion of the same component", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('multiple', 'myCtrl', {titles: ['Template1', 'Template2', 'Template3', 'Template4']}, function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<ol id="multiple"><li title="Template1">Template1</li><li title="Template2">Template2</li><li title="Template3">Template3</li><li title="Template4">Template4</li></ol>');
		});
		
		it("should evaluate a template function with cascading component inclusion", function() {
			var spy = sinon.spy();
			
			// Creates myScope/myController
			tetra.controller.register('myCtrl', {
				scope : 'myScope',
				constr : function(me, app, page, orm) { return {};}
			});
			
			tetra.view.register('myView', {
				scope : 'myScope',
				constr : function(me, app, _) { return {
					events : {},
					methods : {
						init : function() {
							app.exec('cascade', 'myCtrl', {title: 'Template', message: "Hello world!"}, function(html) {
								spy(html);
							});
						}
					}
				};}
			});
			
			// Try to notify on the correct scope
			expect(spy.called).toBeTruthy();
			expect(spy.calledTwice).toBeFalsy();
			
			var html = spy.getCall(0).args[0];
			expect(html).toBeDefined();
			expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="parent"><div id="box"><h1>Template</h1><p>Hello world!</p></div></div>');
		});
		
		it("should evaluate a template with cascading component inclusion and asynchronous actions", function() {
			var spy = sinon.spy();
			
			// Create model for asynchronous call
            this.server = sinon.fakeServer.create();
            this.server.respondWith("GET", /\/my\/test/,
                    [200, {"Content-type": "application/json"}, "{}"]);
            
            var
            	that = this,
            	rendered = false
            ;
            
            runs(function() {
	            tetra.model.register("myModel", {
	            	scope: "myScope",
	                req: {
	                    fetch: {
	                        url: "/my/test/fetch.json"
	                    }
	                },
	                attr: {
	                    success: false
	                },
	                methods: function(attr) { return {}; }
	            });
				
				// Creates myScope/myController
				tetra.controller.register('myCtrl', {
					scope : 'myScope',
					constr : function(me, app, page, orm) { return {
						actions : {
							'article': function(data, render) {
								orm('myModel').fetch({}, function() {
									render(data);
								});
							},
							'title': function(data, render) {
								orm('myModel').fetch({}, function() {
									render(data);
								});
							}
						}
					};}
				});
				
				tetra.view.register('myView', {
					scope : 'myScope',
					constr : function(me, app, _) { return {
						events : {},
						methods : {
							init : function() {
								app.exec('cascade', 'myCtrl', {title: 'Template', message: 'Hello world!'}, function(html) {
									spy(html);
									rendered = true;
								});
							}
						}
					};}
				});

                that.server.respond();
            });
            
			waitsFor(function() {
				return rendered == true;
			}, 2000);
			
			runs(function() {
				// Try to notify on the correct scope
				expect(spy.called).toBeTruthy();
				expect(spy.calledTwice).toBeFalsy();
				
				var html = spy.getCall(0).args[0];
				expect(html).toBeDefined();
				expect(html.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+</g,'<').replace(/>\s+/g,'>')).toEqual('<div id="parent"><div id="box"><h1>Template</h1><p>Hello world!</p></div></div>');

				that.server.restore();
			});
		});
		
		// -- Error States -- 
		
		// TODO Currently we swallow all errors, but perhaps we should do this differently ..
		xit("should handle invalid templates", function() {
		    var spy = sinon.spy();
            
            tetra.view.register('myView', {
                scope : 'myScope',
                constr : function(me, app, _) { return {
                    events : {},
                    methods : {
                        init : function() {
                            expect(function(){
                                app.exec('<div id="box"><h1>{%=title%}</h1><p>{%message%}</p></div>', {title: 'Template', message: 'Hello world!'}, function(html) {
                                    spy(html);
                                });
                            }).toThrow();
                        }
                    }
                };}
            });
		});
		
		it("should throw an exception if the template is not found", function() {
		    
		});
		
		it("should use components if the controller is not defined", function() {
		    
		});
	});
});