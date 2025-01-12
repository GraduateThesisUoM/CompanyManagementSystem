const folders ={
  css: "./public/css",
  img: "./public/imgs",
  js: "./public/js",
  svg: "./public/svg"
};

const schemas = {
  one :{
    user : "././Schemas/User",
    notification : "././Schemas/Notification",
    company : "././Schemas/Company",
    client : "././Schemas/Client",
    series : "././Schemas/Series",
    accountant : "././Schemas/Accountant",
    item : "././Schemas/Item",
    warehouse : "././Schemas/Warehouse",
    node : "././Schemas/Node",
    person : "././Schemas/Person",
    review : "././Schemas/Review",
    document : "././Schemas/Document",
    salary : "././Schemas/Salary",
    attendance : "././Schemas/Attendance",


  },
  two:{
    user : "../../Schemas/User",
    notification : "../../Schemas/Notification",
    company : "../../Schemas/Company",
    client : "../../Schemas/Client",
    series : "../../Schemas/Series",
    accountant : "../../Schemas/Accountant",
    item : "../../Schemas/Item",
    warehouse : "../../Schemas/Warehouse",
    node : "../../Schemas/Node",
    person : "../../Schemas/Person",
    review : "../../Schemas/Review",
    document : "../../Schemas/Document",
    salary : "../../Schemas/Salary",
    attendance : "../../Schemas/Attendance",
  }
};

const url_param = {
  param_1 : 'access_denied',
  param_2 : 'need_to_pick_client'
};

const routes_folder = "./routes"
const views_folder = "./views"
const generalFunctions_folder = {one:"././GeneralFunctions",two:"../../GeneralFunctions"};
const clientAccountantFunctions_folder = {one:"././ClientAccountantFunctions",two:"../../ClientAccountantFunctions"};
const authenticationFunctions_folder = {one:"././AuthenticationFunctions",two:"../../AuthenticationFunctions"};


const routes = {
  general : routes_folder+"/GeneralRoutes/",
  user : routes_folder+"/UserRoutes/",
  accountant : routes_folder+"/AccountantRoutes/",
  admin : routes_folder+"/AdminRoutes/"
};

const views_folders= {
  accountant : "accountant_pages/",
  user : "user_pages/",
  admin : "admin_pages/",
  general : "general/",
  all : views_folder + "/"
};

const pages = {
  //General
  homepage :{
    url : "/index",
    file: routes.general+"HomePageRoutes.js",
    view : function(type) { {
      return views_folders.all+"index.ejs"
    }}
  },
  index :{
    url : "/",
    file: routes.general+"IndexRoutes.js",
    view : function(type) { {
      if(type == "accountant"){
        return views_folders.accountant+"accountant_main.ejs"
      }
      else if(type == "user"){
        return   views_folders.user+"user_main.ejs"
      }
      else if(type == "admin"){
        return views_folders.admin+"admin_main.ejs"
      }
    }}
  },
  notification_read :{
    url : "/notification-read",
    file: routes.general+"ReadNotificationRoutes.js",
    view : ""
  },
  log_in :{
    url : "/log-in",
    file: routes.general+"LogInRoutes.js",
    view : function(type) { {
      return views_folders.all+"log_in.ejs"
    }}
  },
  sign_up :{
    url : "/sign-up",
    file: routes.general+"SignUpRoutes.js",
    view : ""
  },
  report :{
    url : "/report",
    file: routes.general+"ReportRoutes.js",
    view : ""
  },
  profile_page :{
    url : "/profile-page",
    file: routes.general+"ProfilePageRoutes.js",
    view : ""
  },
  forgot_password :{
    url : "/forgot-password",
    file: routes.general+"ForgotPasswordRoutes.js",
    view : ""
  },
  reset_password :{
    url : "/reset-password",
    file: routes.general+"ResetPasswordRoutes.js",
    view : ""
  },
  error :{
    url : "/error",
    file: routes.general+"ErrorPageRoutes.js",
    view : function() { {
      return views_folders.general+"error_page.ejs"
    }}
  },
  delete_account :{
    url : "/delete-account",
    file: routes.general+"DeleteAccountRoutes.js",
    view : ""
  },
  logout :{
    url : "/logout",
    file: routes.general+"LogOutRoutes.js",
    view : ""
  },
  create :{
    url : "/create",
    file: routes.general+"CreateRoutes.js",
    view : function() { {
      return views_folders.general+"create.ejs"
    }}
  },
  list :{
    url : "/list",
    file: routes.general+"ListRoutes.js",
    view : function() { {
      return views_folders.general+"list.ejs"
    }}
  },
  create_doc:{
    url : "/create-doc",
    file: routes.general+"CreateDocRoutes.js",
    view : function() { {
      return views_folders.general+"create_doc.ejs"
    }}
  },
  view: {
    url: "/view",
    file: routes.general + "ViewRoutes.js",
    view: function(input) {
      if (input) {
        if (input === 'doc') {
          return views_folders.general + "view_doc.ejs";
        }
      }
      // Fallback to default view
      return views_folders.general + "view.ejs";
    }
  },  
  //User
  my_accountant :{
    url : "/my-accountant",
    file: routes.user+"MyAccountantRoutes.js",
    view : function() { {
      return views_folders.user+"my_accountant.ejs"
    }}
  },
  my_company :{
    url : "/my-company",
    file: routes.user+"MyCompanyRoutes.js",
    view : function() { {
      return views_folders.user+"my_company.ejs"
    }}
  },
  my_accountant_rate :{
    url : "/my-accountant-rate",
    file: routes.user+"MyAccountantRate.js",
    view : ""
  },
  my_accountant_requests :{
    url : "/my-accountant-requests",
    file: routes.user+"MyAccountantRequests.js",
    view : ""
  },
  my_accountant_delete_request :{
    url : "/my-accountant-delete-request",
    file: routes.user+"MyAccountantDeleteRequest.js",
    view : ""
  },
  pick_accountant :{
    url : "/pick-accountant",
    file: routes.user+"PickAccountantRoutes.js",
    view : ""
  },
  preview_accountant :{
    url : "/preview-accountant",
    file: routes.user+"AccountantPreviewRoutes.js",
    view : ""
  },
  self_accountant :{
    url : "/self-accountant",
    file: routes.user+"SelfAccountantRoutes.js",
    view : ""
  },
  self_accountant_register :{
    url : "/self-accountant-register",
    file: routes.user+"SelfAccountantRegister.js",
    view : ""
  },
  //Acountant
  payroll :{
    url : "/payroll",
    file: routes.accountant+"PayrollRoutes.js",
    view : function() { {
      return views_folders.accountant+"payroll.ejs"
    }}
  },
  view_request :{
    url : "/view-request",
    file: routes.accountant+"ViewRequestRoutes.js",
    view : ""
  },
  //Admin
  get_data :{
    url : "/get-data",
    file: routes.admin+"SearchUserAdmin.js",
    view : ""
  },
  user_profile :{
    url : "/user-profile",
    file: routes.admin+"UserProfileAdminRoutes.js",
    view : ""
  },
  change_ban_status :{
    url : "/change-ban-status",
    file: routes.admin+"BanStatusRoutes.js",
    view : ""
  },
  remove_review :{
    url : "/remove-review",
    file: routes.admin+"RemoveReviewAdmin.js",
    view : ""
  },
  database :{
    url : "/database",
    file: routes.admin+"DataBaseRoutes.js",
    view : function() { {
      return views_folders.admin +"database_page.ejs"
    }}
  }
};





module.exports = { folders,pages, routes ,schemas,url_param,
  generalFunctions_folder,clientAccountantFunctions_folder,
  authenticationFunctions_folder};