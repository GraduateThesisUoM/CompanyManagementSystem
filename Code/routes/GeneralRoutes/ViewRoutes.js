const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");

//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

//Models
const Company  = require(path_constants.schemas.two.company);
const Accountant  = require(path_constants.schemas.two.accountant);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const Report = require(path_constants.schemas.two.report);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);


router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        const access = generalFunctions.checkAccessRigts(req,res);
        if(access.response){
            var company;
            var obj;

            if(req.user.type != 'admin'){
                company = req.user.company

            }else{
                console.log("company")
            }
            const isParamsEmpty = Object.keys(req.query).length === 0;
            var data = {
                user: req.user,
                data : "",
                titles : [],
                isParamsEmpty : isParamsEmpty,
                notification_list: await Notification.find({$and:[{user_id: req.user._id} , {status: "unread"}]})
            };;

            if(!isParamsEmpty){
                type = req.query.type;
                id = req.query.id;
                if(type && id){
                    if(type == "docs"){
                        obj = await Document.findOne({_id : id});
                        var series = await Series.findOne({_id : obj.series});
                        var person = await Person.findOne({_id : obj.receiver});
        
                        data.data = {
                            doc : series.acronym + "-" + obj.doc_num,
                            date : generalFunctions.formatDate(obj.registrationDate),
                            data : obj.invoiceData,
                            receiver : person.firstName + " " + person.lastName
                        };
                        data.titles = ["Doc", "Reg Date","Data"];
                        data.type = [1,1,1];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'warehouses'){
                        obj = await Warehouse.findOne({_id : id});
                        data.data = [ obj.title, obj.location, generalFunctions.formatDate(obj.registrationDate), obj.active]
                        data.titles = ["Title","location", "Reg Date","Status"];
                        data.type = [1,1,1,1];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'series'){
                        obj = await Series.findOne({_id : id});
                        data.data = [ obj.title, obj.acronym,obj.type,obj.count,obj.sealed, generalFunctions.formatDate(obj.registrationDate), obj.active]
                        data.titles = ["Title","Acronym","Type","Count","Sealed", "Reg Date","Status"];
                        data.type = [1,1,1,1,1,1,1];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'persons'){
                        obj = await Person.findOne({_id : id});
                        data.data = [
                            obj.type,
                            obj.firstName,
                            obj.lastName,
                            obj.email,
                            obj.phone,
                            obj.afm,
                            obj.account_status,
                            generalFunctions.formatDate(obj.registrationDate)
                        ]
                        data.titles = ["Type","FirstName","LastName","email","phone", "afm","Status", "Reg Date"];
                        data.type = [1,1,1,1,1,1,1,0];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'items'){
                        obj = await Item.findOne({_id : id});
                        data.data = [ obj.title,obj.description ,generalFunctions.formatDate(obj.registrationDate), obj.unit_of_measurement,obj.price_r,obj.price_w,obj.discount_r,obj.discount_w,obj.tax_r,obj.tax_w, obj.status]
                        data.titles = ["Title", "Description","Reg Date", "Unit of Peasurement", "Price Retail", "Price Wholesale", "Discount Retail", "Discount Wholesale" , "Tax Retail", "Tax Wholesale","Status"];
                        data.type = [1,1,0,1,1,1,1,1,1,1,1];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'users'){
                        obj = await User.findOne({_id : id});
                        data.data = [
                            obj.firstName,
                            obj.lastName,
                            obj.email,
                            generalFunctions.get_status(obj.status),
                            generalFunctions.formatDate(obj.registrationDate)
                        ]
                        data.titles = ["FirstName","LastName","email","Status", "Reg Date"];
                        data.type = [1,1,1,1,1];
                        //1=normal-text,0=text-readonly

                    }
                }
                else{
                    console.log("ERROR")
                }
            }
            if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
                console.error('Error: Data is empty');
            }
            else{
                console.log(data.data)
            }
            
            res.render(path_constants.pages.view.view(), data);
        }
        else{
            res.redirect('/error?error='+access.error);
        }
    }catch (err) {
        console.error('Error saving user:', err);
        res.redirect('/error?error='+err);
      }

    });

router.post('/', async (req, res) => {
    try {
        const isParamsEmpty = Object.keys(req.query).length === 0;
        console.log(req.query.type +" "+ req.query.id+ "-------------- "+req.body.action)
        if (isParamsEmpty) {
            console.log("ERROR ViewRoutes 2");
            return res.redirect('/error?origin_page=/&error=' + encodeURIComponent("Query parameters are missing"));
        }
        console.log(req.body);
        if (req.query.type && req.query.id) {
            if(req.body.action == 'save'){
                console.log('1');
                await generalFunctions.update({ _id: req.query.id } , req.query.type, req.body);
            }
            else{
                await generalFunctions.delete_deactivate({ _id: req.query.id }, req.query.type, req.body.action);
            }
            
            return res.redirect(`/view?type=${req.query.type}&id=${req.query.id}`);
        } else {
            console.log("ERROR ViewRoutes 1");
            return res.redirect('/error?origin_page=/&error=' + encodeURIComponent("Type or ID is missing"));
        }
    } catch (e) {
        console.error(e);
        return res.redirect('/error?origin_page=/&error=' + encodeURIComponent(e.message));
    }
});

module.exports = router;