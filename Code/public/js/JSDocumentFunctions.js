
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
