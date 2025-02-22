const express = require("express");
const router = express.Router();
const url = require('url');

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
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);
const Client = require(path_constants.schemas.two.client);
const Accountant = require(path_constants.schemas.two.accountant);
const Review= require(path_constants.schemas.two.review);


/*
0 text-readonly
1 normal-text,
3=display:none
4 checkbox not editable
5 checkbox
6 input type number
7 for docs wholesale_retail 
10 nodes
13 simple text display
14 select warehose
15
16 star review
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
      const type = req.query.type;
      const id = req.query.id;

      if (!isParamsEmpty) {
        
        console.log(type);
        if (type && id) {
          
          if (type == "docs") {
            obj = await Document.findOne({ _id: id });
            console.log(obj);
            var series = await Series.findOne({ _id: obj.series });
            var series_list = await Series.find({ company: obj.company, status:1, type:req.query.type2 });
            var series_to = await Series.find({ company: company, status: 1, type: obj.type, _id: { $in: series.transforms_to } });
            var person = await Person.findOne({ _id: obj.receiver });
            
            var history = [];
            var d = obj;
            var p;

            while(true){
              p = await Document.findOne({next: d._id})
              if(p){
                d = p;
              }
              else{
                break;
              }
            }
            //history.push(d)
            var s = await Series.findOne({_id: d.series})
            let u = await User.findOne({_id: d.sender})
            history.push({
              _id:d._id,
              name: s.acronym+"-"+d.doc_num,
              registrationDate : generalFunctions.formatDateTime(d.registrationDate),
              user : u.lastName+" "+u.firstName
            })

            while(true){
              if(d.next != '-'){
                p = await Document.findOne({_id: d.next})
                if(p){
                  d=p
                  //history.push(d)
                  s = await Series.findOne({_id: d.series})
                  let u = await User.findOne({_id: d.sender})
                  history.push({
                    _id:d._id,
                    name: s.acronym+"-"+d.doc_num,
                    registrationDate : generalFunctions.formatDateTime(d.registrationDate),
                    user : u.lastName+" "+u.firstName
                  })
                }
                else{
                  break;
                }
              }
              else{
                break;
              }              
            }

            series_to = series_to.map(s => ({
              name: s.name,
              acronym: s.acronym,
              _id: s._id
            }));
            
            var transforms_to = []
            for(s of series.transforms_to){
              transforms_to.push(await Series.findOne({_id:s}))
            }
            transforms_to = transforms_to.map(s => ({
              _id: s._id,
              name: s.acronym+"-"+s.title
            }));

            var person_type = "Customer";
            if (person.type == 1) {
              person_type = "Supplier";
            }
            var persons = await Person.find({ company: obj.company, status:1, type:req.query.type2 })
            persons = persons.map(p => ({
              name: p.lastName+" "+p.firstName,
              _id: p._id
            }));
            console.log('obj.invoiceData[i]');
            var items_id_list = [];
            for (let i = 0; i < Object.keys(obj.invoiceData).length; i++) {
              console.log(obj.invoiceData[i]);
              items_id_list.push(obj.invoiceData[i].lineItem); // Add the lineItem ID to the list
            }


            if(obj.edited == 1 || obj.next !== '-'|| obj.sealed == 1){
              data = {
                doc_name : series.acronym+"-"+obj.doc_num,
                doc : obj,
                registrationDate : generalFunctions.formatDate(obj.registrationDate),
                series : series,
                person_type : person_type,
                person: person,
                user: req.user,
                warehouse : await Warehouse.findOne({ _id: obj.warehouse }),
                items : await Item.find({ company: company, type: obj.type }),
                transforms_to : transforms_to,
                history : history
              }
            }
            else{
            
              data = {
                doc_name : series.acronym+"-"+obj.doc_num,
                doc : obj,
                registrationDate : generalFunctions.formatDate(obj.registrationDate),
                series_list : series_list,
                person_type : person_type,
                persons: persons,
                user: req.user,
                warehouses : await Warehouse.find({ company: company, status: 1 }),
                items : await Item.find({ company: company, type: obj.type }),
                transforms_to : transforms_to,
                history : history
              }
            }

          } else if (type == "Warehouse") {
            obj = await Warehouse.findOne({ _id: id });
            var inventory = await generalFunctions.warehouse_get_inventory({
              company: company,
              id: obj._id,
            });
            data.data = [obj.title, obj.location, inventory];
            data.titles = ["Title", "location", "Data"];
            data.type = [1, 1, 8];
            //1=normal-text,0=text-readonly
            //8 table
          } else if (type == "series") {
            obj = await Series.findOne({ _id: id });
            var series = await Series.find({company:company, status:1,type:obj.type,_id: { $ne: obj._id } /* Exclude the document with the same _id as `obj`*/})

            data.data = [obj.title, obj.acronym, obj.count, {sealed : obj.sealed, effects_warehouse : obj.effects_warehouse, effects_account :obj.effects_account},series];
            data.titles = ["Title", "Acronym", "Count", "Sealed","Series"];
            data.type = [1, 1, 0, 15,12];

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
            data.titles = ["FirstName", "LastName", "email", "phone", "afm", "Status",  "Address","District", "City","Country", "ZIP"
            ];
            data.type = [1, 1, 1, 1, 1, 1,1,1,1,1
            ];

            secondary_data = await generalFunctions.gets_movements({user:obj,from : req.query.from_date,to : req.query.to_date});
            
            //1=normal-text,0=text-readonly
          } else if (type == "items") {
            obj = await Item.findOne({ _id: id });
            data.item = obj
            data.inventory = await generalFunctions.item_get_inventory({
              company: company,
              id: obj._id,
            })
            var warehouses = await Warehouse.find({ company: company, status: 1 });
            data.warehouse_list = [];
            for (w of warehouses) {
              data.warehouse_list.push({
                _id: w._id,
                title: w.title,
                inventory : await generalFunctions.get_item_warehouse_inventory_from_transfers({company:company,warehouse:w._id,item:obj._id})
              });
            }

          } else if (type == "users") {
            obj = await User.findOne({ _id: id });
            data.data = [obj.firstName, obj.lastName, obj.email, obj.status, generalFunctions.formatDate(obj.registrationDate)];
            data.titles = ["FirstName", "LastName", "email"];
            data.type = [1, 1, 1, ];
            
          } else if (type == "nodes") {
            obj = await Node.findOne({ _id: id });
            if(obj.receiver_id){
              if (obj.status == 3 && obj.receiver_id.equals( req.user._id)) {//pending and user is the receiver
                obj.status = 1;//viewed
                await obj.save();
              }
            }
            else{
              console.log("Admin View")
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
            console.log('clients')
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
          } else if (type == "companies") {
            obj = await Company.findOne({ _id: id });
            const users = await User.find({company: obj._id})
            //const ac_node = await Node.findOne({company:obj._id, status:2,next:'-'})
            const ac_node = await generalFunctions.get_accountant_node(obj._id)
            var accountant = "Not assigned"
            if(ac_node){
              const accountant_obj = await Accountant.findOne({_id:ac_node.receiver_id})
              accountant = accountant_obj ? accountant_obj.firstName + " " + accountant_obj.lastName : "Not assigned"
            }
            data.data = [obj.name, obj.logo, generalFunctions.formatDate(obj.registrationDate),users.length, accountant,obj.status,obj.license.used,obj.license.bought,obj.license.requested];
            data.titles = ["Name", "Logo", "Reg Date","Number of Users","Accountant","Status","Used licenses","Bought licenses","Requested licenses"];
            data.type = [0, 11, 0,0,0,0,0,0,0];

            let nodes = await Node.find({
              company: id,
              type: { $in: [1,3,4] },
              //type: 3,
              //type2: { $in:[33]},
              //status : 3, //pending
              next:'-'
            })
            nodes_list = [];
            for( n of nodes){
                const sender = await User.findOne({_id:n.sender_id}) || { firstName: "-", lastName: "-" };
                var receiver = await User.findOne({_id:n.receiver_id});
                
                if(!receiver){
                  receiver = await Company.findOne({_id:n.receiver_id});
                  receiver = receiver.name
                }
                else{
                  receiver = receiver.firstName + " "+ receiver.lastName
                }
                nodes_list.push({
                  _id: n._id,
                  sender: sender,
                  receiver: receiver,
                  type: generalFunctions.get_type(n.type) === 'Clients' ? 'Relationship' : generalFunctions.get_type(n.type),
                  title: n.title || "",
                  registrationDate: generalFunctions.formatDateTime(n.registrationDate),
                  status: generalFunctions.get_status(n.status)
                })
            }

            console.log('ffff'+nodes)
            console.log('ffff')
            secondary_data = {
              nodes: nodes_list
            }
          } else if (type == "reports") {
            obj = await Node.findOne({ _id: id });
            obj.status = 1;//viewed
            await obj.save();
            const s = await User.findOne({_id:obj.sender_id})
            data.data = [
              s.firstName + " " + s.lastName,
              generalFunctions.get_type2(obj.type2),
              obj.text

            ];
            data.titles = [
              "Sender",
               "Category","Text"
            ];
            data.type = [0, 0,9];

            secondary_data = {
              nodes: nodes,
              users: await Client.find({ company: id, status: 1 }),
            };
          } else if (type == "reviews"){
            obj = await Review.findOne({ _id: id });
            let comp = await Company.findOne({ _id: obj.company });
            let prsn1 = await User.findOne({ _id: obj.reviewer_id });
            let prsn2 = await User.findOne({ _id: obj.reviewed_id });

            data.data = [comp.name, prsn1.lastName+" "+prsn1.lastName, prsn2.lastName+" "+prsn2.lastName, obj.rating, obj.text];
            data.titles = ["Company","Reviewer","Reviewed", "Rating", "Text"];
            data.type = [13,13,13,16,13];

          }
          else if (type == "transfers"){
            obj = await Document.findOne({ _id: id });
            var series = await Series.findOne({my_id:'777',status:1})

            var history = [];
            var d = obj;
            var p;
      
            while(true){
              p = await Document.findOne({next: d._id})
              if(p){
                d = p;
              }
              else{
                break;
              }
            }
            //history.push(d)
            var s = await Series.findOne({_id: d.series})
            let u = await User.findOne({_id: d.sender})
            history.push({
              _id:d._id,
              name: s.acronym+"-"+d.doc_num,
              registrationDate : generalFunctions.formatDateTime(d.registrationDate),
              user : u.lastName+" "+u.firstName
            })
      
            while(true){
              if(d.next != '-'){
                p = await Document.findOne({_id: d.next})
                if(p){
                  d=p
                  //history.push(d)
                  s = await Series.findOne({_id: d.series})
                  let u = await User.findOne({_id: d.sender})
                  history.push({
                    _id:d._id,
                    name: s.acronym+"-"+d.doc_num,
                    registrationDate : generalFunctions.formatDateTime(d.registrationDate),
                    user : u.lastName+" "+u.firstName
                  })
                }
                else{
                  break;
                }
              }
              else{
                break;
              }              
            }

            const warehouses = await Warehouse.find({company:req.user.company,status:1});
            const items = await Item.find({company:req.user.company,status:1});
            const persons = await Person.find({company:req.user.company,status:1})
            var location_to = [];
            for( w of warehouses){
              location_to.push({
                _id:w._id,
                name:w.title,
              });
            }
            for( p of persons){
              location_to.push({
                _id:p._id,
                name:p.lastName + " " + p.firstName
              });
            }
            var data = {
              name : series.acronym+"-"+obj.doc_num,
              reg_date : generalFunctions.formatDate(obj.registrationDate),
              doc : obj,
              user : req.user,
              locations:location_to,
              items:items,
              history : history

            }

          }
          
        } else {
          console.log("ERROR");
        }
      }

      console.log(obj)

      data.secondary_data = secondary_data;
      data.registrationDate = generalFunctions.formatDateTime(obj.registrationDate);
      data.status = obj.status;
      
      if (type && id) {
        if (type == "docs") {
          data.registrationDate = generalFunctions.formatDate(obj.registrationDate);
          if(obj.edited == 1 || obj.next !== '-'|| obj.sealed == 1){
            res.render(path_constants.pages.view.view('doc-locked'), data);
          }
          else{
            res.render(path_constants.pages.view.view('doc'), data);
          }
          
        }
        else if (type == "items") {
          res.render(path_constants.pages.view.view('items'), data);
        }
        else if (type == "transfers") {
          res.render(path_constants.pages.view.view('transfers'), data);
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
    console.log("ViewRoutes1");
    
    var obj_type = req.body.obj_type;
    var obj_id = req.body.obj_id;
    var type2 = req.body.obj_type2;

    var data = req.body;
    data.user = req.user;

    await generalFunctions.update({ _id: req.body.obj_id }, obj_type, data);   

    if(obj_type == 'nodes'){
      return res.redirect(`/list?searchfor=clients`);
    }
    if(type2){
      //return res.redirect(`/view?type=${obj_type}&id=${obj_id}&type2=${type2}`);
      return res.redirect(`/list?searchfor=${obj_type}&type2=${type2}`);

    }
    else{
      return res.redirect(`/list?searchfor=${obj_type}`);
      //return res.redirect(`/view?type=${obj_type}&id=${obj_id}`);
    }

  } catch (e) {
    console.error(e);
    return res.redirect("/error?origin_page=/&error=" + encodeURIComponent(e.message));
  }
});

router.post("/transfers", Authentication.checkAuthenticated, async (req, res) => {
  try {

    console.log("TransferRoutes Post");
    const lines_of_doc = [];
    for (let i = 0; i < req.body.count; i++) {
      if (req.body[`item_select_${i}`] !== undefined) {
        lines_of_doc.push({ 
          quantity : req.body[`item_q_${i}`],
          lineItem : req.body[`item_select_${i}`],
          tax : 0,
          discount : 0,
          price_of_unit : 0  
        });
      }
    }
    console.log(lines_of_doc);
    var series = await Series.findOne({my_id:'777',status:1})
    var doc = await generalFunctions.create_doc( {
      company: req.user.company,
      sender: req.user._id,
      receiver: req.body.to_select,
      series: series._id,
      type: 3,
      retail_wholesale: 3,
      warehouse: req.body.from_select,
      generalDiscount: 0,
      invoiceData: lines_of_doc
    })

    var original_doc = await Document.findOne({ _id:req.body.id });

    original_doc.next = doc._id;
    original_doc.edited = 1;

    await original_doc.save();
    
    return res.redirect(`/view?type=transfers&id=${doc._id}`);

  } catch (e) {
    console.error(e);
    return res.redirect("/error?origin_page=/&error=" + encodeURIComponent(e.message));
  }
});


module.exports = router;
