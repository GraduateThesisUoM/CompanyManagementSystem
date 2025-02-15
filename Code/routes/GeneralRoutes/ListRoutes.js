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
const Company = require(path_constants.schemas.two.company);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);
const Node = require(path_constants.schemas.two.node);
const Review = require(path_constants.schemas.two.review);


/*--------   ADMIN - USER PROFILE*/
router.get("/", Authentication.checkAuthenticated, async (req, res) => {
  try {
    console.log("ListRoutes")
    const access = generalFunctions.checkAccessRigts(req, res);
    if (access.response) {
      var company = "";
      var doc_data = {
        company: "",
        doc: "",
        series: "",
        person1: "",
        doc_line_num: 0,
      };
      if (req.user.type != "admin") {
        company = req.user.company;
      }
      var list_items = [];
      var column_titles = [];
      if (req.query.searchfor == "companies") {
        list_items = await Company.find();
        list_items = list_items.map((item) => ({
          data: [item.id,item.name, generalFunctions.formatDate(item.registrationDate), generalFunctions.get_status_user(item.status)],
        }));
        column_titles = ["ID","Name", "Reg Date", "Status"];
      } else if (req.query.searchfor == "users") {
        list_items = await User.find();
        list_items = list_items.map((item) => ({
          data: [
            item._id,
            item.firstName,
            item.lastName,
            generalFunctions.formatDate(item.registrationDate),
            generalFunctions.get_status_user(item.status)
          ],
        }));
        column_titles = ["ID", "First Name", "Last Name", "Reg Date", "Status"];
      } else if (req.query.searchfor == "docs") {
        list_items = await Document.find({
          company: company,
          type: req.query.type,
          edited : 0
        });
        var list_series = await Series.find({
          company: company,
          type: req.query.type,
        });
        var person_type = "Supplier";
        if (req.query.type == 1) {//sale
          person_type = "Customer";
        }
        var list_persons = await Person.find({
          company: company,
          type: req.query.type,
        });

        const seriesMap = new Map(
          list_series.map((series) => [series._id.toString(), series.acronym])
        );
        const personsMap = new Map(
          list_persons.map((person) => [
            person._id.toString(),
            `${person.firstName} ${person.lastName}`,
          ])
        );

        list_items = list_items.map((item) => ({
          data: [
            item._id,
            `${seriesMap.get(item.series.toString())}-${item.doc_num}`,
            generalFunctions.formatDate(item.registrationDate),
            personsMap.get(item.receiver.toString()),
          ],
        }));
        column_titles = ["ID", "Doc", "Reg Date", person_type];
        if (req.query.printdoc) {
          var document = await Document.findOne({ _id: req.query.printdoc });

          var series = await Series.findOne({ _id: document.series });
          if (series.sealed == 1) {
            document.sealed = 1;
            await document.save();
          }

          doc_data = {
            company: await Company.findOne({ _id: company }),
            doc: document,
            series: series.acronym,
            person1: await Person.findOne({ _id: document.receiver }),
            doc_lines: Object.values(document.invoiceData)
          };
        }
      } else if (req.query.searchfor == "Warehouse") {
        list_items = await Warehouse.find({ company: company });
        console.log(list_items)
        list_items = list_items.map((item) => ({
          data: [
            item._id,
            item.title,
            item.location,
            generalFunctions.formatDate(item.registrationDate),
            generalFunctions.get_status_user(item.status)
          ],
        }));
        column_titles = ["ID", "Title", "location", "Reg Date", "Status"];
      } else if (req.query.searchfor == "series") {
        list_items = await Series.find({
          company: company,
          type: req.query.type,
        });
        list_items = list_items.map((item) => ({
          data: [
            item._id,
            item.title,
            item.acronym,
            //item.type,
            item.count,
            item.sealed,
            generalFunctions.formatDate(item.registrationDate),
            item.status,
          ],
        }));
        column_titles = [
          "ID",
          "Title",
          "Acronym",
          //"Type",
          "Count",
          "Sealed",
          "Reg_Date",
          "Status",
        ];
      } else if (req.query.searchfor == "persons") {
        list_items = await Person.find({
          company: company,
          type: req.query.type,
        });
        list_items = list_items.map((item) => ({
          data: [
            item._id,
            item.firstName,
            item.lastName,
            item.email,
            item.phone,
            item.afm,
            generalFunctions.get_status_user(item.status),
            generalFunctions.formatDate(item.registrationDate),
          ],
        }));
        column_titles = [
          "ID",
          "firstName",
          "lastName",
          "email",
          "phone",
          "afm",
          "Status",
          "Reg Date",
        ];
      } else if (req.query.searchfor == "items") {
        list_items = await Item.find({ company: company
          ,type: req.query.type
         });
        list_items = list_items.map((item) => ({
          data: [
            item._id,
            item.title,
            generalFunctions.formatDate(item.registrationDate),
            total_price(item.price_r, item.discount_r, item.tax_r),
            total_price(item.price_w, item.discount_w, item.tax_w),
            generalFunctions.get_status_user( item.status)
          ],
        }));
        column_titles = [
          "ID",
          "Title",
          "Reg Date",
          "Price Retail",
          "Price Wholesale",
          "Status",
        ];
      }else if(req.query.searchfor == "clients"){
        list_items = await clientAccountantFunctions.fetchClients(req.user._id,'all');
        console.log(list_items)
        list_items = list_items.map((client) => ({
          data: [
            client._id,
            client.name
          ],
        }));
        column_titles = [
          "ID",
          "Title"
        ]
      }else if(req.query.searchfor == "reports"){
      var list_items = await Node.find({type:7});
      
      list_items = list_items.map((report) => ({
        data: [
          report._id,
          generalFunctions.formatDate(report.registrationDate),
          generalFunctions.get_type2(report.type2),
          generalFunctions.get_status(report.status)
        ],
      }));
      column_titles = [
        "ID",
        "Date",
        "Title",
        "Status"
      ]
      }else if(req.query.searchfor == "requests"){
        var list_items = await Node.find({type:3,sender_id : req.user._id});
        
        list_items = list_items.map((report) => ({
          data: [
            report._id,
            generalFunctions.formatDate(report.registrationDate),
            generalFunctions.get_type2(report.type2),
            generalFunctions.get_status(report.status)
          ],
        }));
        column_titles = [
          "ID",
          "Date",
          "Type",
          "Status"
        ]
      }else if(req.query.searchfor == "reviews"){
        var person_title;
        if(req.user.type == 'user'){
          var list_items = await Review.find({reviewer_id: req.user._id});
          person_title = "Reviewed";
        }
        else{
          var list_items = await Review.find({reviewed_id: req.user._id});
          person_title = "Reviewer";
        }
        
        list_items = await Promise.all(
          list_items.map(async (review) => {
            var client;
            if(req.user.type == 'user'){
              client = await User.findOne({ _id: review.reviewed_id });
            }
            else{
              client = await User.findOne({ _id: review.reviewer_id });
            }
            
            const company = await Company.findOne({ _id: review.company });
        
            return {
              data: [
              review._id,
              company.name,
              generalFunctions.formatDate(review.registrationDate),
              `${client.firstName} ${client.lastName}`,
              review.rating,
              review.text.length > 10 ? review.text.substring(0,10) + "..." : review.text,
              ],
            };
          })
        );
             
        column_titles = [
          "ID",
          "Client",
          "Date",
          person_title,
          "Rating",
          "Comments"
        ]
      }
    

      var data = {
        user: req.user,
        list_items: list_items,
        column_titles: column_titles,
        searchfor: req.query.searchfor,
        doc_data: doc_data,
      };
      res.render(path_constants.pages.list.view(), data);
    }
    else{
        res.redirect('/error?error='+access.error);
      }
  } catch (err) {
    console.error("Error :", err);
    res.redirect("/error?error=" + err);
  }
});

router.post("/", Authentication.checkAuthenticated, async (req, res) => {
  console.log("List Post")
  try {
    var has_type = ``;
    if(req.query.type){
      has_type = `&type=${req.query.type}`;
    }
    
    if(req.body.list_action == 2 || req.body.list_action == 0 || req.body.list_action == 1){
      await generalFunctions.delete_deactivate({ _id: req.body.list_id }, req.query.searchfor, req.body.list_action);
    }
    if(req.body.list_action == 'filter'){
      console.log("filter");
      console.log(req.body.list_filters_input);
      return res.redirect(`/list?searchfor=${req.query.searchfor}`+has_type+"&filter="+req.body.list_filters_input);
    }
    

    return res.redirect(`/list?searchfor=${req.query.searchfor}`+has_type);

  } catch (e) {
    console.error(e);
    return res.redirect('/error?origin_page=/&error=' + encodeURIComponent(e.message));
}
});


const total_price = (price, discount, tax) => {
  var total = price - discount;
  return total + total * (tax / 100);
};

async function getSeriesIndexById(seriesPromise, id) {
  try {
    // Await the promise to get the list of series
    var list_series = await seriesPromise;

    // Find the index of the series with the matching ID
    const index = list_series.findIndex((series) => series._id === id);

    // Return the index, or -1 if not found
    return index;
  } catch (error) {
    console.error("Error fetching series:", error);
    return -1; // Indicate an error occurred
  }
}

module.exports = router;
