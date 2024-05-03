const folders ={
  css: "./public/css",
  img: "./public/imgs"
};

const routes_folder = "./routes"
const views_folder = "./views"

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
  general : views_folder + "/"
};

const pages = {
  //General
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
  view_request :{
    url : "/view-request",
    file: routes.general+"ReadNotificationRoutes.js",
    view : ""
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
      return views_folders.general+"log_in.ejs"
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
  settings :{
    url : "/settings",
    file: routes.general+"SettingsRoutes.js",
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
    view : ""
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
  //User
  my_accountant :{
    url : "/my-accountant",
    file: routes.user+"MyAccountantRoutes.js",
    view : ""
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
  remove_accountant :{
    url : "/remove-accountant",
    file: routes.user+"RemoveAccountant.js",
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
  pickclientcompany :{
    url : "/pickclientcompany",
    file: routes.accountant+"PickClientCompanyRoutes.js",
    view : ""
  },
  request_history :{
    url : "/request-history",
    file: routes.accountant+"RequestHistoryRoutes.js",
    view : ""
  },
  clients :{
    url : "/clients",
    file: routes.accountant+"ClientsPageRouters.js",
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
  review_report :{
    url : "/review-report",
    file: routes.admin+"ReviewReportAdmin.js",
    view : ""
  },
  remove_relationship :{
    url : "/remove-relationship",
    file: routes.admin+"RemoveRelationshipsAdmin.js",
    view : ""
  },
  reevaluate_report :{
    url : "/reevaluate-report",
    file: routes.admin+"ReevaluateReportAdmin.js",
    view : ""
  },
  dismiss_report :{
    url : "/dismiss-report",
    file: routes.admin+"DismissReportAdmin.js",
    view : ""
  },
  client_profile :{
    url : "/client-profile",
    file: routes.admin+"ClientProfileRoutes.js",
    view : ""
  },
  report_list_page :{
    url : "/report-list-page",
    file: routes.admin+"ReportListPageRouters.js",
    view : ""
  }
};





module.exports = { folders,pages, routes };