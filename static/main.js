//const { data } = require("jquery");

// custom javascript
$(function() {
    console.log('Running ArXiv Bibliometric analysis')

    draw_legend()

    //draw("../data/topics.json", "container_graph_3", "topics", "lines_svg")
    // draw("../data/topics.json", "container_graph_2", "_topics1", "secondo")
    // draw("../data/topics.json", "container_graph_3", "_topics2", "barchart")
    // draw("../data/topics.json", "container_graph_4", "_topics3", "ultimo")


    draw_topics(topics)
    get_barchart_data()
    draw_graph() // disegno il primo grafico



    d3.select(".project_title").text("ArXiv Bibliometric analysis")
        .style("text-align", "center")
        .style("font-family", "fangsong").style("font-size","20px")
    d3.select("#container_graph_3").text("PCA with topic clustering for semantic analysis").style("text-align", "center")
    make_brush()
    



});






var legend_pressed = [0, 0, 0]

function click_legend(input) {

    if (legend_pressed[input] == 1) {
        legend_pressed[input] = 0


        document.getElementsByClassName('l' + input)[0].style.background = plot_colors_sort[input];

        d3.select("#line" + input).style("stroke", plot_colors_sort[input])
        d3.select("#circle" + input).style("fill", plot_colors_sort[input])
        d3.selectAll("#circle" + input).style("fill", plot_colors_sort[input])

        
        ys.sort()


        plot_colors.push(plot_colors_sort[input])
        ys.push(ys_sort[input])

    } else {

        legend_pressed[input] = 1

        document.getElementsByClassName('l' + input)[0].style.background = 'transparent';
        d3.select("#line" + (input)).style("stroke", "transparent")
        // d3.select("#circle"+(input - 1)).style("fill", "#2c2c2c" + ";" + "opacity: 1")

        d3.selectAll("#circle" + (input)).style("fill", "transparent")


        

        plot_colors = remove_from_array(plot_colors, plot_colors_sort[input])
        ys = remove_from_array(ys, ys_sort[input])
    }

    d3.select(".barchart_graph").remove();
    

    ys = ys.sort(function(a, b) {
        return ys_sort.indexOf(a) - ys_sort.indexOf(b);
    });




    // riordinamento dell'array di colori
    plot_colors = sort_colors(plot_colors)
    
    
    // console.log("ys", ys)
    // console.log("plot_colors_sort", plot_colors_sort)
    // console.log("plot_colors", plot_colors)
    

    draw_stacked(to_plot_arr)


    d3.select(".lines_svg").remove(); // rimozione svg
    d3.select(".brush_svg").remove(); // rimozione brushed
    make_brush()
    draw_lines()

    
    
   
    // console.log(plot_colors)
}




var checkbox_pressed = [] // array di 0-1 per topic names


function onClickHandler(input) {
    if (checkbox_pressed[input] == 1) { // Deseleziono
        checkbox_pressed[input] = 0

        // Solo se deseleziono
        selected_topics = remove_from_array(selected_topics, topics[input])
    } else {
        checkbox_pressed[input] = 1

        if (!selected_topics.includes(topics[input])) {
            selected_topics.push(topics[input])
        }
    }

    selected_topics = sort_topics(selected_topics)


    // Rimozione kMeans e ricomputazione
    d3.select(".kMeans_svg").remove()
    kMeans("#container_graph_3");

    // Le linee
    published_map_coordinates = from_map_to_coordinates(published_map, selected_topics)
    new_prep_map_coordinates = from_map_to_coordinates(new_prep_map, selected_topics)
    old_prep_map_coordinates = from_map_to_coordinates(old_prep_map, selected_topics)


    // I barchart
    published_coordinates = from_map_to_coordinates(published_bar_map, selected_topics)
    new_prep_coordinates = from_map_to_coordinates(new_prep_bar_map, selected_topics)
    old_prep_coordinates = from_map_to_coordinates(old_prep_bar_map, selected_topics)
    to_plot_arr = merge_map_barchart(published_coordinates, new_prep_coordinates, old_prep_coordinates)

    



    


    // draw_line(published_map_coordinates, plot_colors[0])
    // draw_line(new_prep_map_coordinates, plot_colors[1])
    // draw_line(old_prep_map_coordinates, plot_colors[2])


    d3.select(".barchart_graph").remove(); // rimozione svg
    d3.select(".lines_svg").remove(); // rimozione svg
    


    // Boxplot
    d3.select(".boxplot_svg").remove(); // rimozione svg
    d3.select(".brush_svg").remove(); // rimozione brushed



    boxplot_array = from_map_to_array(boxplot_map, selected_topics)
    draw_boxplot()
    



    make_brush()
    draw_stacked(to_plot_arr)


    lines_structure = make_lines_structure(from_map_to_coordinates(published_map, selected_topics), 
            from_map_to_coordinates(new_prep_map, selected_topics), 
            from_map_to_coordinates(old_prep_map, selected_topics))

        
    draw_lines()

}

function draw_topics(this_topics) {
    
    var checkSlider = d3.select("#checkboxes_container");

    if(this_topics == topics){
        for(var i = 0; i < topic_names.length; i++){
                /* Custom Checkboxes */
                checkSlider.append("div").attr("class", "pretty p-icon p-round p-pulse").attr("id", "check" + i)
                var inner_container = d3.select("#check" + i)
                inner_container.append("input").attr("type", "checkbox").attr("class", topics[i]+"_check").attr("onclick", "onClickHandler(" + i + ")").attr("checked", "")
                inner_container.append("div").attr("class", "state p-"+topics[i]).attr("id", "inner_" + i);
                var end = d3.select("#inner_" + i)
                end.append("i").attr("class", "icon mdi mdi-check")
                end.append("label").text(topic_names[i])


                var br = document.createElement("br");
                var foo = document.getElementById("checkboxes_container");
                foo.appendChild(br);


            checkbox_pressed = new Array(topic_names.length).fill(1);
        }
    }else{
        for(var i = 0; i < topic_names.length; i++){
                /* Custom Checkboxes */
                checkSlider.append("div").attr("class", "pretty p-icon p-round p-pulse").attr("id", "check" + i)
                var inner_container = d3.select("#check" + i)
                this_topic_idx = topics.findIndex(x => x === this_topics[0])
                if(i != this_topic_idx){
                    inner_container.append("input").attr("type", "checkbox").attr("class", topics[i]+"_check").attr("onclick", "onClickHandler(" + i + ")")
                }else{
                    inner_container.append("input").attr("type", "checkbox").attr("class", topics[i]+"_check").attr("onclick", "onClickHandler(" + i + ")").attr("checked", "")
                }
                inner_container.append("div").attr("class", "state p-"+topics[i]).attr("id", "inner_" + i);
                var end = d3.select("#inner_" + i)
                end.append("i").attr("class", "icon mdi mdi-check")
                end.append("label").text(topic_names[i])


                var br = document.createElement("br");
                var foo = document.getElementById("checkboxes_container");
                foo.appendChild(br);


                //checkbox_pressed = new Array(topic_names.length).fill(1);
        }
    }

}


function draw_line(array, color) {
    var xscl = d3.scaleTime()
        .domain(d3.extent(array, function(d) {
            return d.x;
        })) //use just the x part
        .range([0, chart_dimensions.width])

    var yscl = d3.scaleLinear()
        .domain(d3.extent(array, function(d) {
            return d.y;
        })) // use just the y part
        .range([chart_dimensions.height, 0])

    var slice = d3.line()
        .x(function(d) {
            return xscl(d.x);
        }) // apply the x scale to the x data
        .y(function(d) {
            return yscl(d.y);
        }) // apply the y scale to the y data


    global_svg.append('rect') // outline for reference
        .attr({
            x: margin.left,
            y: margin.top,
            width: width,
            height: height,
            stroke: 'black',
            'stroke-width': 0.5,
            fill: 'white'
        });

    global_svg.append("path")
        .attr("class", "line")
        .attr("d", slice(array)) // use the return value of slice(xy) as the data, 'd'
        .style("fill", "none").attr("id", "line" + from_color_to_id(color))
        .style("stroke", color).style("stroke-linejoin", "round")
        .style("stroke-width", 2);


    var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

    //Pallini
    var dots = global_svg.selectAll('.dots').data(array).enter().append("g").attr("class", "dot");
    dots.selectAll('.dot' + from_color_to_id(color))
        .data(array)
        .enter()
        .append('circle').attr("id", "circle" + from_color_to_id(color))
        .attr("r", 2.5)
        .attr("cx", function(d) {

            return xscl(d.x);
        })
        .attr("cy", function(d) {
            return yscl(d.y);
        })
        .style("fill", color).style("opacity", ".5").attr("text", function(d) {
            return d.y;
        })
        .on('mouseover', function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            div.transition()
                .duration(50)
                .style("opacity", 1);
            let num = d.y;
            div.html(num)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            div.transition()
                .duration('50')
                .style("opacity", 0);
        });



}


function draw_graph(svg_id) {

    // set the ranges
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.05);
    var y = d3.scaleLinear().range([height, 0]);
    var xAxis = d3.axisBottom().scale(x)
    var yAxis = d3.axisLeft(y).ticks(10);


    // load the data
    d3.json("/data", function(error, data) {
        boxplot_map = initialize_fra_boxplot_map(num_rows, num_cols)
        data.forEach(function(d) {
            
            d.journal_ref = d["journal-ref"]
            d.versions = d["versions"]

            var topic_id = clean_topic_id(d["categories"])


            var firts_version_date = new Date(d.versions[0]["created"])
            var first_created_year = firts_version_date.getFullYear()


            // Get last version in array
            var lastItem = d.versions.pop();
            var last_version = lastItem["created"]
            var created_date = new Date(last_version);
            var created_year = created_date.getFullYear()


            if (d.journal_ref != null) {

                if (topics.includes(topic_id)) {
                    count1 = count1+1
                    //ROSSA prima versione 2000, ultima versione 2002
                    published_map.get(topic_id)[created_year]++
                    //BLU
                    if(first_created_year < created_year){
                        new_prep_map.get(topic_id)[first_created_year]++
                        new_prep_map.get(topic_id)[first_created_year+1]++
                        count2 = count2 + 1
                        //VERDE
                        if(first_created_year + 2 <= created_year){
                            for(var i = first_created_year + 2; i <= created_year; i++) {
                                old_prep_map.get(topic_id)[i]++
                            }
                            count3 = count3 + 1
                        }
                    }

                    // popolare boxplot
                    var d1Y = firts_version_date.getFullYear();
                    var d2Y = created_date.getFullYear();
                    var d1M = firts_version_date.getMonth();
                    var d2M = created_date.getMonth();
                    var time_to_publish = (d2M + 12 * d2Y) - (d1M + 12 * d1Y); // In mesi <----

                    if(time_to_publish > 0){
                        boxplot_map.get(topic_id).push(time_to_publish)
                    }
                    //boxplot_map.get(topic_id)["ttp"] += time_to_publish
                    //boxplot_map.get(topic_id)["count"] += 1
                    //console.log(boxplot_map.get(topic_id))
                   
                    
                }

            } else { // journal_ref == null

                if (topics.includes(topic_id)) {
                    //BLU
                    var first_created_year = firts_version_date.getFullYear()
                    var year_to_increment = first_created_year + 1
                    // var year_to_increment = created_year + 1
                    if (year_to_increment <= 2020) {
                        new_prep_map.get(topic_id)[first_created_year]++
                        new_prep_map.get(topic_id)[year_to_increment]++
                        count2 = count2+1
                    }
                    //VERDE
                    for (var i = first_created_year + 2; i <= 2020; i++) {
                        old_prep_map.get(topic_id)[i]++
                    }
                    count3 = count3 + 1
                }


            }
            
        });
        draw_boxplot()
        kMeans("#container_graph_3");

        // add axis
        global_svg = d3.select("#lines_svg")
            .attr("width", container_dimensions.width)
            .attr("height", container_dimensions.height)
            .append("g")
            .attr("transform",
                "translate(" + margins.left + "," + margins.top + ")")


        


        lines_structure = make_lines_structure(from_map_to_coordinates(published_map, topics), 
            from_map_to_coordinates(new_prep_map, topics), 
            from_map_to_coordinates(old_prep_map, topics))

        
        draw_lines()  //<--------!!!



        

    });
}


var time_scale;
var percent_scale;

function draw(topics, id1, id2, svg_id) {
    

    time_scale = d3.scaleTime()
        .range([0, chart_dimensions.width])
        .domain([new Date(1988, 0, 1), new Date(2020, 0, 1)]);


    percent_scale = d3.scaleLinear()
        .range([chart_dimensions.height, 0])
        .domain([0, 600]);
    // .domain([1000, 330000]);


    var time_axis = d3.axisBottom(time_scale).ticks(years_array.length).
    tickFormat(function(d) {
        return d.getFullYear();
    }) // Rimozione valore assi

    var count_axis = d3.axisLeft(percent_scale)

    // draw axes

    var g = d3.select('#' + id1)
        .append('svg')
        .attr("width", container_dimensions.width)
        .attr("height", container_dimensions.height)
        .attr("id", svg_id)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .attr("id", "chart");


    g.append("g")
        .attr("class", "x axis").call(time_axis)
        .attr("transform", "translate(0," + chart_dimensions.height + ")").selectAll("text").attr("transform", "rotate(45)").attr("y", 0)
        .attr("x", 9)
        .attr("dx", "-0.15em")
        .attr("dy", "1.35em")
        .style("text-anchor", "start")


    g.append("g")
        .attr("class", "y axis")
        .call(count_axis);


    // draw the y-axis label
    d3.select('.y.axis')
        .append('text')
        .text('')
        .attr('transform', "rotate (-270, 0, 0)")
        .attr('x', 100)
        .attr('y', 50);
}




var main, xAxis_stacked;   // <--- main globale
function draw_stacked(to_plot_arr) {

    var data = parse_stacked(to_plot_arr)
    // some colours to use for the bars
    var colour = d3.scaleOrdinal().domain(ys).range(plot_colors)

    // mathematical scales for the x and y axes
    // var x = d3.scaleTime().range([0, chart_dimensions.width]).domain(years_array.length)
    var x = d3.scaleTime()
  .domain([d3.min(data, function(d) {
    return d3.timeDay.offset(d.date, -10);
  }), d3.max(data, function(d) {
    return d3.timeDay.offset(d.date, 10);
  })])
  .range([6, width]);
    // var x = d3.scaleTime()
    //   .domain([d3.min(data, function(d) {
    //     return d3.timeDay.offset(d.date, -10);
    //   }), d3.max(data, function(d) {
    //     return d3.timeDay.offset(d.date, 10);
    //   })])
    //   .range([0, width]);

    // var x = d3.scaleTime()
    // .domain(d3.extent(data, function(d) { return d.date; }))
    // .rangeRound([margin.left, width - margin.right])

    // var x = d3.scaleBand()
    //     .domain(years_array)
    //     .range([0, width])
    //     .padding([0.2])


    var y = d3.scaleLinear()
        .range([chart_dimensions.height, 0]);
   

    // rendering for the x and y axes
    xAxis_stacked = d3.axisBottom().scale(x).ticks(d3.timeYear, 1)//should display 1 year intervals
    .tickFormat(d3.timeFormat('%Y'))


    var yAxis = d3.axisLeft()
        .scale(y)

    var xAxisOverview = d3.axisBottom()
        .scale(xOverview).ticks(years_array.length).tickFormat(function(d) {
            return d.getFullYear(); // <---- asse per xOverview
        })

    


    // something for us to render the chart into
    var svg = d3.select("#container_graph_2").text("Total number of citations over time").style("text-align", "center")
        .append("svg").attr("class", "barchart_graph") // the overall space
        .attr("width", container_dimensions.width)
        .attr("height", container_dimensions.height);


    main = svg.append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + (margin.left+30)+ "," + (margin.top-10) + ")");


    

    // data ranges for the x and y axes
    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.total;
    })]);


    xOverview.domain(x.domain());
    yOverview.domain(y.domain());

    // data range for the bar colours
    // (essentially maps attribute names to colour values)
    colour.domain(plot_colors);


    // Per i margini sinistri
    main.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", container_dimensions.width)
        .attr("height", chart_dimensions.height);

    

    main.append('g')
      .classed("axis axis--x", true)
      .attr("transform", "translate(0," + chart_dimensions.height + ")")
      .call(d3.axisBottom(x)
    .tickFormat(d3.timeFormat("%Y")).tickValues(data.map(function(d) {
      return new Date(d.date)
    }))).selectAll("text").attr("transform", "rotate(45)").attr("y", 0) // testo labels asse x
            .attr("x", 9)
            .attr("dx", "-0.35em")
            .attr("dy", "0.95em")
            .style("text-anchor", "start");



    main.append("g")
        .attr("class", "y axis")
        .call(yAxis).append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Num. citations").style("fill", "white");
    

    var div = d3.select("body").append("div") // per i tooltips
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
   

    if (ys.length != 0) {

        // draw the bars
        main.append("g")
            .attr("class", "bars").attr("clip-path", "url(#clip)")
            // a group for each stack of bars, positioned in the correct x position
            .selectAll(".bar.stack")
            .data(data)
            .enter().append("g")
            .attr("class", "bar stack")
            .attr("transform", function(d) {
                return "translate(" + (x(d.date)-6) + ",0)";
            })
            // a bar for each value in the stack, positioned in the correct y positions
            .selectAll("rect")
            .data(function(d) {
                return d.counts;
            })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("width", function(d) {
              return 12
            })
            // .attr('x', function(d, i) {
            //   return x(d3.select(this.parentNode).datum().date)-4;
            // })
            .attr("y", function(d) {
                return y(d.y1);
            })
            .attr("height", function(d) {
                return y(d.y0) - y(d.y1);
            })
            .style("fill", function(d) {
                return colour(d.name);
            })
            .on('mouseover', function(d, i) { // Muose show tooltips

                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.85');
                div.transition()
                    .duration(50)
                    .style("opacity", 1);
                let num = d.y1 - d.y0;
                div.html(num)
                    .style("left", (d3.event.pageX - 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            })
            .on('mouseout', function(d, i) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1');
                div.transition()
                    .duration('50')
                    .style("opacity", 0);
            });


    }


}


function get_barchart_data() {
    d3.json("/barchart", function(dataFromServer) {
        

        published_bar_map = new Map(Object.entries(dataFromServer[0]));
        new_prep_bar_map = new Map(Object.entries(dataFromServer[1]));
        old_prep_bar_map = new Map(Object.entries(dataFromServer[2]));




        published_coordinates = from_map_to_coordinates(published_bar_map, topics)
        new_prep_coordinates = from_map_to_coordinates(new_prep_bar_map, topics)
        old_prep_coordinates = from_map_to_coordinates(old_prep_bar_map, topics)



        to_plot_arr = merge_map_barchart(published_coordinates, new_prep_coordinates, old_prep_coordinates)

        draw_stacked(to_plot_arr);
        // draw_stacked_old()
    });
}




function draw_boxplot() {
    var svg = d3.select("#container_graph_4").text("Average delay before a preprint is published").style("text-align", "center").append("svg").attr("class", "boxplot_svg")
        .attr("width", container_dimensions.width)
        .attr("height", container_dimensions.height)
        .append("g")
        .attr("transform",
            "translate(" + (margin.left+160) + "," + margin.top + ")");

    boxplot_array = from_map_to_array(boxplot_map, selected_topics)
    // Compute summary statistics used for the box:
    var data_sorted = boxplot_array.sort(d3.ascending)
    console.log(data_sorted)

    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)

    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1

    //var min = d3.min(data_sorted)
    var min = 0
    if(!(q1 - (1.5 * interQuantileRange) < 0)){
        min = q1 - (1.5 * interQuantileRange)
    }

    //var max = d3.max(data_sorted)
    var max = q3 + (1.5 * interQuantileRange)


    // Show the Y scale
    var y = d3.scaleLinear()
        .domain([min, max])
        .range([chart_dimensions.height, 0]);

    svg.append("g").attr("class", "y axis").call(d3.axisLeft(y)).append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Months").style("fill", "white");

    // a few features for the box
    var center = 200
    var width = 100

    var div = d3.select("body").append("div") // per i tooltips
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

    // Show the main vertical line
    svg
        .append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", y(min))
        .attr("y2", y(max))
        .attr("stroke", "white")

    // Show the box
    svg
        .append("rect")
        .attr("x", center - width / 2)
        .attr("y", y(q3))
        .attr("height", (y(q1) - y(q3)))
        .attr("width", width)
        .attr("stroke", "white")
        .style("fill", "#69b3a2")
        .on('mouseover', function(d, i) { // Muose show tooltips

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            div.transition()
                .duration(50)
                .style("opacity", 1);

            div.html(function(d) {
                var content = "";
                content += `
                    <table style="margin-top: 2.5px;">
                            <tr><td>Max: </td><td style="text-align: right">` + d3.format(".2f")(max) + `</td></tr>
                            <tr><td>Q3: </td><td style="text-align: right">` + d3.format(".2f")(q3) + `</td></tr>
                            <tr><td>Median: </td><td style="text-align: right">` + d3.format(".2f")(median) + `</td></tr>
                            <tr><td>Q1: </td><td style="text-align: right">` + d3.format(".2f")(q1) + `</td></tr>
                            <tr><td>Min: </td><td style="text-align: right">` + d3.format(".2f")(min) + `</td></tr>
                    </table>
                    `;
                return content;
            }).style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            div.transition()
                .duration('50')
                .style("opacity", 0);
        });





    // show median, min and max horizontal lines
    svg
        .selectAll("toto")
        .data([min, median, max])
        .enter()
        .append("line")
        .attr("x1", center - width / 2)
        .attr("x2", center + width / 2)
        .attr("y1", function(d) {
            return (y(d))
        })
        .attr("y2", function(d) {
            return (y(d))
        })
        .attr("stroke", "white")
        .on('mouseover', function(d, i) { // Mouse show tooltips

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            div.transition()
                .duration(50)
                .style("opacity", 1);
            var num = d
            div.html(num)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function(d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            div.transition()
                .duration('50')
                .style("opacity", 0);
        });
}


function draw_legend() {
    for (var i = 0; i < plot_colors.length; i++) {
        var li = d3.select("#legend-labels").append("li").attr("id", "li" + i)
        li.text(legend_text[i])
        li.append("span").attr("style", "background:" + plot_colors_sort[i]).attr("class", "l" + i).attr("onclick", "click_legend(" + i + ")")
    }

    d3.select(".count_labels").attr("style", "margin-top: 95px;")
}




// Posizionamento del brush in alto al centro
function make_brush(){
    var svg = d3
        .select("#brush_container")
        .append("svg").attr("style", "display: block;margin: auto;").attr("class", "brush_svg")
        .attr("height", 80)
}




var x, x2, y, y2, z, xAxis, xAxis2, focuslines, line, focus, yAxis, focuslineGroups;
var this_lines_structure;
function draw_lines(){
    this_lines_structure = edit_lines_structure(lines_structure)
    var svg = d3.select("#container_graph_1").text("Total number of papers on Arxiv over time").style("text-align", "center")
    .append("svg").attr("class", "lines_svg")
    .attr("width", container_dimensions.width)
    .attr("height", container_dimensions.height),
        margin = {
            top: 10,
            right: 160,
            bottom: 110,
            left: 40,
        },
        margin2 = {
            top: 430,
            right: 20,
            bottom: 30,
            left: 40,
        },
        
        
        height = chart_dimensions.height,
        height2 = heightOverview

    
    d3.select("#container_graph_1")
    

    x = d3.scaleTime().range([0, chart_dimensions.width+5]).domain(years_array.length),
        x2 = d3.scaleTime().range([0, chart_dimensions.width]),
        y = d3.scaleLinear().range([chart_dimensions.height, 10]),
        y2 = d3.scaleLinear().range([height2, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);


   

    // var x = d3.scaleTime()
    //     .range([0.2, chart_dimensions.width]).domain(years_array)
    
    xAxis = d3.axisBottom().scale(x).ticks(d3.timeYear, 1)//should display 1 year intervals
    .tickFormat(d3.timeFormat('%Y'))
    

   



    xAxis2 = d3.axisBottom(x2).ticks(years_array.length).
        tickFormat(function(d) {
            return d.getFullYear();
        })
    yAxis = d3.axisLeft(y);
    

    
    var brush = d3
        .brushX()
        .extent([
            [0, 0],
            [chart_dimensions.width, height2],
        ])
        .on("brush end", brushed)
    
    
    



    line = d3
        .line()
        .x(function (d) {
            return x(new Date(d.date));
        })
        .y(function (d) {
            return y(d.y);
        })
    
    var clip = svg.append("defs").append("svg:clipPath").attr("id", "clip").append("svg:rect").attr("width", width).attr("height", chart_dimensions.height).attr("x", 0).attr("y", 0);
    focus = svg
        .append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + (margin.left+30) + "," + margin.top + ")")
        
    
    
    
    d3.select(".brush_svg").attr("width", 1040)
    var context = d3.select(".brush_svg")
        .append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + (margin.left+200) + "," + margin.top + ")");
    
    
    

    var domain = z.domain(
        d3.keys(ys).filter(function (key) {
            return key;
        })
    );
    var o1 = 0;
    var o2 = 0;


    x.domain([new Date(1988, 0, 1), new Date(2020, 0, 1)]);

    y.domain([
        0,
        d3.max(this_lines_structure, function (c) {
            return d3.max(c.values, function (d) {
                return d.y;
            }); 
        }), // dominio y
    ]);
    x2.domain(x.domain());
    y2.domain(y.domain());
    z.domain(
        this_lines_structure.map(function (c) {
            return c.id;
        })
    );
    focuslineGroups = focus.selectAll("g").data(this_lines_structure).enter();
    focuslines = focuslineGroups
        .append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return plot_colors[o1++];
        })
        .style("stroke-width", 2)
        .attr("clip-path", "url(#clip)");
    



    // Testo labels contando i pallini
    total_count_label = total_published_label = total_pre_print_less_label = total_pre_print_greater_label = 0

    for(var i = 0; i < 3; i++){
        if(this_lines_structure[i] != undefined){
            var dati = this_lines_structure[i].values
            var id = this_lines_structure[i].id
            if(id == "line1"){
                for(var j = 0; j < dati.length; j++){
                    total_published_label += dati[j].y
                }
            }
            else if(id == "line2"){
                // for(var j = 0; j < dati.length; j++){
                //     total_pre_print_less_label += dati[j].y
                // }
                total_pre_print_less_label += dati[dati.length - 1].y + Math.abs(dati[dati.length - 2].y - dati[dati.length - 1].y)
            }
            else{
                total_pre_print_greater_label += dati[dati.length - 1].y
            }
        }
    }
    total_count_label = total_published_label + total_pre_print_less_label + total_pre_print_greater_label



    d3.select("#total_count_label").text(total_count_label_text + total_count_label)  // cambio testo
    d3.select("#total_published_label").text(total_published_label_text + total_published_label)  // cambio testo
    d3.select("#total_pre_print_less_label").text(total_pre_print_less_label_text + total_pre_print_less_label)  // cambio testo
    d3.select("#total_pre_print_greater_label").text(total_pre_print_greater_label_text + total_pre_print_greater_label)  // cambio testo



    focus
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + chart_dimensions.height + ")")
        .call(xAxis)
        .selectAll("text").attr("transform", "rotate(45)").attr("y", 0) // testo labels asse x
            .attr("x", 9)
            .attr("dx", "-0.35em")
            .attr("dy", "0.95em")
            .style("text-anchor", "start");
    focus.append("g").attr("class", "axis axis--y").call(yAxis)


    
    context
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2)
        .selectAll("text").attr("transform", "rotate(45)").attr("y", 0) // testo labels asse x
        .attr("x", 9)
        .attr("dx", "-0.35em")
        .attr("dy", "0.95em")
        .style("text-anchor", "start");


    context.append("g").attr("class", "brush").call(brush).call(brush.move, x.range());
    



    // pallini
    var div = d3.select("body").append("div")   // solo per tooltips
        .attr("class", "tooltip-donut")
        .style("opacity", 0);





}   




function brushed(){ //aka zoom
    var extent = d3.event.selection;
    
    var s = extent.map(x2.invert, x2);

    //x.range([0,625]);
    console.log(x.range())

    x.domain(s);
    focuslines.attr("d", function (d) {
        return line(d.values);
    });



    focus.select(".axis--x").call(xAxis)
    .selectAll("text").attr("transform", "rotate(45)").attr("y", 0) // testo labels asse x
    .attr("x", 9)
    .attr("dx", "-0.35em")
    .attr("dy", "0.95em")
    .style("text-anchor", "start");


    focus.selectAll(".axis--y").append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Num. papers").style("fill", "white");
    
    

    
    var clip = d3.select("clipPath");
    var div = d3.select("body").append("div")   // solo per tooltips
        .attr("class", "tooltip-donut")
        .style("opacity", 0);


    d3.selectAll(".lines_dot").remove() // Rimozione cerchietti linee
    for(var i = 0; i < ys.length; i++){
        focuslineGroups.selectAll("myCircles")
          .data(this_lines_structure[i].values)
          .enter()
          .append("circle").attr("class", "lines_dot")
            .attr("fill", plot_colors[i])
            .attr("stroke", "none")
            .attr("cx", function(d) {return x(d.date) })
            .attr("cy", function(d) { return y(d.y) })
            .attr("r", 3)
            .attr("clip-path", "url(#clip)")// Tooltips
            .on('mouseover', function(d, i) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.85');
                div.transition()
                    .duration(50)
                    .style("opacity", 1);
                let num = d.y;
                div.html(num)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            })
            .on('mouseout', function(d, i) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1');
                div.transition()
                    .duration('50')
                    .style("opacity", 0);
            });
    }


    
    



    // Brush stacked barchart
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    var s = d3.event.selection || xOverview.range();
    x.domain(s.map(x2.invert, x2));
    x.range([6, width]);    // sposto l'asse x
    main.selectAll(".bar.stack").attr("transform", function(d) {
        return "translate(" + (x(d.date)-6) + ",0)";
    }) 




    main.select(".axis--x").attr("transform", "translate(0," + chart_dimensions.height + ")").call(xAxis)
    .selectAll("text").attr("transform", "rotate(45)").attr("y", 0) // testo labels asse x
            .attr("x", 9)
            .attr("dx", "-0.35em")
            .attr("dy", "0.95em")
            .style("text-anchor", "start");

}
