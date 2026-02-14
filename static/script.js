// DONE: write the function to update all filter options
function update_filter_options(group_filters){
    
    let countrySel = document.getElementById("Country/Region-filter");
    let regionSel = document.getElementById("Region-filter");
    let stateSel = document.getElementById("State/Province-filter");

    // Update Country filter options
    let currentCountry = countrySel.value;
    countrySel.innerHTML = ''; // clear existing options from the filter

    group_filters["Country/Region"].forEach(function(option) {
        let optionEl = document.createElement("option"); // create a new option in the dropdown
        optionEl.value = option;
        optionEl.text = option;
        countrySel.appendChild(optionEl); // add the option to the dropdown
    });
    // Check if the selected region is still in the newly selected country
    if (group_filters["Country/Region"].includes(currentCountry)) {
        countrySel.value = currentCountry;
    } else {
        countrySel.value = "All";
    }

    // Update Region filter options
    let currentRegion = regionSel.value;
    regionSel.innerHTML = '';

    group_filters["Region"].forEach(function(option) {
        let optionEl = document.createElement("option");
        optionEl.value = option;
        optionEl.text = option;
        regionSel.appendChild(optionEl);
    });
    if (group_filters["Region"].includes(currentRegion)) {
        regionSel.value = currentRegion;
    } else {
        regionSel.value = "All";
    }

    // Update State/Province filter options
    let currentState = stateSel.value;
    stateSel.innerHTML = '';

    group_filters["State/Province"].forEach(function(option) {
        let optionEl = document.createElement("option");
        optionEl.value = option;
        optionEl.text = option;
        stateSel.appendChild(optionEl);
    });
    if (group_filters["State/Province"].includes(currentState)) {
        stateSel.value = currentState;
    } else {
        stateSel.value = "All";
    }
}


// DONE: write the function to draw the bar chart
function draw_bar(data, x_column, y_column){
    // Clear previous chart
    svg.selectAll("*").remove();

    // X scale
    let x = d3.scaleBand()
        .domain(data.map(d => d[x_column]))
        .range([0, width])
        .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");
    
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text(x_column);

    // Y scale
    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[y_column]) || 0])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text(y_column);

    // Draw bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d[x_column]))
        .attr("y", d => y(d[y_column]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[y_column]))
        .attr("fill", "#1f77b4");
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
        // DONE: extract the necessary data from the results and re-draw the bars
        update_filter_options(results.group_filters)
        draw_bar(results.data, results.x_column, results.y_column)
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
        // DONE: extract the necessary data from the results, re-draw the bars, and update the filters
        update_filter_options(results.group_filters)
        draw_bar(results.data, results.x_column, results.y_column)
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

update_aggregate(null, null);