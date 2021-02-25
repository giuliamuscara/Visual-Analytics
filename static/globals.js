// Graphic dimentions
var container_dimensions = {
        width: 700,
        height: 350
    },
    margins = {
        top: 10,
        right: 20,
        bottom: 30,
        left: 60
    },
    chart_dimensions = {
        width: container_dimensions.width - margins.left - margins.right,
        height: container_dimensions.height - margins.top - margins.bottom
    };

// Variabili grafico
var margin = {
        top: 20,
        right: 20,
        bottom: 70,
        left: 40
    },
    width = 650 - margin.left - margin.right,

    height = 350 - margin.top - margin.bottom;


// Variabili brush
var marginOverview = {
        top: 10,
        right: margin.right,
        bottom: 20,
        left: margin.left
    },
    heightOverview = 60 - marginOverview.top - marginOverview.bottom;
 var xOverview = d3.scaleTime()
    .range([0, width]);
var yOverview = d3.scaleLinear()
    .range([heightOverview, 0]);


var plot_colors = ['#e41a1c', '#4daf4a', '#377eb8']
var plot_colors_sort = plot_colors // Serve solo per ridare un ordinamento alla lista di colori
var legend_text = ["Published Papers", "Pre-print greater than 1 year", "Pre-print less than 1 year"]


var kMeansSVG;

var ys = ["y1", "y3", "y2"]
var ys_sort = ys



var data_kmeans;


// Aggiornamento testo labels
var count1 = 0
var count2 = 0
var count3 = 0

var total_count_label = 0
var total_published_label = 0
var total_pre_print_less_label = 0
var total_pre_print_greater_label = 0

var total_count_label_text = "Total number of papers: "
var total_published_label_text = "Total number of published papers: "
var total_pre_print_less_label_text = "Total number of pre-print less than 1 year: "
var total_pre_print_greater_label_text = "Total number of pre-print greater than 1 year: "


var lines_structure;

function from_color_to_id(color){
    for(var i = 0; i < plot_colors.length; i++){
        if(color == plot_colors[i]){return i}
    }
}

function sort_topics(topics_arr){
    to_ret = []
    for(var i = 0; i < topics.length; i++){
        for(var j = 0; j < topics_arr.length; j++){
            if(!to_ret.includes(topics[i]) && topics_arr.includes(topics[i])){
                to_ret.push(topics[i])
            }
        }
    }
    return to_ret
}

function sort_colors(color_arr){
    to_ret = []
    for(var i = 0; i < plot_colors_sort.length; i++){
        for(var j = 0; j < color_arr.length; j++){
            if(!to_ret.includes(plot_colors_sort[i]) && color_arr.includes(plot_colors_sort[i])){
                to_ret.push(plot_colors_sort[i])
            }
        }
    }
    return to_ret
}


var data_glob = []

var global_svg = null // Contiene l'svg globale


// Crea un array con elementi compresi tra begin e end
function range(begin, end) {
    var arr = [];
    for (var i = begin; i <= end; i++) {
        arr.push(i);
    }
    return arr;
}

var years_array = range(1988, 2020);
// console.log(years_array)
var num_rows = 20,
    num_cols = 33;


let topics = ["cs", "econ", "eess", "math", "physics", "astro-ph", "cond-mat", "gr-qc", "hep-ex",
    "hep-lat", "hep-ph", "hep-th", "math-ph", "nlin", "nucl-ex", "nucl-th", "quant-ph", "q-bio", "q-fin", "stat"
]
let topic_names = [
  "Computer Science",
  "Economics",
  "Electrical Engineering and Systems Science",
  "Mathematics ",
  "Physics",
  "Astrophysics",
  "Condensed Matter",
  "General Relativity and Quantum Cosmology",
  "High Energy Physics - Experiment",
  "High Energy Physics - Lattice",
  "High Energy Physics - Phenomenology",
  "High Energy Physics - Theory",
  "Mathematical Physics",
  "Nonlinear Sciences",
  "Nuclear Experiment",
  "Nuclear Theory",
  "Quantum Physics",
  "Quantitative Biology",
  "Quantitative Finance",
  "Statistics"
]

function get_topic_name(topic_id){
    for(var i = 0; i < topics.length; i++){
        if(topic_id == topics[i]){return topic_names[i]}
    }
}



let topics_colors = d3.schemeCategory20
// console.log("topics_colors", topics_colors)
// console.log("topics", topics)

var selected_topics = topics // Side-effect per i checkboxes


// Inizializzazione mappe
var published_map = initialize_fra_map(num_rows, num_cols)
var new_prep_map = initialize_fra_map(num_rows, num_cols)
var old_prep_map = initialize_fra_map(num_rows, num_cols)


var published_bar_map = initialize_fra_map(num_rows, num_cols)
var new_prep_bar_map = initialize_fra_map(num_rows, num_cols)
var old_prep_bar_map = initialize_fra_map(num_rows, num_cols)
var stacked_subgroups = ["y1", "y3", "y2"]




var boxplot_map = initialize_fra_boxplot_map()
var boxplot_array;

var to_plot_arr = []





// console.log(published_matrix[0][])
function clean_topic_id(topic_id) {
    if (topic_id.includes(" ")) {
        topic_id = topic_id.split(" ")[0]
    }
    if (topic_id.includes(".")) {
        topic_id = topic_id.split(".")[0]
    }
    return topic_id
}


function initialize_fra_map(num_rows, num_cols) {
    var myMap = new Map();
    for (var i = 0; i < num_rows; i++) {
        // var array = []
        var dict = {}
        for (var j = 0; j < num_cols; j++) {
            dict[years_array[j]] = 0
        }
        myMap.set(topics[i], dict) // -----> "topic_id": [{x:..., y:...}]
    }
    return myMap
}

function initialize_fra_boxplot_map(num_rows, num_cols) {
    var myMap = new Map();
    for (var i = 0; i < num_rows; i++) {
        var array = []
        myMap.set(topics[i], array) // -----> "topic_id": [{x:..., y:...}]
    }
    return myMap
}


// da {1998:0} a {"x": 1998, "y":0}
function from_map_to_coordinates(map, topics_list) {
    var to_ret = []
    var keys = Array.from(map.keys());

    keys = sort_topics(keys)

    dict_sum = initialize_sum_dict()

    for (var i = 0; i < map.size; i++) {
        if (topics_list.includes(keys[i])) {
            var dictionary = map.get(topics[i])
            const dict_keys = Object.keys(dictionary);
            const dict_values = Object.values(dictionary);
            for (var j = 0; j < dict_keys.length; j++) {
                dict_sum[dict_keys[j]] += dict_values[j]
            }
        }

    }

    const dict_sum_keys = Object.keys(dict_sum);
    const dict_sum_values = Object.values(dict_sum);
    for (var i = 0; i < dict_sum_keys.length; i++) {
        var dict = {
            "x": 0,
            "y": 0
        }
        dict["x"] = dict_sum_keys[i]
        dict["y"] = dict_sum_values[i]
        to_ret.push(dict)
    }
    return to_ret
}


function initialize_sum_dict() {
    to_ret = {}
    for (var i = 0; i < years_array.length; i++) {
        to_ret[years_array[i]] = 0
    }
    return to_ret
}


function remove_from_array(array, to_remove) {
    array = array.filter(item => item !== to_remove)
    return array
}


function merge_map_barchart(dict1, dict2, dict3) {

    var to_ret = []
    const dict_keys_1 = Object.keys(dict1);

    const dict_keys_2 = Object.keys(dict2);
    const dict_keys_3 = Object.keys(dict3);

    const dict_values_1 = Object.values(dict1);
    const dict_values_2 = Object.values(dict2);
    const dict_values_3 = Object.values(dict3);

    for (var i = 0; i < dict_keys_1.length; i++) {
        var dict = {
            "x": 0,
            "y1": 0,
            "y2": 0,
            "y3": 0
        }
        dict["x"] = dict_values_1[i]["x"]
        dict["y1"] = dict_values_1[i]["y"]
        dict["y2"] = dict_values_2[i]["y"]
        dict["y3"] = dict_values_3[i]["y"]

        // dict["total"] = dict_values_1[i]["y"] + dict_values_2[i]["y"] + dict_values_3[i]["y"]
        to_ret.push(dict)
    }
    return to_ret
}



// Per disegnare barchart ----> data = parse_stacked(to_plot_arr)
function parse_stacked(array){
    var to_ret = []
    var parseDate = d3.timeFormat("%Y");
    for(var i = 0; i < array.length; i++){
        var str_date = new Date(array[i].x)
        var value = {date: str_date}
        var y0 = 0; // keeps track of where the "previous" value "ended"


        value.counts = ys.map(function(name) {
            return { name: name,
                     y0: y0,
                     // add this count on to the previous "end" to create a range, and update the "previous end" for the next iteration
                     y1: y0 += +array[i][name]
                   };
        });
        if(plot_colors.length != 0){
            value.total = value.counts[value.counts.length - 1].y1;
            // adding calculated data to each count in preparation for stacking
        }else{
            value.total = 0
        }
        to_ret.push(value)
    }
    return to_ret
}


function from_map_to_array(map, topics_list){
    var to_ret = []
    for(var i = 0; i < map.size; i++){
        if(topics_list.includes(topics[i])){
            var values = map.get(topics[i])
            //console.log(values)
            for(var j = 0; j < values.length; j++){
                to_ret.push(values[j])
            }
        }
    }
    return to_ret
}




function make_lines_structure(array1, array2, array3){
    var to_ret = []
    var domain = ["line1"]
    var line1 = domain.map(function(id) {
        return {
          id: id,
          values: array1.map(function(d) {
            return {date: new Date(d.x), y: +d["y"]};
          }),
          color: plot_colors_sort[0]
        };
      });
    
    to_ret.push(line1[0])
    

    domain = ["line2"]
    var line2 = domain.map(function(id) {
        return {
          id: id,
          values: array2.map(function(d) {
            return {date: new Date(d.x), y: +d["y"]};
          }),
          color: plot_colors_sort[1]
        };
      });
    to_ret.push(line2[0])


    domain = ["line3"]
    var line3 = domain.map(function(id) {
        return {
          id: id,
          values: array3.map(function(d) {
            return {date: new Date(d.x), y: +d["y"]};
          }),
          color: plot_colors_sort[2]
        };
      });
    to_ret.push(line3[0])


    return to_ret  
}



function edit_lines_structure(lines_structure){
    var to_ret = []
    for(var i = 0; i < ys.length; i++){
        var line_num = "line"+ ys[i].split('y')[1]
        for(var j = 0 ; j < lines_structure.length; j++){
            if(!to_ret.includes(lines_structure[j]) && lines_structure[j].id == line_num){
                to_ret.push(lines_structure[j])
            }
        }
    }
    return to_ret
}