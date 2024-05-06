//File with the paths
const path_constants = require('./constantsPaths');

//function checkAccessRigts(req, data ,res){
function checkAccessRigts(req){
    try{
        var file_path = ""
        // Iterate over each key-value pair in the pages object
        for (const [page, pageData] of Object.entries(path_constants.pages)) {
            if (pageData.url === req.originalUrl) {
                file_path = pageData.file; // Access the file path directly
                break; // Correct spelling of break
            }
        }
        var page_user_type = "general";
        if( file_path.startsWith(path_constants.routes.user)){
            page_user_type = "user";
        }
        else if( file_path.startsWith(path_constants.routes.accountant)){
            page_user_type = "accountant";
        }
        else if( file_path.startsWith(path_constants.routes.admin)){
            page_user_type = "admin";
        }
        else{
            return true;
        }

        return page_user_type == req.user.type
    }
    catch(e){
        console.log(e)
        return false;
    }
}



module.exports = { checkAccessRigts};
