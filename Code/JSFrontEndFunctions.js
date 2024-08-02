function print_form(){
    alert('ff')
    var iframe = document.getElementById('print-frame');
    var doc = iframe.contentWindow.document;

    var form = `
        <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="cache-control" content="no-cache"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="-1">
                <title>Title</title>
                <style>

                    #type {
                        background-color: black;
                        width: 100%;
                        text-indent: 20px;
                        font-size: 40px;
                        font-weight: bold;
                        color: white;
                        margin-top: 50px;
                    }

                    #doc_num {
                        text-align: right;
                        display: flex;
                        justify-content: right;
                        align-items: center;
                    }
                    #doc_num > span {
                        margin-right: 20px;
                    }
                    table {
                        border-collapse: collapse;
                        border: 2px solid rgb(140, 140, 140);
                        width: 99%;
                    }
                    th, td {
                        border-collapse: collapse;
                        border: 2px solid rgb(140, 140, 140);
                        text-align: center;
                    }
                    table > tbody > tr > td> div{
                        display: grid;
                        grid-template-columns: 70% 30%;
                    }
                    header{
                        display: grid;
                        grid-template-columns: 40% 60% ;
                    }
                    header > div{
                        width: 100%;
                        font-size: 20px;
                        margin-top: 50px;
                    }
                    body{
                    margin: 0px;
                    padding: 0px;
                    }

                    hr {
                        width:50%;
                            border: none;
                            height: 1.5px; /* Thickness of the line */
                            background-color: black; /* Color of the line */
                            margin: 10px 0; /* Space around the line */
                        }
                    #persons_data{
                        display:grid;
                        grid-template-columns: 50% 50%;
                    }
                    #persons_data>div>div{
                        display:grid;
                        grid-template-columns: 50% 50%;
                    }
                </style>
            </head>
  
            <body>
                <header>
                    <div id="type">Invoice</div>
                    <div id="doc_num">No. <span>9999</span></div>
                </header>
                <div>Company Name</div>
                <hr>
                <div>DD/MM/YYY</div>
                <div id="persons_data">
                    <div>
                        <div>Bill To</div>
                        <div>
                            <div>Customer Name</div>
                            <div>Name</div>
                            <div>Email :</div>
                            <div>xxx@xxx.com</div>
                            <div>Vat :</div>
                            <div>999 999 999</div>
                            <div>phone :</div>
                            <div>222 333 22</div>
                        </div>
                    </div>
                    <div>
                        <div>Bill To</div>
                        <div>
                            <div>Customer Name</div>
                            <div>Name</div>
                            <div>Email :</div>
                            <div>xxx@xxx.com</div>
                            <div>Vat :</div>
                            <div>999 999 999</div>
                            <div>phone :</div>
                            <div>222 333 22</div>
                        </div>
                    </div>
                </div>
                <table>
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
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>title</td>
                            <td>1</td>
                            <td>&nbsp;%</td>
                            <td>0&nbsp;€</td>
                            <td>0&nbsp;%</td>
                            <td>95</td>
                            <td>95</td>
                            <td>90</td>
                            <td>100</td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <div>wholesale / retail</div>
                    <div> Total Value : <span id="total_value">0.00</span> €</div>
                    <div> Total Discounts : <span id="total_disc">0.00</span> €</div>
                    <div> Total Price after Discounts : <span id="total_after_disc">0.00</span> €</div>
                    <div> Total Price after Tax : <span id="total_after_Tax">0.00</span> €</div>
                    <br>

                    <div>Discount : <span>0.00</span> %</div>
                    <div>Discount Amount: <span>0.00</span> €</div>
                    <div> Total Cost : <span id="total_cost">0.00</span> €</div>

                </div>
            </body>`;
    doc.open();
    doc.write(form);
    doc.close();

    // Trigger the print dialog
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
}