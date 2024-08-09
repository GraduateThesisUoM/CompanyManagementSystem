const express = require("express");
const router = express.Router();

const path_constants = require('../../constantsPaths');


//Models
const Company  = require(path_constants.schemas.two.company);
const Notification = require(path_constants.schemas.two.notification);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);


//Authentication Functions
const Authentication = require("../../AuthenticationFunctions");
//Get General Functions
const generalFunctions = require("../../GeneralFunctions");

/*--------   ADMIN - USER PROFILE*/
router.get('/', Authentication.checkAuthenticated, async (req,res)=>{
    try{
        if(generalFunctions.checkAccessRigts(req,res)){
            var company = "";
            var doc_data = {
                company : '',
                doc : '',
                series: '',
                person1: '',
                doc_line_num :0

            };
            if(req.user.type != 'admin'){
                company = req.user.company

            }
            var list_items = [];
            var column_titles = [];
            if(req.query.searchfor == "companys"){
                list_items = await Company.find();
                list_items = list_items.map(item => ({
                    data :[ item.name, formatDate(item.registrationDate), item.status]
                }));
                column_titles = ["Name", "Reg Date","Status"]
            }
            else if (req.query.searchfor == "users"){
                list_items = await User.find();
                list_items = list_items.map(item => ({
                    data :[ item.firstName,item.lastName, formatDate(item.registrationDate), item.account_status]
                }));
                column_titles = ["First Name","Last Name","Reg Date","Status"]
            }
            else if (req.query.searchfor == "items"){
                
                list_items = await Item.find({companyID : company});

                list_items = list_items.map(item => ({
                    data :[ item.title,item.description, formatDate(item.registrationDate), item.active, item.price_r, item.price_w, item.discount_r, item.discount_w]
                }));
                column_titles = ["Title","Description","Reg Date","Status","Prece Retail","Discount Retail","Prece Wholesale","Discount Wholesale"]
            }
            else if (req.query.searchfor == "docs"){
                list_items = await Document.find({company : company,type:req.query.type});
                var list_series = await Series.find({companyID : company,type:req.query.type});
                var person_type = 'supplier'
                if(req.query.type == 'sale'){
                    person_type = 'customer'
                }
                var list_persons = await Person.find({company : company,type:req.query.type});

                const seriesMap = new Map(list_series.map(series => [series._id.toString(), series.acronym]));
                const personsMap = new Map(list_persons.map(person => [person._id.toString(), `${person.firstName} ${person.lastName}`]));


                list_items = list_items.map(item => ({
                    data: [item._id,`${seriesMap.get(item.series.toString())}-${item.doc_num}`,formatDate(item.registrationDate),personsMap.get(item.receiver.toString())]
                }));
                column_titles = ["ID","Doc", "Reg Date",person_type]
                if(req.query.printdoc){
                    var document = await Document.findOne({_id: req.query.printdoc});
                    var series = await Series.findOne({_id: document.series});
                    if(series.sealed == 1){
                        document.sealed = 1;
                        await document.save();
                    }
                    
                    doc_data = {
                        company : await Company.findOne({_id: company}),
                        doc : document,
                        series : series.acronym,
                        person1 : await Person.findOne({_id: document.receiver}),
                        doc_line_num :document.invoiceData.length
                    }
                }
            }
            else if (req.query.searchfor == "warehouses"){
                list_items = await Warehouse.find({companyID : company});
                list_items = list_items.map(item => ({
                    data :[ item._id,item.title, item.location, formatDate(item.registrationDate), item.active]
                }));
                column_titles = ["ID","Title","location", "Reg Date","Status"]
            }else if (req.query.searchfor == "series"){
                list_items = await Series.find({companyID : company,type:req.query.type});
                list_items = list_items.map(item => ({
                    data :[ item._id,item.title, item.acronym,item.type,item.count,item.sealed, formatDate(item.registrationDate), item.active]
                }));
                column_titles = ["ID","Title","Acronym","Type","Count","Sealed", "Reg Date","Status"]
            }
            else if (req.query.searchfor == 'persons'){
                list_items = await Person.find({company : company,type:req.query.type});
                list_items = list_items.map(item => ({
                    data :[ item._id,item.type, item.firstName, item.lastName, item.email, item.phone, item.afm, item.account_status, formatDate(item.registrationDate)]
                }));
                column_titles = ["ID","Type","firstName","lastName","email","phone", "afm","Status", "Reg Date"];
            }
        
            var data = {
                user: req.user,
                list_items : list_items,
                notification_list: await Notification.find({$and:[{user_id: req.user._id} , {status: "unread"}]}),
                column_titles : column_titles,
                searchfor : req.query.searchfor,
                doc_data :doc_data
            };
            res.render(path_constants.pages.list.view(), data)
          }
          else{
            res.redirect('/error?origin_page=my-company&error=acces denid');
          }
    }
    catch (err) {
        console.error('Error loading user page:', err);
        res.redirect('/error?origin_page=list&error=' + err);
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

async function getSeriesIndexById(seriesPromise, id) {
    try {
      // Await the promise to get the list of series
      var list_series = await seriesPromise;
      
      // Find the index of the series with the matching ID
      const index = list_series.findIndex(series => series._id === id);
      
      // Return the index, or -1 if not found
      return index;
    } catch (error) {
      console.error('Error fetching series:', error);
      return -1; // Indicate an error occurred
    }
  }


module.exports = router;