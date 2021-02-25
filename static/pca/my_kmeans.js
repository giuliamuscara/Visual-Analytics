function kMeans(elt) {

    var w = 650, h = 350
    // the current iteration
    var iter = 0,
        centroids = [],
        points = [];
    
    var maxIter = 10;
    
    var margin = {top: 10, right: 20, bottom: 30, left: 40},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    var colors = d3.schemeCategory20; //var colors = d3.scale.category20().range();

    var countInsideCluster = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    var svg = d3.select(elt)
      .append("svg").attr("class", "kMeans_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.scaleLinear()
        .domain([-10, 10])
        .range([0, width]);
      
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)).attr("class", "x axis").append("text")
        .attr("dx", "59.71em")
        .attr("dy", "2.90em")
        .style("text-anchor", "end")
        .text("Principal Component 1").style("fill", "white");
          
    var y = d3.scaleLinear()
        .domain([-6, 6])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y)).attr("class", "y axis").append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Principal Component 2").style("fill", "white");
    
    /**
     * Computes the euclidian distance between two points.
     */
    function getEuclidianDistance(a, b) {
        var dx = b.x - a.x,
            dy = b.y - a.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    
    /** 
     * Generates a specified number of random points of the specified type.
     */

    //Breve spiegazione: selected topics contiene la lista dei topic sui quali fare k-means. I centroidi sono inizializzati
    //per essere i primi elementi in ordine di lettura del file con i topic scelti, senza ripetizione, così abbiamo num centroidi
    //uguale a num topics scelti. Il colore è assegnato in base al topic grazie alla variabile color_idx. Così che anche se i topics
    //sono diversi ad ogni scelta, i colori sono coerenti e non assegnati a random.
    function initializePointsFromCsv(){
        if (typeof data_kmeans !== 'undefined') {
            var j = 0;
            var centroid_topics = [];
            for(var i = 0; i < data_kmeans.length; i++){
                if(selected_topics.includes(data_kmeans[i].topic)){
                    if(!centroid_topics.includes(data_kmeans[i].topic)){
                        var color_idx = topics.findIndex(x => x === data_kmeans[i].topic);
                        var centroid = {x: data_kmeans[i].x, y:data_kmeans[i].y, type:"centroid", fill:colors[color_idx], topic:data_kmeans[i].topic, topic_name: get_topic_name(data_kmeans[i].topic)};
                        centroid.id = centroid.type + "-" + i;
                        j += 1;
                        centroid_topics.push(data_kmeans[i].topic);
                        centroids.push(centroid);
                    }
                    var point = {x: data_kmeans[i].x, y:data_kmeans[i].y, type:"point", fill:"black", topic:data_kmeans[i].topic, topic_name: get_topic_name(data_kmeans[i].topic)};
                    point.id = point.type + "-" + i;
                    points.push(point);
                }
            }
        }else{
            d3.json("/pca_kmeans", function(data) {
                data_kmeans = data
                var j = 0;
                var centroid_topics = [];
                for(var i = 0; i < data.length; i++){
                    if(selected_topics.includes(data[i].topic)){
                        if(!centroid_topics.includes(data[i].topic)){
                            var color_idx = topics.findIndex(x => x === data[i].topic);
                            var centroid = {x: data[i].x, y:data[i].y, type:"centroid", fill:colors[color_idx], topic:data[i].topic, topic_name: get_topic_name(data[i].topic)};
                            centroid.id = centroid.type + "-" + i;
                            j += 1;
                            centroid_topics.push(data[i].topic);
                            centroids.push(centroid);
                        }
                        var point = {x: data[i].x, y:data[i].y, type:"point", fill:"black", topic:data[i].topic, topic_name: get_topic_name(data[i].topic)};
                        point.id = point.type + "-" + i;
                        points.push(point);
                    }
                }
            });
        }
    }
    

    /**
     * Find the centroid that is closest to the specified point.
     */
    function findClosestCentroid(point) {
        var closest = {i: -1, distance: width * 2};
        centroids.forEach(function(d, i) {
            var distance = getEuclidianDistance(d, point);
            // Only update when the centroid is closer
            if (distance < closest.distance) {
                closest.i = i;
                closest.distance = distance;
            }
        });
        return (centroids[closest.i]); 
    }
    
    /**
     * All points assume the color of the closest centroid.
     */
    function colorizePoints() {
        points.forEach(function(d) {
            var closest = findClosestCentroid(d);
            d.fill = closest.fill;
            d.topic = closest.topic;
            d.topic_name = closest.topic_name
        });
    }

    /**
     * Computes the center of the cluster by taking the mean of the x and y 
     * coordinates.
     */
    function computeClusterCenter(cluster) {
        return [
            d3.mean(cluster, function(d) { return d.x; }), 
            d3.mean(cluster, function(d) { return d.y; })
        ];
    }
    
    /**
     * Moves the centroids to the center of their cluster.
     */
    function moveCentroids() {
        centroids.forEach(function(d) {
            // Get clusters based on their fill color
            var cluster = points.filter(function(e) {
                return e.fill === d.fill;
            });
            // Compute the cluster centers
            var center = computeClusterCenter(cluster);
            // Move the centroid
            d.x = center[0];
            d.y = center[1];
        });
    }

    /**
     * Updates the chart.
     */
    function update() {
    
        var data = points;
        
        var circle = svg.selectAll("circle")
            .data(data);
        

        var div = d3.select("body").append("div")   // solo per tooltips
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

        // Create new elements as needed
        circle.enter().append("circle")
            .attr("id", function(d) { return d.id; })
            .attr("class", function(d) {
                var to_append = d.type + " " + d.topic
                return to_append; 
            })
            .attr("r", 5).style("fill", "transparent")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .on("click", function(d) {        
                selected_topics = [d.topic]
                for(var i = 0; i < topics.length; i++){
                    if(topics[i] != d.topic){
                        checkbox_pressed[i] = 0
                    }else{
                        checkbox_pressed[i] = 1
                    }
                }


                d3.select("#checkboxes_container").selectAll("*").remove();
                draw_topics(selected_topics)
                
                
                
                



                d3.select(".barchart_graph").remove(); // rimozione svg
                d3.select(".lines_svg").remove(); // rimozione svg
                d3.select(".brush_svg").remove(); // rimozione brushed


                make_brush()

                



                published_coordinates = from_map_to_coordinates(published_bar_map, selected_topics)
                new_prep_coordinates = from_map_to_coordinates(new_prep_bar_map, selected_topics)
                old_prep_coordinates = from_map_to_coordinates(old_prep_bar_map, selected_topics)
                to_plot_arr = merge_map_barchart(published_coordinates, new_prep_coordinates, old_prep_coordinates)
                draw_stacked(to_plot_arr)


                lines_structure = make_lines_structure(from_map_to_coordinates(published_map, selected_topics), 
                from_map_to_coordinates(new_prep_map, selected_topics), 
                from_map_to_coordinates(old_prep_map, selected_topics))

                draw_lines()
                
                d3.select(".boxplot_svg").remove(); // rimozione svg
                draw_boxplot()
                
                d3.select(".kMeans_svg").remove()
                kMeans("#container_graph_3");


                


                d3.select(this).transition()
                        .duration('50')
                        .attr('opacity', '1');
                div.transition()
                    .duration('50')
                    .style("opacity", 0);
            
            })
            .on('mouseover', function(d) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.85');
                div.transition()
                    .duration(50)
                    .style("opacity", 1);
                let num = countInsideCluster[topics.findIndex(x => x === d.topic)];
                let topic_name = d.topic_name
                let to_show = topic_name + ": " + num
                div.html(to_show).style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY - 15) + "px")
                })
                .on('mouseout', function(d, i) {
                    d3.select(this).transition()
                        .duration('50')
                        .attr('opacity', '1');
                    div.transition()
                        .duration('50')
                        .style("opacity", 0);
                });
            
        // Update old elements as needed
        circle.transition().delay(100).duration(1000)
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y); })
            .style("fill", function(d) { return d.fill; })


        
        // Remove old nodes
        circle.exit().remove();
    }

    function computeClustersSize(){
        countInsideCluster = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        points.forEach(function(d){
            var i = topics.findIndex(x => x === d.topic)
            countInsideCluster[i] += 1;
        });
    }


    /**
     * Executes one iteration of the algorithm:
     * - Fill the points with the color of the closest centroid (this makes it 
     *   part of its cluster)
     * - Move the centroids to the center of their cluster.
     */
    function iterate() {

        // Colorize the points
        colorizePoints();
        
        // Move the centroids
        moveCentroids();
        
        // Update the chart
        update();
    }
    /** 
     * The main function initializes the algorithm and calls an iteration every 
     * two seconds.
     */
    function initialize() {
        
        //points = initializePointsFromCsv();
        //centroids = initializeCentroids();
        initializePointsFromCsv();
        //console.log(points);
        update();
        
        var interval = setInterval(function() {
            if(iter < maxIter) {
                iterate();
                iter++;
                computeClustersSize();
            } else {
                clearInterval(interval);
                computeClustersSize();
            }
        }, 1 * 1000);
        
    }

    // Call the main function
    initialize();

}