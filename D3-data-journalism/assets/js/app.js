// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
    top: 40,
    right: 20,
    bottom: 60,
    left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load csv data
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    console.log(censusData);

    // Parse data and cast too numbers
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Create a scale for your x coordinates
    var xScale = d3.scaleLinear()
        .domain([8, d3.max(censusData, d => d.poverty) + .5])
        .range([0, chartWidth]);
    
    // Create a scale for y coordinates
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.healthcare) + 1.1])
        .range([chartHeight, 0]);
    
    // Create bottom and left axis
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // Append Axes to chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    chartGroup.append("g")
        .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "15")
        .attr("class", "stateCircle");
    
    var circleLabels = chartGroup.selectAll(null).data(censusData).enter().append("text");

    circleLabels
        .attr("x", function(d) {
            return xScale(d.poverty);})
        .attr("y", function(d) {
            return yScale(d.healthcare - .5);})
        .text(function(d) {
            return d.abbr;})
        .attr("class", "stateText");
    
    // Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>In Poverty: ${d.poverty}%<br>Lack of Healthcare: ${d.healthcare}%`);
        });
    
    // Create tooltip in chart
    chartGroup.call(toolTip);

    // Create event listeners
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 50)
        .attr("x", 0 - (chartHeight/2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("Lacks Healthcare (%)");
    
    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + margin.top})`)
        .attr("class", "aText")
        .text("In Poverty (%)"); 
});

