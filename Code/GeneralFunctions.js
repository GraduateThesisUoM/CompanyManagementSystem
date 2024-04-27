function checkAccessRigts(user, page,res){
    const user_pages = ['/my-accountant'];
    const admin_pages = ['/remove-relationship'];
    const accountant_pages = ['/clients'];

    if(user_pages.includes(page)) {
        if(user.type != 'user'){
            res.redirect('/error?origin_page=/&error=access_denied');
        }
    }
    if(accountant_pages.includes(page)) {
        if(user.type != 'accountant'){
            res.redirect('/error?origin_page=/&error=access_denied');
        }
    }
    if(admin_pages.includes(page) && user.type != 'admin'){
        if(user.type != 'admin'){
            res.redirect('/error?origin_page=/&error=access_denied');
        }    
    }
}

module.exports = { checkAccessRigts};
