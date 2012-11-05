// Testing the MVC tetra view functionality
// ====================================

// For documentation, see
// 
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/
//
// Note that for simplicity, performance, and due to limitations with Sizzle/jQuery, the following
// CSS selectors are unsupported for view events
//
// * :lang() pseudoselector
// * :link pseudoselector
// * :visited pseudoselector
// * :active pseudoselector
// * :hover pseudoselector
// * html:root 
// * nth-last-child
// * nth-of-type
// * nth-last-of-type
// * first-of-type
// * last-of-type
// * only-of-type

// Note also
//	* The custom event test is uncommented, until the functionality is available
//  * Focus/Blur non-bubbling event handlers exhibit an odd race condition under IE8 and under; the page element is already
//    removed by the time the events fire. Hence, for the moment, we execute such tests only if a valid focus() function 
//    can be found on the page element
//  * window events cannot be tested on IE6/7/8 as there is no window.dispatchEvent
//  * the :disabled and :enabled pseudoselectors do not work under Firefox + Prototype

describe("the tetra view", function() {

    "use strict";    
    
    var d = document;
    
    // View Instantiation
    // ------------------
    describe("instantiation", function() {
        
        afterEach(function(){
            tetra.view.destroy("myView", "myScope");
            tetra.view.destroy("mySecondView", "myScope");
            tetra.view.destroy("myView", "mySecondScope");
            tetra.view.destroy("mySecondView", "mySecondScope");
            tetra.view.destroy("myThirdView", "mySecondScope");
            tetra.controller.destroy("myController", "myScope");
        });        
        
        it("should register and cache a successfully created view", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(VNS.test.getObjectLength(views)).toBe(0);

            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
            expect(VNS.test.getObjectLength(views)).toBe(1);
            
            // This is the view name, not the scope, so it shouldn't exist at this level
            expect(views.myView).toBeUndefined();
        });
        
        it("should register multiple views on the same scope", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            
            // myScope/myView
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            // myScope/mySecondView
            tetra.view.register("mySecondView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
            expect(views.myScope[1]).toBe("myScope/mySecondView");
            
            // This is the views name, not the scope, so it shouldn't exist at this level
            expect(views.myView).toBeUndefined();
            expect(views.mySecondView).toBeUndefined();
        });
        
        it("should register the same view on different scopes", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(views.mySecondScope).toBeUndefined();
            
            // myScope/myView
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            // mySecondScope/myView
            tetra.view.register("myView", {
                scope: "mySecondScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
            expect(views.mySecondScope).toBeDefined();
            expect(views.mySecondScope[0]).toBe("mySecondScope/myView");
            
            // This is the views name, not the scope, so it shouldn't exist at this level
            expect(views.myView).toBeUndefined();
        });
        
        it("should register multiple views on different scopes", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(views.mySecondScope).toBeUndefined();
            
            // myScope/myView
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            // mySecondScope/mySecondView
            tetra.view.register("mySecondView", {
                scope: "mySecondScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
            expect(views.mySecondScope).toBeDefined();
            expect(views.mySecondScope[0]).toBe("mySecondScope/mySecondView");
            expect(VNS.test.getObjectLength(views)).toBe(2);
            
            // This is the views name, not the scope, so it shouldn't exist at this level
            expect(views.myView).toBeUndefined();
            expect(views.mySecondView).toBeUndefined();
        });
        
        it("should conditionally register a view *only* if its dependencies have already been loaded or could be retrieved using requireJS", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            
            tetra.view.register("myView", {
                use: ["myController"],
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            // Verify that the view has *not* been registered
            views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            
            // Create the test controller
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            // requireJS must auto-register the view using its previous definition
            
            // -- BAM --
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
        });
        
        it("should be able to notify a view, as if from a controller", function() {
            var spy = sinon.spy();
            
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            controller: {
                                "myTestControllerEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            tetra.view.register("mySecondView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            controller: {
                                "myTestControllerEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            tetra.view.register("myThirdView", {
                scope: "mySecondScope",
                constr: function(me, app) {
                    return {
                        events: {
                            controller: {
                                "myTestControllerEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            // Try to notify, but on the wrong scope
            tetra.view.notify("myTestControllerEvent", {foo: "bar"}, "myUselessScope");
            expect(spy.called).toBeFalsy();
            
            // Try to notify on the correct scope
            tetra.view.notify("myTestControllerEvent", {foo: "bar"}, "myScope");
            expect(spy.called).toBeTruthy();
            expect(spy.calledTwice).toBeTruthy();
            
            var data = spy.getCall(0).args[0];
            expect(data.foo).toBeDefined();
            expect(data.foo).toBe("bar");
        });
        
        it("should be able to destroy a view", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();

            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
            
            tetra.view.destroy("myView", "myScope");
            views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
        });
        
        // ### Error states ###
        
        it("should throw an exception when a view is registered with no name or params", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(VNS.test.getObjectLength(views)).toBe(0);
            
            expect(tetra.view.register).toThrow();
            expect(function(){tetra.view.register("myView");}).toThrow();
            expect(function(){tetra.view.register(null, {scope: "myScope"});}).toThrow();
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(VNS.test.getObjectLength(views)).toBe(0);
        });
        
        it("should throw an exception when a view is registered with no scope or constructor", function() {
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(VNS.test.getObjectLength(views)).toBe(0);
            
            expect(function(){tetra.view.register("myView", {});}).toThrow();
            expect(function(){tetra.view.register("myView", {scope: "myScope"});}).toThrow();
            expect(function(){tetra.view.register("myView", {constr: function(){}});}).toThrow();
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();
            expect(VNS.test.getObjectLength(views)).toBe(0);
        });
        
        it("should throw an exception when a view with the same name exists on the same scope", function(){
            var views = tetra.debug.view.list();
            expect(views.myScope).toBeUndefined();

            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {}
                    };
                }
            });
            
            views = tetra.debug.view.list();
            expect(views.myScope).toBeDefined();
            expect(views.myScope[0]).toBe("myScope/myView");
            
            expect(function(){
                tetra.view.register("myView", {
                    scope: "myScope",
                    constr: function(me, app) {
                        return {
                            events: {}
                        };
                    }
                });
            }).toThrow();
        });
    });
    
    // Configuring a View
    // --------------------
    describe("configuration", function() {
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            this.spy = null;
        });
        
        it("should allow functions to be set on the methods object", function() {
            var
                spy = sinon.spy(),
                methods
            ;
            
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {},
                        methods: {
                            init : function() {
                                me.methods._myTestMethod();
                            },
                            _myTestMethod : function() {
                                spy(me.methods);
                            }
                        }
                    };
                }
            });
            
            expect(spy.called).toBeTruthy();
            
            // Check methods obj
            methods = spy.getCall(0).args[0];

            expect(VNS.test.getObjectLength(methods)).toBe(2);
            expect(methods.init).toBeDefined();
            expect(methods.init).toEqual(jasmine.any(Function));
            expect(methods._myTestMethod).toBeDefined("as custom methods should be available on the methods object");
            expect(methods._myTestMethod).toEqual(jasmine.any(Function));
        });
        
        it("should fire its init() method when starting up", function() {
            var spy = sinon.spy();
            
            // Setup a test controller
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                spy();
                            }
                        }
                    };
                }
            });
            
            expect(spy.called).toBeTruthy();
            expect(spy.calledOnce).toBeTruthy("as the init() method should have been invoked once during startup");
        });
    });
    
    // Interacting with a view
    // 
    // We use the same view for each test, which is defined in the `beforeEach` function
    // ------------------------------------
    describe("handling of a bubbling event", function() {

        beforeEach(function() {
            // Load the test fixture
            loadFixtures("bubblingEventHandlers.html");

            // Get refs to the test nodes
            this.bubblingTestNode = d.getElementById("bubblingTestNode");
            this.bubblingTestNodeParent = d.getElementById("bubblingTestNodeParent");
            this.bubblingTestField = d.getElementById("bubblingTestField");
            this.bubblingTestFieldParent = d.getElementById("bubblingTestFieldParent");
            
            // create the spy
            this.spy = sinon.spy();
            
            // setup the test view
            var that = this;

            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "click": {
                                    "#bubblingTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#bubblingTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                "dblclick": {
                                    "#bubblingTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#bubblingTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                "change": {
                                    "#bubblingTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#bubblingTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                "select": {
                                    "#bubblingTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#bubblingTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            tetra.view.destroy("mySecondView", "myScope");
            
            this.spy = null;
            this.bubblingTestNode = null;
            this.bubblingTestNodeParent = null;
            this.bubblingTestField = null;
            this.bubblingTestFieldParent = null;
        });
        
        it("should handle bubbling events not in the isSupported list", function() {
            // TODO Implement & rewrite description
        })
        
        it("should respond appropriately to an onClick", function() {
            VNS.test.triggerEvent(this.bubblingTestNode, "click");
            
            // Spy should have been called twice, once for the element 'link' and once
            // when the event bubbles to the #parent 
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy();
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.bubblingTestNode, "click");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.bubblingTestNodeParent, "click");
        });
        
        it("should respond appropriately to an onChange", function() {
            VNS.test.triggerEvent(this.bubblingTestField, "change");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as it should have been called twice, has actually been called " +
                    this.spy.callCount + " time(s)");
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.bubblingTestField, "change");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.bubblingTestFieldParent, "change");
        });
        
        it("should respond appropriately to an onDblClick", function() {
            VNS.test.triggerEvent(this.bubblingTestNode, "dblclick");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy();
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.bubblingTestNode, "dblclick");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.bubblingTestNodeParent, "dblclick");
        });

        it("should respond appropriately to an onSelect", function() {
            VNS.test.triggerEvent(this.bubblingTestField, "select");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy();
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.bubblingTestField, "select");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.bubblingTestFieldParent, "select");
        });
        
        // NOTE not enabled yet, as Prototype.js does not support custom events
        //TODO Implement look at line 341
        xit("should respond appropriately to a custom event", function() {
            this.bubblingTestNode.fire("baz:bar");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as the custom event should fire on the target element and its parent");
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.bubblingTestField, "select");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.bubblingTestFieldParent, "select");
        });
        
        // Register another view that mirrors some of the event handlers of the main view
        it("should allow multiple views to handle the same type of bubbling events, with no side-effects", function() {
            var that = this;
            
            // `myFirstView` is defined in the `beforeEach` and handles the same user events
            tetra.view.register("mySecondView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "click": {
                                    "#bubblingTestNode": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherNode": function(e, elm) {
                                        that.spy("mySecondView someOtherNode");
                                    }
                                },
                                "change": {
                                    "#bubblingTestField": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherField": function(e, elm) {
                                        that.spy("mySecondView someOtherField");
                                    }
                                }
                            }
                        }
                    };
                }
            });
            
            VNS.test.triggerEvent(this.bubblingTestNode, "click");
            
            // Spy should be called three times, twice for the original
            // view and one for the second one

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3, "as click should have fired three times on bubblingTestNode");
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");
            
            this.spy = sinon.spy();
            VNS.test.triggerEvent(d.getElementById("someOtherNode"), "click");
            expect(this.spy.callCount).toBe(1);
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherNode");
            
            this.spy = sinon.spy();
            VNS.test.triggerEvent(this.bubblingTestField, "change");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3, "as change should have fired three times on bubblingTestField");
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");

            this.spy = sinon.spy();
            VNS.test.triggerEvent(d.getElementById("someOtherField"), "change");

            expect(this.spy.callCount).toBe(1);
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherField");
        });
    });
    
    describe("handling of a 'mouse' event", function() {

        beforeEach(function() {
            // Load the test fixture
            loadFixtures("bubblingEventHandlers.html");

            // Get refs to the test nodes
            this.mouseTestNode = d.getElementById("mouseTestNode");
            this.mouseTestNodeParent = d.getElementById("mouseTestNodeParent");
            
            // create  the spy
            this.spy = sinon.spy();
            
            // setup the test view
            var that = this;
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "mouseover": {
                                    "#mouseTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#mouseTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "mouseout": {
                                    "#mouseTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#mouseTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "mousedown": {
                                    "#mouseTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#mouseTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "mouseup": {
                                    "#mouseTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#mouseTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "mousemove": {
                                    "#mouseTestNode": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#mouseTestNodeParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            tetra.view.destroy("mySecondView", "myScope");
            
            this.spy = null;
            this.mouseTestNode = null;
            this.mouseTestNodeParent = null;
        });
        
        it("should respond appropriately to an onMouseOver", function() {
            VNS.test.triggerEvent(this.mouseTestNode, "mouseover");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a mouseover should have been handled on the element & its parent");
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.mouseTestNode, "mouseover");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.mouseTestNodeParent, "mouseover");
        });
        
        it("should respond appropriately to an onMouseOut", function() {
            var someOtherNode = d.getElementById('someOtherNode');
            
            VNS.test.triggerEvent(this.mouseTestNode, "mouseout");
            VNS.test.triggerEvent(someOtherNode, "mouseover");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a mouseout should have been handled on the element & its parent");
            someOtherNode = null;
            
            // Check the arguments returned for the target and its parent
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.mouseTestNode, "mouseout");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.mouseTestNodeParent, "mouseout");
        });
        
        it("should handle special mouseout cases, see line 177", function() {
            // TODO Implement & rewrite description
        });

        it("should respond appropriately to an onMouseDown", function() {
            VNS.test.triggerEvent(this.mouseTestNode, "mousedown");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a mousedown should have been handled on the element & its parent");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.mouseTestNode, "mousedown");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.mouseTestNodeParent, "mousedown");
        });

        it("should respond appropriately to an onMouseUp", function() {
            VNS.test.triggerEvent(this.mouseTestNode, "mouseup");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a mouseup should have been handled on the element & its parent");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.mouseTestNode, "mouseup");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.mouseTestNodeParent, "mouseup");
        });

        it("should respond appropriately to an onMouseMove", function() {
            VNS.test.triggerEvent(this.mouseTestNode, "mousemove");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a mousemove should have been handled on the element & its parent");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.mouseTestNode, "mousemove");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.mouseTestNodeParent, "mousemove");
        });

        it("should allow multiple views to handle the same type of mouse events, with no side-effects", function() {
            var 
                that = this,
                someOtherNode = d.getElementById("someOtherNode")
            ;
            
            // `myView` is defined in the `beforeEach` and handles the same user events
            tetra.view.register("mySecondView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "mouseover": {
                                    "#mouseTestNode": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherNode": function(e, elm) {
                                        that.spy("mySecondView someOtherNode");
                                    }
                                }
                            }
                        }
                    };
                }
            });
            
            VNS.test.triggerEvent(this.mouseTestNode, "mouseover");

            // Spy should be called three times, twice for the original
            // view and one for the second one
        
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3);
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");
        
            this.spy = sinon.spy();
            VNS.test.triggerEvent(someOtherNode, "mouseover");
            expect(this.spy.callCount).toBe(1);
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherNode");
            
            someOtherNode = null;
        });
    });
    
    describe("handling of a 'key' event", function() {
        
        beforeEach(function() {
            // Load the test fixture
            loadFixtures("bubblingEventHandlers.html");

            // Get refs to the test nodes
            this.keyTestField = d.getElementById("keyTestField");
            this.keyTestFieldParent = d.getElementById("keyTestFieldParent");
            
            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            tetra.view.register("keyEventRouter", {
                scope: "keyEventRouterScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "keydown": {
                                    "#keyTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#keyTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "keyup": {
                                    "#keyTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#keyTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "keypress": {
                                    "#keyTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#keyTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            tetra.view.destroy("keyEventRouter", "keyEventRouterScope");
            tetra.view.destroy("mySecondView", "myScope");
            
            this.spy = null;
            this.keyTestField = null;
            this.keyTestFieldParent = null;
        });
        
        it("should respond appropriately to an onKeyDown", function() {
            VNS.test.triggerEvent(this.keyTestField, "keydown");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a keydown should have been triggered");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.keyTestField, "keydown");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.keyTestFieldParent, "keydown");
            
        });
    
        it("should respond appropriately to an onKeyPress", function() {
            VNS.test.triggerEvent(this.keyTestField, "keypress");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a keypress should have been triggered");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.keyTestField, "keypress");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.keyTestFieldParent, "keypress");
        });
        
        it("should respond appropriately to an onKeyUp", function() {
            VNS.test.triggerEvent(this.keyTestField, "keyup");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a keyup should have been triggered");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.keyTestField, "keyup");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.keyTestFieldParent, "keyup");
        });
        
        it("should allow multiple views to handle the same type of key events, with no side-effects", function() {
            var that = this;

            // `myView` is defined in the `beforeEach` and handles the same user events 
            tetra.view.register("mySecondView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "keydown": {
                                    "#keyTestField": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherField": function(e, elm) {
                                        that.spy("mySecondView someOtherTestField");
                                    }
                                },
                                
                                "keyup": {
                                    "#keyTestField": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherField": function(e, elm) {
                                        that.spy("mySecondView someOtherTestField");
                                    }
                                }
                            }
                        }
                    };
                }
            });    
            
            VNS.test.triggerEvent(this.keyTestField, "keydown");
            
            // Spy should be called thrice, twice for the original
            // view and once for the second view
            
            var someOtherField = d.getElementById("someOtherField");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3);
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");
            
            this.spy = sinon.spy();
            VNS.test.triggerEvent(someOtherField, "keydown");
            expect(this.spy.callCount).toBe(1);
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherTestField");

            // Reset and fire "keyup"
            this.spy = sinon.spy();
            VNS.test.triggerEvent(this.keyTestField, "keyup");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3);
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");

            this.spy = sinon.spy();
            VNS.test.triggerEvent(someOtherField, "keyup");
            expect(this.spy.callCount).toBe(1);
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherTestField");
                        
            someOtherField = null;
        });
    });

    describe("handling of non-bubbling events with handlers in the capturing phase", function() {
    
        beforeEach(function() {
            loadFixtures("nonBubblingEventHandlers.html");
            
            // Get refs to the test nodes
            this.nonBubblingTestField = d.getElementById("nonBubblingTestField");
            this.nonBubblingTestFieldParent = d.getElementById("nonBubblingTestFieldParent");

            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "focus": {
                                    "#nonBubblingTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#nonBubblingTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "blur": {
                                    "#nonBubblingTestField": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#nonBubblingTestFieldParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "click": {
                                    "#clickoutTestField" : function(e, elm) {
                                        // Activates the clickout event
                                    }
                                },
                                
                                "clickout": {
                                    "#clickoutTestField" : function(e, elm) {
                                        that.spy("clickout");
                                    }
                                }
                            }
                        }
                    };
                }
            });            
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            
            this.spy = null;
            this.nonBubblingTestField = null;
            this.nonBubblingTestFieldParent = null;
        });
        
        it("should respond appropriately to an onFocus", function() {
            VNS.test.triggerEvent(this.nonBubblingTestField, "focus");

            runs(function(){
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.callCount).toBe(2, "as focus should have been captured on the element and its parent");
    
                VNS.test.validateEventArguments(this.spy.getCall(0).args, this.nonBubblingTestField, "focus");
                VNS.test.validateEventArguments(this.spy.getCall(1).args, this.nonBubblingTestFieldParent, "focus");
            });
        });
        
        it("should respond appropriately to an onBlur", function() {
            VNS.test.triggerEvent(this.nonBubblingTestField, "focus");
            VNS.test.triggerEvent(this.nonBubblingTestField, "blur");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(4, "as focus/blur should have been called on the event and its parent");

            VNS.test.validateEventArguments(this.spy.getCall(0).args, this.nonBubblingTestField, "focus");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, this.nonBubblingTestFieldParent, "focus");
            VNS.test.validateEventArguments(this.spy.getCall(2).args, this.nonBubblingTestField, "blur");
            VNS.test.validateEventArguments(this.spy.getCall(3).args, this.nonBubblingTestFieldParent, "blur");
        });
        
        it("should respond appropriately to a clickout", function() {
            var 
                clickoutField = d.getElementById("clickoutTestField"),
                clickCaptureTestField = d.getElementById("clickCaptureTestField")
            ;
            
            VNS.test.triggerEvent(clickoutField, "click");
            VNS.test.triggerEvent(clickCaptureTestField, "click");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
        });
        
        it("should allow multiple views to handle the same type of cascading events, with no side-effects", function() {
            var 
                that = this,
                someOtherField = d.getElementById("someOtherTestField")
            ;

            tetra.view.register("mySecondView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "focus": {
                                    "#nonBubblingTestField": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherTestField": function(e, elm) {
                                        that.spy("mySecondView someOtherTestField");
                                    }
                                },
                                
                                "blur": {
                                    "#nonBubblingTestField": function(e, elm) {
                                        that.spy("mySecondView");
                                    },
                                    "#someOtherTestField": function(e, elm) {
                                        that.spy("mySecondView someOtherTestField");
                                    }
                                }
                            }
                        }
                    };
                }
            });    
            
            VNS.test.triggerEvent(this.nonBubblingTestField, "focus");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3, "as nonBubblingTestField focus should have fired three times");
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");

            VNS.test.triggerEvent(this.nonBubblingTestField, "blur");

            this.spy = sinon.spy();
            VNS.test.triggerEvent(someOtherField, "focus");
            
            expect(this.spy.callCount).toBe(1, "as some other field should only have been focused on once");
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherTestField");

            VNS.test.triggerEvent(this.nonBubblingTestField, "focus");
            
            this.spy = sinon.spy();
            VNS.test.triggerEvent(this.nonBubblingTestField, "blur");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3, "as nonBubblingTestField blur should have fired three times");
            expect(this.spy.getCall(2).args[0]).toBe("mySecondView");
    
            this.spy = sinon.spy();
            VNS.test.triggerEvent(someOtherField, "focus");
    
            expect(this.spy.callCount).toBe(1);
            expect(this.spy.getCall(0).args[0]).toBe("mySecondView someOtherTestField");
            someOtherField = null;
        });
    });
    
    describe("handling of non-bubbling events that are listened for on all nodes", function() {

        beforeEach(function() {
            loadFixtures("nonBubblingEventHandlers.html");
            
            // Get refs to the test nodes
            this.nonBubblingTestField = d.getElementById("nonBubblingTestField");
            this.nonBubblingTestFieldParent = d.getElementById("nonBubblingTestFieldParent");
            
            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                 "scroll": {
                                    "#listBox": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#testScrollTextareaParent": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#testScrollTextarea": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "submit": {
                                    "#testForm": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#testFormParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                },
                                
                                "reset": {
                                    "#testForm": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#testFormParent": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                            
                        }
                    };
                }
            });            
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            tetra.view.destroy("mySecondView", "myScope");
            
            this.spy = null;
            this.nonBubblingTestField = null;
            this.nonBubblingTestFieldParent = null;
        });        
        
        it("should respond appropriately to an onScroll on a div with overflow auto or scroll", function() {
            var listBoxNode = d.getElementById("listBox");

            VNS.test.triggerEvent(listBoxNode, "scroll");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3, "as even for a single call, the synthetic event fires 3 times");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, listBoxNode, "scroll");
            listBoxNode = null;
        });
        
        it("should respond appropriately to an onScroll on a textarea", function() {
            var testScrollTextarea = d.getElementById("testScrollTextarea");

            VNS.test.triggerEvent(testScrollTextarea, "scroll");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.callCount).toBe(3, "as even for a single call, the synthetic event fires 3 times");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, testScrollTextarea, "scroll");
            testScrollTextarea = null;
        });
        
        it("should respond appropriately to an onSubmit", function() {
            var 
                form = d.getElementById("testForm"),
                formParent = d.getElementById("testFormParent")
            ;
            
            VNS.test.triggerEvent(form, "submit");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a submit event listener should have been added to the node and its parent");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, form, "submit");
            
            form = null;
            formParent = null;
        });
        
       it("should respond appropriately to an onReset", function() {
            var 
                form = d.getElementById("testForm"),
                formParent = d.getElementById("testFormParent")
            ;
        
            VNS.test.triggerEvent(form, "reset");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as a reset event listener should have been added to the node and its parent");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, form, "reset");
            
            form = null;
            formParent = null;
        });
    });
    
    describe("handling of a window event", function() {
        
        beforeEach(function() {
            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            window: {
                                "resize": function(e) {
                                    that.spy(e);
                                },
                                // Abort is never used, but let's test it anyway for the craic
                                "abort": function(e) {
                                    that.spy(e);
                                },
                                "error": function(e) {
                                    that.spy(e);
                                },
                                "scroll": function(e) {
                                    that.spy(e);
                                }
                            }
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            tetra.view.destroy("mySecondView", "myScope");
            this.spy = null;
        });
        
        it("should respond appropriately to a window onScroll", function() {
            if(window.dispatchEvent) {
                VNS.test.triggerEvent(window, "scroll");
                
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.calledOnce).toBeTruthy("as scroll should have been triggered on the window");
    
                VNS.test.validateWindowEventArguments(this.spy.getCall(0).args, "scroll");
            }
        });
        
        it("should respond appropriately to an onResize", function() {
            if(window.dispatchEvent) {
                VNS.test.triggerEvent(window, "resize");
                
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.calledOnce).toBeTruthy("as resize should have been triggered on the window");
    
                VNS.test.validateWindowEventArguments(this.spy.getCall(0).args, "resize");
            }
        });
        
        it("should respond appropriately to an onAbort", function() {
            if(window.dispatchEvent) {
                VNS.test.triggerEvent(window, "abort");
                
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.calledOnce).toBeTruthy("as abort should have been triggered on the window");
    
                VNS.test.validateWindowEventArguments(this.spy.getCall(0).args, "abort");
            }
        });
        
        it("should respond appropriately to an onError", function() {
            if(window.dispatchEvent) {
                VNS.test.triggerEvent(window, "error");
                
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.calledOnce).toBeTruthy("as error should have been triggered on the window");
    
                VNS.test.validateWindowEventArguments(this.spy.getCall(0).args, "error");
            }
        });

        it("should allow multiple views to handle the same type of window events, with no side-effects", function() {
            if(window.dispatchEvent) {
                var that = this;
    
                // `myView` is defined in the `beforeEach` function and handles the same window events
                tetra.view.register("mySecondView", {
                    scope: "myScope",
                    constr: function(me, app) {
                        return {
                            events: {
                                window: {
                                    "resize": function(e) {
                                        that.spy("mySecondView");
                                    },
                                    
                                    "scroll": function(e) {
                                        that.spy("mySecondView");
                                    }
                                }
                            }
                        };
                    }
                });    
                
                VNS.test.triggerEvent(window, "resize");    
                
                // Spy should be called twice, once for the original
                // view and once for the second view
                
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.callCount).toBe(2);
                expect(this.spy.getCall(1).args[0]).toBe("mySecondView");
    
                this.spy = sinon.spy();
                VNS.test.triggerEvent(window, "scroll");
                
                expect(this.spy.called).toBeTruthy();
                expect(this.spy.callCount).toBe(2);
                expect(this.spy.getCall(1).args[0]).toBe("mySecondView");
            }
        });
    });

    describe("handling of a standard CSS selector", function(){
    
        beforeEach(function() {
            // Load the test fixture
            loadFixtures("cssSelectors.html");
            
            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "click": {
                                    "#aside": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div#parent div.small": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "p#precedent ~ strong": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "p#immediateprecedent + strong": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#article > .childTest": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#idTest": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    ".classTest": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    ".multipleClass1.multipleClass2.multipleClass3": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "b:not(.selected)": function(e, elm) {
                                        that.spy(e, elm);
                                    },                                
                                    "input:checked": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "input#enabledTestInput:enabled": function(e, elm) {        
                                        that.spy(e, elm);
                                    },
                                    "div.firstTestGroup p#firstTestPara span span small": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "p#secondTestPara small:not(.selected)": function(e, elm) {                
                                        that.spy(e, elm);
                                    },
                                    "div div#thirdTestGroup p.thirdTestPara.test": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "a:focus": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                        }
                    };
                }
            });
        });
    
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            this.spy = null;
        });
        
        it("should respond to event handlers attached via a type selector", function() {
            var aside = d.getElementById("aside");
            
            VNS.test.triggerEvent(aside, "click");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy("as a click should have been fired for the given type");
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, aside, "click");
            
            aside = null;
        });
        
        it("should respond to event handlers attached via a descendant CSS selector", function() {    
            var 
                small1 = d.getElementById('small1'),
                small2 = d.getElementById('small2'),
                small3 = d.getElementById('small3')
            ;
            
            VNS.test.triggerEvent(small1, "click");
            VNS.test.triggerEvent(small2, "click");
            VNS.test.triggerEvent(small3, "click");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as two of the three <small> elements match the descendant selector");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, small1, "click");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, small2, "click");
            
            small1 = null;
            small2 = null;
            small3 = null;
        });
        
        it("should respond to event handlers attached via a child CSS selector", function() {
            var 
                child1 = d.getElementById("childTest1"),
                child2 = d.getElementById("childTest2"),
                child3 = d.getElementById("childTest3")
            ;
            
            VNS.test.triggerEvent(child1, "click");
            VNS.test.triggerEvent(child2, "click");
            VNS.test.triggerEvent(child3, "click");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as there are two child nodes matching the selector");
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, child1, "click");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, child2, "click");
            
            child1 = null;
            child2 = null;
            child3 = null;
        });
        
        it("should respond to event handlers attached via an ID CSS selector", function() {
            var idTest = d.getElementById("idTest");
                        
            VNS.test.triggerEvent(idTest, "click");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
        
            VNS.test.validateEventArguments(this.spy.getCall(0).args, idTest, "click");
            
            idTest = null;
        });
        
        it("should respond to event handlers attached via a class CSS selector", function() {
            var 
                classTest1 = d.getElementById("classTest1"),
                classTest2 = d.getElementById("classTest2")
            ;
            
            VNS.test.triggerEvent(classTest1, "click");
            VNS.test.triggerEvent(classTest2, "click");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy();
        
            VNS.test.validateEventArguments(this.spy.getCall(0).args, classTest1, "click");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, classTest2, "click");
            
            classTest1 = null;
            classTest2 = null;
        });
        
        it("should respond to event handlers attached via multiple class CSS selectors", function() {
            var 
                multiTest1 = d.getElementById("multiTest1"),
                multiTest2 = d.getElementById("multiTest2"),
                multiTest3 = d.getElementById("multiTest3"),
                multiTest4 = d.getElementById("multiTest4")
            ;
            
            VNS.test.triggerEvent(multiTest1, "click");
            VNS.test.triggerEvent(multiTest2, "click");
            VNS.test.triggerEvent(multiTest3, "click");
            VNS.test.triggerEvent(multiTest4, "click");
                
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy();
        
            VNS.test.validateEventArguments(this.spy.getCall(0).args, multiTest1, "click");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, multiTest2, "click");
            
            multiTest1 = null;
            multiTest2 = null;
            multiTest3 = null;
            multiTest4 = null;
        });
        
        it("should respond to event handlers attached via a not() CSS selector", function() {
            var 
                notTest1 = d.getElementById("notTest1"),
                notTest2 = d.getElementById("notTest2")
            ;
        
            VNS.test.triggerEvent(notTest1, "click");
            VNS.test.triggerEvent(notTest2, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            VNS.test.validateEventArguments(this.spy.getCall(0).args, notTest2, "click");
            
            notTest1 = null;
            notTest2 = null;
        });
        
        it("should respond to event handlers attached via :checked pseudoclass selector", function() {
            var radio = d.getElementById("radioButton");
    
            VNS.test.triggerEvent(radio, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
        
            VNS.test.validateEventArguments(this.spy.getCall(0).args, radio, "click");
            
            radio = null;
        });
        
        // In firefox, disabled fields respond to no event handlers, so we test the enabled and assume
        // it works for :disabled too
        it("should respond to event handlers attached via the :enabled pseudoclass selector", function() {
            var 
                input = d.getElementById("enabledTestInput")
            ;

            VNS.test.triggerEvent(input, "click");
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            VNS.test.validateEventArguments(this.spy.getCall(0).args, input, "click");

            input = null;
        });

        it("should respond to event handlers attached via a combination of CSS selectors", function() {
            var 
                groupTest1 = d.getElementById("firstTestNode"),
                groupTest2 = d.getElementById("secondTestNode"),
                groupTest3 = d.getElementById("thirdTestNode")
            ;
    
            VNS.test.triggerEvent(groupTest1, "click");
            VNS.test.triggerEvent(groupTest2, "click");
            VNS.test.triggerEvent(groupTest3, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledThrice).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, groupTest1, "click");
            VNS.test.validateEventArguments(this.spy.getCall(1).args, groupTest2, "click");
            VNS.test.validateEventArguments(this.spy.getCall(2).args, groupTest3, "click");
            
            groupTest1 = null;
            groupTest2 = null;
            groupTest3 = null;
        });
    });
    
    describe("handling of an attribute CSS selector", function(){

        beforeEach(function() {
            // Load the test fixture
            loadFixtures("cssAttributeSelectors.html");
            
            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "click": {
                                    "div[data-enctype]": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div[data-enctype='application/x-www-form-urlencoded']": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div[class^='baz']": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div[class$='baz']": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div[class*='barz']": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div[data-test~='foo']": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "div[data-test|='fab']": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            this.spy = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute", function() {
            var 
                formWithAttribute = d.getElementById("formWithAttributeTest"),
                formWithoutAttribute = d.getElementById("formWithoutAttributeTest")
            ;
            
            VNS.test.triggerEvent(formWithAttribute, "click");
            VNS.test.triggerEvent(formWithoutAttribute, "click");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();

            VNS.test.validateEventArguments(this.spy.getCall(0).args, formWithAttribute, "click");
            
            formWithAttribute = null;
            formWithoutAttribute = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute having a specific value", function() {
            var 
                formWithAttributeValue = d.getElementById("formWithAttributeValueTest"),
                formWithoutAttributeValue = d.getElementById("formWithoutAttributeValueTest")
            ;

            VNS.test.triggerEvent(formWithAttributeValue, "click");
            VNS.test.triggerEvent(formWithoutAttributeValue, "click");
    
            expect(this.spy.called).toBeTruthy();
            // Twice because the selector from the previous test will catch it too
            expect(this.spy.calledTwice).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, formWithAttributeValue, "click");
            
            formWithAttributeValue = null;
            formWithoutAttributeValue = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute having a value that begins with a specific string", function() {
            var 
                formBeginningWithAttributeValue = d.getElementById("formBeginningWithAttributeValueTest"),
                formNotBeginningWithAttributeValue = d.getElementById("formNotBeginningWithAttributeValueTest")
            ;
            
            VNS.test.triggerEvent(formBeginningWithAttributeValue, "click");
            VNS.test.triggerEvent(formNotBeginningWithAttributeValue, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, formBeginningWithAttributeValue, "click");
            
            formBeginningWithAttributeValue = null;
            formNotBeginningWithAttributeValue = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute having a value that ends with a specific string", function() {
            var 
                formEndingWithAttributeValue = d.getElementById("formEndingWithAttributeValueTest"),
                formNotEndingWithAttributeValue = d.getElementById("formNotEndingWithAttributeValueTest")
            ;
        
            VNS.test.triggerEvent(formEndingWithAttributeValue, "click");
            VNS.test.triggerEvent(formNotEndingWithAttributeValue, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, formEndingWithAttributeValue, "click");
            
            formEndingWithAttributeValue = null;
            formNotEndingWithAttributeValue = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute having a value that contains a specific string", function() {
            var 
                formContainingAttributeValueTest = d.getElementById("formContainingAttributeValueTest"),
                formNotContainingAttributeValueTest = d.getElementById("formNotContainingAttributeValueTest")
            ;
    
            VNS.test.triggerEvent(formContainingAttributeValueTest, "click");
            VNS.test.triggerEvent(formNotContainingAttributeValueTest, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, formContainingAttributeValueTest, "click");
            
            formContainingAttributeValueTest = null;
            formNotContainingAttributeValueTest = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute containing a value amongst a comma separated list", function() {
            var 
                formListTest = d.getElementById("formListTest"),
                formNoListTest = d.getElementById("formNoListTest")
            ;

            VNS.test.triggerEvent(formListTest, "click");
            VNS.test.triggerEvent(formNoListTest, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, formListTest, "click");
            
            formListTest = null;
            formNoListTest = null;
        });
        
        it("should respond to event handlers attached to elements with a particular attribute containing a value amongst a hyphen separated list", function() {
            var 
                formHyphenListTest = d.getElementById("formHyphenListTest"),
                formNoHyphenListTest = d.getElementById("formNoHyphenListTest")
            ;

            VNS.test.triggerEvent(formHyphenListTest, "click");
            VNS.test.triggerEvent(formNoHyphenListTest, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, formHyphenListTest, "click");
            
            formHyphenListTest = null;
            formNoHyphenListTest = null;
        });
    });

    describe("handling of a structural pseudoclass CSS selector", function(){

        beforeEach(function() {
            // Load the test fixture
            loadFixtures("cssStructuralSelectors.html");
            
            // setup the spy and view
            this.spy = sinon.spy();
            var that = this;
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            user: {
                                "click": {                    
                                    "#listparent li:nth-child(2)": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#firstlastparent abbr:first-child": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "#firstlastparent abbr:last-child": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "small:only-child": function(e, elm) {
                                        that.spy(e, elm);
                                    },
                                    "abbr:empty": function(e, elm) {
                                        that.spy(e, elm);
                                    }
                                }
                            }
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            this.spy = null;
        });
        
        it("should respond to event handlers attached via a nth-child selector", function() {
            var 
                secondChild = d.getElementById("listparent").children[1],
                thirdChild = d.getElementById("listparent").children[2]
            ;
            
            VNS.test.triggerEvent(secondChild, "click");
            VNS.test.triggerEvent(thirdChild, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
                
            VNS.test.validateEventArguments(this.spy.getCall(0).args, secondChild, "click");
            
            secondChild = null;
            thirdChild = null;
        });

        it("should respond to event handlers attached via a first-child selector", function() {
            var 
                firstChild = d.getElementById("firstlastparent").children[0],
                middleChild = d.getElementById("firstlastparent").children[1]
            ;

            VNS.test.triggerEvent(firstChild, "click");
            VNS.test.triggerEvent(middleChild, "click");

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();

            VNS.test.validateEventArguments(this.spy.getCall(0).args, firstChild, "click");
            
            firstChild = null;
            middleChild = null;
        });
        
        it("should respond to event handlers attached via a last-child selector", function() {
            var 
                middleChild = d.getElementById("firstlastparent").children[1],
                lastChild = d.getElementById("firstlastparent").children[2]
            ;

            VNS.test.triggerEvent(middleChild, "click");
            VNS.test.triggerEvent(lastChild, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, lastChild, "click");
            
            middleChild = null;
            lastChild = null;
        });

        it("should respond to event handlers attached via a only-child selector", function() {
            var 
                onlyChild = d.getElementById("onlyChild"),
                notOnlyChild = d.getElementById("notOnlyChild")
            ;

            VNS.test.triggerEvent(onlyChild, "click");
            VNS.test.triggerEvent(notOnlyChild, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, onlyChild, "click");
            
            onlyChild = null;
            notOnlyChild = null;
        });
        
        it("should respond to event handlers attached via a empty selector", function() {
            var 
                empty = d.getElementById("empty"),
                notEmpty = d.getElementById("notEmpty")
            ;

            VNS.test.triggerEvent(empty, "click");
            VNS.test.triggerEvent(notEmpty, "click");
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            VNS.test.validateEventArguments(this.spy.getCall(0).args, empty, "click");
            
            empty = null;
            notEmpty = null;
        });
    });
    
    describe("handling of controller notifications", function(){
        
        afterEach(function() {
            tetra.view.destroy("myView", "myScope");
            tetra.controller.destroy("myController", "myScope");
        });
        
        it("should be able to handle notifications sent from the controller", function() {
            var spy = sinon.spy();
            
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {
                            controller: {
                                "myTestControllerEvent": function(data) {
                                    spy(data);
                                }
                            }
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init : function() {
                                app.notify("myTestControllerEvent", {foo: "bar"});
                            }
                        }
                    };
                }
            });

            expect(spy.called).toBeTruthy();
            expect(spy.calledOnce).toBeTruthy();
            
            var data = spy.getCall(0).args[0];
            expect(data.foo).toBeDefined();
            expect(data.foo).toBe("bar");
        });

        it("should be able to send notifications to the controller", function() {
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
            
            tetra.view.register("myView", {
                scope: "myScope",
                constr: function(me, app) {
                    return {
                        events: {},
                        methods: {
                            init: function() {
                                app.notify("myTestViewEvent", {foo: "bar"});
                            }
                        }
                    };
                }
            });

            expect(spy.called).toBeTruthy();
            expect(spy.calledOnce).toBeTruthy();
            
            var data = spy.getCall(0).args[0];
            expect(data.foo).toBeDefined();
            expect(data.foo).toBe("bar");
        });
    });
});