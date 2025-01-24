
function populateSelect(selectElement,items) {
    selectElement.append('<option class="item_line_option_empty" value="-"></option>');
    items.forEach(function(item) {
        selectElement.append('<option value="' + item._id + '">' + item.title + '</option>');
    });
}

function get_price(index,items){

    if($('#wholesale_retail').val() === "0"){
        return parseFloat(items[index].price_w).toFixed(2);
    }
    return parseFloat(items[index].price_r).toFixed(2);
}



function get_discount(index,items){
    if($('#wholesale_retail').val()==="0"){
        return (items[index].discount_w).toFixed(2);
    }
    else{
        return (items[index].discount_r).toFixed(2);
    }
}




function get_tax(index,items){
    if($('#wholesale_retail').val()==="0"){
        return items[index].tax_w.toFixed(1);
    }
    else{
        return parseFloat(items[index].tax_r).toFixed(1);
    }
}


/*
function calculate_total_cost() {
    var total = 0;
    $('.total_price_of_line').each(function() {
        var linePrice = parseFloat($(this).html()) || 0;
        total += linePrice;
    });
    var disc_amnt = 0
    $('.disc_amnt').each(function() {
        var linedisc = parseFloat($(this).val()) || 0;
        disc_amnt += linedisc;
    });
    
    var after_tax = 0
    $('.final_price_of_line').each(function() {
        var line_after_tax = parseFloat($(this).html()) || 0;
        after_tax += line_after_tax;
    });

    $('#doc_total_value').html(parseFloat(total).toFixed(2));

    $('#doc_total_disc').html(
        (parseFloat(disc_amnt) + parseFloat($("#general_discount_amount").val())).toFixed(2)
    );
    $('#doc_total_after_disc').html(parseFloat(total - disc_amnt).toFixed(2));

    $('#doc_total_after_tax').html(parseFloat(after_tax).toFixed(2));

    var totalCost = after_tax - $('#general_discount_amount').val();


    $('#doc_total_cost').html(parseFloat(totalCost).toFixed(2));
}
*/
/*
function calculate_row_prices(index){
    var quantity = $('#quantity_'+index).val();
    var price_of_unit = parseFloat($('#price_of_unit_'+index).val()).toFixed(2)
    var tax =  parseFloat($('#tax_'+index).val()).toFixed(2)
    var discount = parseFloat($('#discount_'+index).val()).toFixed(2);

    var total = (quantity*parseFloat(price_of_unit).toFixed(2));
    $('#total_price_of_line_'+index).html(parseFloat(total).toFixed(2));

    var total = parseFloat(total) -  parseFloat(discount);
    $('#total_price_of_line_after_disc_'+index).html(parseFloat(total).toFixed(2));

    //var total = total + ( total*(tax/100) );
    var total = parseFloat(total) +  parseFloat(total*(tax/100));
    $('#final_price_of_line_'+index).html(parseFloat(total).toFixed(2));
    //$('#final_price_of_line_'+index).html('ff');

    calculate_total_cost();
}
*/




function get_item_index_from_id(index,items){
    //console.log(items);
    for(let i=0;i<items.length;i++){
        //console.log(items[i]._id + " "+$('#doc_line_item_0').val());
        
        if(items[i]._id == $('#doc_line_item_'+index).val()){
            return i;
        }
    };
}


function retail_wholesale(items) {
    // Iterate over each row in the table
    $('#doc_table tbody tr').each(function(index) {
        console.log(index)//δεν ξέρω γιατί αλλά χωρίς αυτό δεν δουλέυει
        if ($('.doc_line_select').eq(index).val() != "-") {
            console.log(index);
            var itemIndex = get_item_index_from_id(index,items);
            // Update price and discount based on wholesale or retail selection
            put_data_on_row(itemIndex,items);
        }
    });
}


/*
function addNewRow(index,items) {
    $('#num_of_rows').val(index);
    var newRow = `<tr id='row${index}'class='glass_effect_2'>
                        <td>${index + 1}</td>
                        <td class='item_column'>
                            <select id="doc_line_item_${index}" name="doc_line_item_${index}" class="doc_line_select"></select>
                        </td>
                        <td class = 'column'>
                            <div>
                                <input id='quantity_${index}' name='quantity_${index}' class='input' type='number' value=1 min="1" max="100" required><span id='qty_${index}'></span></div></td>
                        <td class = 'column'>
                            <div><input id='tax_${index}' name='tax_${index}' type='number' class='input' min="0" max="100" required><span>&nbsp%</span></div></td>
                        <td class = 'column'>
                            <div><input id='discount_${index}' name='discount_${index}' class='discount input disc_amnt' type='number' min="0" required><span>€</span></div></td>
                        <td class = 'column'>
                            <div><input id='discount_p_${index}' name='discount_p_${index}' class='discount input' type='number' min="0" max="100" required><span>&nbsp%</span></div></td>
                        <td class = 'column'>
                            <div><input id='price_of_unit_${index}' name='price_of_unit_${index}' class='input' type='number' min="0" required><span>€</span></div></td>
                        <td class = 'column'>
                            <div>
                                <div id='total_price_of_line_${index}' name='total_price_of_line_${index}' class='total_price_of_line'></div>
                                <span>&nbsp€</span>
                            </div>
                        </td>
                        <td class = 'column'>
                            <div>
                                <div id='total_price_of_line_after_disc_${index}' name='total_price_of_line_after_disc_${index}' class='total_price_of_line_after_disc'></div>
                                <span>&nbsp€</span>
                            </div>
                        </td>
                        <td class = 'column'>
                            <div>
                                <div id='final_price_of_line_${index}' name='final_price_of_line_${index}' class='final_price_of_line'></div>
                                <span>&nbsp€</span>
                            </div>
                        </td>
                        <td id = 'btn_column'>
                            <button type="button" class="remove_row" disabled>Remove</button>
                        </td>
                    </tr>`;
    $('#doc_table tbody').append(newRow);
    populateSelect($(`#doc_table tbody tr:last .doc_line_select`),items);
    index = index +1
    $('#quantity_'+index).css('visibility', 'hidden');
    $('#tax_'+index).css('visibility', 'hidden');
    $('#discount_'+index).css('visibility', 'hidden');
    $('#discount_p_'+index).css('visibility', 'hidden');
    $('#price_of_unit_'+index).css('visibility', 'hidden');

}*/

function removeRow(index) {
    $("#row"+index).remove()
    calculate_total_cost();
   
    allow_submit();
    let i = 1; // Initialize i
    for (const r of $('.row_aa')) {
        $(r).html(i); // Set the HTML content
        i++; // Increment i
    }
  }
