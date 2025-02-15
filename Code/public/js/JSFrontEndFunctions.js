function create_form(data) {
 
    const css = `
    <style>
        @media print {
            @page {
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
            }
            #print-frame {
                display: none;
            }
        }
        html, body {
            height: 100%;
            margin: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            height: 100%;
            margin: 0;
            padding: 0;
        }
        .main_body {
            display: flex;
            flex-direction: column;
            height: 100%;
            margin: 10px;
            flex: 1;
        }
        #type {
            background-color: black;
            width: 100%;
            text-indent: 20px;
            font-size: 40px;
            font-weight: bold;
            color: white;
            margin: 0;
        }
        #doc_num {
            text-align: right;
            display: flex;
            justify-content: right;
            align-items: center;
            margin: 0;
        }
        #doc_num > span {
            margin-right: 20px;
        }
        table {
            border-collapse: collapse;
            border: 2px solid rgb(140, 140, 140);
            width: 100%;
        }
        th, td {
            border-collapse: collapse;
            border: 2px solid rgb(140, 140, 140);
            text-align: center;
        }
        table > tbody > tr > td > div {
            display: grid;
            grid-template-columns: 70% 30%;
        }
        .doc_header > div {
            display: grid;
            grid-template-columns: 40% 60%;
            margin: 0;
            padding: 0;
        }
        .doc_header > div > div {
            width: 100%;
            font-size: 20px;
            padding: 10px 0;
        }
        hr {
            border: none;
            height: 1px;
            background-color: black;
            margin: 10px 0;
        }
        #persons_data {
            display: grid;
            grid-template-columns: 49% 49%;
            gap: 2%;
            margin-bottom: 20px;
        }
        #persons_data > div > div {
            display: grid;
            grid-template-columns: 50% 50%;
        }
        #company_name {
            margin: 10px;
        }
        #company_logo {
            height: auto;
            width: 150px;
            object-fit: cover;
            margin-bottom: 10px;
        }
        .from_footer {
            margin: 10px 0px;
            text-align: left;
            display: grid;
            grid-template-columns: auto auto auto;
        }
        .container {
            flex: 1;
        }
    </style>`;

    const form = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="cache-control" content="no-cache">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="-1">
        <title>Title</title>
        ${css}
    </head>
    <body>${create_form_body(data)}</body></html>
    `;
    return form;
}

function create_form_body(data) {
    let body = '';
    let rows_written = 0;
    var create_doc_table_var;




    while (rows_written < data.doc_lines.length) {
        create_doc_table_var = create_doc_table(data.doc_lines,rows_written);
        body += create_header(data) + `
        <div class="main_body">
            <div>${data.date}</div>
            <div id="persons_data">
                <div>${create_doc_person(true, 'Bill To', 'Customer', data.person1)}</div>
                <div>${create_doc_person(false, 'Bill From', 'Company', data.company)}</div>
            </div>
            <div class="container">
                ${create_doc_table_var.table}
            </div>
            ${create_doc_footer(data.doc)}
        </div>`;

        rows_written = create_doc_table_var.rows_written;

        //************** */
        //rows_written = data.total_doc_rows;
    }
    return body;
}

function create_header(data) {
    return `
    <div class='doc_header'>
        <img id="company_logo" src="https://static.vecteezy.com/system/resources/previews/008/214/517/non_2x/abstract-geometric-logo-or-infinity-line-logo-for-your-company-free-vector.jpg" alt="Company Logo">
        <div>
            <div id="type">Invoice</div>
            <div id="doc_num">No. <span>${data.series}${data.doc.doc_num}</span></div>
        </div>
    </div>`;
}

function create_doc_table(data,rows_written) {
    var brake_page = 24 + rows_written;
    console.log("brake_page "+brake_page)
    var table =  `<table>
            <thead>
                <tr>
                    <th>A/A</th>
                    <th>Title</th>
                    <th>Qty</th>
                    <th>Tax</th>
                    <th>Discount</th>
                    <th>Discount %</th>
                    <th>U/P</th>
                    <th>Value</th>
                    <th>Price After Discount</th>
                    <th>Final Price</th>
                </tr>
            </thead>
            <tbody>`;
            
            for (let i = rows_written; i < data.length; i++) {
                let line = data[i];
                
                let value = line.quantity * line.price_of_unit;
                let disc_p = ((line.discount * 100) / value).toFixed(2); // Discount percentage rounded to 2 decimals
                let p_after_d = value - line.discount;
                let final_p = p_after_d + (p_after_d * (line.tax / 100));
            
                table += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>Title</td>
                        <td>${line.quantity}</td>
                        <td>${line.tax}&nbsp;%</td>
                        <td>${parseFloat(line.discount).toFixed(2)}&nbsp;€</td>
                        <td>${disc_p}&nbsp;%</td>
                        <td>${parseFloat(line.price_of_unit).toFixed(2)}&nbsp;€</td>
                        <td>${parseFloat(value).toFixed(2)}&nbsp;€</td>
                        <td>${parseFloat(p_after_d).toFixed(2)}&nbsp;€</td>
                        <td>${parseFloat(final_p).toFixed(2)}&nbsp;€</td>
                    </tr>`;
            
                rows_written += 1;
            
                if (i === brake_page) {
                    break;
                }
            }

        table = table + `</tbody></table>`;
    return {table : table,rows_written : rows_written};
}

function create_doc_footer(doc) {
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
    <hr>
    <div class='from_footer'>
        <div>Total Value: ${parseFloat(total_value).toFixed(2)} €</div>
        
        <div>Total Price after Discounts: ${parseFloat(total_price_after_d).toFixed(2)} €</div>

        <div>Total Price after Tax: ${parseFloat(total_price_after_t).toFixed(2)} €</div>
        <div>Discount ON TOP: ${parseFloat(total_d_p).toFixed(1)} %</div>
        <div>Discount Amount ON TOP: ${parseFloat(doc.generalDiscount).toFixed(2)} €</div>

        <div>Total Discounts: ${parseFloat(total_d).toFixed(2)} €</div>

        <div style='font-weight:bold'>Total Cost: ${parseFloat(total_cost).toFixed(2)} €</div>
    </div>`;
}

function create_doc_person(client, header, person_title, data) {
    if (client) {
        return `<div>${header}</div>
        <div>
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
    <div>
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
    var iframe = document.getElementById('print-frame');
    var doc = iframe.contentWindow.document;

    var form = create_form(data);
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

function get_item_from_list(list,id){
    for(l of list){
        if(l._id == id){
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
        return  '/';
    }
  }

