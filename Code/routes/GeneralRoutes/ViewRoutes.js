const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);


//Models
const Company  = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);


router.get('/', Authentication.checkAuthenticated, async (req, res) => {
    try{
        console.log('ViewRoutes')
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

                        var warehouse = {title :'-'};
                        if (obj.warehouse !== "0") {
                            warehouse = await Warehouse.findOne({ _id: obj.warehouse });
                          }

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
                            obj.retail_wholesale,
                            obj.sealed,
                            warehouse.title,
                            obj.invoiceData,
                            //---
                            await Item.find({company : company, status:1,type:obj.type})
                        ];
                        data.titles = ["Doc", "Reg Date",person_type,"General Discount %","Status","Type","Sealed","Warehouse","Data"];
                        
                        data.type = [0,0,0,6,3,7,4,1,2];//1=normal-text,0=text-readonly,2=doc-table,3=display:none,4 checkbox not editable,5 checkbox,6 input type number
                        //7 for docs wholesale_retail
                        //data.items = await Item.find({companyID : company,_id: { $in: items_id_list }});
                    }
                    else if (type == 'Warehouse'){
                        obj = await Warehouse.findOne({_id : id});
                        var inventory = await generalFunctions.warehose_get_inventory({company : company,id : obj._id});
                        console.log(inventory)
                        data.data = [
                            obj.title,
                            obj.location,
                            generalFunctions.formatDate(obj.registrationDate),
                            obj.status,
                            inventory
                        ]
                        data.titles = ["Title","location", "Reg Date","Status","Data"];
                        data.type = [1,1,0,0,8];
                        //1=normal-text,0=text-readonly
                        //8 table

                    }
                    else if (type == 'series'){
                        obj = await Series.findOne({_id : id});
                        data.data = [ obj.title, obj.acronym,obj.type,obj.count,obj.sealed,obj.effects_warehouse,obj.credit,obj.debit, generalFunctions.formatDate(obj.registrationDate), obj.status]
                        data.titles = ["Title","Acronym","Type","Count","Sealed","Effects Warehouse","Credit","Debit", "Reg Date","Status"];
                        data.type = [1,1,1,1,5,5,5,5,0,0];
                        //1=normal-text,0=text-readonly, 5 checkbox

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
                            obj.status,
                            generalFunctions.formatDate(obj.registrationDate)
                        ]
                        data.titles = ["Type","FirstName","LastName","email","phone", "afm","Status", "Reg Date"];
                        data.type = [1,1,1,1,1,1,0,0];
                        //1=normal-text,0=text-readonly

                    }
                    else if (type == 'items'){
                        obj = await Item.findOne({_id : id});
                        data.data = [
                            obj.title,
                            obj.description,
                            generalFunctions.formatDate(obj.registrationDate),
                            obj.unit_of_measurement,
                            obj.price_r,
                            obj.price_w,
                            obj.discount_r,
                            obj.discount_w,
                            obj.tax_r,
                            obj.tax_w,
                            obj.status,
                            await generalFunctions.item_get_inventory({company : company,id : obj._id})
                        ]
                        data.titles = ["Title", "Description","Reg Date", "Unit of Peasurement", "Price Retail", "Price Wholesale", "Discount Retail", "Discount Wholesale" , "Tax Retail", "Tax Wholesale","Status","Inventory"];
                        data.type = [1,1,0,1,1,1,1,1,1,1,0,0];
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
                    else if( type == 'nodes'){
                        obj = await Node.findOne({_id : id});
                        if(obj.status == 'pending'){
                            obj.status = 'viewed'
                            await obj.save();
                        }
                        var nodes = []
                        nodes.push(obj);
                        var node = obj;
                        while(true){
                            
                            node = await Node.findOne({next : node._id});
                            if(node == undefined){
                                break; 
                            }
                            else{
                                nodes.push(node);
                            }
                        }

                        const company = await Company.findOne({ _id: obj.company });

                        var node_data = [];
                        for(n of nodes){
                            var sender_user = await User.findOne({_id:n.sender_id})
                            node_data.push({
                                sender : sender_user,
                                registrationDate: generalFunctions.formatDate(obj.registrationDate),
                                title: n.title,
                                status: n.status,
                                text: n.text,
                                locked: n.locked
                            })
                        }
                        node_data.reverse();

                        data.data = [
                            obj.title,
                            obj.type,
                            obj.type2,
                            company.name,
                            node_data,
                            "",

                        ]
                        data.titles = ["Title","Type","Type2","Company","Data","Answer"];
                        data.type = [0,0,0,0,10,9];
                        //nodes10
                    }
                    else if( type == 'clients'){
                        obj = await Company.findOne({_id : id});
                        data.data = [
                            obj.name,
                            obj.logo,
                            generalFunctions.formatDate(obj.registrationDate)
                        ]
                        data.titles = ["Name","Logo","Reg Date"];
                        data.type = [0,11,0];
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
            var obj_data = req.body;
            var obj_type = req.query.type;

            if(req.body.action == 'save'){
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
               
                await generalFunctions.update({ _id: req.query.id } , obj_type, obj_data);
            }
            else if (req.query.type == 'nodes'){
                const node = await Node.findOne({_id:req.query.id});
                let action = 4;//rejected
                if(req.body.action == 'executed'){
                    action = 2;
                }

                const new_node = await generalFunctions.node_reply({
                    user: req.user,
                    target_node:node,
                    reply : 2,//response
                    text: req.body.input5,
                    status : action
                })
                return res.redirect(`/view?type=${req.query.type}&id=${new_node.id}`);
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