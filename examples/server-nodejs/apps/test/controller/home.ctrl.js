core.controller.register('home', {

    scope : 'home',
    use : ['me'],
    
    constr : function(me, app, page, orm) { return {
        
        events : {
            
            model : {
                'me' : {
                    'call' : function(data){},
                    'complete' : function(data){},
                    'append' : function(col){},
                    'update' : function(obj){},
                    'stored' : function(obj){},
                    'remove' : function(obj){},
                    'deleted' : function(obj){},
                    'reset' : function(obj){},
                    'reseted' : function(obj){},
                    'error' : function(error){
                        if(error.type == 'save') {}
                        else if(error.type == 'delete') {}
                    }
                }
            }
            
        },
		
		actions : {
			'index' : function(data, render){
				data.title = 'homepage';
				render(data);
			},

			'index2' : function(data, render){
				data.title = 'homepage me';
				render(data);
			},

			'me' : function(data, render) {
				orm('me').select({}).success(function(col) {
					render({me: col[0]});
				});
			},
			
			'profile' : function(data, render){
				data = {
					title:'profile',
					layout: false
				};
				render(data,'home/index');
			},

			'json' : function(data, render){
				render('{status:"success"}');
			}
		},
        
        methods : {
            init: function() {
            }
        }
    };}
});
