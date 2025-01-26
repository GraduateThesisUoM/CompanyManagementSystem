function new_event(selected_date,user_id){ 
    $('#action').val('new')
  
    const dummys = $('.dummy');

    dummys.eq(0).val(selected_date);
    $("#day_data_input_date").val(selected_date);
    dummys.eq(1).val(selected_date);
    $("#day_data_input_date_to").val(selected_date);

    $("#day_data").show();
    $("#day_data_input_user_id").val(user_id);


    $("#time_table_hours_start").val(0);
    dummys.eq(2).val(0);
    $("#time_table_minutes_start").val(0);
    dummys.eq(3).val(0);

    $("#time_table_hours_end").val(1);
    dummys.eq(4).val(1);
    $("#time_table_minutes_end").val(0);
    dummys.eq(5).val(0);

  return 1;
}

function view_edit_event(id, nodes,users) {
    // Show the event edit/view container
    $("#day_data").show();

    const dummys = $('.dummy');

    // Find the node with the matching ID
    let node = nodes.find(node => node._id === id);
    //let user = users.find(user => user._id === node.receiver_id);

    if (node) {       
        // Populate the inputs with the node's data
        $("#day_data_input_user_id").val(node.user._id);
        $("#day_data_input_node_id").val(id);

        $("#time_table_type_select").val(node.type2);
        $("#time_table_type").val(node.type2);
        

        let selectedDate = formatDate(new Date(node.data.date));
        $("#day_data_input_date").val(selectedDate);
        dummys.eq(0).val(selectedDate);

        dummys.eq(1).hide();

        $("#day_data_users div").each((_, element) => {
            const checkbox = $(element).find("input[type='checkbox']");
            if (checkbox.val() === node.user._id) {
                $(element).show();
                checkbox.hide();
            } else {
                $(element).hide();
            }
        });

        $("#time_table_hours_start").val(String(node.data.hour_start).padStart(2, "0"));
        $("#time_table_minutes_start").val(String(node.data.minutes_start).padStart(2, "0"));
        dummys.eq(2).val(String(node.data.hour_start).padStart(2, "0"));
        dummys.eq(3).val(String(node.data.minutes_start).padStart(2, "0"));

        $("#time_table_hours_end").val(String(node.data.hour_end).padStart(2, "0"));
        $("#time_table_minutes_end").val(String(node.data.minutes_end).padStart(2, "0"));
        dummys.eq(4).val(String(node.data.hour_end).padStart(2, "0"));
        dummys.eq(5).val(String(node.data.minutes_end).padStart(2, "0"));


        $("#time_table_notes").val(node.text);
        dummys.eq(6).val(node.text);

        

    } else {
        // If no matching node is found, provide feedback
        console.error("No event found with ID:", id);
        alert("Event not found.");
    }
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
    return `${year}-${month}-${day}`;
}


function put_dates(calendar_spectrum,date_selected){
    for( d of $(".day")){
        d.innerHTML = '';
    }

    var dates = $("."+calendar_spectrum+"_date");

    $(".day").removeClass('old');
    $(".day").removeClass('now');

    var start = parseInt(date_selected.split('-')[2]);
    var end = 1;
    var startOffset = 0;
    var days_of_month = daysInMonth(date_selected.split('-')[1],2024);
    if(calendar_spectrum=='week'){
        start = getFirstDayOfWeek(date_selected);
        end = 8;
    }
    else if (calendar_spectrum=='month'){
        start = 1;
        startOffset = getMonthStartOffset(date_selected)
        end = days_of_month + startOffset;

        if(startOffset > 4){
            $(".week").eq(6).hide()
        }
        else{
            $(".week").eq(6).show()
        }
    }
    var text = '';
    for(let i=0;i<end;i++){
        if(startOffset > i){
            //text = 'i';
            start = start -1;
            $(dates.get(i)).addClass('old');
        }
        else if (start > days_of_month){
            //text= 'x';
            $(dates.get(i)).addClass('old');
        }
        else{
            //text=start;
            text = "<div class='day_num'>"+start+"</div>";
            $(dates.get(i)).append(text);
            $(dates.get(i)).addClass('now');
            $(dates.get(i)).attr('id', 'add_event_for_' + start);
            //$(dates.get(i)).append("<button id='add_event_for_"+start+"' class='add_event'>+</button>");
            $(dates.get(i)).append("<div class='events_container'></div>");
        }
        
        
        if(start > end - startOffset && calendar_spectrum !='week'){
            start =1;
        }
        start = start + 1;
    }
    
}

function getMonthStartOffset(dateString) {
    // Parse the input date string
    const inputDate = new Date(dateString);

    // Get the year and month from the input date
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);

    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = firstDayOfMonth.getDay();

    // Adjust for Monday as the first day of the week
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}