// Base URL
dataurl = "//"+window.location.host+"/web/data/";
//Read Goals, Targets and Indicators
var sdgs = [];
var stats = {};

files = ["goals","targets","indicators"];
var data_loaded = 0;
function load_data(){
  //Reset and Read into memory the SDGs
  sdgs = {};
  stats = {};
  files.forEach(function (f) {
    console.log("Loading "+f);
    d3.json(dataurl+f+".json", function (error, data) {
      //for (var attrname in data) { sdgs[attrname] = data[attrname]; }
      sdgs[data.meta.id]=data;
      if (sdgs.hasOwnProperty('indicators')) {
        update_stats();
        vizs();
        data_loaded=1;}
  });
});
}

//When page loadded, read data
$( document ).ready(load_data());

function full_list(){
  //Add listing and stats
  list_goals();
  add_targets();
  add_indicators();
}

function update_stats(){
 //make stats
 console.log(sdgs);
 stats.goals=sdgs.goals.goals.length;
 stats.targets = sdgs.targets.targets.length;
 stats.indicators = sdgs.indicators.indicators.length;
 stats.goal_targets = array_num(sdgs.targets.targets.length,0);
 stats.goal_indicators = array_num(sdgs.indicators.indicators.length,0);
 for (var i in sdgs.indicators.indicators){ stats.goal_indicators[sdgs.indicators.indicators[i].goal-1]++; }
 for (var j in sdgs.targets.targets){ stats.goal_targets[sdgs.targets.targets[j].goal-1]++; }
 // Add left bar with numbers.
 document.getElementById("goals-num").innerHTML = stats.goals+" Goals";
 document.getElementById("targets-num").innerHTML = stats.targets+" Targets";
 document.getElementById("indicators-num").innerHTML = stats.indicators+" Indicators";
}

function vizs(){
  add_stack_plot();
}

function add_stack_plot(){
 // Add plot stack viz on id "barplot".
 var data = {
    labels: d3.range(1, stats.goals).map(function(i){return "Goal "+i;}),
    datasets: [
        {
            label: "Targets",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: stats.goal_targets
        },
        {
            label: "Indicators",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: stats.goal_indicators
        }
    ]
 };
 var options = {
    scaleBeginAtZero : true,
    scaleShowGridLines : true,
    scaleGridLineColor : "rgba(0,0,0,.05)",
    scaleGridLineWidth : 1,
    scaleShowHorizontalLines: true,
    scaleShowVerticalLines: true,
    barShowStroke : true,
    barStrokeWidth : 2,
    barValueSpacing : 5,
    barDatasetSpacing : 1,
 };
 var anchor=document.getElementById("dashboard-content");
 var canvas = document.createElement("canvas");
 canvas.setAttribute("id", "barplot");
 anchor.appendChild(canvas);
 var ctx= canvas.getContext("2d");
 Chart.defaults.global.multiTooltipTemplate = "<%= value %> <%= datasetLabel %> ";
 var myBarChart = new Chart(ctx).Bar(data, options);
}

function empty_dashboard(){
  document.getElementById("dashboard-title").innerHTML = "";
  document.getElementById("dashboard-content").innerHTML = "";
}

function list_goals(){
  empty_dashboard();
  document.getElementById("dashboard-title").innerHTML = "SDG Goals";
  var sdgList = document.getElementById("dashboard-content");
  var goals=sdgs.goals.goals;
  for (var i in goals){
    var goal= goals[i];
    append('li',sdgList,"goal-"+goal.goal,goal.goal+": "+goal.title+".");
  }
}

function list_indicators(){
  empty_dashboard();
  document.getElementById("dashboard-title").innerHTML = "SDG Indicators";
  var sdgList = document.getElementById("dashboard-content");
  var indicators=sdgs.indicators.indicators;
  for (var i in indicators){
    var indicator= indicators[i];
    append('li',sdgList,"goal-"+indicator.indicator,indicator.indicator+": "+indicator.indicator+".");
  }
}

function list_targets(){
  empty_dashboard();
  document.getElementById("dashboard-title").innerHTML = "SDG Targets";
  var sdgList = document.getElementById("dashboard-content");
  var targets=sdgs.targets.targets;
  for (var i in targets){
    var target= targets[i];
    append('li',sdgList,"goal-"+target.target,target.id+": "+target.title+".");
  }
}

function append(htype,hookElement,id,value){
  var newListItem = document.createElement(htype);
  newListItem.setAttribute("id", id);
  var ListValue = document.createTextNode(value);
  newListItem.appendChild(ListValue);
  hookElement.appendChild(newListItem);
}

function append_row(hookElement,row){
 var table = document.getElementById(hookElement);
  var rowObject = table.insertRow(0);
  for (var i in row){
    cell = rowObject.insertCell(i);
    cell.innerHTML = row[i];
  }
}

function array_num(size,num){
  return Array.apply(null, new Array(size)).map(Number.prototype.valueOf,num);
}

function add_targets(){
  var targets=sdgs.targets;
  for (var i in targets){
    var target=targets[i];
    var goalLi = document.getElementById("goal-"+target.goal);
    var targetId="goal-"+target.goal+"-targets";
    if ( document.getElementById(targetId) === null) {
      var nestedOl = document.createElement("ul");
      nestedOl.setAttribute("id", targetId);
      goalLi.appendChild(nestedOl);
    }else{
      var goalLiUl = document.getElementById(targetId);
      append('li',goalLiUl,"target-"+target.id,target.id+": "+target.title);
    }
  }
}

function add_indicators(sdgs){
  var indicators=sdgs.indicators;
  for (var i in indicators){
    var indicator=indicators[i];
    var goalLi = document.getElementById("goal-"+indicator.goal);
    var indicatorsId="goal-"+indicator.goal+"-indicators";
    if (document.getElementById(indicatorsId) === null) {
      var responsiveTable = document.createElement("div");
      responsiveTable.setAttribute("class","table-responsive");
      var nestedTable = document.createElement("table");
      nestedTable.setAttribute("class","table table-striped table-bordered");
      var header = nestedTable.createTHead();
      var rowObject = header.insertRow(0);
      var columns=["Indicator","Leads","Available"];
      for (var ii in columns ){
          var th = document.createElement('th');
          th.innerHTML = columns[ii];
          rowObject.appendChild(th);
      }
      var body = nestedTable.createTBody();
      body.setAttribute("id", indicatorsId);
      goalLi.appendChild(responsiveTable).appendChild(nestedTable);
     }else{
      append_row(indicatorsId,[indicator.indicator,indicator.leads,indicator.available]);
    }
  }
}
