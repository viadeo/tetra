core.model.register('session', {

    req : {
		dbTable: {
			name: '',
			id: ''
		},
        fetch : {
            parser : function(resp, col, cond) {
                col[resp.id] = resp;
                return col;
            }
        }
    },
    
    attr : {
        id: '',
        sessionId: '',
    },
    
    methods : function(attr) { return {
        validate : function(attr, errors){
            return errors;
        }
    };}

});
