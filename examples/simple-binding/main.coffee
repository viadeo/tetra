
    tetra.start()
    
    tetra.view.register 'formView',
        scope : 'truc',
        constr: (me, app, _) -> 
            events :
                user :
                    "keyup" :
                        "#inputFld" : (e, elm) ->
                            me.output.html(elm.val())
            methods :
                init : ->
                    me.output = _("#outputFld")
