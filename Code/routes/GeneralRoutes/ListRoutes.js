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
const Notification = require(path_constants.schemas.two.notification);
const User = require(path_constants.schemas.two.user);
const Item = require(path_constants.schemas.two.item);
const Person = require(path_constants.schemas.two.person);
const Document = require(path_constants.schemas.two.document);
const Series = require(path_constants.schemas.two.series);
const Warehouse = require(path_constants.schemas.two.warehouse);


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
      if (req.query.searchfor == "companys") {
        list_items = await Company.find();
        list_items = list_items.map((item) => ({
          data: [item.name, formatDate(item.registrationDate), item.status],
        }));
        column_titles = ["Name", "Reg Date", "Status"];
      } else if (req.query.searchfor == "users") {
        list_items = await User.find();
        list_items = list_items.map((item) => ({
          data: [
            item._id,
            item.firstName,
            item.lastName,
            formatDate(item.registrationDate),
            generalFunctions.get_status(item.status)
          ],
        }));
        column_titles = ["ID", "First Name", "Last Name", "Reg Date", "Status"];
      } else if (req.query.searchfor == "docs") {
        list_items = await Document.find({
          company: company,
          type: req.query.type,
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
            formatDate(item.registrationDate),
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
            formatDate(item.registrationDate),
            item.status,
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
            formatDate(item.registrationDate),
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
          "Reg Date",
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
            item.type,
            item.firstName,
            item.lastName,
            item.email,
            item.phone,
            item.afm,
            item.status,
            formatDate(item.registrationDate),
          ],
        }));
        column_titles = [
          "ID",
          "Type",
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
            formatDate(item.registrationDate),
            total_price(item.price_r, item.discount_r, item.tax_r),
            total_price(item.price_w, item.discount_w, item.tax_w),
            item.status,
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
      }

      var data = {
        user: req.user,
        list_items: list_items,
        notification_list: await Notification.find({
          $and: [{ user_id: req.user._id }, { status: "unread" }],
        }),
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
  
  try {
    console.log(req.body.list_id);
    console.log(req.body.list_action);

    if(req.body.list_action == 2 || req.body.list_action == 0){
      await generalFunctions.delete_deactivate({ _id: req.body.list_id }, req.query.searchfor, req.body.list_action);
    }
    var has_type = ``;
    if(req.query.type){
      has_type = `&type=${req.query.type}`;
    }

    return res.redirect(`/list?searchfor=${req.query.searchfor}`+has_type);

  } catch (e) {
    console.error(e);
    return res.redirect('/error?origin_page=/&error=' + encodeURIComponent(e.message));
}
});


const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

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
