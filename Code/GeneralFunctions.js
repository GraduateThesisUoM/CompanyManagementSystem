//File with the paths
const path_constants = require('./constantsPaths');

//function checkAccessRigts(req, data ,res){
function checkAccessRigts(prefix,req, res, data){
    var file_path = ""

    // Iterate over each key-value pair in the pages object
    for (const [page, pageData] of Object.entries(path_constants.pages)) {
        if (pageData.url === req.originalUrl) {
            file_path = pageData.file; // Access the file path directly
            break; // Correct spelling of break
        }
    }
    var page_user_type = "general";
    console.log(path_constants.routes);
    if( file_path.startsWith(path_constants.routes.user)){
        page_user_type = "user";
    }
    else if( file_path.startsWith(path_constants.routes.accountant)){
        page_user_type = "accountant";
    }
    else if( file_path.startsWith(path_constants.routes.admin)){
        page_user_type = "admin";
    }
    /*if(page_user_type == req.user.type){
        res.render(file_path,data);
    }
    else{
        res.redirect('/error?origin_page=/&error=access_denied');
    }*/
}

/*function checkAccessRigts(req, data ,res){
    const user_pages = [
        {page:'/my-accountant',file:'my_accountant.ejs'},
        "/preview-accountant"];
    const admin_pages = ['/remove-relationship','/user-profile'];
    const accountant_pages = [
        {page:'/clients',file:view_request.ejs},
        {page:'/view-request',file:}];

    const access = true;

    if(user_pages.includes(req.originalUrl)) {
        if(req.user.type != 'user'){
            access =  false;
            console.log("non user try to access user pages/ GeneralFunctions.checkAccessRigts ")
        }
    }
    else if(accountant_pages.includes(req.originalUrl)) {
        if(req.user.type != 'accountant'){
            access =  false;
            console.log("non accountant try to access accountant pages/ GeneralFunctions.checkAccessRigts ")
        }
    }
    else if(admin_pages.includes(req.originalUrl) && user.type != 'admin'){
        if(req.user.type != 'admin'){
            access =  false;
            console.log("non admin try to access admin pages/ GeneralFunctions.checkAccessRigts ")

        }    
    }
    if (access){
        if(req.user.type == 'user'){
            for (let i = 0; i < user_pages.length; i++) {
                if(user_pages[i].page == req.originalUrl){
                    brake;
                }
            }

        }
        else if(req.user.type == 'accountant'){
            for (let i = 0; i < accountant_pages.length; i++) {
                if (accountant_pages[i].page === req.originalUrl) {
                    break; // Exit the loop once the page is found
                }
            }
        }
        else if(req.user.type == 'admin'){
            for (let i = 0; i < admin_pages.length; i++) {
                if (admin_pages[i].page === req.originalUrl) {
                    break; // Exit the loop once the page is found
                }
            }
        }
        res.render(req.user.type+"_pages/",data);
    }
    else{
        res.redirect('/error?origin_page=/&error=access_denied');
    }

}*/



module.exports = { checkAccessRigts};
