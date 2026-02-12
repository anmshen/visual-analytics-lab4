// The current state for what's selected
let CURRENT = {
  x: "Country/Region",
  y: "Quantity",
  agg: "sum",
};

// Function to reset all filters to "all" (requireemnt 3b)
function reset_filters_toall(){
    // These keys should match your filter dropdown ids + the column name used by Flask
    const filterMap = [
        { selectId: "#countryFilter", key: "Country/Region" },
        { selectId: "#regionFilter",  key: "Region" },
        { selectId: "#stateFilter",   key: "State/Province" },
    ];

    filterMap.forEach(({ selectId }) => {
        const sel = d3.select(selectId);
        if (!sel.empty()) {
        sel.property("value", "All");
        }
    });

  // If your server needs to be told that filters reset, uncomment this:
  // filterMap.forEach(({ key }) => update_filter("All", key)); 
}

d3.csv("/Sample - Superstore.xls", d3.autoType).then(function (data) {
    
    let Xattrs = ["Country/Region", "Region", "State/Province"];
    let Yattrs = ["Quantity", "Sales", "Profit"];
    let Aggattrs = ["sum,", "mean", "variance", "count"];

    d3.select("#xAxisDropdown")
        .on('change', (event) => {
            CURRENT.x = event.target.value;
            reset_filters_toall(); // Reset filters when x-axis changes
            update_aggregate(CURRENT.x, "x"); // Update aggregate with new x-axis
        })
        .selectAll("option")
        .data(Xattrs)
        .join("option")
        .attr("value", (d) => d)
        .text((d) => d);
    d3.select("#xAxisDropdown").property("value", CURRENT.x); // Set default value
    
    d3.select("#yAxisDropdown")
        .on('change', (event) => {
            CURRENT.y = event.target.value;
            reset_filters_toall(); // Reset filters when y-axis changes
            update_aggregate(CURRENT.y, "y"); // Update aggregate with new y-axis
        })
        .selectAll("option")
        .data(Yattrs)
        .join("option")
        .attr("value", (d) => d)
        .text((d) => d);
    d3.select("#yAxisDropdown").property("value", CURRENT.y); // Set default value
    
    d3.select("#aggAxisDropdown")
        .on('change', (event) => {
            CURRENT.agg = event.target.value;
            reset_filters_toall(); // Reset filters when agg dropdown changes
            update_aggregate(CURRENT.agg, "agg");
        })
        .selectAll("option")
        .data(Aggattrs)
        .join("option")
        .attr("value", (d) => d)
        .text((d) => d);
    d3.select("#aggDropdown").property("value", CURRENT.agg);

    // Initial drawing of the bar chart
    update_aggregate(null, null);
    });



// TODO: write the function to update all filter options
function update_filter_options(group_filters){

}


// TODO: write the function to draw the bar chart
function draw_bar(data, x_column, y_column){
    

}

function update_aggregate(value, key){    
    fetch('/update_aggregate', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({value: value, key: key}),
        cache: 'no-cache',
        headers: new Headers({
            'content-type': 'application/json'
        })

        
    }).then(async function(response){
        var results = JSON.parse(JSON.stringify((await response.json())))
        // TODO: extract the necessary data from the results and re-draw the bars
        // ...
        // draw_bar(...)

    })
}

function update_filter(value, key){
    fetch('/update_filter', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({value: value, key: key}),
        cache: 'no-cache',
        headers: new Headers({
            'content-type': 'application/json'
        })
    }).then(async function(response){
        var results = JSON.parse(JSON.stringify((await response.json())))
        // TODO: extract the necessary data from the results, re-draw the bars, and update the filters
        // ...
        // update_filter_options(...)
        // draw_bar(...)
    })
}

margin = {top: 30, right: 30, bottom: 70, left: 80},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

svg = d3.select("#plot-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "plot")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

update_aggregate(null, null)