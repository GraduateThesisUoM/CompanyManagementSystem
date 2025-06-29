function create_form(data) {
    console.log("create_form_body")
    console.log(data.type)
    if (data.type == 1) {
        return '<div style="padding:0px 50px;">' + create_form_body(data) + '</div>'
    }
    else if (data.type == 2) {

        return '<div style="padding:0px 50px;">' + create_form_body_transfer_doc(data) + '</div>'
    }
}

function create_form_body(data) {
    let body = '';
    console.log("create_form_body")
    console.log(data.type)
    let rows_written = 0;
    var create_doc_table_var;
    console.log(data.doc_lines.length)
    while (rows_written < data.doc_lines.length) {
        create_doc_table_var = create_doc_table(data.doc_lines, rows_written, data.type);
        body = body + create_header(data) + `
        <div class="main_body" style="display: flex; flex-direction: column; height: calc(80%-200px); margin: 10px; flex: 1; ">
            <div>${data.date}</div>
            <div id="persons_data" style="display: grid; grid-template-columns: 49% 49%; gap: 2%; margin-bottom: 20px;">
                <div>${create_doc_person(true, 'Bill To', 'Customer', data.person1)}</div>
                <div>${create_doc_person(false, 'Bill From', 'Company', data.company)}</div>
            </div>
            <div class="container" style="flex: 1;">
                ${create_doc_table_var.table}
            </div>
            ${create_doc_footer(data.doc, data.type)}
        </div>`;

        rows_written = create_doc_table_var.rows_written;

        //************** */
        //rows_written = data.total_doc_rows;
    }
    return body;
}


function create_form_body_transfer_doc(data) {
    let body = '';
    let rows_written = 0;
    var create_doc_table_var;
    var person_data = ``;
    if (data.type == 1) {
        person_data =
            `<div id="persons_data" style="display: grid; grid-template-columns: 49% 49%; gap: 2%; margin-bottom: 20px;">
                <div>${create_doc_person(true, 'Bill To', 'Customer', data.person1)}</div>
                <div>${create_doc_person(false, 'Bill From', 'Company', data.company)}</div>
            </div>`
    }
    else if (data.type == 2) {//Transfer Doc
        person_data =
            `<div id="persons_data" style="display: grid; grid-template-columns: 49% 49%; gap: 2%; margin-bottom: 20px;">
        <div>FROM : ${data.from.title}</div>
        <div>TO : ${data.to.title}</div>
    </div>`
    }

    while (rows_written < data.doc_lines.length) {
        create_doc_table_var = create_doc_table(data.doc_lines, rows_written, data.type);
        body += create_header(data) + `
        <div class="main_body" style="display: flex; flex-direction: column; height: calc(80%-200px); margin: 10px; flex: 1; ">
            <div>${data.date}</div>
            ${person_data}
            <div class="container" style="flex: 1;">
                ${create_doc_table_var.table}
            </div>
            ${create_doc_footer(data.doc, data.type)}
        </div>`;

        rows_written = create_doc_table_var.rows_written;

        //************** */
        //rows_written = data.total_doc_rows;
    }
    return body;
}

function create_header(data) {

    let docType = data.type == 1 ? 'Invoice' : 'Transfer Document';
    return `
    <div class='doc_header' style='height: calc(20%+50px);padding-top:50px'>
        <div style="display:flex;justify-content:space-between">
            <img style="height: auto; width: 150px; object-fit: cover; margin-bottom: 10px;" id="company_logo" src="${data.company.logo}" alt="Company Logo">
            <p style="text-align:center;font-weight:bold;font-size:1.5em;">Company Name</p>
        </div>
        <div style="display: grid; grid-template-columns: auto auto; margin: 0; padding: 0";>
            <div id="type" style='background-color: black !Important;width: 100%;text-indent: 20px;font-size: 40px; font-weight: bold; color: white; margin: 0;'>${docType}</div>
            <div id="doc_num" style="text-align: right;display: flex;justify-content: right;align-items: center;margin: 0";>No. <span style='margin-right: 20px;'>${data.series}${data.doc.doc_num}</span></div>
        </div>
    </div>`;
}

function create_doc_table(data, rows_written, type) {
    var brake_page = 20 + rows_written;
    console.log("brake_page " + brake_page)
    console.log("type " + type)
    console.log(data)
    var table = `<table style="border-collapse: collapse;width:100%">
            <thead>
                <tr>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">A/A</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Title</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Qty</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Tax</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Discount</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Discount %</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">U/P</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Value</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Price After Disc.</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Final Price</th>
                </tr>
            </thead>
            <tbody>`;
            if (type == 2) {
        table = `<table style="border-collapse: collapse;width:100%">
            <thead>
                <tr>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">A/A</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Title</th>
                    <th style="border:solid black 1px;margin:0px;padding:0px; text-align: center;">Quantity</th>
                </tr>
            </thead>
            <tbody>`;

        for (let i = rows_written; i < data.length; i++) {
            let line = data[i];

            table += `
                        <tr>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${i + 1}</td>
                            <td style="border: solid black 1px; padding: 0px;">${line.item.title}</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${line.quantity}</td>
                        </tr>`;

            rows_written += 1;

            if (i === brake_page) {
                break;
            }
        }
    }
    else {

        for (let i = rows_written; i < data.length; i++) {
            let line = data[i];

            let value = line.quantity * line.price_of_unit;
            let disc_p = ((line.discount * 100) / value).toFixed(2); // Discount percentage rounded to 2 decimals
            let p_after_d = value - line.discount;
            let final_p = p_after_d + (p_after_d * (line.tax / 100));

            table += `
                        <tr>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${i + 1}</td>
                            <td style="border: solid black 1px; padding: 0px;">${line.item.title}</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${line.quantity}</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${line.tax}&nbsp;%</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${parseFloat(line.discount).toFixed(2)}&nbsp;€</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${disc_p}&nbsp;%</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${parseFloat(line.price_of_unit).toFixed(2)}&nbsp;€</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${parseFloat(value).toFixed(2)}&nbsp;€</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${parseFloat(p_after_d).toFixed(2)}&nbsp;€</td>
                            <td style="border: solid black 1px; padding: 0px; text-align: center;">${parseFloat(final_p).toFixed(2)}&nbsp;€</td>
                        </tr>`;

            rows_written += 1;

            if (i === brake_page) {
                break;
            }
        }
    }


    table = table + `</tbody></table>`;
    return { table: table, rows_written: rows_written };
}

function create_doc_footer(doc, type) {
    if (type == 1) {
        let total_cost = 0;
        let total_value = 0;
        let total_d = 0;
        let total_price_after_t = 0;


        for (let i = 0; i < Object.keys(doc.invoiceData).length; i++) {
            const value = doc.invoiceData[i].quantity * doc.invoiceData[i].price_of_unit;
            const p_after_d = value - doc.invoiceData[i].discount;
            const final_p = p_after_d + (p_after_d * (doc.invoiceData[i].tax / 100));

            total_value += value;
            total_d += doc.invoiceData[i].discount;
            total_price_after_t += final_p;
        };

        const total_price_after_d = total_value - total_d;
        const total_d_p = (doc.generalDiscount * 100) / total_price_after_t;
        total_cost = total_price_after_t - doc.generalDiscount;

        return `
        <br>
    
        <div class='from_footer' style="margin: 10px 0px; text-align: left; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; height: 150px; width: calc(100%-60px);">
            <div>
                <div>Total Value: ${parseFloat(total_value).toFixed(2)} €</div>
                <div>Total Disc.: ${parseFloat(total_d).toFixed(2)} €</div>
                <div style='font-weight:bold'>Total Cost: ${parseFloat(total_cost).toFixed(2)} €</div>
            </div>
            
            <div>
                <div>Total Price after Dis.: ${parseFloat(total_price_after_d).toFixed(2)} €</div>
                <div>Disc. ON TOP: ${parseFloat(total_d_p).toFixed(1)} %</div>
            </div>

            <div>
                <div>Total Price after Tax: ${parseFloat(total_price_after_t).toFixed(2)} €</div>
                <div>Disc. Amount ON TOP: ${parseFloat(doc.generalDiscount).toFixed(2)} €</div>
            </div>
        </div>`;
    }
    else if (type == 2) {
        return `
        <br>
    
        <div class='from_footer' style="color:white;margin: 10px 0px; text-align: left; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; height: 150px; width: calc(100%-60px);">
            <div>
                <div>.</div>
                <div>.</div>
                <div .</div>
            </div>
            
            <div>
                <div>.€</div>
                <div>.</div>
            </div>

            <div>
                <div>.</div>
                <div>.</div>
            </div>
        </div>`;
    }
}

function create_doc_person(client, header, person_title, data) {
    if (client) {
        return `<div>${header}</div>
        <div style="display: grid; grid-template-columns: 50% 50%;">
            <div>${person_title} Name</div>
            <div>${data.firstName} ${data.lastName}</div>
            <div>Email:</div>
            <div>${data.email || 'no email'}</div>
            <div>VAT:</div>
            <div>${data.afm || 'no AFM'}</div>
            <div>Phone:</div>
            <div>${data.phone || 'no phone'}</div>
        </div>`;
    }
    return `<div>${header}</div>
    <div style="display: grid; grid-template-columns: 50% 50%;">
        <div>${person_title} Name</div>
        <div>${data.name}</div>
        <div>Email:</div>
        <div>${data.email || 'no email'}</div>
        <div>AFM:</div>
        <div>${data.afm || 'no AFM'}</div>
        <div>Phone:</div>
        <div>${data.phone || 'no phone'}</div>
    </div>`;
}

function print_form(data) {
    console.log(data)
    var iframe = document.getElementById('print-frame');
    var doc = iframe.contentWindow.document;

    //var form = create_form(data);
    var form = create_form(data)
    doc.open();
    doc.write(form);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
}
function formatDate(date) {
    // Ensure the input is a valid Date object
    if (!(date instanceof Date)) {
        throw new Error('Invalid date object');
    }

    // Extract day, month, year, hours, and minutes
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Format into DD/MM/YYYY HH:MM
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function get_today() {
    const today = new Date();

    // Convert to Athens time zone
    const options = { timeZone: 'Europe/Athens' };
    const athensDate = new Date(today.toLocaleString('en-US', options));

    // Extract components
    const year = athensDate.getFullYear();
    const month = String(athensDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(athensDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(dateString) {
    // Parse the input date string
    const inputDate = new Date(dateString);

    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = inputDate.getDay();

    // Calculate the difference to the first day of the week (Monday)
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

    // Get the first day of the week
    const firstDayOfWeek = new Date(inputDate);
    firstDayOfWeek.setDate(inputDate.getDate() - diffToMonday);

    // Return just the day of the month
    return firstDayOfWeek.getDate();
}

function get_item_from_list(list, id) {
    for (l of list) {
        if (l._id == id) {
            return l;
        }
    }
    return 'not found'
}

function go_back(url) {
    //alert(url)
    const path = new URL(url).pathname; // Extract the path (e.g., "/view")

    if (path.includes('view')) {
        return '/list';
    } else {
        return '/';
    }
}

const dictionary = {
    EN: {
        home: "Home",
        companies: "Companies",
        users: "Users",
        reports: "Reports",
        database: "DataBase",
        client: "Client",
        clients: "Clients",
        payroll: "PayRoll",
        buying: "Buying",
        sales: "Sales",
        warehouse: "Warehouse",
        calendar: "Calendar",
        person: "Person",
        persons: "Persons",
        submit: "Submit",
        save: "Save",
        manager: "Manager",
        view: "View",
        list: "List",
        series: "Series",
        items: "Items",
        docs: "Docs",
        transfers: "Transfers",
        profile: "Profile",
        company: "Company",
        welcome: "Welcome",
        reviews: "Reviews",
        report: "Report",
        logout: "Log Out",
        management: "Management",
        accountantmainpage: "Accountant main page",
        pending: "Pending",
        Requests: "Requests",
        pendingrequests: "Pending Requests",
        type: "Type",
        title: "Title",
        registrationdate: "Registration Date",
        duedate: "Due Date",
        executedrequests: "Executed Requests",
        youhavenopendingrequestsatthemoment: "You have no pending requests at the moment",
        youhavenoexecutedrequestsatthemoment: "You have no executed requests at the moment",
        rejectedrequests: "Rejected Requests-",
        youhavenorejectedrequestsatthemoment: 'You have no rejected requests at the moment',
        pickmanager: "Pick Manager",
        year: "Year",
        warehouses: "Warehouses"
    }
}

function get_word(data) {
    return dictionary[data.lang]?.[data.key] || data.key;
}

function translateTextElements() {
    $(".text_function").each(function () {
        let key = $(this).text().trim().toLowerCase().replace(/\s+/g, ""); // Remove spaces
        let translatedText = get_word({ lang: "EN", key: key });
        $(this).text(translatedText); // Replace text
    });
}

// The original message_from_url function
function message_from_url(url) {
    // Extract query parameters from URL string
    const fullUrl = new URL(url, window.location.origin);
    const queryParams = new URL(url).searchParams;
    const message = queryParams.get('message');
    const action = queryParams.get('action');
    if (fullUrl.pathname == '/list') {
        if (message) {
            if (action) {
                if (action == 2) {
                    if (message == '1') {//Delete complete
                        alert('Delete Complete');
                    }
                    else if (message == '2') {//Delete Fail
                        alert('Delete Failed');
                    }
                }
            }
        }
    }
    if (fullUrl.pathname == '/view') {
        if (message) {
            if (action) {
                if (action == 2) {
                    if (message == '1') {//Delete complete
                        alert('Delete Complete');
                    }
                    else if (message == '2') {//Delete Fail
                        alert('Delete Failed');
                    }
                }
            }
        }
    }
    /*else if(message){
        alert(message);
    }*/
}


