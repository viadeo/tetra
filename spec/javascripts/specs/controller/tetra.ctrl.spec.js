// Testing the MVC tetra controller functionality
// ====================================

// For documentation, see
// 
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/
//
// Note the following naming conventions:
//
// * Model - `myModel`, `mySecondModel`, etc.
// * Controller - `myController`, `mySecondController`, etc.
// * View - `myView`, `mySecondView`, etc.
// * Scope - `myScope`, `mySecondScope`, etc.
//
// As the tests are currently setup, any model/view/controller named `myModel`, `myView`, `myController` will 
// automatically be cleaned up after each test. For any other names, you **must** cleanup the objects yourself and **always**
// in the `afterEach` function. Otherwise, if an exception is thrown in your test, it may never reach the line that
// destroys the object and this could impact on subsequent tests. `afterEach` will **always** be called.
//
// We also make use of the `spy()` function, provided by the Sinon.js library.
// The spy object should always be reset in the `afterEach`.

describe("the controller; ", function() {

    "use strict";
    
    // Instantiation
    // ------------------
    describe("instantiation", function() {
        
        afterEach(function(){
            tetra.controller.destroy("myController", "myScope");
            tetra.controller.destroy("myNewController", "myScope");
            tetra.controller.destroy("myController", "mySecondScope");
            tetra.controller.destroy("mySecondController", "myScope");
            tetra.controller.destroy("test", "testscope");
            tetra.controller.destroy("myGlobalController", "myScope");
            tetra.model.destroy("myModel", "myScope");
        });
        
        it("should register a successfully created controller", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();

            // Creates a controller with the name "myController" in the scope of "myScope"
            // i.e. app path is myScope/myController
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function() {}
            });
            
            // Creates a controller with the name "mySecondController" in the scope of "myScope", this
            // time with most properties populated
            tetra.model.register("myModel", { scope: "myScope" });
            tetra.controller.register("mySecondController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            user: {
                                "click": {
                                    ".mySelector" : function() {
                                        return;
                                    }
                                }
                            },
                            model : {
                                "myModel" : {
                                    "call" : function() {
                                        return;
                                    },
                                    "complete" : function() {
                                        return;
                                    },
                                    "append" : function() {
                                        return;
                                    },
                                    "create" : function() {
                                        return;
                                    },
                                    "saved" : function() {
                                        return;
                                    },
                                    "save": function() {
                                        return;
                                    },
                                    "delete": function() {
                                        return;
                                    },
                                    "error": function() {
                                        return;
                                    },
                                    "invalid": function() {
                                      
                                    }
                                }
                            },
                            view: {
                                "myHandler" : function() {
                                    return;
                                }
                            }
                        },
                        methods: {
                            init: function() {
                                return me;
                            },
                            
                            myMethod: function() {
                                return;
                            }
                        }
                    };
                }
            });
            
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeDefined();
            expect(controllers.myScope[0]).toBe("myScope/myController");
            expect(controllers.myScope[1]).toBe("myScope/mySecondController");
            expect(controllers.myController).toBeUndefined("as this is the application name, not the scope");
        });
        
        it("should register multiple controllers on the same scope", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
            expect(controllers.testcope).toBeUndefined();
            
            // Creates myScope/myController
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function() {}
            });
            
            // Creates myScope/mySecondController
            tetra.controller.register("mySecondController", {
                scope: "myScope",
                constr: function() {}
            });
            
            // Creates testscope/test
            tetra.controller.register("test", {
                scope: "testscope",
                constr: function() {}
            });
            
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeDefined();
            expect(controllers.myScope[0]).toBe("myScope/myController");
            expect(controllers.myScope[1]).toBe("myScope/mySecondController");
            expect(controllers.testscope).toBeDefined();
            expect(controllers.testscope[0]).toBe("testscope/test");
            expect(controllers.myController).toBeUndefined("as this is the application name, not the scope");
        });
        
        it("should register multiple controllers on different scopes", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
            expect(controllers.testscope).toBeUndefined();
            
            // Creates myScope/myController
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function() {}
            });
            
            // Creates testscope/myScope
            tetra.controller.register("test", {
                scope: "testscope",
                constr: function() {}
            });
            
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeDefined();
            expect(controllers.myScope[0]).toBe("myScope/myController");
            expect(controllers.testscope).toBeDefined();
            expect(controllers.testscope[0]).toBe("testscope/test");
            expect(controllers.myController).toBeUndefined("as this is the application name, not the scope");
            expect(controllers.test).toBeUndefined("as this is the application name, not the scope");
        });
        
        it("should register the same controller on different scopes", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
            expect(controllers.mySecondController).toBeUndefined();
            
            // Creates myScope/myController
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function() {}
            });
            
            // Creates mySecondScope/myController
            tetra.controller.register("myController", {
                scope: "mySecondScope",
                constr: function() {}
            });
            
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeDefined();
            expect(controllers.myScope[0]).toBe("myScope/myController");
            expect(controllers.mySecondScope).toBeDefined();
            expect(controllers.mySecondScope[0]).toBe("mySecondScope/myController");
            
            // This is the app name, not the scope, so it shouldn't exist at this level
            expect(controllers.myController).toBeUndefined("as this is the application name, not the scope");
        });
        
        it("should conditionally register a controller *only* if its dependencies have already been loaded or could be retrieved using requireJS", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
            
            tetra.controller.register("myController", {
                use: ["myNonExistentModel"],
                scope: "myScope",
                constr: function() {}
            });

            // Verify that the controller has *not* been created
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
        });
        
        it("should be able to destroy a controller", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();

            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function() {}
            });
            
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeDefined();
            
            tetra.controller.destroy("myController", "myScope");
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined("as it should have been destroyed");
        });

        it("should be able to notify a controller, as if from a view", function() {
            var spy = sinon.spy();
            
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            view: {
                                "myTestViewEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            tetra.controller.register("mySecondController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            view: {
                                "myTestViewEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            tetra.controller.register("myThirdController", {
                scope: "mySecondScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            view: {
                                "myTestViewEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            // Try to notify, but on the wrong scope
            tetra.controller.notify("myTestViewEvent", {foo: "bar"}, "myUselessScope");
            expect(spy.called).toBeFalsy();
            
            // Try to notify on the correct scope
            tetra.controller.notify("myTestViewEvent", {foo: "bar"}, "myScope");
            expect(spy.called).toBeTruthy();
            expect(spy.calledTwice).toBeTruthy();
            
            var data = spy.getCall(0).args[0];
            expect(data.foo).toBeDefined();
            expect(data.foo).toBe("bar");
            
            tetra.controller.destroy("mySecondController", "myScope");
            tetra.controller.destroy("myThirdController", "mySecondScope");
        });
        
        it("should be able to notify a controller, as if from a model", function() {
            var spy = sinon.spy();
            
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myTestModelEvent": {
                                    "create": function(data) {
                                        spy(data);
                                    }
                                }
                            }
                        }
                    };
                }
            });
            
            // Try to notify, but on the wrong type
            tetra.controller.modelNotify("myTestModelEvent", "call", [{foo: "bar"}]);
            expect(spy.called).toBeFalsy();
            
            // Try to notify on the correct scope
            tetra.controller.modelNotify("myTestModelEvent", "create", [{foo: "bar"}]);
            expect(spy.called).toBeTruthy();
            expect(spy.calledOnce).toBeTruthy();
            
            var data = spy.getCall(0).args[0];
            expect(data.foo).toBeDefined();
            expect(data.foo).toBe("bar");
        });        

        // ### Error states ###
        
        it("should throw an exception when the controller has no name or params", function() {
            var controllers = tetra.debug.ctrl.list();
            
            // Confirm that scope myScope does not already exist
            expect(controllers.myScope).toBeUndefined();
            
            // Try to create a controller in various invalid ways
            expect(tetra.controller.register).toThrow();
            expect(function(){tetra.controller.register("myController");}).toThrow();
            expect(function(){tetra.controller.register(null, {
              scope: "myScope",
              constr: null
            })}).toThrow();
            
            
            // myScope should still not exist
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
        });
        
        it("should throw an exception when the controller has no scope or constructor", function() {
            var controllers = tetra.debug.ctrl.list();
            
            expect(controllers.myScope).toBeUndefined();
            
            // Try to create a controller in various invalid ways
            expect(function(){tetra.controller.register("myController", {});}).toThrow();
            expect(function(){tetra.controller.register("myController", {scope: "myScope"});}).toThrow();
            expect(function(){tetra.controller.register("myController", {constr: function(){}});}).toThrow();
            
            // scope "myScope" should still not exist
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
        });
        
        // This test is just to confirm that errors are not being swallowed by the register method
        it("should throw an exception if any error occurs in a controller", function() {
            var controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
            
            // error: variable blarg has no var keyword
            var init = {
                scope: "mySecondScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init : function() {
                                me.methods._myTestMethod();
                            },
                            _myTestMethod : function() {
                                // -- Uh oh -- an error has occurred
                                throw new Error();
                            }
                        }
                    };
                }
            };
            
            expect(function(){tetra.controller.register("myController", init);}).toThrow();
            
            controllers = tetra.debug.ctrl.list();
            expect(controllers.myScope).toBeUndefined();
        });
        
        it("should not be able to load a controller twice", function() {
            var init = {
                    scope: "myScope",
                    constr: function(me, app, page, orm) {
                        return {
                            events: {}
                        };
                    }
            };

            if(typeof window.console === "undefined") {
                window.console = {
                    warn: function(){}
                };
            }
            var stub = sinon.stub(window.console, "warn");

            expect(function(){tetra.controller.register("myController", init);}).not.toThrow();
            expect(function(){tetra.controller.register("myController", init);}).not.toThrow();
            expect(stub.callCount).toBe(1);

            stub.restore();
        });
    });
    
    // Controller configuration
    // --------------------
    describe("configuration", function() {
        
        beforeEach(function(){
            this.spy = sinon.spy();
        });
        
        afterEach(function(){
            tetra.controller.destroy("myController", "myScope");
            this.spy = null;
        });
        
        it("should fire its init() method once, during start up", function() {
            var that = this;
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                that.spy();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy("as the init() method should only have fired once");
        });
        
        it("should set a reference to itself as 'me' and make it available to its constructor method", function() {
            var 
                me,
                that = this
            ;
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                that.spy(me);
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            
            // 'me' should be an object of the form:
            //
            //    {
            //        events: {},
            //        methods: {init: function(){ ... }},
            //        scope: 'myScope'
            //    }
            me = this.spy.getCall(0).args[0];
            expect(me).toBeDefined();
            expect(me).toEqual(jasmine.any(Object));
            
            expect(me.events).toBeDefined();
            expect(me.methods).toBeDefined();
            expect(me.methods.init).toBeDefined();            
            expect(me.methods.init).toEqual(jasmine.any(Function));
            expect(me.scope).toBeDefined();
            expect(me.scope).toBe("myScope");
        });
        
        it("should make 'app' available to its constructor method", function() {
            var 
                app,
                that = this
            ;
            
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                that.spy(app);
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            
            // Check the app object, it should be of the form:
            //
            //    {
            //        notify: function(){ ... }
            //    }
            app = this.spy.getCall(0).args[0];
            
            expect(app).toBeDefined();
            expect(app).toEqual(jasmine.any(Object));
            expect(app.notify).toBeDefined();
            expect(app.notify).toEqual(jasmine.any(Function));
        });
        
        it("should make 'page' available to its constructor method", function() {
            var 
                page,
                that = this
            ;
            
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                that.spy(page);
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            
            // Check the page object, it should be of the form
            //
            //    {
            //        notify: function(){ ... }
            //    }
            page = this.spy.getCall(0).args[0];
            expect(page).toBeDefined();
            expect(page).toEqual(jasmine.any(Object));
            expect(page.notify).toBeDefined();
            expect(page.notify).toEqual(jasmine.any(Function));
        });
        
        it("should make 'orm' available to its constructor method", function() {
            var 
                orm,
                that = this
            ;
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                that.spy(orm);
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            orm = this.spy.getCall(0).args[0];
            expect(orm).toBeDefined();
            expect(orm).toEqual(jasmine.any(Function));
        });
        
        it("should allow functions to be set on the methods object", function() {
            var 
                methods,
                that = this
            ;
            
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init : function() {
                                me.methods._myTestMethod();
                            },
                            _myTestMethod : function() {
                                that.spy(me.methods);
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            
            methods = this.spy.getCall(0).args[0];
            expect(VNS.test.getObjectLength(methods)).toBe(2, "as there should only be two functions on the methods object");
            expect(methods.init).toBeDefined();
            expect(methods.init).toEqual(jasmine.any(Function));
            expect(methods._myTestMethod).toBeDefined();
            expect(methods._myTestMethod).toEqual(jasmine.any(Function));
        });
    });
    
    
    // Controller notifications
    // -----------------------------------
    describe("communication with the model", function() {

        afterEach(function() {
            tetra.controller.destroy("myController", "myScope");
            tetra.model.destroy("myModel", "myScope");
            tetra.model.destroy("mySecondModel", "myScope");
        });
        
        it("should respond to an app.notify()", function() {
            var spy = sinon.spy();            
        
            tetra.model.register("myModel", { scope: "myScope" });
            tetra.model.register("mySecondModel", { scope: "myScope" });            
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            view: {
                                "test" : function() {
                                    // This shouldn't be called
                                    me.methods._myTestMethod();
                                }
                            },
                            model: {
                                "myModel": {
                                    "append" : function() {
                                        me.methods._myTestMethod();
                                    },
                                    "error": function(){
                                        // This shouldn't be called either
                                        me.methods._myTestMethod();
                                    }
                                }
                                
                            }
                        },
                        methods: {
                            _myTestMethod : function() {
                                spy();
                            }
                        }
                    };
                }
            });
            
            // ... still not called ...
            expect(spy.called).toBeFalsy();
        
            // notify the model that our controller does not use
            tetra.debug.model("myScope", "mySecondModel").notify("append")();

            // ... still not called ... 
            expect(spy.called).toBeFalsy();
            
            // notify the controller with a model we **do** use
            tetra.debug.model("myScope", "myModel").notify("append")();
            
            // --- BAM! ---
            expect(spy.called).toBeTruthy();
            expect(spy.calledOnce).toBeTruthy();
        });
    });
    
    describe("communication with the view", function() {

        afterEach(function() {
            tetra.controller.destroy("myController", "myScope");
        });
        
        it("should respond to an app.notify()", function() {
            var 
                spy = sinon.spy(),
                viewListeners
            ;
            
            // Setup a test controller with a view event callback
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            view: {
                                "testCallback" : function() {
                                    me.methods._myTestMethod();
                                }
                            },
                            model: {
                                // This shouldn't be called
                                "test" : function() {
                                    me.methods._myTestMethod();
                                }
                            }
                        },
                        methods: {
                            _myTestMethod : function() {
                                spy();
                            }
                        }
                    };
                }
            });

            // The listener is setup ...
            viewListeners = tetra.debug.ctrl.msg("myScope/myController");
            expect(viewListeners).toContain("testCallback");

            // .. but the spy has still not been called
            expect(spy.called).toBeFalsy();
            
            // simulate the sending of a message for which no handler exists
            tetra.debug.ctrl.app("myScope").notify("blarg");
            
            // ... spy still not called ...
            expect(spy.called).toBeFalsy();
            
            // simulate the sending of a handled message from the view
            tetra.debug.ctrl.app("myScope").notify("testCallback");
            
            // -- BAM! -- 
            expect(spy.called).toBeTruthy();
            expect(spy.calledOnce).toBeTruthy("as the listener method should have been invoked *once*");
        });
    });
    
    describe("page-level communication", function() {

      afterEach(function() {
          tetra.controller.destroy("myController", "myScope");
          tetra.controller.destroy("myOtherController", "myOtherScope");
      });
      
      it("should invoke all controller callbacks for the message passed into page.notify", function() {
          var 
              spy = sinon.spy(),
              viewListeners
          ;
          
          // Setup a test controller with a view event callback
          tetra.controller.register("myController", {
              scope: "myScope",
              constr: function(me, app, page, orm) {
                  return {
                      events: {
                          view: {
                              // This shouldn't be called
                              "testCallback" : function() {
                                  me.methods._myTestMethod();
                              }
                          },
                          controller: {
                            // This *is* called
                            "testCallback" : function() {
                                me.methods._myTestMethod();
                            }
                          },
                          model: {
                              // This shouldn't be called
                              "test" : function() {
                                  me.methods._myTestMethod();
                              }
                          }
                      },
                      methods: {
                          _myTestMethod : function() {
                              spy();
                          }
                      }
                  };
              }
          });
          
          // Setup a second controller that will be notified aswell
          tetra.controller.register("myOtherController", {
            scope: "myOtherScope",
            constr: function(me, app, page, orm) {
                return {
                    events: {
                        view: {
                            "testCallback" : function() {
                                me.methods._myTestMethod();
                            }
                        },
                        controller: {
                          // This *is* called
                          "testCallback" : function() {
                              me.methods._myTestMethod();
                          }
                        },
                        model: {
                            // This shouldn't be called
                            "test" : function() {
                                me.methods._myTestMethod();
                            }
                        }
                    },
                    methods: {
                        _myTestMethod : function() {
                            spy();
                        }
                    }
                };
            }
        });

          // The listener is setup ...
          viewListeners = tetra.debug.ctrl.msg("myScope/myController");
          expect(viewListeners).toContain("testCallback");

          // .. but the spy has still not been called
          expect(spy.called).toBeFalsy();
          
          // simulate the sending of a message for which no handler exists
          tetra.debug.ctrl.page.notify("blarg");
          
          // ... spy still not called ...
          expect(spy.called).toBeFalsy();
          
          // simulate a page-level invocation of all callbacks
          tetra.debug.ctrl.page.notify("testCallback", "hello");
          
          // -- BAM! -- 
          expect(spy.called).toBeTruthy();
          expect(spy.calledTwice).toBeTruthy("as the callback should have been invoked in each controller");
      });
  });
});