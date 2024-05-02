const folders ={
  css: "./public/css",
  img: "./public/imgs"
};

const routes_folder = "./routes"

const routes = {
  general : routes_folder+"/GeneralRoutes/",
  user : routes_folder+"/UserRoutes/",
  accountant : routes_folder+"/AccountantRoutes/",
  admin : routes_folder+"/AdminRoutes/"
};

const pages = {
  //General
  index :{
    url : "/",
    file: routes.general+"IndexRoutes.js"
  },
  view_request :{
    url : "/view-request",
    file: routes.general+"ReadNotificationRoutes.js"
  },
  notification_read :{
    url : "/notification-read",
    file: routes.general+"ReadNotificationRoutes.js"
  },
  log_in :{
    url : "/log-in",
    file: routes.general+"LogInRoutes.js"
  },
  sign_up :{
    url : "/sign-up",
    file: routes.general+"SignUpRoutes.js"
  },
  report :{
    url : "/report",
    file: routes.general+"ReportRoutes.js"
  },
  settings :{
    url : "/settings",
    file: routes.general+"SettingsRoutes.js"
  },
  profile_page :{
    url : "/profile-page",
    file: routes.general+"ProfilePageRoutes.js"
  },
  forgot_password :{
    url : "/forgot-password",
    file: routes.general+"ForgotPasswordRoutes.js"
  },
  reset_password :{
    url : "/reset-password",
    file: routes.general+"ResetPasswordRoutes.js"
  },
  error :{
    url : "/error",
    file: routes.general+"ErrorPageRoutes.js"
  },
  delete_account :{
    url : "/delete-account",
    file: routes.general+"DeleteAccountRoutes.js"
  },
  logout :{
    url : "/logout",
    file: routes.general+"LogOutRoutes.js"
  },
  //User
  my_accountant :{
    url : "/my-accountant",
    file: routes.user+"MyAccountantRoutes.js"
  },
  my_accountant_rate :{
    url : "/my-accountant-rate",
    file: routes.user+"MyAccountantRate.js"
  },
  my_accountant_requests :{
    url : "/my-accountant-requests",
    file: routes.user+"MyAccountantRequests.js"
  },
  my_accountant_delete_request :{
    url : "/my-accountant-delete-request",
    file: routes.user+"MyAccountantDeleteRequest.js"
  },
  pick_accountant :{
    url : "/pick-accountant",
    file: routes.user+"PickAccountantRoutes.js"
  },
  preview_accountant :{
    url : "/preview-accountant",
    file: routes.user+"AccountantPreviewRoutes.js"
  },
  remove_accountant :{
    url : "/remove-accountant",
    file: routes.user+"RemoveAccountant.js"
  },
  self_accountant :{
    url : "/self-accountant",
    file: routes.user+"SelfAccountantRoutes.js"
  },
  self_accountant_register :{
    url : "/self-accountant-register",
    file: routes.user+"SelfAccountantRegister.js"
  },
  //Acountant
  pickclientcompany :{
    url : "/pickclientcompany",
    file: routes.accountant+"PickClientCompanyRoutes.js"
  },
  request_history :{
    url : "/request-history",
    file: routes.accountant+"RequestHistoryRoutes.js"
  },
  //Admin
  get_data :{
    url : "/get-data",
    file: routes.admin+"SearchUserAdmin.js"
  },
  user_profile :{
    url : "/user-profile",
    file: routes.admin+"UserProfileAdminRoutes.js"
  },
  change_ban_status :{
    url : "/change-ban-status",
    file: routes.admin+"BanStatusRoutes.js"
  },
  remove_review :{
    url : "/remove-review",
    file: routes.admin+"RemoveReviewAdmin.js"
  },
  review_report :{
    url : "/review-report",
    file: routes.admin+"ReviewReportAdmin.js"
  },
  remove_relationship :{
    url : "/remove-relationship",
    file: routes.admin+"RemoveRelationshipsAdmin.js"
  },
  reevaluate_report :{
    url : "/reevaluate-report",
    file: routes.admin+"ReevaluateReportAdmin.js"
  },
  dismiss_report :{
    url : "/dismiss-report",
    file: routes.admin+"DismissReportAdmin.js"
  },
  clients :{
    url : "/clients",
    file: routes.admin+"ClientsPageRouters.js"
  },
  client_profile :{
    url : "/client-profile",
    file: routes.admin+"ClientProfileRoutes.js"
  },
  report_list_page :{
    url : "/report-list-page",
    file: routes.admin+"ReportListPageRouters.js"
  }
};



module.exports = { folders,pages };