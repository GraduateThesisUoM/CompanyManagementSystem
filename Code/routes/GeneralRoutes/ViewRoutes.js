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

                        var person_type = "Customer";
                        if(person.type == 1){
                            person_type = "Supplier";
                        }
                        var items_id_list = [];
                        for(let i=0;i<Object.keys(obj.invoiceData).length;i++){
                            items_id_list.push(obj.invoiceData[i].lineItem); // Add the lineItem ID to the list
                        }
        
                        data.data = [
                            series.acronym + "-" + obj.doc_num,
                            generalFunctions.formatDate(obj.registrationDate),
                            person.firstName + " " + person.lastName,
                            obj.generalDiscount,
                            obj.status,
                            obj.sealed,
                            obj.invoiceData,
                            //---
                            data.items_all = await Item.find({companyID : company, status:1,type:obj.type}),
                        ];
                        data.titles = ["Doc", "Reg Date",person_type,"General Discount %","Status","Sealed","Data"];
                        
                        data.type = [0,0,0,6,3,4,2];//1=normal-text,0=text-readonly,2=doc-table,3=display:none,4 checkbox not editable,5 checkbox,6 input type number
                        //data.items = await Item.find({companyID : company,_id: { $in: items_id_list }});
                    }
                    else if (type == 'Warehouse'){
                        obj = await Warehouse.findOne({_id : id});
                        data.data = [ obj.title, obj.location, generalFunctions.formatDate(obj.registrationDate), obj.status]
                        data.titles = ["Title","location", "Reg Date","Status"];
                        data.type = [1,1,0,0];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'series'){
                        obj = await Series.findOne({_id : id});
                        data.data = [ obj.title, obj.acronym,obj.type,obj.count,obj.sealed, generalFunctions.formatDate(obj.registrationDate), obj.status]
                        data.titles = ["Title","Acronym","Type","Count","Sealed", "Reg Date","Status"];
                        data.type = [1,1,1,1,5,0,0];
                        //1=normal-text,0=text-readonly 5 checkbox

                    }
                    else if (type == 'person'){
                        obj = await Person.findOne({_id : id});
                        data.data = [
                            obj.type,
                            obj.firstName,
                            obj.lastName,
                            obj.email,
                            obj.phone,
                            obj.afm,
                            obj.status,
                            generalFunctions.formatDate(obj.registrationDate)
                        ]
                        data.titles = ["Type","FirstName","LastName","email","phone", "afm","Status", "Reg Date"];
                        data.type = [1,1,1,1,1,1,0,0];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'items'){
                        obj = await Item.findOne({_id : id});
                        data.data = [ obj.title,obj.description ,generalFunctions.formatDate(obj.registrationDate), obj.unit_of_measurement,obj.price_r,obj.price_w,obj.discount_r,obj.discount_w,obj.tax_r,obj.tax_w, obj.status]
                        data.titles = ["Title", "Description","Reg Date", "Unit of Peasurement", "Price Retail", "Price Wholesale", "Discount Retail", "Discount Wholesale" , "Tax Retail", "Tax Wholesale","Status"];
                        data.type = [1,1,0,1,1,1,1,1,1,1,0];
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
                        data.type = [1,1,1,0,0];
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
            /*else{
                console.log(data.data)
            }*/
            
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

router.post("/", Authentication.checkAuthenticated, async (req, res) => {

    try {
        const isParamsEmpty = Object.keys(req.query).length === 0;
        console.log(req.query.type +" "+ req.query.id+ "-------------- "+req.body.action)
        if (isParamsEmpty) {
            console.log("ERROR ViewRoutes 2");
            return res.redirect('/error?origin_page=/&error=' + encodeURIComponent("Query parameters are missing"));
        }
        if (req.query.type && req.query.id) {
            if(req.body.action == 'save'){
                var obj_data = req.body;
                var obj_type = req.query.type;
                if(req.query.type == 'docs'){
                    obj_type = 'documents'
                    const lines_of_doc = {};

                    for (let i = 0; i < req.body.num_of_rows; i++) {
                        const quantity = parseInt(req.body[`quantity_${i}`], 10);
                        const tax = parseFloat(req.body[`tax_${i}`]).toFixed(2);
                        const lineItem = req.body[`doc_line_item_${i}`]; // Assuming lineItem should remain a string or ID
                        const discount = parseFloat(req.body[`discount_${i}`]).toFixed(2);
                        const price_of_unit = parseFloat(req.body[`price_of_unit_${i}`]).toFixed(2);
                        lines_of_doc[i] = { quantity, tax, lineItem, discount, price_of_unit };
                    }
                    
                    obj_data = {
                        generalDiscount : 50,
                        invoiceData : lines_of_doc
                    }

                }
                console.log(obj_data)
                await generalFunctions.update({ _id: req.query.id } , obj_type, obj_data);
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