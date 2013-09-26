
    tetra.start()
    
    tetra.view.register 'formView',
        scope : 'truc',
        constr: (me, app, _) -> 
            events :
                user :
                    "submit" :
                        "form" : (e, elm) ->
                            app.notify "user input", elm.serialize()
                controller :
                    "show filtered data" : (data) ->
                        me.output.html(data)
            methods :
                init : ->
                    me.output = _("#outputFld")
                    
    
    tetra.controller.register 'formController',
        scope : 'truc',
        constr: (me, app, _) -> 
            events : 
                view : 
                    "user input" : (data) ->
                        # Some treatment on data
                        app.notify "show filtered data", data
