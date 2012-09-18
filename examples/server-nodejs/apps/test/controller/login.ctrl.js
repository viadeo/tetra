core.controller.register('login', {

    scope : 'login',
    use : [],
    
    constr : function(me, app, page, orm) { return {
        
        events : {},
		
		actions : {
			'index' : function(data, render){
				data.title = 'sign in';
				render(data);
			}
		},
        
        methods : {
            init: function() {
            }
        }
    };}
});
