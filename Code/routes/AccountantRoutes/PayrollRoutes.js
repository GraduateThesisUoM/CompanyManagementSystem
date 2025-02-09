const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Models
const Company = require(path_constants.schemas.two.company);
const Attendance = require(path_constants.schemas.two.attendance);
const Client = require(path_constants.schemas.two.client);
const Salary = require(path_constants.schemas.two.salary);
const PayRoll = require(path_constants.schemas.two.payroll);

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
            console.log("company : "+comp);
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

            console.log("company : "+comp);
            console.log("selected_user : "+selected_user);

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

            //Attendance
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
            console.log('attendance :'+attendance)
            
            //PayRoll
            var payroll_list = await PayRoll.find({company: comp, user: selected_user});
            payroll_list = await Promise.all(payroll_list.map(async (payroll) => ({
                month: payroll.month,
                salary: await Salary.findOne({_id: payroll.salary}),
                extra : payroll.extra
            })));
            

            console.log('payroll :'+payroll_list);
            console.dir(payroll_list)


            //Salary
            var salary_months = []
            var salary_amounts = [];
            
            var payrolls = await Salary.find({company: comp,
                user:selected_user,
                registrationDate: { $gte: from_date, $lt: to_date }
            }).sort({ registrationDate: 1 });

            for( payroll of payrolls){
                salary_months.push(generalFunctions.formatDate(payroll.registrationDate));
                salary_amounts.push(payroll.amount);
            }
            if(payrolls.length > 0){
                salary = salary_amounts[0]; 
            }
            
            const salaryRecord = await Salary.findOne({ user: selected_user._id, company: comp, next: '-' });


            var data ={
                user : req.user,
                clients : clients,
                clients_users: clients_users,
                selected_user : selected_user,
                salary_months: salary_months,
                salary_amounts: salary_amounts,
                salary : salaryRecord ? salaryRecord : {amount : 0},
                attendance: attendance,
                payroll: payroll_list,
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
      console.log("Post Payroll");
      console.log(req.body)

      const u = await Client.findOne({_id:req.body.person})
      console.log(u)
      var current_salary = await Salary.findOne({company:u.company,user : u._id,next:"-"})
      var new_salary;
      if(req.body.action == 1){//pay
        console.log("Pay");
        if(!current_salary){
            console.log("Register Salary");
            current_salary = await new Salary({
                company : u.company,
                user : u._id,
                amount : req.body.salary,
            })
            await current_salary.save();
        }
        var payroll = {};
        payroll = await new PayRoll({
            company : u.company,
            user : u._id,
            month : req.body.salary_month,
            year : req.body.salary_year,
            salary: current_salary._id,
            extra : req.body.extra
        });
        await payroll.save();
      }
      else if (req.body.action == 2){//set
        console.log("Set");
        new_salary = await new Salary({
            company : u.company,
            user : u._id,
            amount : req.body.salary
        })
        await new_salary.save();

        if(current_salary){
            console.log("Replace Salary");
            current_salary.next = new_salary._id;
            await current_salary.save();
        }
      }
      /*const s = await new Salary({
        company : u.company,
        user : u._id,
        month : req.body.month,
        year : req.body.year,
        amount : req.body.salary
      })
      await s.save();*/
      res.redirect('/payroll?id='+u._id+"&comp="+u.company);
    }
    catch (err) {
      console.error('Error updating user data:', err);
      res.redirect('/error?origin_page=payroll&error='+err);
    }
});

module.exports = router;