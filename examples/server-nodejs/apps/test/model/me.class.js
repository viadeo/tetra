core.model.register('me', {

    req : {
        fetch : {
            url: '/me',
            parser : function(resp, col, cond) {
                col[resp.id] = resp;
                return col;
            }
        }
    },
    
    attr : {
        id: '',
        type: 'USER',
        link: '',
        updated_time: '',
        name: '',
        webid: '',
        contact_count: 0,
        gender: '',
        nickname: '',
        first_name: '',
        last_name: '',
        has_picture: false,
        picture_small: '',
        picture_large: '',
        headline: '',
        introduction: '',
        interests: '',
        location: {},
        language: '',
        distance: 0,
        is_premium: false,
        premium_since: '',
        twitter_account: ''
    },
    
    methods : function(attr) { return {
        validate : function(attr, errors){
            return errors;
        }
    };}

});
