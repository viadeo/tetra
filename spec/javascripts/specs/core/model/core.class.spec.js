// Testing the MVC tetra `model` functionality

describe("the tetra MVC model", function() {
    
    "use strict";
    
    var successResponse = {
            status: "SUCCESS",
            data: {
                myUniqueId: {
                    success: true
                }
            }
    };
    
    var successResponseWithContent = {
        status: "SUCCESS",
        data: {
            myUniqueId: {
                foo: true,
                success: true,
                myTestString: "bye",
                myTestNumber: 12,
                myTestArray: [1, 2, 3],
                myTestObj: {
                    foo: "bar"
                }
            }
        }
    };
    
    var failResponse = {
            status: "FAIL"
    };

    // Model Instantiation
    // ------------------
    describe("model instantiation", function() {

        afterEach(function() {
            tetra.model.destroy("myModel", "myScope");
            tetra.model.destroy("mySecondModel", "myScope");
            tetra.model.destroy("myBrokenModel", "myScope");
        });
        
        it("should register a successfully created model", function() {
            var models = tetra.debug.model.list();
            expect(models).not.toContain("myScope/myModel");
            expect(models).not.toContain("myScope/mySecondModel");
            
            // empty model
            tetra.model.register("myModel", {scope: "myScope"});        
            
            // a model with all properties populated
            tetra.model.register("mySecondModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/fake/fetch/url"
                    },
                    save: {
                        url: "/my/fake/save/url"
                    },
                    del: {
                        url: "/my/fake/delete/url"
                    },
                    reset: {
                        url: "/my/fake/reset/url"
                    }
                },
                attr: {
                    boo: false,
                    baf: "lorem",
                    hup: {},
                    argh: []
                },
                methods: function(attr) {
                    return {
                        getSomething: function() {
                            return "something";
                        }
                    };
                }
            });
            
            models = tetra.debug.model.list();
            expect(models).toContain("myScope/myModel", "because we should have successfully registered it");
            expect(models).toContain("myScope/mySecondModel", "because we should have successfully registered it");
        });
        
        it("should be possible to destroy a successfully created model", function() {
            var models = tetra.debug.model.list();
            expect(models).not.toContain("myScope/myModel");
            
            tetra.model.register("myModel", {scope: "myScope"});
            models = tetra.debug.model.list();
            expect(models).toContain("myScope/myModel", "because we should have successfully registered it");
            
            tetra.model.destroy("myModel", "myScope");
            models = tetra.debug.model.list();
            expect(models).not.toContain("myScope/myModel", "as it should have been destroyed");
            
            // Make sure we can recreate the model once more
            tetra.model.register("myModel", {scope: "myScope"});
            models = tetra.debug.model.list();
            expect(models).toContain("myScope/myModel", "because we should have successfully re-registered it");
        });
        
        // ### Error states ###
        
        it("should throw an exception when the model has no name", function() {
            expect(tetra.model.register).toThrow();
            expect(function(){tetra.model.register(null);}).toThrow();
            expect(function(){tetra.model.register(null, {});}).toThrow();
        });
        
        it("should throw an exception if we try to register a model that already exists", function() {
            var models = tetra.debug.model.list();
            expect(models).not.toContain("myModel");
            expect(function(){tetra.model.register("myModel", {scope: "myScope"});}).not.toThrow();
            expect(function(){tetra.model.register("myModel", {scope: "myScope"});}).toThrow();
        });
        
        it("should throw an exception if any kind of malformed data is present in a model instantiation", function() {
            expect(function(){tetra.model.register("myModel", {scope: "myScope"});}).not.toThrow();
//            expect(function(){tetra.model.register("myBrokenModel", {test:blarg});}).toThrow();
            
            var models = tetra.debug.model.list();
            expect(models).not.toContain("myBrokenModel", "as it should never have been registered");
        });
    });

    // Model Configuration
    // --------------------
    describe("model configuration", function() {
        
        beforeEach(function() {

            this.spy = sinon.spy();
            this.server = sinon.fakeServer.create();
            this.server.respondWith("GET", /\/my\/test/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            var that = this;
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
                methods: function(attr) {
                    return {
                        myMethod: function() {
                            that.spy();
                            return attr;
                        }
                    };
                }
            });
        });
        
        afterEach(function() {
            this.server.restore();
            this.spy = null;
            
            tetra.controller.destroy("myController", "myScope");
            tetra.model.destroy("myModel", "myScope");
        });
        
        it("should export functions set on the methods attribute", function(){
            var that = this;
            
            // Create a controller that uses myModel
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data) {
                                        that.spy(data);
                                    },
                                    "error": function(error) {
                                        // This should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });

            // Check that the spy has been called **once**
            expect(this.spy.called).toBeTruthy("as the spy should have been called");
            expect(this.spy.calledOnce).toBeTruthy("as the spy should have been called just once");
            
            // Check that we can see our method
            var data = this.spy.getCall(0).args[0];
            expect(data).toBeDefined("as the spy should contain the data object");
            expect(data[0]).toBeDefined();
            expect(data[0].myMethod).toBeDefined("as we defined the method myMethod on the data object");
            
            // Call it
            data[0].myMethod();
            expect(this.spy.calledTwice).toBeTruthy("as having invoked the myMethod(), the spy should have been called twice");
        });

        it("should make 'attr' available to its methods functions", function(){
            var 
                that = this,
                data,
                attr
            ;
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the `attr` object.
            //
            // It should correctly be
            //
            //    {
            //        id: "myUniqueId",
            //        ref: "blahblah",
            //        success: true
            //    }
            data = this.spy.getCall(0).args[0];
            attr = data[0].myMethod();
            
            expect(attr).toBeDefined("as the 'attr' object should have been exported by the 'myMethod()' call");
            expect(attr.id).toBeDefined();
            expect(attr.ref).toBeDefined();
            expect(attr.success).toBeDefined();
            expect(attr.success).toBeTruthy();
        });
    });
    
    // Fetching data
    // -----------------
    describe("fetching data with a model", function() {
        
        beforeEach(function() {
            this.spy = sinon.spy();
            this.server = sinon.fakeServer.create();
            this.server.respondWith("GET", /\/my\/test/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
        });
        
        afterEach(function() {
            this.server.restore();
            this.spy = null;
            
            tetra.controller.destroy("mySecondController", "myScope");
            tetra.controller.destroy("myController", "myScope");
            tetra.controller.destroy("myController", "myScope");
            tetra.controller.destroy("myPostController", "myScope");
            tetra.model.destroy("mySecondModel", "myScope");
            tetra.model.destroy("myModel", "myScope");
        });
        
        it("should fetch from the configured URL and return the expected response", function() {
            var that = this;
            
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
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            var response = this.spy.getCall(0).args[0];
            
            expect(response).toBeDefined("as we should have received a valid response");
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.success).toBeDefined();
            expect(response.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
        });
        
        it("should send json parameter in request body when method is POST and Content-Type is 'application/json'", function() {
            var 
                that = this,
                jsonServer = sinon.fakeServer.create()
            ;
            
            jsonServer.respondWith("POST", /\/my\/test\/jsonFetch.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        method: "POST",
                        url: "/my/test/jsonFetch.json",
                        headers: {"Content-type": "application/json"}
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({myJson:{myContent:"hello"}});
                                jsonServer.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            var response = this.spy.getCall(0).args[0];
            var request = jsonServer.requests[0];
            
            expect(response).toBeDefined("as we should have received a valid response");
            expect(request.requestHeaders['Content-Type']).toBe("application/json;charset=utf-8", "as the Content-Type must be set to 'application/json'");
            expect(request.requestBody).toBeDefined("as the request should contain the json string in its body");
            
            var jsonBody = JSON.parse(request.requestBody);
            
            expect(jsonBody.myJson).toBeDefined();
            expect(jsonBody.myJson.myContent).toBeDefined();
            expect(jsonBody.myJson.myContent).toBe("hello");
            jsonServer.restore();
        });
        
        it("should retrieve previously fetched data from local cache, using the 'find' function", function(){
            var that = this;
            
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
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Retrieve the object ID and find the object
            var response = this.spy.getCall(0).args[0];
            var hasLoaded = false;
            var successResponse;

            tetra.debug.model("myScope", "myModel").find(response.id, function(data){
                successResponse = data.getResponse();
                hasLoaded = true;
            });
            
            waitsFor(function(){
                return hasLoaded;
            });
            
            runs(function() {
                expect(successResponse).toBeDefined("as we should have received a valid response from the success callback");
                expect(successResponse.id).toBeDefined();
                expect(successResponse.ref).toBeDefined();
                expect(successResponse.success).toBeDefined();
                expect(successResponse.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
            });
        });
        
        it("should fetch data from server when a valid Id is passed to the 'find' function", function(){
            var 
                that = this,
                findServer = sinon.fakeServer.create(),
                hasLoaded = false,
                successResponseWithAttr = {
                    status: "SUCCESS",
                    data: {
                        myUniqueId: {
                            success: true,
                            dataAttr: "test"
                        }
                    }
                }
            ;
            
            findServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=.*&id=myUniqueId/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithAttr)]);
            
            tetra.model.register("mySecondModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    }
                },
                attr: {
                    success: false,
                    dataAttr: "abc"
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("mySecondController", {
                scope: "myScope",
                use: ["mySecondModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            
                        },
                        methods: {
                            init: function(){
                                // nothing to do
                            }
                        }
                    };
                }
            });
            
            var response;
            
            runs(function(){
                // This should succeed
                tetra.debug.model("myScope", "mySecondModel").find("myUniqueId", function(data){
                    response = data.getResponse();
                    hasLoaded = true;
                });
                findServer.respond();
            });

            waitsFor(function(){
                return hasLoaded;
            });
            
            runs(function(){
                expect(response).toBeDefined("as we should have received a valid response");
                expect(response.id).toBeDefined();
                expect(response.ref).toBeDefined();
                expect(response.success).toBeDefined();
                expect(response.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
                expect(response.dataAttr).toBeDefined();
                expect(response.dataAttr).toBe("test");
                findServer.restore();
            });
        });
        
        it("should retrieve previously fetched data from local cache, using the 'findByRef' function", function(){
            var that = this;
            
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
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Retrieve the object Ref and find the object
            var 
                response = this.spy.getCall(0).args[0],
                failObj,
                successObj,
                successResponse
            ;
			
			tetra.debug.model("myScope", "myModel").findByRef("blarg", function(obj) {
				failObj = obj;
			});
			
			tetra.debug.model("myScope", "myModel").findByRef(response.ref, function(obj) {
				successObj = obj;
			});
            
            expect(failObj).toBeNull();
            expect(successObj).toBeDefined();

            successResponse = successObj.getResponse();
            expect(successResponse).toBeDefined("as we should have received a valid response from the success callback");
            expect(successResponse.id).toBeDefined();
            expect(successResponse.ref).toBeDefined();
            expect(successResponse.success).toBeDefined();
            expect(successResponse.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
        });
        
        it("should retrieve previously fetched data from local cache, using the 'findByCond' function", function(){
            var that = this;
            
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
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Retrieve the object Ref and find the object
            var 
                response = this.spy.getCall(0).args[0],
                successResponse,
                hasLoaded = false
            ;
            
            // This should fail
            runs(function() {
                tetra.debug.model("myScope", "myModel").findByCond({
                    id: "myIncorrectId",
                    success: true
                }, function(data){
                    successResponse = data;
                    hasLoaded = true;
                });
            });
            
            waitsFor(function(){
                return hasLoaded;
            });
            
            runs(function() {
                expect(successResponse).toBeNull();
                hasLoaded = false;
            });
            
            // This should succeed
            runs(function(){
                tetra.debug.model("myScope", "myModel").findByCond({
                    id: "myUniqueId",
                    success: true
                }, function(data){
                    successResponse = data.getResponse();
                    hasLoaded = true;
                });
            });

            waitsFor(function(){
                return hasLoaded;
            });
            
            runs(function() {
                expect(successResponse).toBeDefined("as we should have received a valid response from the success callback");
                expect(successResponse.id).toBeDefined();
                expect(successResponse.ref).toBeDefined();
                expect(successResponse.success).toBeDefined();
                expect(successResponse.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
            });
        });
        
        it("should retrieve previously fetched data using the 'select' function", function(){
            var that = this;
            
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
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                // Nothing to do
                            }
                        }
                    };
                }
            });
            
            // Retrieve the object Ref and find the object
            var 
                response,
                successResponse,
                hasLoaded = false
            ;
            
            runs(function(){
                hasLoaded = false;
                tetra.debug.model("myScope", "myModel").select({
                    id: "myUniqueId",
                    success: true
                }, function(data) {
                    response = data[0].getResponse();
                    hasLoaded = true;
                });
                this.server.respond();
            });
            
            waitsFor(function(){
                return hasLoaded;
            });
            
            runs(function(){
                expect(response).toBeDefined("as we should have received a valid response from the success callback");
                expect(response.id).toBeDefined();
                expect(response.ref).toBeDefined();
                expect(response.success).toBeDefined();
                expect(response.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
            });
            
            // Call the function again, it should use the cache
            runs(function(){
                hasLoaded = false;
                tetra.debug.model("myScope", "myModel").select({
                    id: "myUniqueId",
                    success: true
                }, function(data) {
                    response = data[0].getResponse();
                    hasLoaded = true;
                });
            });
            
            waitsFor(function(){
                return hasLoaded;
            });

            runs(function(){
                expect(response).toBeDefined("as we should have received a valid response from the success callback");
                expect(response.id).toBeDefined();
                expect(response.ref).toBeDefined();
                expect(response.success).toBeDefined();
                expect(response.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
                
                // Check that the server was only polled once
                expect(this.server.requests.length).toBe(1);
            });
        });
        
        it("should store meta data on the models meta property, accessible via the getMeta function", function() {
            var 
                that = this,
                metaServer = sinon.fakeServer.create(),
                successResponseWithCount = {
                    status: "SUCCESS",
                    count: 2,
                    data: {
                        myUniqueId: {
                            success: true
                        }
                    }
                }
            ;
        
            metaServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=.*/,
                [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithCount)]);

            tetra.model.register("mySecondModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("mySecondController", {
                scope: "myScope",
                use: ["mySecondModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "mySecondModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("mySecondModel").fetch({});
                                metaServer.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            var response = this.spy.getCall(0).args[0];
            
            expect(response).toBeDefined("as we should have received a valid response");
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.success).toBeDefined();
            expect(response.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
            
            // confirm meta data
            expect(tetra.debug.model("myScope", "mySecondModel").getMeta("count")).toBe(2);
            
            metaServer.restore();
        });
        
        it("should fetch from a parameterized URL", function(){
            
            var 
                that = this,
                parameterizedServer = sinon.fakeServer.create()
            ;
            
            parameterizedServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=.*&part1=my&part2=test&part3=fetch/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/{0}/{1}/{2}.json",
                        uriParams: ["part1", "part2", "part3"]
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({
                                    part1: "my",
                                    part2: "test",
                                    part3: "fetch"
                                });
                                parameterizedServer.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            var response = this.spy.getCall(0).args[0];
            expect(response).toBeDefined("as the parameterized URL should still have returned a correct response");
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.success).toBeDefined();
            expect(response.success).toBeTruthy("as the response should have set the 'success' attribute to 'true'");
            
            // Cleanup the server
            parameterizedServer.restore();
        });
        
        it("should be able to pass parameters to be appended to the fetch URL", function() {
            var 
                that = this,
                parameterizedServer = sinon.fakeServer.create()
            ;
        
            parameterizedServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=.*&part1=my&part2=params/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json",
                        uriParams: ["part1", "part2"]
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        // Append will be called if the URL matches the server expectation
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({
                                    part1: "my",
                                    part2: "params"
                                });
                                parameterizedServer.respond();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            // Inspect the request parameters
            var data = this.spy.getCall(0).args[0];
            expect(data).toBeDefined("as the append callback should have been invoked");
            expect(data.success).toBeTruthy();
            expect(data.id).toBe("myUniqueId");
            expect(data.ref).toBeDefined();
            
            // Cleanup the server
            parameterizedServer.restore();
        });

        it("should fetch data using either POST or GET", function() {
            var
                postServer = sinon.fakeServer.create(),
                that = this
            ;
            
            // First create the server with GET and show that it fails for POST
            postServer.respondWith("GET", /\/my\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json",
                        method: "POST"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            var constructorFnc = function(me, app, page, orm) {
            	return {
                    events: {
                        model: {
                            "myModel": {
                                "append": function(data){
                                    that.spy(data[0].getResponse());
                                }
                            }
                        }
                    },
                    methods: {
                        init: function(){
                            orm("myModel").fetch({});
                            postServer.respond();
                        }
                    }
                };
            };
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: constructorFnc
            });
            
            expect(this.spy.called).toBeFalsy("as the mock server is setup to accept GET requests only");
            
            // Now setup a POST server and confirm it succeeds
            postServer.respondWith("POST", /\/my\/test/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            tetra.controller.register("myPostController", {
                scope: "myScope",
                use: ["myModel"],
                constr: constructorFnc
            });
            
            // -- BAM -- 
            expect(this.spy.called).toBeTruthy("as we have reset the mock server to accept POST requests");
            
            var data = this.spy.getCall(0).args[0];
            expect(data.success).toBeTruthy();
            expect(data.id).toBe("myUniqueId");
            expect(data.ref).toBeDefined();
            
            // Cleanup the server and test-specific controllers
            postServer.restore();
            
        });
        
        it("should fetch data with a parser callback", function() {
            
            var that = this;
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json",
                        parser: function(resp, col, cond) {            
                            col[0] = resp;
                            that.spy();
                            return col;
                        }
                    }
                },
                attr: {
                    data: {
                        myUniqueId: {
                            success: false
                        }
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Spy should be called twice, once in the `append` and once in the parser
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as it should have been called in the 'append' and parser() functions");
            
            var response = this.spy.getCall(1).args[0];
            expect(response).toBeDefined("as we should have received a valid response from the server");
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.data).toBeDefined();
            expect(response.data).toEqual(jasmine.any(Object));
            expect(response.data.myUniqueId).toBeDefined();
            expect(response.data.myUniqueId.success).toBeTruthy("as the response should have set 'success' to true");
        });

        it("should return well-formed data to the parser callback", function(){
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json",
                        parser: function(resp, col, cond) {            
                            col[0] = resp;
                            that.spy(resp, col, cond);
                            return col;
                        }
                    }
                },
                attr: {
                    data: {
                        myUniqueId: {
                            success: false
                        }
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {},
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the parser arguments. Each argument should correctly contain the following values
            //
            // `resp`
            //        {
            //            data: {
            //                myUniqueId: {
            //                    success: true,
            //                    id: 'something',
            //                    status: 'something else'
            //                }
            //            }
            //        },
            //
            // `col`
            //        {
            //            data: {
            //                myUniqueId:  {
            //                    success: true,
            //                    id: 'something',
            //                    status: 'something else'
            //                }
            //            }
            //        }
            //
            // `cond`
            //        ?
            var 
                args = this.spy.getCall(0).args,
                resp,
                col,
                colData,
                cond
            ;

            expect(args).toBeDefined();
            expect(args.length).toBe(3, "as we should return the arguments 'resp', 'col' and 'cond'");
            
            resp = args[0];
            expect(resp).toBeDefined();
            expect(resp.data).toBeDefined();
            expect(resp.data.myUniqueId).toBeDefined();
            expect(resp.data.myUniqueId.success).toBeTruthy();
            expect(resp.id).toBeDefined();
            expect(resp.status).toBeDefined();
            
            col = args[1];
            expect(col).toBeDefined();
            
            colData = col[0];
            expect(colData).toBeDefined();
            expect(colData.data).toBeDefined();
            expect(colData.data.myUniqueId).toBeDefined();
            expect(colData.data.myUniqueId.success).toBeTruthy();
            expect(colData.id).toBeDefined();
            expect(colData.status).toBeDefined();
            
            // TODO What is cond for?
            cond = args[2];
            expect(cond).toBeDefined();
        });
        
        it("should fetch data matching the attr description", function() {
            
            var
                attrServer = sinon.fakeServer.create(),
                that = this
            ;

            attrServer.respondWith("GET", /\/my\/attr\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithContent)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/attr/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    success: false,
                    myTestString: "salut",
                    myTestNumber: 50,
                    myTestArray: [1, 2],
                    myTestObj: {
                        bar: "foo"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                attrServer.respond();
                            }
                        }
                    };
                }
            });

            var response = this.spy.getCall(0).args[0];
            expect(response).toBeDefined("as we should have a valid response");
            expect(response.success).toBe(true);
            expect(response.myTestString).toBe("bye");
            expect(response.myTestNumber).toBe(12);
            expect(response.myTestArray).toEqual([1, 2, 3]);
            expect(response.myTestObj).toEqual({"foo": "bar"});
            expect(response.foo).toBeUndefined("as it is not described by the 'attr' object in the model");
            
            attrServer.restore();
        });
        
        it("should fetch data with defaults matching those in attr", function() {
            var
                attrServer = sinon.fakeServer.create(),
                that = this,
                response = {
                        status: "SUCCESS",
                        data: {
                            myUniqueId: {
                                bar: true
                            }
                        }
                }
            ;
            
            attrServer.respondWith("GET", /\/my\/attr\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/attr/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    success: false,
                    myTestString: "salut",
                    myTestNumber: 50,
                    myTestArray: [1, 2],
                    myTestObj: {
                        bar: "foo"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                attrServer.respond();
                            }
                        }
                    };
                }
            });
            
            var args = this.spy.getCall(0).args[0];
            expect(args).toBeDefined("as we should have a valid response");
            expect(args.success).toBe(false);
            expect(args.myTestString).toBe("salut");
            expect(args.myTestNumber).toBe(50);
            expect(args.myTestArray).toEqual([1, 2]);
            expect(args.myTestObj).toEqual({"bar": "foo"});
            expect(args.foo).toBeUndefined("as it is not described by the 'attr' object in the model");
            
            attrServer.restore();
        });
        
        it("should make the get() function available on its return object, to retrieve individual attributes", function(){
            var
                attrServer = sinon.fakeServer.create(),
                that = this
            ;

            attrServer.respondWith("GET", /\/my\/attr\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithContent)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/attr/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    success: false,
                    myTestString: "salut",
                    myTestNumber: 50,
                    myTestArray: [1, 2],
                    myTestObj: {
                        bar: "foo"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                attrServer.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0][0];
            expect(response.get).toBeDefined();
            expect(response.get).toEqual(jasmine.any(Function));
            expect(response.get("success")).toBeTruthy();
            expect(response.get("myTestString")).toBe("bye");
            expect(response.get("myTestNumber")).toBe(12);
            expect(response.get("myTestArray")).toEqual([1, 2, 3]);
            expect(response.get("myTestObj")).toEqual({foo: "bar"});
            
            attrServer.restore();
        });
        
        it("should make the function set() available on its return object, to modify the value of individual attributes", function(){
            var
                attrServer = sinon.fakeServer.create(),
                that = this
            ;
            
            attrServer.respondWith("GET", /\/my\/attr\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithContent)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/attr/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    success: false,
                    myTestString: "salut",
                    myTestNumber: 50,
                    myTestArray: [1, 2],
                    myTestObj: {
                        bar: "foo"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                attrServer.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0][0];
            
            // Verify that the default values are present
            expect(response.get("success")).toBeTruthy();
            expect(response.get("myTestString")).toBe("bye");
            expect(response.get("myTestNumber")).toBe(12);
            expect(response.get("myTestArray")).toEqual([1, 2, 3]);
            expect(response.get("myTestObj")).toEqual({foo: "bar"});
            
            // Set them to new values
            response.set("success", false);
            response.set("myTestString", "ciao");
            response.set("myTestNumber", 42);
            response.set("myTestArray", [1, 2, 3, 4, 5]);
            response.set("myTestObj", {baz: "blargh"});
            
            // Check that they've been updated
            expect(response.get("success")).toBeFalsy();
            expect(response.get("myTestString")).toBe("ciao");
            expect(response.get("myTestNumber")).toBe(42);
            expect(response.get("myTestArray")).toEqual([1, 2, 3, 4, 5]);
            expect(response.get("myTestObj")).toEqual({baz: "blargh"});
            
            attrServer.restore();
        });
        
        it("should make the function update() available on its return object, to modify the value of all attributes at once", function(){
            var
                attrServer = sinon.fakeServer.create(),
                that = this
            ;
            
            attrServer.respondWith("GET", /\/my\/attr\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithContent)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/attr/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    success: false,
                    myTestString: "salut",
                    myTestNumber: 50,
                    myTestArray: [1, 2],
                    myTestObj: {
                        bar: "foo"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        },
                        validate: function(attr, errors) {
                            if(typeof attr.myTestString !== "string") {
                                errors.push("bar");
                            }
                            return errors;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                attrServer.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0][0];
            
            // Verify that the default values are present
            expect(response.get("success")).toBeTruthy();
            expect(response.get("myTestString")).toBe("bye");
            expect(response.get("myTestNumber")).toBe(12);
            expect(response.get("myTestArray")).toEqual([1, 2, 3]);
            expect(response.get("myTestObj")).toEqual({foo: "bar"});
            
            // Set them all to new values
            response.update({
                success: false,
                myTestString: "ciao",
                myTestNumber: 42,
                myTestArray: [1, 2, 3, 4, 5],
                myTestObj: {
                    baz: "blargh"
                }
            });
            
            // Check they've been updated
            expect(response.get("success")).toBeFalsy();
            expect(response.get("myTestString")).toBe("ciao");
            expect(response.get("myTestNumber")).toBe(42);
            expect(response.get("myTestArray")).toEqual([1, 2, 3, 4, 5]);
            expect(response.get("myTestObj")).toEqual({baz: "blargh"});
            
            // Set some to new values
            response.update({
                myTestString: "slan",
                myTestNumber: 99
            });
            
            // Check they've been updated
            expect(response.get("myTestString")).toBe("slan");
            expect(response.get("myTestNumber")).toBe(99);
            
            // Try to set values with an object that fails validation (see `validate` function above)
            response.update({
                success: "sdfsdf",
                myTestString: 12,
                myTestNumber: 88,
                myTestArray: [1],
                myTestObj: {
                    xxx: "yyy"
                }
            });
            
            // Check that the update has failed
            expect(response.get("success")).toBeFalsy();
            expect(response.get("myTestString")).toBe("slan");
            expect(response.get("myTestNumber")).toBe(99);
            expect(response.get("myTestArray")).toEqual([1, 2, 3, 4, 5]);
            expect(response.get("myTestObj")).toEqual({baz: "blargh"});
            
            attrServer.restore();
        });
        
        it("should make the function revert() available on its return object, to return modified attributes to their original state", function(){
            var
                attrServer = sinon.fakeServer.create(),
                that = this
            ;
            
            attrServer.respondWith("GET", /\/my\/attr\/test/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponseWithContent)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/attr/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    success: false,
                    myTestString: "salut",
                    myTestNumber: 50,
                    myTestArray: [1, 2],
                    myTestObj: {
                        bar: "foo"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        },
                        validate: function(attr, errors) {
                            if(typeof attr.myTestString !== "string") {
                                errors.push("bar");
                            }
                            return errors;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                attrServer.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0][0];
            
            // Verify that the default values are present
            expect(response.get("success")).toBeTruthy();
            expect(response.get("myTestString")).toBe("bye");
            expect(response.get("myTestNumber")).toBe(12);
            expect(response.get("myTestArray")).toEqual([1, 2, 3]);
            expect(response.get("myTestObj")).toEqual({foo: "bar"});
            
            // Set them to new values
            response.set("success", false);
            response.set("myTestString", "ciao");
            response.set("myTestNumber", 42);
            response.set("myTestArray", [1, 2, 3, 4, 5]);
            response.set("myTestObj", {baz: "blargh"});
            
            // Check they've been updated
            expect(response.get("success")).toBeFalsy();
            expect(response.get("myTestString")).toBe("ciao");
            expect(response.get("myTestNumber")).toBe(42);
            expect(response.get("myTestArray")).toEqual([1, 2, 3, 4, 5]);
            expect(response.get("myTestObj")).toEqual({baz: "blargh"});
            
            // Revert the changes
            response.revert();
            
            // Check they've been restored
            expect(response.get("success")).toBeTruthy();
            expect(response.get("myTestString")).toBe("bye");
            expect(response.get("myTestNumber")).toBe(12);
            expect(response.get("myTestArray")).toEqual([1, 2, 3]);
            expect(response.get("myTestObj")).toEqual({foo: "bar"});
            
            attrServer.restore();
        });

        it("should validate the server data if a validate method is found", function(){
            var
                validatingServer = sinon.fakeServer.create(),
                that = this,
                response = {
                        status: "SUCCESS",
                        data: {
                            myUniqueId: {
                                bar: true
                            }
                        }
                },
                falseResponse = {
                        status: "SUCCESS",
                        data: {
                            myUniqueId: {
                                bar: false
                            }
                        }
                }
            ;
            
            // Setup routes for valid and invalid requests
            validatingServer.respondWith("GET", /\/my\/validate\/test\/fetch.json\?ts=.*&valid=true/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
            validatingServer.respondWith("GET", /\/my\/validate\/test\/fetch.json\?ts=.*&valid=false/, 
                    [200, {"Content-type": "application/json"}, JSON.stringify(falseResponse)]);

            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/validate/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    bar: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        },
                        validate: function(attr, errors) {
                            if(!attr.bar) {
                                errors.push("bar");
                            }
                            return errors;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy();
                                    },
                                    "invalid": function(error) {
                                        // Called when the `validate` function returns some errors
                                        that.spy(error);
                                    }
                                        
                                }
                            },
                            view: {
                                "testValidRequest": function() {
                                    orm("myModel").fetch({valid: true});
                                    validatingServer.respond();
                                },
                                "testInvalidRequest": function() {
                                    orm("myModel").fetch({valid: false});
                                    validatingServer.respond();
                                }
                            }
                        },
                        methods: {
                            init: function(){}
                        }
                    };
                }
            });
            
            // Send a valid request
            tetra.debug.ctrl.app("myScope").notify("testValidRequest", {});
            
            // Check that `append` was called
            expect(that.spy.called).toBeTruthy();
            expect(that.spy.calledOnce).toBeTruthy("as the 'invalid' callback should not fire");
            
            // Reset the spy and send an invalid request
            this.spy = sinon.spy();

            tetra.debug.ctrl.app("myScope").notify("testInvalidRequest", {});
            expect(this.spy.called).toBeTruthy();
            expect(that.spy.calledTwice).toBeTruthy("as the 'invalid' callback should fire, calling spy() for a 2nd time");

            // Check that the error "bar" is returned
            var errors = this.spy.getCall(0).args[0];
            expect(errors.attr[0]).toBe("bar");
            
            validatingServer.restore();
        });
        
        it("should not validate the data of an object created manually", function(){
            var
                that = this
            ;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                attr: {
                    bar: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        },
                        validate: function(attr, errors) {
                            if(!attr.bar) {
                                errors.push("bar");
                            }
                            return errors;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "create": function(data){
                                        that.spy();
                                    },
                                    "invalid": function(error) {
                                        // Called when the `validate` function returns some errors
                                        that.spy(error);
                                    }
                                        
                                }
                            },
                            view: {
                                "createInvalidOject": function() {
                                    orm("myModel").create({valid: false});
                                }
                            }
                        },
                        methods: {
                            init: function(){}
                        }
                    };
                }
            });
            
            // Send a valid request
            tetra.debug.ctrl.app("myScope").notify("createInvalidOject", {});
            
            // Check that `append` was called
            expect(that.spy.called).toBeTruthy();
            expect(that.spy.calledOnce).toBeTruthy("as the 'invalid' callback should not fire");
            
        });
        
        it("should be able to parse an HTML response", function(){
            var
                htmlServer = sinon.fakeServer.create(),
                that = this
            ;
            
            // Setup routes for valid and invalid requests
            // NOTE Firefox with Prototype only returns the correct format if we set a doctype, otherwise its parsed as XML.
            htmlServer.respondWith("GET", /\/my\/html\/test\/fetch.json/, 
                    [200, {"Content-type": "text/html"}, "<!doctype HTML><div><p>TEST</p></div>"]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/html/test/fetch.json",
                        method: "GET",
                        parser : function(resp, col, cond) {
                            col[0] = {html: resp};
                            return col;
                        }
                    }
                },
                attr: {
                    html: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }    
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                htmlServer.respond();
                            }
                        }
                    };
                }
            });
    
            expect(that.spy.called).toBeTruthy();
            expect(that.spy.calledOnce).toBeTruthy();
            
            var 
                response = that.spy.getCall(0).args[0],
                html = response[0].get("html")
            ;

            expect(html).toEqual("<!doctype HTML><div><p>TEST</p></div>");
            
            htmlServer.restore();
        });
        
        // NOTE This test is designed to check that we correctly handle a weird "feature" of Prototype, namely 
        // that an Ajax response that happens to be the ID of a page element will cause that element to be
        // retrieved and returned as the response object
        it("should be able to parse a response that matches an ID in the document, without returning the node", function(){
            var
                protoServer = sinon.fakeServer.create(),
                that = this
            ;
                        
            // TODO Inject HTML and use our own ID
            protoServer.respondWith("GET", /\/my\/prototype\/test\/fetch.json/, 
                    [200, {"Content-type": "text/plain"}, "__jasmine_TrivialReporter_showPassed__"]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/prototype/test/fetch.json",
                        method: "GET"
                    }
                },
                attr: {
                    html: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data);
                                    }    
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                protoServer.respond();
                            }
                        }
                    };
                }
            });
    
            expect(that.spy.called).toBeTruthy();
            expect(that.spy.calledOnce).toBeTruthy();
            
            var 
                response = that.spy.getCall(0).args[0]
            ;

            expect(response).toBeDefined();
            expect(typeof response).not.toEqual("HTMLElement");
            
            protoServer.restore();
        });
        
        // Test the most common 4XX errors (these are typically handled identically
        // by the Ajax library but, as we don't know what ORM will be abstracting in the
        // future, best to test a handful of them)
        it("should correctly handle a 'client error' (4XX) response from the server", function(){
            var
                clientErrorServer = sinon.fakeServer.create(),
                that = this,
                args,
                errorCode,
                errorMsg
            ;
            
            var response400 = {
                    status: "FAIL",
                    errors: ["400"]
            };
            var response401 = {
                    status: "FAIL",
                    errors: ["401"]
            };
            var response403 = {
                    status: "FAIL",
                    errors: ["403"]
            };
            var response404 = {
                    status: "FAIL",
                    errors: ["404"]
            };
            var response405 = {
                    status: "FAIL",
                    errors: ["405"]
            };

            // Setup routes for each 4XX response under test
            clientErrorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test400=true/, 
                    [400, {"Content-type": "application/json"}, JSON.stringify(response400)]);
            clientErrorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test401=true/, 
                    [401, {"Content-type": "application/json"}, JSON.stringify(response401)]);
            clientErrorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test403=true/, 
                    [403, {"Content-type": "application/json"}, JSON.stringify(response403)]);
            clientErrorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test404=true/, 
                    [404, {"Content-type": "application/json"}, JSON.stringify(response404)]);
            clientErrorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test405=true/, 
                    [405, {"Content-type": "application/json"}, JSON.stringify(response405)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/error/test/fetch.json",
                        method: "GET"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        // This should never be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }
                                }
                            },
                            view: {
                                "test400Response": function() {
                                    orm("myModel").fetch({test400: true});
                                    clientErrorServer.respond();
                                },
                                "test401Response": function() {
                                    orm("myModel").fetch({test401: true});
                                    clientErrorServer.respond();
                                },
                                "test403Response": function() {
                                    orm("myModel").fetch({test403: true});
                                    clientErrorServer.respond();
                                },
                                "test404Response": function() {
                                    orm("myModel").fetch({test404: true});
                                    clientErrorServer.respond();
                                },
                                "test405Response": function() {
                                    orm("myModel").fetch({test405: true});
                                    clientErrorServer.respond();
                                }
                            }
                        },
                        methods: {
                            init: function(){}
                        }
                    };
                }
            });
        
            // ### Test a 400 (Bad request) response ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("test400Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 400 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];

            expect(errorCode).toBe(400);
            expect(errorMsg).toBe("400");

            // ### Test a 401 (Unauthorized) response ###
            //
            // Note that a 401 error will also create and open the ajaxbox widget
            this.spy = sinon.spy();
            
            expect(tetra.ajaxBox).toBeUndefined();
            
            tetra.debug.ctrl.app("myScope").notify("test401Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 401 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];

            expect(errorCode).toBe(401);
            expect(errorMsg).toBe("401");
                        
            expect(tns.ajaxBox).toBeDefined();
            delete tns.ajaxBox;
            
            // ### Test a 403 (Forbidden) Response ###
            this.spy = sinon.spy();

            tetra.debug.ctrl.app("myScope").notify("test403Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 403 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];
            
            expect(errorCode).toBe(403);
            expect(errorMsg).toBe("403");
            
            expect(tns.ajaxBox).toBeDefined();
            delete tns.ajaxBox;
            
            // ### Test a 404 (Not Found) response ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("test404Response", {});
            
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 404 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];
            
            expect(errorCode).toBe(404);
            expect(errorMsg).toBe("404");
            
            // ### Test a 405 (Method not allowed) response ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("test405Response", {});
            
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 405 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];
            
            expect(errorCode).toBe(405);
            expect(errorMsg).toBe("405");

            clientErrorServer.restore();
        });
        
        it("should correctly handle a 'server error' (5XX) response from the server", function(){
            var
                errorServer = sinon.fakeServer.create(),
                that = this,
                args,
                errorCode,
                errorMsg
            ;
            
            var response500 = {
                    status: "FAIL",
                    errors: ["500"]
            };
            var response501 = {
                    status: "FAIL",
                    errors: ["501"]
            };
            var response503 = {
                    status: "FAIL",
                    errors: ["503"]
            };
    
            // Setup routes for 5XX responses
            errorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test500=true/, 
                    [500, {"Content-type": "application/json"}, JSON.stringify(response500)]);
            errorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test501=true/, 
                    [501, {"Content-type": "application/json"}, JSON.stringify(response501)]);
            errorServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test503=true/, 
                    [503, {"Content-type": "application/json"}, JSON.stringify(response503)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/error/test/fetch.json",
                        method: "GET"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        // This should never be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        // This is the only time it should be called
                                        that.spy(data);
                                    }    
                                }
                            },
                            view: {
                                "test500Response": function() {
                                    orm("myModel").fetch({test500: true});
                                    errorServer.respond();
                                },
                                "test501Response": function() {
                                    orm("myModel").fetch({test501: true});
                                    errorServer.respond();
                                },
                                "test503Response": function() {
                                    orm("myModel").fetch({test503: true});
                                    errorServer.respond();
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                
                            }
                        }
                    };
                }
            });
            
            // ### Test a 500 (Internal Server Error) response ###
            this.spy = sinon.spy();

            tetra.debug.ctrl.app("myScope").notify("test500Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 500 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];

            expect(errorCode).toBe(500);
            expect(errorMsg).toBe("500");
            
            // ### Test a 501 (Not implemented) response ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("test501Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 501 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];
            
            expect(errorCode).toBe(501);
            expect(errorMsg).toBe("501");
            
            // ### Test a 503 (Service not available) response ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("test503Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 503 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];
            
            expect(errorCode).toBe(503);
            expect(errorMsg).toBe("503");
    
            errorServer.restore();
        });

        // There is no real standard way to handle a redirect response to an Ajax request. We return an error.
        it("should handle 'redirect' (3XX) server responses", function() {
            var
                redirectionServer = sinon.fakeServer.create(),
                that = this,
                args,
                errorCode,
                errorMsg
            ;
    
            var response301 = {
                    success: "FAIL",
                    errors: ["301"]
            };
            
            // Setup routes for valid and invalid requests
            redirectionServer.respondWith("GET", /\/my\/error\/test\/fetch.json\?ts=.*&test301=true/, 
                    [301, {"Content-type": "application/json", "Location": "http://www.redirectto.nowhere/"},
                             JSON.stringify(response301)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/error/test/fetch.json",
                        method: "GET"
                    }
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        // This should never be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }    
                                }
                            },
                            view: {
                                "test301Response": function() {
                                    orm("myModel").fetch({test301: true});
                                    redirectionServer.respond();
                                }
                            }
                        },
                        methods: {
                            init: function(){
                            }
                        }
                    };
                }
            });
            
            // ### Test a 301 (Moved Permanently) response ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("test301Response", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 301 error callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            errorCode = args.errorCode;
            errorMsg = args.errors[0];
            
            expect(errorCode).toBe(301);
            expect(errorMsg).toBe("301");

            redirectionServer.restore();
        });
        
        it("should handle any valid mime types other than JSON", function() {
            var
                mimeTypeServer = sinon.fakeServer.create(),
                that = this
            ;
            
            // Setup routes for different mime types
            //
            // The following mime types should be handled : 
            //
            // * text/plain
            // * text/css                (returned as plain text)
            // * text/csv                (returned as plain text)
            // * text/xml                (returned as a Document object)
            // * application/xhtml+xml     (returned as a Document object)
            // * application/soap+xml     (returned as a Document object)
            // * application/json         (returned as a JSON object)
            // * text/javascript        (executed & returned as a string)
            // * application/javascript (executed & returned as a string)
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=plaintext/, 
                    [200, {"Content-type": "text/plain"}, "plaintext"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=css/, 
                    [200, {"Content-type": "text/css"}, "body{}"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=csv/, 
                    [200, {"Content-type": "text/csv"}, "a,b,c"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=xml/, 
                    [200, {"Content-type": "text/xml"}, "<?xml version='1.0'?><test><tag>value</tag></test>"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=xhtml/, 
                    [200, {"Content-type": "application/xhtml+xml"},
                     "<?xml version='1.0'?><html><head></head><body><div><h1>Hello world</h1></div><br /></body></html>"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=soap/, 
                    [200, {"Content-type": "application/soap+xml"},
                     "<?xml version='1.0'?><soap:Envelope xmlns:soap='http://www.w3.org/2003/05/soap-envelope'>" + 
                     "<soap:Header></soap:Header><soap:Body></soap:Body></soap:Envelope>"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=js-text/, 
                    [200, {"Content-type": "text/javascript"}, "window.hasJsTextCallback = true"]);
            
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=js-app/, 
                    [200, {"Content-type": "application/javascript"}, "window.hasJsAppCallback = true"]);
            
            // The following mime types are unsupported and should be treated as plaintext
            // 
            // * application/octet-stream
            // * application/pdf
            // * audio/mpg
            // * image/gif
            // * video/mpeg
            // * multipart/form-data
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=octet/, 
                    [200, {"Content-type": "application/octet-stream"}, "octet"]);
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=pdf/, 
                    [200, {"Content-type": "application/pdf"}, "pdf"]);
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=image/, 
                    [200, {"Content-type": "image/gif"}, "image"]);
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=audio/, 
                    [200, {"Content-type": "audio/mpg"}, "audio"]);
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=video/, 
                    [200, {"Content-type": "video/mpeg"}, "video"]);
            mimeTypeServer.respondWith("GET", /\/my\/mime\/test\/fetch.json\?ts=.*&mime=multipart/, 
                    [200, {"Content-type": "multipart/form-data"}, "multipart"]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/mime/test/fetch.json",
                        method: "GET",
                        parser: function(resp, col, cond) {
                            col[0] = {
                                    mime: cond.mime,
                                    response: resp
                            };
                            
                            return col;
                        }
                    }
                },
                attr: {
                    mime: "",
                    response: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    },
                                    "error": function(data) {
                                        // This should never be called
                                        that.spy();
                                    }
                                }
                            },
                            view: {
                                "testPlaintext": function() {
                                    orm("myModel").fetch({mime: "plaintext"});
                                    mimeTypeServer.respond();
                                },
                                "testCss": function() {
                                    orm("myModel").fetch({mime: "css"});
                                    mimeTypeServer.respond();
                                },
                                "testCsv": function() {
                                    orm("myModel").fetch({mime: "csv"});
                                    mimeTypeServer.respond();
                                },
                                "testXml": function() {
                                    orm("myModel").fetch({mime: "xml"});
                                    mimeTypeServer.respond();
                                },
                                "testXhtml": function() {
                                    orm("myModel").fetch({mime: "xhtml"});
                                    mimeTypeServer.respond();
                                },
                                "testSoap": function() {
                                    orm("myModel").fetch({mime: "soap"});
                                    mimeTypeServer.respond();
                                },
                                "testJavaScriptText": function() {
                                    orm("myModel").fetch({mime: "js-text"});
                                    mimeTypeServer.respond();
                                },
                                "testJavaScriptApplication": function() {
                                    orm("myModel").fetch({mime: "js-app"});
                                    mimeTypeServer.respond();
                                },
                                "testOctetStream": function() {
                                    orm("myModel").fetch({mime: "octet"});
                                    mimeTypeServer.respond();
                                },
                                "testPdf": function() {
                                    orm("myModel").fetch({mime: "pdf"});
                                    mimeTypeServer.respond();
                                },
                                "testImage": function() {
                                    orm("myModel").fetch({mime: "image"});
                                    mimeTypeServer.respond();
                                },
                                "testAudio": function() {
                                    orm("myModel").fetch({mime: "audio"});
                                    mimeTypeServer.respond();
                                },
                                "testVideo": function() {
                                    orm("myModel").fetch({mime: "video"});
                                    mimeTypeServer.respond();
                                },
                                "testMultipart": function() {
                                    orm("myModel").fetch({mime: "multipart"});
                                    mimeTypeServer.respond();
                                }
                            }
                        },
                        methods: {
                            init: function(){}
                        }
                    };
                }
            });
        
            var args;
            
            // ## Valid mime-types ##
            
            // ### Test a response with mimetype `text/plain` ###
            this.spy = sinon.spy();
    
            tetra.debug.ctrl.app("myScope").notify("testPlaintext", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("plaintext");
            
            // ### Test a response with mimetype `text/css` ###
            this.spy = sinon.spy();
            tetra.debug.ctrl.app("myScope").notify("testCss", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("body{}");
            
            // ### Test a response with mimetype `text/csv` ###
            this.spy = sinon.spy();
            tetra.debug.ctrl.app("myScope").notify("testCsv", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("a,b,c");
            
            // ### Test a response with mimetype `text/xml` ###
            this.spy = sinon.spy();
            tetra.debug.ctrl.app("myScope").notify("testXml", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
//            args = that.spy.getCall(0).args[0];
            // Note that we can't do instanceof Document, as this returns `undefined` in IE8 and under
//            expect(args.response).toEqual(jasmine.any(Object), "as mimetype text/xml should return a Document object");

            // ### Test a response with mimetype `application/xhtml+xml` ###
            this.spy = sinon.spy();
            tetra.debug.ctrl.app("myScope").notify("testXhtml", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
//            args = that.spy.getCall(0).args[0];
//            expect(args.response).toEqual(jasmine.any(Object), "as mimetype application/xhtml+xml should return a Document object");

            // ### Test a response with mimetype `application/soap+xml` ###
            this.spy = sinon.spy();
            tetra.debug.ctrl.app("myScope").notify("testSoap", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
//            args = that.spy.getCall(0).args[0];
//            expect(args.response).toEqual(jasmine.any(Object), "as mimetype application/soap+xml should return a Document object");
            
            // ### Test a response with mimetype `text/javascript` ###
            this.spy = sinon.spy();
            expect(window.hasJsTextCallback).toBeUndefined();
            
            tetra.debug.ctrl.app("myScope").notify("testJavaScriptText", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            expect(window.hasJsTextCallback).toBeTruthy("as it should have been created in the JavaScript evaluation");
            
            args = that.spy.getCall(0).args[0];
            // The script content should be executed and returned as a String
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("window.hasJsTextCallback = true");

            // ### Test a response with mimetype `application/javascript` ###
            this.spy = sinon.spy();
            expect(window.hasJsAppCallback).toBeUndefined();
            
            tetra.debug.ctrl.app("myScope").notify("testJavaScriptApplication", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            expect(window.hasJsAppCallback).toBeTruthy("as it should have been created in the JavaScript app evaluation");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("window.hasJsAppCallback = true");
            
            // ## Unsupported mime-types, should be treated as text/plain ##
            
            // ### Test a response with mimetype `application/octet-stream` ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("testOctetStream", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("octet");            
            
            // ### Test a response with mimetype `application/pdf` ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("testPdf", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("pdf");        
            
            // ### Test a response with mimetype `image/gif` ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("testImage", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("image");    
            
            // ### Test a response with mimetype `audio/mpg` ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("testAudio", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("audio");
            
            // ### Test a response with mimetype `video/mpeg` ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("testVideo", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("video");    
            
            // ### Test a response with mimetype `multipart/form-data` ###
            this.spy = sinon.spy();
            
            tetra.debug.ctrl.app("myScope").notify("testMultipart", {});
            expect(that.spy.called).toBeTruthy("as the spy should have been invoked in the 'append' callback");
            expect(that.spy.calledOnce).toBeTruthy("as the spy should only have been invoked once");
            
            args = that.spy.getCall(0).args[0];
            expect(args.response).toEqual(jasmine.any(String));
            expect(args.response).toBe("multipart");    
            
            mimeTypeServer.restore();
        });
        
        it("should correctly handle empty JSON responses", function(){
            var
                emptyJsonServer = sinon.fakeServer.create(),
                that = this
            ;
            
            // Setup routes for valid and invalid requests
            emptyJsonServer.respondWith("GET", /\/my\/empty\/test\/fetch.json/, 
                    [200, {"Content-type": "application/json"}, ""]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/empty/test/fetch.json"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "append": function(data) {
                                        // This should never be called
                                        that.spy();
                                    },
                                    "alert": function(error) {
                                        that.spy(error);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                emptyJsonServer.respond();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();

            var args = that.spy.getCall(0).args[0];
            expect(args).toBeDefined();
            expect(args.type).toBe("fetch");
            expect(args.alerts).toBeDefined();
            expect(args.cond).toBeDefined();
            
            emptyJsonServer.restore();
        });
        
//        it("should correctly handle invalid JSON responses", function(){
//            var
//                invalidJsonServer = sinon.fakeServer.create(),
//                that = this
//            ;
//            
//            invalidJsonServer.respondWith("GET", /\/my\/invalid\/test\/fetch.json/, 
//                    [200, {"Content-type": "application/json"},
//                     "{{"]);
//    
//            tetra.model.register("myModel", {
//        		  scope: "myScope",
//                req: {
//                    fetch: {
//                        url: "/my/invalid/test/fetch.json"
//                    }
//                },
//                attr: {
//                    success: false
//                },
//                methods : function(attr){
//                    return {
//                        getResponse: function() {
//                            return attr;
//                        }
//                    };
//                }
//            });
//            
//            tetra.controller.register("myController", {
//                scope: "myScope",
//                use: ["myModel"],
//                constr: function(me, app, page, orm) {
//                    return {
//                        events: {
//                            model: {
//                                "myModel": {
//                                    "append": function() {
//                                        // Shouldn't be called
//                                    },
//                                    "error": function(error) {
//                                        that.spy(error);
//                                    }
//                                }
//                            }
//                        },
//                        methods: {
//                            init: function(){
//                                orm("myModel").fetch({});
//                                invalidJsonServer.respond();
//                            }
//                        }
//                    };
//                }
//            });
//            
//            expect(this.spy.called).toBeTruthy();
//            expect(this.spy.calledOnce).toBeTruthy();
//            
//            invalidJsonServer.restore();
//        });
    });
    
    // Saving data
    // -----------------
    describe("saving data to a model", function() {
        
        beforeEach(function() {
            var response = {
                    status: "SUCCESS",
                    data: {
                        id10: {
                            id: 10,
                            foo: "bar"
                        }
                    }
            };
            
            this.spy = sinon.spy();
            this.server = sinon.fakeServer.create();
            this.server.respondWith("POST", /\/my\/test\/save.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
        });
        
        afterEach(function() {
            this.server.restore();
            this.spy = null;
            
            tetra.controller.destroy("myController", "myScope");
            tetra.model.destroy("myModel", "myScope");
        });
        
        it("should save model data to the configured URL", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/test/save.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToSave: "",
                    foo: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToSave: "myData"}).save();
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0];
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            expect(response.id).toBeDefined();

            expect(response.ref).toBeDefined();    
            expect(response.myDataToSave).toBeDefined();
            expect(response.myDataToSave).toEqual("myData");
            expect(response.foo).toBeDefined();
            expect(response.foo).toBe("bar");
        });
        
        it("should save model data to a parameterized URL", function() {
            var 
                that = this,
                parameterizedServer = sinon.fakeServer.create()
            ;

            parameterizedServer.respondWith("POST", /\/my\/parameterized\/test\/save.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);

            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/{0}/{1}/{2}/save.json",
                        uriParams: ["part1", "part2", "part3"],
                        method: "POST"
                    }
                },
                attr: {
                    myDataToSave: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){    
                                orm("myModel").create({myDataToSave: "foo"}).save({uriParams: {
                                    part1: "my",
                                    part2: "parameterized",
                                    part3: "test"
                                }});
                                parameterizedServer.respond();
                            }
                        }
                    };
                }
            });

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            var response = this.spy.getCall(0).args[0];
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myDataToSave).toBeDefined();
            expect(response.myDataToSave).toEqual("foo");
            
            parameterizedServer.restore();
        });
        
        it("should save data matching the attr description", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/test/save.json",
                        method: "POST"
                    }
                },
                attr: {
                    myTestString: "",
                    myTestNumber: 0,
                    myTestBoolean: false,
                    myTestObj: {},
                    myTestArray: []
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({
                                    myTestString: "foo",
                                    myTestNumber: 99,
                                    myTestBoolean: true,
                                    myTestObj: {
                                        "foo": "bar"
                                    },
                                    myTestArray: [1, 2, 3],
                                    myUnsavedAttr: "blargh"
                                }).save();
                                that.server.respond();
                            }
                        }
                    };
                }
            });

            // Check the `response`, the format should be
            //
            // {
            //  id: "",
            //  ref: "",
            //  myTestString: "",
            //  myTestNumber: 0,
            //  myTestObj: {},
            //  myTestArray: []
            // }
            
            var response = this.spy.getCall(0).args[0];

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.myTestString).toBeDefined();
            expect(response.myTestString).toEqual("foo");
            expect(response.myTestNumber).toBeDefined();
            expect(response.myTestNumber).toBe(99);
            expect(response.myTestBoolean).toBeDefined();
            expect(response.myTestBoolean).toBe(true);
            expect(response.myTestObj).toBeDefined();
            expect(response.myTestObj).toEqual({"foo": "bar"});
            expect(response.myTestArray).toBeDefined();
            expect(response.myTestArray).toEqual([1, 2, 3]);
            expect(response.myUnsavedAttr).toBeUndefined();
        });
        
        it("should post data with defaults matching those in attr", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/test/save.json",
                        method: "POST"
                    }
                },
                attr: {
                    myTestString: "default",
                    myTestNumber: 12,
                    myTestBoolean: true,
                    myTestObj: {"foo":"baz"},
                    myTestArray: [1, 2]
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({
                                    myTestString: "overwrite"
                                }).save();
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            var response = this.spy.getCall(0).args[0];
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.myTestString).toBeDefined();
            expect(response.myTestString).toEqual("overwrite");
            expect(response.myTestNumber).toBeDefined();
            expect(response.myTestNumber).toBe(12);
            expect(response.myTestBoolean).toBeDefined();
            expect(response.myTestBoolean).toBe(true);
            expect(response.myTestObj).toBeDefined();
            expect(response.myTestObj).toEqual({"foo": "baz"});
            expect(response.myTestArray).toBeDefined();
            expect(response.myTestArray).toEqual([1, 2]);
        });
        
        // ### Error states ###
        
        it("should correctly handle FAIL responses from the server", function(){
            var 
                that = this,
                failServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    data: {
                        id10: {
                            foo: "bar"
                        }
                    },
                    alerts: {
                        msg1: "msg1 body",
                        msg2: "msg2 body"
                    }
                }
            ;
            
            failServer.respondWith("POST", /\/my\/test\/save.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/test/save.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToSave: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data) {
                                        // Should never be called
                                        that.spy();
                                    },
                                    "alert": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").create({myDataToSave: "foo"}).save();
                                failServer.respond();
                            }
                        }
                    };
                }
            });
            
            // TODO Use of "obj" here, does it match naming conventions elsewhere?  
            var 
                args = this.spy.getCall(0).args[0],
                obj = args.obj.getResponse()
            ;
            
            // Check the response alerts
            expect(args).toBeDefined();
            expect(args.alerts).toBeDefined();
            expect(args.alerts.msg1).toBeDefined();
            expect(args.alerts.msg1).toBe("msg1 body");
            expect(args.alerts.msg2).toBeDefined();
            expect(args.alerts.msg2).toBe("msg2 body");
            
            // Check the response object
            expect(obj).toBeDefined();
            expect(obj.myDataToSave).toBeDefined();
            expect(obj.myDataToSave).toBe("foo");

            failServer.restore();
        });
        
        it("should correctly handle a 500 response from the server", function(){
            var 
                that = this,
                errorServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    data: {
                        id10: {
                            foo: "bar"
                        }
                    },
                    errors: ["msg1", "msg2"]
                }
            ;
            
            // TODO Errors vs. alerts, sometimes its errors sometimes its alerts
            // TODO In this case, docs say alerts but object has errors
            errorServer.respondWith("POST", /\/my\/test\/save.json\?ts=.*/,
                    [500, {"Content-type": "application/json"}, JSON.stringify(response)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/test/save.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToSave: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data) {
                                        // Shouldn't be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").create({myDataToSave: "foo"}).save();
                                errorServer.respond();
                            }
                        }
                    };
                }
            });
            
            
            // Inspect the response
            // TODO Use of "obj" here, does it match naming conventions elsewhere?  
            var 
                args = this.spy.getCall(0).args[0],
                obj
            ;
            
            expect(args).toBeDefined("as the invalid callback should have been invoked");
            expect(args.errors).toBeDefined("as the alerts messages should have been returned");
            expect(args.errors[0]).toBe("msg1");
            expect(args.errors[1]).toBe("msg2");

            obj = args.obj.getResponse();
            expect(obj).toBeDefined();
            expect(obj.myDataToSave).toBeDefined();
            expect(obj.myDataToSave).toBe("foo");

            errorServer.restore();
        });
        
        it("should correctly handle a 400 response from the server", function(){
            var 
                that = this,
                errorServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    data: {
                        id10: {
                            foo: "bar"
                        }
                    },
                    errors: ["msg1", "msg2"]
                }
            ;
            
            // TODO Errors vs. alerts, sometimes its errors sometimes its alerts
            // TODO In this case, docs say alerts but object has errors
            // TODO If the response code is 500, it goes to "error", if its 200 it goes to "invalid"
            errorServer.respondWith("POST", /\/my\/test\/save.json\?ts=.*/,
                    [404, {"Content-type": "application/json"}, JSON.stringify(response)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/test/save.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToSave: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data) {
                                        // Shouldn' be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").create({myDataToSave: "foo"}).save();
                                errorServer.respond();
                            }
                        }
                    };
                }
            });
            
            var 
                args = this.spy.getCall(0).args[0],
                obj
            ;
            
            // Check the response alerts
            expect(args).toBeDefined("as the invalid callback should have been invoked");
            expect(args.errors).toBeDefined();
            expect(args.errors[0]).toBe("msg1");
            expect(args.errors[1]).toBe("msg2");
    
            // Check the response object
            obj = args.obj.getResponse();
            expect(obj).toBeDefined();
            expect(obj.myDataToSave).toBeDefined();
            expect(obj.myDataToSave).toBe("foo");

            errorServer.restore();
        });
        
//        it("should correctly handle invalid JSON responses", function(){
//            var 
//                that = this,
//                errorServer = sinon.fakeServer.create()
//            ;
//            
//            // Note that JSON response is missing a curly bracket
//            errorServer.respondWith("POST", /\/my\/test\/save.json\?ts=.*/,
//                    [200, {"Content-type": "application/json"},
//                          "{\"status\": \"SUCCESS\", \"data\": {\"id10\": {\"foo\": \"bar\""]);
//    
//            tetra.model.register("myModel", {
//                req: {
//                    save: {
//                        url: "/my/test/save.json",
//                        method: "POST"
//                    }
//                },
//                attr: {
//                    myDataToSave: "",
//                    foo: ""
//                },
//                methods : function(attr){
//                    return {
//                        getResponse: function() {
//                            return attr;
//                        }
//                    };
//                }
//            });
//            
//            tetra.controller.register("myController", {
//                scope: "myScope",
//                use: ["myModel"],
//                constr: function(me, app, page, orm) {
//                    return {
//                        events: {
//                            model: {
//                                "myModel": {
//                                    // TODO Not sure if such responses should be invalid or error
//                                    "error": function(error) {
//                                        that.spy(error);
//                                    },
//                                    "stored": function(data) {
//                                        // Shouldn't be called
//                                        that.spy();
//                                    }
//                                }
//                            }
//                        },
//                        methods: {
//                            init: function(){                        
//                                orm("myModel").create({myDataToSave: "foo"}).save();
//                                errorServer.respond();
//                            }
//                        }
//                    };
//                }
//            });
//            
//            expect(this.spy.called).toBeTruthy();
//            expect(this.spy.calledOnce).toBeTruthy();
//            
//            // TODO Inspect data here
//
//            errorServer.restore();
//        });
        
        it("should fail to save if anything other than POST is attempted", function() {
            var 
                saveServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    data: {
                        id10: {
                            id: 10,
                            foo: "bar"
                        }
                    },
                    errors: ["msg1", "msg2"]
                }
            ;
            saveServer.respondWith("GET", /\/my\/test\/save.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
            
            var 
                that = this,
                init = {
            		scope: "myScope",
                    req: {
                        save: {
                            url: "/my/test/save.json",
                            method: "GET"
                        }
                    },
                    attr: {
                        myDataToSave: ""
                    },
                    methods : function(attr){
                        return {
                            getResponse: function() {
                                return attr;
                            }
                        };
                    }
            };
            
            expect(function(){tetra.model.register("myModel", init);}).toThrow();
            saveServer.restore();
        });
        
        // An empty response is valid for a save
        it("should correctly handle empty JSON responses", function(){
            var
                emptyJsonServer = sinon.fakeServer.create(),
                that = this
            ;
            
            // Setup routes for valid and invalid requests
            emptyJsonServer.respondWith("POST", /\/my\/empty\/test\/post.json\?ts=.*/, 
                    [200, {"Content-type": "application/json"}, ""]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    save: {
                        url: "/my/empty/test/post.json"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "stored": function(data) {
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(error) {
                                        // Shouldn't be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToSave: "foo"}).save();
                                emptyJsonServer.respond();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();

            var args = this.spy.getCall(0).args[0];
            expect(args).toBeDefined();
            expect(args.success).toBeFalsy();

            emptyJsonServer.restore();
        });
    });
    
    // Deleting data
    // -----------------    
    describe("when deleting data from a model", function() {
        
        beforeEach(function() {
            this.spy = sinon.spy();
            this.server = sinon.fakeServer.create();
            this.server.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
        });
        
        afterEach(function() {
            this.server.restore();
            this.spy = null;
            tetra.controller.destroy("myController", "myScope");
            tetra.controller.destroy("mySecondController", "myScope");
            tetra.model.destroy("myModel", "myScope");
            tetra.model.destroy("mySecondModel", "myScope");
        });
        
        it("should delete from the configured URL and return the expected response", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToDelete: "foo"}).remove();
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            var 
                response = this.spy.getCall(0).args[0]
            ;

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myDataToDelete).toBeDefined();
            expect(response.myDataToDelete).toEqual("foo");
        });
        
        it("should be able to delete using POST or DELETE", function() {
            var 
                that = this,
                deleteServer = sinon.fakeServer.create()
            ;
    
            deleteServer.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
                [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToDelete: "foo"}).remove();
                                deleteServer.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0];

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myDataToDelete).toBeDefined();
            expect(response.myDataToDelete).toEqual("foo");
            
            deleteServer.restore();
        });
            
        it("should delete from a parameterized URL, returning the expected response", function(){
            var 
                that = this,
                parameterizedServer = sinon.fakeServer.create()
            ;
        
            parameterizedServer.respondWith("POST", /\/my\/parameterized\/test\/delete.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/{0}/{1}/{2}/delete.json",
                        uriParams: ["part1", "part2", "part3"],
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Shouldn't be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").create({myDataToDelete: "foo"}).remove({uriParams: {
                                    part1: "my",
                                    part2: "parameterized",
                                    part3: "test"
                                }});
                                parameterizedServer.respond();
                            }
                        }
                    };
                }
            });

            var response = this.spy.getCall(0).args[0];
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myDataToDelete).toBeDefined();
            expect(response.myDataToDelete).toEqual("foo");
            
            parameterizedServer.restore();
        });

        it("should delete using an object that matches the attr object", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myTestString: "",
                    myTestArray: [],
                    myTestObj: {},
                    myTestNumber: 0,
                    myTestBoolean: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({
                                    myTestString: "foo",
                                    myTestArray: [1, 2, 3],
                                    myTestObj: {"foo": "bar"},
                                    myTestNumber: 99,
                                    myTestBoolean: true,
                                    myDataNotToDelete: "blargh"
                                }).remove();
                                
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0];

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myTestString).toBeDefined();
            expect(response.myTestString).toEqual("foo");
            expect(response.myTestArray).toBeDefined();
            expect(response.myTestArray).toEqual([1, 2, 3]);
            expect(response.myTestObj).toBeDefined();
            expect(response.myTestObj).toEqual({"foo": "bar"});
            expect(response.myTestNumber).toBeDefined();
            expect(response.myTestNumber).toEqual(99);
            expect(response.myTestBoolean).toBeDefined();
            expect(response.myTestBoolean).toBeTruthy();
            expect(response.myDataNotToDelete).toBeUndefined();
        });
        
        // TODO Is this correct behaviour? Should we delete by passing values that have not been explicitly sent?
        it("should delete using the default values set in the attr object", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myTestString: "bar",
                    myTestArray: [1, 2],
                    myTestObj: {"foo": "bar"},
                    myTestNumber: 50,
                    myTestBoolean: true
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data){
                                        that.spy(data.getResponse());
                                    },
                                    "error": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({
                                    myTestString: "overwrite"
                                }).remove();
                                
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            var response = this.spy.getCall(0).args[0];

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myTestString).toBeDefined();
            expect(response.myTestString).toEqual("overwrite");
            expect(response.myTestArray).toBeDefined();
            expect(response.myTestArray).toEqual([1, 2]);
            expect(response.myTestObj).toBeDefined();
            expect(response.myTestObj).toEqual({"foo": "bar"});
            expect(response.myTestNumber).toBeDefined();
            expect(response.myTestNumber).toEqual(50);
            expect(response.myTestBoolean).toBeDefined();
            expect(response.myTestBoolean).toBeTruthy();
            expect(response.myDataNotToDelete).toBeUndefined();
        });

        // ### Error States ###
        
        it("should handle FAIL responses from the server", function() {
            var 
                that = this,
                failServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    alerts: {
                        "msg1": "msg1 body",
                        "msg2": "msg2 body"
                    }
                }
            ;
    
            failServer.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
                [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data){
                                        // Shouldn't be called
                                        that.spy();
                                    },
                                    "alert": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToDelete: "foo"}).remove();
                                failServer.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            // TODO Use of "obj" here, does it match naming conventions elsewhere?  
            var 
                args = this.spy.getCall(0).args[0],
                obj
            ;
            
            // Check the `alerts` object
            expect(args).toBeDefined("as the error response should have been returned");
            expect(args.alerts).toBeDefined();
            expect(args.alerts.msg1).toBeDefined();
            expect(args.alerts.msg1).toBe("msg1 body");
            expect(args.alerts.msg2).toBeDefined();
            expect(args.alerts.msg2).toBe("msg2 body");
            
            // Check the `response` object
            obj = args.obj.getResponse();
            expect(obj).toBeDefined();
            expect(obj.myDataToDelete).toBeDefined();
            expect(obj.myDataToDelete).toBe("foo");

            // Cleanup
            failServer.restore();
        });
        
        it("should fail to delete if we try with a GET", function() {
            var 
                that = this,
                deleteServer = sinon.fakeServer.create(),
                init = {
            		scope: "myScope",
                    req: {
                        del: {
                            url: "/my/test/delete.json",
                            method: "GET"
                        }
                    },
                    attr: {
                        myDataToDelete: ""
                    },
                    methods : function(attr){
                        return {
                            getResponse: function() {
                                return attr;
                            }
                        };
                    }
                }
            ;
    
            deleteServer.respondWith("GET", /\/my\/test\/delete.json\?ts=.*/,
                [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            expect(function(){tetra.model.register("myModel", init);}).toThrow();
            
            // Cleanup
            deleteServer.restore();
        });
        
        it("should correctly handle 500 responses from the server", function(){
            var 
                that = this,
                errorServer = sinon.fakeServer.create()
            ;
    
            errorServer.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
                [500, {"Content-type": "application/json"}, JSON.stringify(failResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "error": function(data) {
                                        that.spy(data);
                                    },
                                    "deleted": function(data) {
                                        // Shouldn't be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToDelete: "foo"}).remove();
                                errorServer.respond();
                            }
                        }
                    };
                }
            });

            // Inspect the `response`
            var response = this.spy.getCall(0).args[0];
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();

            var obj = response.obj.getResponse();
            expect(obj.id).toBeDefined();
            expect(obj.ref).toBeDefined();    
            expect(obj.myDataToDelete).toBeDefined();
            expect(obj.myDataToDelete).toEqual("foo");
            
            errorServer.restore();
        });
        
        it("should correctly handle 404 responses from the server", function(){
            var 
                that = this,
                errorServer = sinon.fakeServer.create()
            ;
    
            errorServer.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
                [404, {"Content-type": "application/json"}, JSON.stringify(failResponse)]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data) {
                                        // Shouldn't be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToDelete: "foo"}).remove();
                                errorServer.respond();
                            }
                        }
                    };
                }
            });
            
            var response = this.spy.getCall(0).args[0];
    
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            var obj = response.obj.getResponse();
            expect(obj.id).toBeDefined();
            expect(obj.ref).toBeDefined();    
            expect(obj.myDataToDelete).toBeDefined();
            expect(obj.myDataToDelete).toEqual("foo");
            
            errorServer.restore();            
        });

//        it("should correctly handle invalid JSON responses", function(){
//            var 
//                that = this,
//                errorServer = sinon.fakeServer.create()
//            ;
//    
//            errorServer.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
//                [200, {"Content-type": "application/json"},
//                      "{\"status\": \"\""]);
//            
//            tetra.model.register("myModel", {
//                req: {
//                    del: {
//                        url: "/my/test/delete.json",
//                        method: "POST"
//                    }
//                },
//                attr: {
//                    myDataToDelete: ""
//                },
//                methods : function(attr){
//                    return {
//                        getResponse: function() {
//                            return attr;
//                        }
//                    };
//                }
//            });
//            
//            tetra.controller.register("myController", {
//                scope: "myScope",
//                use: ["myModel"],
//                constr: function(me, app, page, orm) {
//                    return {
//                        events: {
//                            model: {
//                                "myModel": {
//                                    "deleted": function(data) {
//                                        // Shouldn't be called
//                                        that.spy();
//                                    },
//                                    "error": function(error) {
//                                        that.spy(error);
//                                    }
//                                }
//                            }
//                        },
//                        methods: {
//                            init: function(){
//                                orm("myModel").create({myDataToDelete: "foo"}).remove();
//                                errorServer.respond();
//                            }
//                        }
//                    };
//                }
//            });
//            
//            // Inspect the response
//            var response = this.spy.getCall(0).args[0];
//    
//            expect(this.spy.called).toBeTruthy();
//            expect(this.spy.calledOnce).toBeTruthy();
////            expect(response.id).toBeDefined();
////            expect(response.ref).toBeDefined();    
////            expect(response.myDataToDelete).toBeDefined();
////            expect(response.myDataToDelete).toEqual("foo");
//            
//            errorServer.restore();    
//        });
        
        // For a delete, an empty response is acceptable
        it("should correctly handle empty JSON responses", function(){
            var 
                that = this,
                errorServer = sinon.fakeServer.create()
            ;
    
            errorServer.respondWith("POST", /\/my\/test\/delete.json\?ts=.*/,
                [200, {"Content-type": "application/json"}, ""]);
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    del: {
                        url: "/my/test/delete.json",
                        method: "POST"
                    }
                },
                attr: {
                    myDataToDelete: ""
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "deleted": function(data) {
                                        that.spy(data.getResponse());
                                    },
                                    "alert": function(data) {
                                        // Should never be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").create({myDataToDelete: "foo"}).remove();
                                errorServer.respond();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
            
            // Inspect the `response`
            var response = this.spy.getCall(0).args[0];
        
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();    
            expect(response.myDataToDelete).toBeDefined();
            expect(response.myDataToDelete).toEqual("foo");
            
            // Cleanup
            errorServer.restore();    
        });
    });
    
    // Resetting model data
    // -----------------
    describe("resetting a model", function() {
        
        beforeEach(function() {
            
            var response = {
                status: "SUCCESS",
                data: {
                    myUniqueId: {
                        myTestBoolean: true,
                        myTestString: "foo",
                        success: true,
                        myTestNumber: 99,
                        myTestArray: [1, 2],
                        myTestObject: {
                            foo: "bar"
                        }
                    }
                }
            };
            
            this.spy = sinon.spy();
            this.server = sinon.fakeServer.create();
            this.server.respondWith("GET", /\/my\/test\/fetch.json\?ts=.*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);

            this.server.respondWith("POST", /\/my\/test\/reset.json/,
                    [200, {"Content-type": "application/json"}, ""]);
            
            this.server.respondWith("PUT", /\/my\/test\/reset.json/,
                    [200, {"Content-type": "application/json"}, ""]);
        });
        
        afterEach(function() {
            this.server.restore();
            this.spy = null;

            tetra.controller.destroy("myController", "myScope");
            tetra.model.destroy("myModel", "myScope");
        });
        
        it("should reset model data using the configured URL", function() {
            var that = this;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    },
                    reset: {
                        url: "/my/test/reset.json"
                    }
                },
                attr: {
                    myTestString: "",
                    myTestBoolean: false,
                    myTestObject: {},
                    myTestArray: [],
                    myTestNumber: 0
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    // TODO Append returns an array, resetted returns an object with ref as the first element
                                    "append": function(data){
                                        that.spy(data[0].getResponse());
                                    },
                                    "resetted": function(data) {
                                        that.spy(data);
                                    },
                                    "error": function() {
                                        // Shouldn't be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                                orm("myModel").reset();
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as the spy() should have been invoked in the append and resetted callbacks");

            var 
                response = this.spy.getCall(0).args[0],
                responseAfterReset = this.spy.getCall(1).args[0]
            ;
            
            expect(response).toBeDefined("as we should have received a valid response in the first call");
            expect(response).toEqual(jasmine.any(Object));
            expect(response.id).toBeDefined();
            expect(response.ref).toBeDefined();
            expect(response.myTestBoolean).toBeDefined();
            expect(response.myTestBoolean).toBeTruthy();
            expect(response.myTestString).toBeDefined();
            expect(response.myTestString).toBe("foo");
            expect(response.myTestObject).toBeDefined();
            expect(response.myTestObject).toEqual({"foo": "bar"});
            expect(response.myTestNumber).toBeDefined();
            expect(response.myTestNumber).toBe(99);
            expect(response.myTestArray).toBeDefined();
            expect(response.myTestArray).toEqual([1, 2]);
            
            expect(responseAfterReset).toBeDefined("as a call to reset should at least return the name of the model");
            expect(responseAfterReset).toEqual(jasmine.any(String));
            expect(responseAfterReset).toBe("myModel");
        });
        
        it("should accept a parameterized reset URL", function(){
            var 
                that = this,
                parameterizedServer = sinon.fakeServer.create()
            ;
            
            parameterizedServer.respondWith("GET", /\/my\/test\/parameterized\/fetch.json/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            parameterizedServer.respondWith("POST", /\/my\/test\/parameterized\/reset.json/,
                    [200, {"Content-type": "application/json"}, ""]);
            parameterizedServer.respondWith("DELETE", /\/my\/test\/parameterized\/reset.json/,
                    [200, {"Content-type": "application/json"}, ""]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/parameterized/fetch.json"
                    },
                    reset: {
                        url: "/{0}/{1}/{2}/reset.json",
                        uriParams: ["part1", "part2", "part3"],
                        method: "POST"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "resetted": function(data) {
                                        that.spy(data);
                                    },
                                    "error": function() {
                                        // This shouldn't be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").fetch({});
                                parameterizedServer.respond();
                                orm("myModel").reset({
                                    part1: "my",
                                    part2: "test",
                                    part3: "parameterized"
                                });
                                parameterizedServer.respond();
                            }
                        }
                    };
                }
            });

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy("as the spy() should have been invoked in the resetted callbacks");
            
            var response = this.spy.getCall(0).args[0];
            expect(response).toBeDefined();
            expect(response).toBe("myModel");

            parameterizedServer.restore();
        });
        
        it("should fire the reset callback before the resetted callback", function() {
            var 
                that = this
            ;
            
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    },
                    reset: {
                        url: "/my/test/reset.json"
                    }
                },
                attr: {
                    myTestString: "",
                    myTestBoolean: false,
                    myTestObject: {},
                    myTestArray: [],
                    myTestNumber: 0
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "reset": function(data) {
                                        that.spy("reset");
                                    },
                                    "resetted": function(data) {
                                        that.spy("resetted");
                                    },
                                    "error": function() {
                                        // Shouldn't be called
                                        that.spy();
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                that.server.respond();
                                orm("myModel").reset();
                                that.server.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledTwice).toBeTruthy("as the spy() should have been invoked in the reset and resetted callbacks");
    
            var 
                reset = this.spy.getCall(0).args[0],
                resetted = this.spy.getCall(1).args[0]
            ;
            
            expect(reset).toBeDefined();
            expect(reset).toBe("reset");
            expect(resetted).toBeDefined();
            expect(resetted).toBe("resetted");
        });
        
        // ### Error states ###
        
        it("should handle FAIL responses from the server", function(){
            var 
                that = this,
                failServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    alerts: {
                        "msg1": "msg1 body",
                        "msg2": "msg2 body"
                    }
                }
            ;
            
            failServer.respondWith("POST", /\/my\/test\/reset.json/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
            failServer.respondWith("DELETE", /\/my\/test\/reset.json/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(response)]);
            failServer.respondWith("GET", /\/my\/test\/fetch.json?ts=*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    },
                    reset: {
                        url: "/my/test/reset.json",
                        method: "POST"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "resetted": function() {
                                        // This shouldn't be called
                                        that.spy();
                                    },
                                    "alert": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").fetch({});
                                failServer.respond();
                                orm("myModel").reset();
                                failServer.respond();
                            }
                        }
                    };
                }
            });
            
            
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy("as the spy() should have been invoked in the error callback");
    
            // Inspect the `response`
            var args = this.spy.getCall(0).args[0];
            
            expect(args).toBeDefined();
            expect(args.type).toBe("reset");
            expect(args.alerts).toBeDefined();
            expect(args.alerts.msg1).toBe("msg1 body");
            expect(args.alerts.msg2).toBe("msg2 body");
            
            // Cleanup
            failServer.restore();
        });
        
        it("should handle 500 responses from the server", function(){
            var 
                that = this,
                failServer = sinon.fakeServer.create(),
                response = {
                    success: "FAIL",
                    errors: ["msg1"]
                }
            ;
            
            failServer.respondWith("POST", /\/my\/test\/reset.json/,
                    [500, {"Content-type": "application/json"}, JSON.stringify(response)]);
            failServer.respondWith("DELETE", /\/my\/test\/reset.json/,
                    [500, {"Content-type": "application/json"}, JSON.stringify(response)]);
            failServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    },
                    reset: {
                        url: "/my/test/reset.json",
                        method: "POST"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "resetted": function(data) {
                                        // This shouldn't be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").fetch({});
                                failServer.respond();
                                orm("myModel").reset();
                                failServer.respond();
                            }
                        }
                    };
                }
            });

            
            expect(this.spy.called).toBeTruthy("as the spy() should have been invoked in the error callback");
            expect(this.spy.calledOnce).toBeTruthy("as the spy() should have been invoked once");
    
            // Inspect the `response`
            var args = this.spy.getCall(0).args[0];
            expect(args).toBeDefined();
            expect(args.type).toBe("reset");
            expect(args.errorCode).toBe(500);
            expect(args.errors).toBeDefined();
            expect(args.errors[0]).toBe("msg1");

            // Cleanup
            failServer.restore();
        });
        
        it("should handle 404 responses from the server", function(){
            var 
                that = this,
                failServer = sinon.fakeServer.create(),
                response = {
                    status: "FAIL",
                    errors: ["msg1", "msg2"]
                }
            ;
            
            failServer.respondWith("POST", /\/my\/test\/reset.json/,
                    [404, {"Content-type": "application/json"}, JSON.stringify(response)]);
            failServer.respondWith("DELETE", /\/my\/test\/reset.json/,
                    [404, {"Content-type": "application/json"}, JSON.stringify(response)]);
            failServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
    
            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/test/fetch.json"
                    },
                    reset: {
                        url: "/my/test/reset.json",
                        method: "POST"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
            
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "resetted": function(data) {
                                        // This shouldn't be called
                                        that.spy();
                                    },
                                    "error": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){                        
                                orm("myModel").fetch({});
                                failServer.respond();
                                orm("myModel").reset();
                                failServer.respond();
                            }
                        }
                    };
                }
            });
            
            // Inspect the response
            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy("as the spy() should have been invoked in the error callback");
    
            var args = this.spy.getCall(0).args[0];
            expect(args).toBeDefined();
            expect(args.type).toBe("reset");
            expect(args.errorCode).toBe(404);
            expect(args.errors).toBeDefined();
            expect(args.errors[0]).toBe("msg1");
            expect(args.errors[1]).toBe("msg2");
            
            failServer.restore();
        });
        
        it("should fail to reset if we try with a GET", function() {
            var 
                that = this,
                resetServer = sinon.fakeServer.create(),
                init = {
            		scope: "myScope",
                    req: {
                        reset: {
                            url: "/my/test/delete.json",
                            method: "GET"
                        }
                    },
                    attr: {
                        success: true
                    },
                    methods : function(attr){
                        return {
                            getResponse: function() {
                                return attr;
                            }
                        };
                    }
                }
            ;
    
            resetServer.respondWith("GET", /\/my\/test\/delete.json\?ts=.*/,
                [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);
            
            expect(function(){tetra.model.register("myModel", init);}).toThrow();
            
            // Cleanup
            resetServer.restore();
        });
        
//        it("should correctly handle invalid JSON responses", function(){
//            var 
//                that = this,
//                errorServer = sinon.fakeServer.create()
//            ;
//            
//            errorServer.respondWith("POST", /\/my\/test\/reset.json/,
//                    [200, {"Content-type": "application/json"}, 
//                     "{\"status\": \"SUCCESS\", \"alerts\": {\"msg1\""]);
//            errorServer.respondWith("DELETE", /\/my\/test\/reset.json/,
//                    [200, {"Content-type": "application/json"}, 
//                     "{\"status\": \"SUCCESS\", \"alerts\": {\"msg1\""]);
//            errorServer.respondWith("GET", /\/my\/test\/fetch.json\?ts=*/,
//                    [200, {"Content-type": "application/json"},
//                     "{\"status\": \"SUCCESS\", \"data\": {\"myUniqueId\": {\"success\": true}}}"]);
//    
//            tetra.model.register("myModel", {
//                req: {
//                    fetch: {
//                        url: "/my/test/fetch.json"
//                    },
//                    reset: {
//                        url: "/my/test/reset.json",
//                        method: "POST"
//                    }
//                },
//                attr: {
//                    success: false
//                },
//                methods : function(attr){
//                    return {
//                        getResponse: function() {
//                            return attr;
//                        }
//                    };
//                }
//            });
//            
//            tetra.controller.register("myController", {
//                scope: "myScope",
//                use: ["myModel"],
//                constr: function(me, app, page, orm) {
//                    return {
//                        events: {
//                            model: {
//                                "myModel": {
//                                    "resetted": function(data) {
//                                        // This shouldn't be called
//                                        that.spy();
//                                    },
//                                    "error": function(data) {
//                                        that.spy(data);
//                                    }
//                                }
//                            }
//                        },
//                        methods: {
//                            init: function(){                        
//                                orm("myModel").fetch({});
//                                errorServer.respond();
//                                orm("myModel").reset();
//                                errorServer.respond();
//                            }
//                        }
//                    };
//                }
//            });
//            
//            // Inspect the response
//            expect(this.spy.called).toBeTruthy();
//            expect(this.spy.calledOnce).toBeTruthy("as the spy() should have been invoked once in the error callback");
//    
//            var response = this.spy.getCall(0).args[0];
//            expect(response).toBeDefined();
//            
//            // TODO Check data here
//            
//            errorServer.restore();
//        });
        
        it("should handle empty JSON responses", function(){
            var
                emptyJsonServer = sinon.fakeServer.create(),
                that = this
            ;
        
            emptyJsonServer.respondWith("POST", /\/my\/empty\/test\/reset.json/,
                    [200, {"Content-type": "application/json"}, ""]);
            
            emptyJsonServer.respondWith("PUT", /\/my\/empty\/test\/reset.json/,
                    [200, {"Content-type": "application/json"}, ""]);
            
            emptyJsonServer.respondWith("GET", /\/my\/empty\/test\/fetch.json\?ts=*/,
                    [200, {"Content-type": "application/json"}, JSON.stringify(successResponse)]);

            tetra.model.register("myModel", {
            	scope: "myScope",
                req: {
                    fetch: {
                        url: "/my/empty/test/fetch.json"
                    },
                    reset: {
                        url: "/my/empty/test/reset.json"
                    }
                },
                attr: {
                    success: false
                },
                methods : function(attr){
                    return {
                        getResponse: function() {
                            return attr;
                        }
                    };
                }
            });
        
            tetra.controller.register("myController", {
                scope: "myScope",
                use: ["myModel"],
                constr: function(me, app, page, orm) {
                    return {
                        events: {
                            model: {
                                "myModel": {
                                    "error": function(error) {
                                        that.spy(error);
                                    },
                                    "resetted": function(data) {
                                        that.spy(data);
                                    }
                                }
                            }
                        },
                        methods: {
                            init: function(){
                                orm("myModel").fetch({});
                                emptyJsonServer.respond();
                                orm("myModel").reset();
                                emptyJsonServer.respond();
                            }
                        }
                    };
                }
            });

            expect(this.spy.called).toBeTruthy();
            expect(this.spy.calledOnce).toBeTruthy();
    
            var response = this.spy.getCall(0).args[0];
            expect(response).toBe("myModel");

            emptyJsonServer.restore();
        });
    });
});

// TODO Have we tested all callbacks (complete, error, etc?)