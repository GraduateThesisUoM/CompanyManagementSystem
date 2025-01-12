const express = require("express");
const router = express.Router();

const path_constants = require("../../constantsPaths");

//Authentication Function
const Authentication = require(path_constants.authenticationFunctions_folder.two);
//Get clients Function
const clientAccountantFunctions = require(path_constants.clientAccountantFunctions_folder.two);
//Get General Functions
const generalFunctions = require(path_constants.generalFunctions_folder.two);

//Models
const Company = require(path_constants.schemas.two.company);
const Node = require(path_constants.schemas.two.node);
const Notification = require(path_constants.schemas.two.notification);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);
const Client = require(path_constants.schemas.two.client);
const Accountant = require(path_constants.schemas.two.accountant);

/*
0 text-readonly
1 normal-text,
2=doc-table
3=display:none
4 checkbox not editable
5 checkbox
6 input type number
7 for docs wholesale_retail 
10 nodes
13 simple text display
14 select warehose
15 input hiden show text for status
*/


router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("ViewRoutes");
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      var company;
      var obj;
      var secondary_data = {};

      if (req.user.type != "admin") {
        company = req.user.company;
      }
      /*else{ for delete
          company = await Company.findOne({_id:req.query.id})
      }*/
      const isParamsEmpty = Object.keys(req.query).length === 0;
      var data = {
        user: req.user,
        data: "",
        titles: [],
        isParamsEmpty: isParamsEmpty
      };

      if (!isParamsEmpty) {
        type = req.query.type;
        id = req.query.id;
        console.log("ID : "+ id)
        if (type && id) {
          if (type == "docs") {
            obj = await Document.findOne({ _id: id });
            var series = await Series.findOne({ _id: obj.series });
            var series_list = await Series.find({ company: obj.company, status:1, type:req.query.type2 });
            var series_to = await Series.find({ company: company, status: 1, type: obj.type, _id: { $in: series.transforms_to } });
            var person = await Person.findOne({ _id: obj.receiver });
            
            series_to = series_to.map(s => ({
              name: s.name,
              acronym: s.acronym,
              _id: s._id
            }));

            var warehouse = { _id: "-" };
            if (obj.warehouse !== "0") {
              warehouse = await Warehouse.findOne({ _id: obj.warehouse });
            }

            var person_type = "Customer";
            if (person.type == 1) {
              person_type = "Supplier";
            }
            var persons = await Person.find({ company: obj.company, status:1, type:req.query.type2 })
            persons = persons.map(p => ({
              name: p.lastName+" "+p.firstName,
              _id: p._id
            }));

            var items_id_list = [];
            for (let i = 0; i < Object.keys(obj.invoiceData).length; i++) {
              items_id_list.push(obj.invoiceData[i].lineItem); // Add the lineItem ID to the list
            }

            data = {
              doc : obj,
              registrationDate : generalFunctions.formatDate(obj.registrationDate),
              series : series,
              series_list : series_list,
              person_type : person_type,
              person:person,
              persons: persons,
              user: req.user,
              warehouses : await Warehouse.find({ company: company, status: 1 }),
            }

            /*data.data = [
              series.acronym + "-" + obj.doc_num,
              generalFunctions.formatDate(obj.registrationDate),
              person.firstName + " " + person.lastName,
              obj.generalDiscount,
              obj.status,
              obj.retail_wholesale,
              obj.sealed,
              warehouse._id,
              obj.invoiceData,
              //---
              await Item.find({ company: company, status: 1, type: obj.type }),
            ];
            data.titles = ["Doc", "Reg Date", person_type, "General Discount %", "Status", "Type", "Sealed", "Warehouse", "Data"];

            data.type = [13, 13, 13, 6, 3, 7, 4, 14, 2]; 
            //data.items = await Item.find({companyID : company,_id: { $in: items_id_list }});

            secondary_data = {
              series_to :series_to,
              warehouses : await Warehouse.find({ company: company, status: 1 }),
              warehouse : warehouse
            }*/

          } else if (type == "Warehouse") {
            obj = await Warehouse.findOne({ _id: id });
            var inventory = await generalFunctions.warehose_get_inventory({
              company: company,
              id: obj._id,
            });
            data.data = [obj.title, obj.location, generalFunctions.formatDate(obj.registrationDate), obj.status, inventory];
            data.titles = ["Title", "location", "Reg Date", "Status", "Data"];
            data.type = [1, 1, 0, 15, 8];
            //1=normal-text,0=text-readonly
            //8 table
          } else if (type == "series") {
            obj = await Series.findOne({ _id: id });
            var series = await Series.find({company:company, status:1,type:obj.type,_id: { $ne: obj._id } /* Exclude the document with the same _id as `obj`*/})
            data.data = [obj.title, obj.acronym, obj.type, obj.count, obj.sealed, obj.effects_warehouse, obj.credit, obj.debit, generalFunctions.formatDate(obj.registrationDate), obj.status,obj.transforms,series];
            data.titles = ["Title", "Acronym", "Type", "Count", "Sealed", "Effects Warehouse", "Credit", "Debit", "Reg Date", "Status","Transforms","Series"];
            data.type = [1, 1, 1, 1, 5, 5, 5, 5, 0, 15,5,12];

            secondary_data = {
              selected_series :obj.transforms_to
            }
            //1=normal-text,0=text-readonly, 5 checkbox,12 series
          } else if (type == "persons") {
            obj = await Person.findOne({ _id: id });
            data.data = [ obj.firstName, obj.lastName, obj.email, obj.phone, obj.afm, obj.status, 
              generalFunctions.formatDate(obj.registrationDate),
              obj.address,obj.district,obj.city,obj.country,obj.zip
            ];
            data.titles = ["FirstName", "LastName", "email", "phone", "afm", "Status", "Reg Date",
              "Address","District", "City","Country", "ZIP"
            ];
            data.type = [1, 1, 1, 1, 1, 15, 13,
              1,1,1,1,1
            ];
            //1=normal-text,0=text-readonly
          } else if (type == "items") {
            obj = await Item.findOne({ _id: id });
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
              await generalFunctions.item_get_inventory({
                company: company,
                id: obj._id,
              }),
            ];
            data.titles = ["Title", "Description", "Reg Date", "Unit of Peasurement", "Price Retail", "Price Wholesale", "Discount Retail", "Discount Wholesale", "Tax Retail", "Tax Wholesale", "Status", "Inventory"];
            data.type = [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 15, 0];
            
          } else if (type == "users") {
            obj = await User.findOne({ _id: id });
            data.data = [obj.firstName, obj.lastName, obj.email, obj.status, generalFunctions.formatDate(obj.registrationDate)];
            data.titles = ["FirstName", "LastName", "email", "Status", "Reg Date"];
            data.type = [1, 1, 1, 15, 0];
            
          } else if (type == "nodes") {
            obj = await Node.findOne({ _id: id });
            console.log(obj)
            console.log(req.user._id)
            console.log(obj.receiver_id.equals( req.user._id))
            if (obj.status == 3 && obj.receiver_id.equals( req.user._id)) {//pending and user is the receiver
              obj.status = 1;//viewed
              await obj.save();
            }
            var nodes = [];
            nodes.push(obj);
            var node = obj;
            console.log(node)
            while (true) {
              node = await Node.findOne({ next: node._id });
              console.log(node)
              if (!node) {
                break;
              } else {
                nodes.push(node);
              }
            }

            const company = await Company.findOne({ _id: obj.company });

            var node_data = [];
            for (n of nodes) {
              var sender_user = await User.findOne({ _id: n.sender_id });
              node_data.push({
                sender: sender_user,
                registrationDate: generalFunctions.formatDateTime(n.registrationDate),
                title: n.title,
                status: generalFunctions.get_status(n.status),
                text: n.text,
                locked: n.locked,
              });
            }
            node_data.reverse();

            data.data = [generalFunctions.get_type2(obj.type2), obj.title, company.name,generalFunctions.formatDateTime(obj.due_date), node_data, ""];
            data.titles = ["Type", "Title", "Company", "Data","Due Date", "Reply"];
            data.type = [13, 13, 13,13, 10, 9];


            
          } else if (type == "clients") {
            obj = await Company.findOne({ _id: id });
            data.data = [obj.name, obj.logo, generalFunctions.formatDate(obj.registrationDate)];
            data.titles = ["Name", "Logo", "Reg Date"];
            data.type = [0, 11, 0];

            let nodes = await Node.find({ company: id, type: 6, type2: 6, next: "-", status: 2 });

            nodes = await Promise.all(
              nodes.map(async (n) => {
                const c = await Client.findOne({ _id: n.receiver_id });
                return {
                  _id: n._id,
                  user: { _id: c._id, firstName: c.firstName, lastName: c.lastName },
                  data: n.data,
                  text: n.text,
                };
              })
            );

            secondary_data = {
              nodes: nodes,
              users: await Client.find({ company: id, status: 1 }),
            };
          } else if (type == "companys") {
            obj = await Company.findOne({ _id: id });
            const users = await User.find({company: obj._id})
            const ac_node = await Node.findOne({company:obj._id, status:2,next:'-'})
            console.log(ac_node)
            var accountant = "Not assigned"
            if(ac_node){
              const accountant_obj = await Accountant.findOne({_id:'6744cea94215507895961cc0'})
              console.log(accountant_obj)
              accountant = accountant_obj ? accountant_obj.firstName + " " + accountant_obj.lastName : "Not assigned"
            }
            data.data = [obj.name, obj.logo, generalFunctions.formatDate(obj.registrationDate),users.length, accountant,obj.status];
            data.titles = ["Name", "Logo", "Reg Date","Number of Users","Accountant","Status"];
            data.type = [0, 11, 0,0,0,0];

            /*let nodes = await Node.find({ company: id, type: 6, type2: 6, next: "-", status: 2 });

            nodes = await Promise.all(
              nodes.map(async (n) => {
                const c = await Client.findOne({ _id: n.receiver_id });
                return {
                  _id: n._id,
                  user: { _id: c._id, firstName: c.firstName, lastName: c.lastName },
                  data: n.data,
                  text: n.text,
                };
              })
            );

            secondary_data = {
              nodes: nodes,
              users: await Client.find({ company: id, status: 1 }),
            };*/
          } else if (type == "reports") {
            obj = await Node.findOne({ _id: id });
            const c = await Company.findOne({_id:obj.company});
            const s = await User.findOne({_id:obj.sender_id})
            const r = await User.findOne({_id:obj.receiver_id})
            data.data = [c.name,
              generalFunctions.formatDate(obj.registrationDate),
              s.firstName + " " + s.lastName,
              r.firstName + " " + r.lastName,
              generalFunctions.get_type2(obj.type2),
              obj.text

            ];
            data.titles = [
              "Company Name","Reg Date", "Sender",
              "Recever", "Category","Text"
            ];
            data.type = [0, 0, 0,0,0,9];

            secondary_data = {
              nodes: nodes,
              users: await Client.find({ company: id, status: 1 }),
            };
          }
          
        } else {
          console.log("ERROR");
        }
      }
      if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
        console.error("Error: Data is empty");
      }

      data.secondary_data = secondary_data;

      if (type && id) {
        if (type == "docs") {
          res.render(path_constants.pages.view.view('doc'), data);
        }
        else{
          res.render(path_constants.pages.view.view(), data);
        }
      }
      else{
        res.render(path_constants.pages.view.view(), data);
      }
    } else {
      res.redirect("/error?error=" + access.error);
    }
  } catch (err) {
    console.error("Error saving user:", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    var data = {};
    const isParamsEmpty = Object.keys(req.query).length === 0;
    console.log("ViewRoutes");
    console.log(req.body.action);
    if (isParamsEmpty) {
      console.log("ERROR ViewRoutes 2");
      return res.redirect("/error?origin_page=/&error=" + encodeURIComponent("Query parameters are missing"));
    }
    if (req.query.type && req.query.id) {
      var obj_data = req.body;
      var obj_type = req.query.type;

      if (req.body.action == "save") {
        if (req.query.type == "docs") {
          obj_type = "documents";
          const lines_of_doc = {};

          for (let i = 0; i < req.body.num_of_rows; i++) {
            const quantity = parseInt(req.body[`quantity_${i}`], 10);
            const tax = parseFloat(req.body[`tax_${i}`]).toFixed(2);
            const lineItem = req.body[`doc_line_item_${i}`]; // Assuming lineItem should remain a string or ID
            const discount = parseFloat(req.body[`discount_${i}`]).toFixed(2);
            const price_of_unit = parseFloat(req.body[`price_of_unit_${i}`]).toFixed(2);
            lines_of_doc[i] = {
              quantity,
              tax,
              lineItem,
              discount,
              price_of_unit,
            };
          }

          obj_data = {
            generalDiscount: 50,
            warehouse: req.body.select_warehose,
            invoiceData: lines_of_doc,
          };
        }

        await generalFunctions.update({ _id: req.query.id }, obj_type, obj_data);
      } else if (req.body.action == "time_table" || req.body.action == "time_table_delete") {
        var company = await Company.findOne({ _id: req.query.id });
        let date_start_dateObject = new Date(req.body.day_data_input_date);
        let endDate = new Date(req.body.day_data_input_date_to);

        var node = false;
        if (req.body.day_data_input_node_id) {
          node = await Node.findOne({ _id: req.body.day_data_input_node_id });
          if (req.body.action == "time_table_delete") {
            node.status = 5; //canceled
            await node.save();
          }
          else {
            time_table_new_node = await generalFunctions.node_reply({
              user: req.user,
              target_node: node,
              reply: 6, //response
              text: req.body.time_table_notes,
              data: {
                date: date_start_dateObject,

                hour_start: req.body.time_table_hours_start,
                minutes_start: req.body.time_table_minutes_start,

                hour_end: parseInt(req.body.time_table_hours_end),
                minutes_end: req.body.time_table_minutes_end,
              },
            });
          }
        }
        else{
          var users = req.body.day_data_input_user_id;
          users = users.split(';');
          console.log("users "+users)
          for( u of users){
            let currentDate = new Date(date_start_dateObject);
            while (currentDate <= endDate) {
              let d = new Date(currentDate);
              const dd = d.toISOString().replace('Z', '+00:00')

              var data = {
                company : company._id,
                receiver_id : u,
                type : 6,
                type2: 6,
                next : '-',
                status : 2,
                data : {
                  date : dd,
                  hour_start: req.body.time_table_hours_start,
                  minutes_start: req.body.time_table_minutes_start,
  
                  hour_end: parseInt(req.body.time_table_hours_end),
                  minutes_end: req.body.time_table_minutes_end  
                }
              };
              var node = await Node.findOne(data);
              console.log(node)
              if(node){
                data = {
                  user: req.user,
                  target_node: node,
                  reply: 6, //response
                  text: req.body.time_table_notes,
                  data: {
                    date: date_start_dateObject,
    
                    hour_start: req.body.time_table_hours_start,
                    minutes_start: req.body.time_table_minutes_start,
    
                    hour_end: parseInt(req.body.time_table_hours_end),
                    minutes_end: req.body.time_table_minutes_end,
                  }
                }
                await generalFunctions.node_reply(data);
              }
              else{
                console.log("Node Foud");
                console.log(node)
                data.sender_id = req.user._id,
                await generalFunctions.create_node(data);
              }

              // Increment the current date by one day
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }

        }

        if (req.body.calendar_view_selection) {
          return res.redirect(`/view?type=${req.query.type}&id=${req.query.id}&timetable=${req.body.calendar_view_selection}`);
        }
        return res.redirect(`/view?type=${req.query.type}&id=${req.query.id}`);
      } else if (req.query.type == "nodes" || req.query.type == "requests") {
        const node = await Node.findOne({ _id: req.query.id });
        let action = 7; //rejected
        if (req.body.action == "executed") {
          action = 2;
        }
        else if (req.body.action == "rejected") {
          action = 4;
        }

        const new_node = await generalFunctions.node_reply({
          user: req.user,
          target_node: node,
          text: req.body.input4,
          reply: action
        });

        if(new_node.type == 1 && new_node.type2 == 3 ){
          return res.redirect(`/list?searchfor=clients`);
        }
        return res.redirect(`/view?type=${req.query.type}&id=${new_node._id}`);
      
      }
      else if(req.body.action == "turn_to"){
        console.log("turn_to "+req.query.id);
        const origin_doc = await Document.findOne({ _id: req.query.id });
        const new_doc = await generalFunctions.create_doc({
          company: origin_doc.company,
          sender: origin_doc.sender,
          receiver: origin_doc.receiver,
          type: origin_doc.type,
          generalDiscount: origin_doc.generalDiscount,
          series: origin_doc.series,
          doc_num: origin_doc.doc_num,
          retail_wholesale: origin_doc.retail_wholesale,
          warehouse: origin_doc.warehouse,
          sealed: origin_doc.sealed,
          invoiceData: origin_doc.invoiceData,
        });

        origin_doc.next = new_doc._id;
        await origin_doc.save();
        
      }
      else {
        await generalFunctions.delete_deactivate({ _id: req.query.id }, req.query.type, req.body.action);
      }

      return res.redirect(`/view?type=${req.query.type}&id=${req.query.id}`);
    } else {
      console.log("ERROR ViewRoutes 1");
      return res.redirect("/error?origin_page=/&error=" + encodeURIComponent("Type or ID is missing"));
    }
  } catch (e) {
    console.error(e);
    return res.redirect("/error?origin_page=/&error=" + encodeURIComponent(e.message));
  }
});

module.exports = router;
