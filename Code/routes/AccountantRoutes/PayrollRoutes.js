const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Company = require(path_constants.schemas.two.company);
const Attendance = require(path_constants.schemas.two.attendance);
const Client = require(path_constants.schemas.two.client);
const Salary = require(path_constants.schemas.two.salary);



//Authentication Functions
const Authentication = require(path_constants.authenticationFunctions_folder.two);
const generalFunctions = require(path_constants.generalFunctions_folder.two)
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);

router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        const access = generalFunctions.checkAccessRigts(req,res);
        if(access.response){
            console.log("PayRoll")
            var salary = 0;
            var year = new Date().getFullYear();
            var from_month = new Date().getMonth();
            var to_month = new Date().getMonth();

            const clients = await clientAccountantFunctions.fetchClients(req.user._id,'all');
            var comp = clients[0]._id;
            if( req.query.comp){
                comp = req.query.comp
            }
            const clients_users = [];
            var users = await Client.find({company: comp, status:1})

            for( u of users){
                clients_users.push({u : u , c : comp})
            }

            var selected_user = clients_users[0].u;
            if( req.query.id){
                selected_user = await Client.findOne({_id: req.query.id, status:1})
            }
            else if( req.query.comp){
                comp = req.query.comp
                selected_user = await Client.findOne({company:comp,type:'user', status:1})
            }

            if( req.query.year){
                year = req.query.year
            }

            if( req.query.from_month){
                from_month = req.query.from_month -1
            }

            if( req.query.to_month){
                to_month = req.query.to_month-1
            }

            const from_date = new Date(Date.UTC(year, from_month, 1, 0, 0, 1));  // UTC
            from_date.setHours(from_date.getHours() + 2);  // Add 2 hours for Greece time zone
            const to_date = new Date(Date.UTC(year, to_month+1, 1, 0, 0, 1));  // UTC
            to_date.setHours(to_date.getHours() + 2);  // Add 2 hours for Greece time zone


            var payrolls = await Salary.find({company: comp,
                user:selected_user,
                registrationDate: { $gte: from_date, $lt: to_date }
            }).sort({ registrationDate: 1 });



            var attendance = await Attendance.find({
                user:selected_user,
                company: comp,
                registrationDate: { $gte: from_date, $lt: to_date }
            }).sort({ registrationDate: 1 });
            attendance = attendance.map((attendance) => ({
                month : new Date(attendance.registrationDate).getUTCMonth() + 1,
                day : new Date(attendance.registrationDate).getUTCDate(),
                clock_in: new Date(attendance.registrationDate).getUTCHours().toString().padStart(2, '0') + " : " + new Date(attendance.registrationDate).getUTCMinutes().toString().padStart(2, '0'),
                clock_out: attendance.clock_out 
                ? new Date(attendance.clock_out).getUTCHours().toString().padStart(2, '0') + " : " + new Date(attendance.clock_out).getUTCMinutes().toString().padStart(2, '0') 
                : '-',             }));
            console.log(attendance)

            var payroll_months = []
            var payroll_amounts = [];
            for( payroll of payrolls){
                payroll_months.push(generalFunctions.formatDate(payroll.registrationDate));
                payroll_amounts.push(payroll.amount);
            }

            if(payrolls.length > 0){
                salary = payroll_amounts[0]; 
            }
    

            var data ={
                user : req.user,
                clients : clients,
                clients_users: clients_users,
                selected_user : selected_user,
                payroll_months: payroll_months,
                payroll_amounts: payroll_amounts,
                salary : salary,
                attendance: attendance,
                time_in_comp : generalFunctions.calculateDateDifference(selected_user.registrationDate)
            }
            res.render( path_constants.pages.payroll.view(),data );  
        }
        else{
            res.redirect('/error?error='+access.error);
        }
    }
    catch (err) {
    console.error('Error updating user data:', err);
    res.redirect('/error?error='+err);
    }
})


router.post('/', Authentication.checkAuthenticated, async (req, res) => {
    try {
      console.log("Post Payroll")
      const u = await Client.findOne({_id:req.body.person_select})
      console.log(u)
      const s = await new Salary({
        company : u.company,
        user : u._id,
        amount : req.body.salary
      })
      await s.save();
      res.redirect('/payroll?id='+u._id+"&comp="+u.company);
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=payroll&error='+err);
    }
});

module.exports = router;