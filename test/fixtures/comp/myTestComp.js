tetra.model.register("myCompModel", {
    scope: "Comp"
});

tetra.controller.register("myCompController", {
    use: ["myCompModel"],
    scope: "Comp",
    constr: function(me, app, page, orm) {
        return {
            events: {},
            methods: {
                init : function() {
                }
            }
        };
    }
});

tetra.view.register("myCompView", {
    use: ["myCompController"],
    scope: "Comp",
    constr: function(me, app, _) {
        return {
            events: {}
        };
    }
});
