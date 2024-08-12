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
        if(generalFunctions.checkAccessRigts(req,res)){
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
                            date : formatDate(obj.registrationDate),
                            data : obj.invoiceData,
                            receiver : person.firstName + " " + person.lastName
                        };
                        data.titles = ["Doc", "Reg Date","Data"]
                    }
                    else if (type == 'warehouses'){
                        obj = await Warehouse.findOne({_id : id});
                        data.data = [ obj.title, obj.location, formatDate(obj.registrationDate), obj.active]
                        data.titles = ["Title","location", "Reg Date","Status"];
                    }
                    else if (type == 'series'){
                        obj = await Series.findOne({_id : id});
                        data.data = [ obj.title, obj.acronym,obj.type,obj.count,obj.sealed, formatDate(obj.registrationDate), obj.active]
                        data.titles = ["Title","Acronym","Type","Count","Sealed", "Reg Date","Status"];
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
                            formatDate(obj.registrationDate)
                        ]
                        data.titles = ["Type","firstName","lastName","email","phone", "afm","Status", "Reg Date"];
                    }
                    else if (type == 'items'){
                        obj = await Item.findOne({_id : id});
                        data.data = [ obj.title,obj.description ,formatDate(obj.registrationDate), obj.unit_of_measurement,obj.price_r,obj.price_w,obj.discount_r,obj.discount_w,obj.tax_r,obj.tax_w, obj.active]
                        data.titles = ["Title", "Description","Reg Date", "Unit of Peasurement", "Price Retail", "Price Wholesale", "Discount Retail", "Discount Wholesale" , "Tax Retail", "Tax Wholesale","Status"];
                    }
                }
                else{
                    console.log("ERROR")
                }
            }
            console.log(data.data)
            res.render(path_constants.pages.view.view(), data);
        }
        else{
          res.redirect('/error?origin_page=my-company&error=acces denid');
        }
    }catch (err) {
        console.error('Error saving user:', err);
        res.redirect('/error?origin_page=view&error='+err);
      }

    });

    router.post('/', async (req, res) => {
        try {
            const isParamsEmpty = Object.keys(req.query).length === 0;

            if (isParamsEmpty) {
                console.log("ERROR ViewRoutes 2");
                return res.redirect('/error?origin_page=/&error=' + encodeURIComponent("Query parameters are missing"));
            }
    
            if (req.query.type && req.query.id) {
                await generalFunctions.delete_deactivate({ _id: req.query.id }, req.query.type, req.body.action);
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
    


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

module.exports = router;