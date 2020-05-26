// events
var events = [  {ymd: "2020-11-03", event: "U.S. elections" }, 
                {ymd: "2020-07-28", event: "AUSMIN" },
                {ymd: "2021-01-20", event: "Inauguration"}
              ];

var margin = {top: 20, right: 20, bottom: 20, left: 50};
var width = 1000;
var height = 1100;
var width_cal = 450;

var electionDay = new Date(2020,10,3);
var days_to_election = d3.timeDay.count(Date.now(), electionDay);
var inaugurationDay = new Date(2021,0,20);

var dayLabels = [ 'M','Tu','W','Th','F','Sa','Su' ];
var dayFmt = d3.timeFormat("%d");

// day sequence
var today = d3.timeDay(Date.now());

/* day sequence, needs to start/end on a Monday */
var startMonday = d3.timeMonday(today - 3600*1000*24*7);
var daySeq = d3.timeDay.every(1).range(startMonday, new Date(2021, 1, 1));

var today_index = daySeq.findIndex(function(element){return(element>today);}) - 1;

var week = daySeq.map(function(d,i){ 
  return Math.floor(i/7);
  }
); 

var get_DayOfWeek = d3.timeFormat("%u");
var DayOfWeek = daySeq.map(get_DayOfWeek).map(function(d){ return +d; });

var mondays = [ ]; 
for(var i=0; i<daySeq.length; i=i+7){
  mondays.push( { day: daySeq[i],
                  week: Math.floor(i/7),
                  ym: d3.timeFormat("%Y-%m")(daySeq[i]) });
  }

var weekOfFirstMonday = Array.from(d3.rollup(mondays, w => d3.min(w, d => d.week), d => d.ym));

var colors = {  today: "green",
                background_default: "#eee",
                background_event: "#5c98e1",
                rollover_default: "orange",  /* orange */
                rollover_event: "#0c5bbc",
                highlight_minor: "#bb685d",  /* fire engine red */
                highlight_major: "#9f2919"   /* deep red */
             };   




// scales
var x_canvas = d3.scaleLinear()
  .domain([0,1])
  .range([margin.left,width-margin.right]);

var x = d3.scaleLinear()
  .domain([0.5, 7.5])
  .range([margin.left, margin.left + width_cal]);


 var y = d3.scaleLinear()
  .domain([d3.min(week)-1, d3.max(week)+.5])
  .range([margin.top, height - margin.bottom]); 


var ygrid = d3.range(d3.min(week)-.5, d3.max(week)+.5, 1);

var xgrid = [ .5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5 ]; 

// date data
var dateData = [ ];
for(var i=0; i<daySeq.length; i++){
    dateData.push( 
                    { i: i,
                      day: daySeq[i], 
                      day_of_week: DayOfWeek[i],
                      ymd: d3.timeFormat("%Y-%m-%d")(daySeq[i]),
                      week: week[i], 
                      xpos: xgrid[DayOfWeek[i]-1],
                      ypos: ygrid[d3.set(week).values().indexOf(""+week[i])],
                      fill_color: i==today_index ? colors.today : colors.background_default,
                      mouseover_color: i==today_index ? colors.highlight_major : colors.rollover_default
                    } 
                 );
  }




events = events.map(function(d) {
  return {
    ymd: d.ymd,
    day: d3.timeParse("%Y-%m-%d")(d.ymd),
    fill_color: colors.background_event,
    mouseover_color: colors.rollover_event,
    event: d.event
  };
});

dateData = alasql('SELECT * FROM ? dateData \
  LEFT JOIN ? events \
  ON dateData.ymd = events.ymd',[dateData,events]);

/************************************************************/
// publications data
var publications_promise = d3.csv("research_timeline.csv")
  .then(function(data){
    data.forEach(function(d) {
      d.original =  d3.timeParse("%m/%d/%Y")(d.date);
      d.day =  d3.timeParse("%m/%d/%Y")(d.actual);
      d.ymd = d3.timeFormat("%Y-%m-%d")(d3.timeParse("%m/%d/%Y")(d.actual));
      d.event = d.Title;
      d.program = d.program;
      d.fill_color = (+d.major == 1) ? colors.highlight_major : colors.highlight_minor;
      d.mouseover_color = (+d.major == 1) ? colors.highlight_major : colors.highlight_minor; 
      } 
    )
    return data; 
  }
);

// merge 
var dateData_complete = publications_promise
  .then(function(data){
    return alasql('SELECT * FROM ? dateData \
      LEFT JOIN ? data \
      ON dateData.ymd = data.ymd',
      [dateData,data]);
 });


/************************************************************/
// define svg object
var svg = d3.select("body")
  .append("svg")
  .attr("width",width)
  .attr("height",height);

var ddd = svg.append("g")
  .append("text")
  .attr("x",x(8.5))
  .attr("y",y(d3.min(week)-1))
  .attr("dominant-baseline","middle")
  .attr("text-anchor","start")
    /* .text("Today is " + 
         d3.timeFormat("%b %d")(now) + 
          ", " + 
          days_to_election + " " + "days until the election") */
  .attr("class","days_to_election");

// place holder event text
var eee = svg.append("g")
  .append("text")
  .attr("x",x(8.5))
  .attr("y",y(d3.min(week)+1))
  .attr("dominant-baseline","middle")
  .attr("text-anchor","start")
  .attr("class","event_name");

var xAxis = g => g 
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x)
    .tickValues(xgrid)
    .tickSize(0)
    .tickFormat(""))
  .call(g => g.select(".domain")
        .remove());

var yAxis = g => g
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y)
    .tickValues(ygrid)
    .tickSize(0)
    .tickFormat(""))    
  .call(g => g.select(".domain")
      .remove());

svg.append("g")
      .call(xAxis);

svg.append("g")
      .call(yAxis);
  
/* day of week labels */
for(var i=1;i<8;i++){
  svg.append("g")
    .append('text')
    .attr("x",x(i))
    .attr("y",y(d3.min(week)-1))
    .text(dayLabels[i-1])
    .style("text-anchor","middle")
    .attr("dominant-baseline","middle");
}
  
/* month labels */
svg.append("g")
  .selectAll("g")
  .data(weekOfFirstMonday)
  .enter()
  .append("text")
  .each(function(d){
		d.yPos = y(d[1]);
		d.label = d3.timeFormat("%b")(d3.timeParse("%Y-%m")(d[0]));
  })
  .attr("x",x(.5))
  .attr("y",d => d.yPos)
  .attr("dx",-6)
  .attr("text-anchor", "end")
  .text(d => d.label)
  .attr("dominant-baseline","middle");
  
/* grid */
var cell = { w: x(2) - x(1),
             h: y(20) - y(19) };
  
/* container for grid: grid cells and dates inside grid cells */
dateData_complete.then(function(data){

  var marker = svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("id",function(d,i) { return "datesquare_" + i });
  
  var dateSquare_object = marker.append("g")
    .each(function(d,i){
       d.day = d.day;
       d.xpos_actual = x(d.xpos);
       d.label = d3.timeFormat("%e")(d.day);
       d.ypos_actual = y(d.ypos);
       d.xpos_text = x(d.day_of_week);
       d.ypos_text = y(d.week);
       d.fill_color = d.fill_color;
       d.mouseover_color = d.mouseover_color;
       d.event = d.event;
       d.program = d.program;
       d.indx = i;
    });
  
  var dateSquare = dateSquare_object
    .append("rect")
    .attr("id",function(d) { "datesquare_" + d.indx; })
    .attr("x",d => d.xpos_actual)
    .attr("y",d => d.ypos_actual)
    .attr("width",cell.w - 1)
    .attr("height",cell.h - 1)
    .style("stroke-width","2px")
    .style("stroke","transparent")
    .style("fill",d => d.fill_color);
    
  var dateText = dateSquare_object
    .append("text")
    .attr("id",function(d) { "datesquare_" + d.indx; })
    .attr("x",d => d.xpos_text)
    .attr("y",d => d.ypos_text)
    .text(d => d.label)
    .style("text-anchor","middle")
    .attr("dominant-baseline","middle")
    .attr("class","dateText");

  /* svg.call(highlight_today); */
    
  dateSquare_object
    .on("mouseover",
            function(d){
              d3.select(this).selectAll("rect")
                .attr("visibility","visible")
                .style("fill",d.mouseover_color)
                .style("stroke","#222")
                .style("stroke-width","0px");
              d3.select(this).selectAll("text")
                .attr("dy",2)
                .style("fill","#fff")
                .style("font-size","15pt");
              var d_to_election = d3.timeDay.count(d.day,electionDay);
              var d_to_i = d3.timeDay.count(d.day,inaugurationDay);
              var today_text = d3.timeFormat("%B %-d")(d.day);
              if(d.indx == today_index){
                today_text = "Today";
              }
              if(d_to_election > 0){
                ddd.text(today_text + ": " +
                        d_to_election + " " + 
                         ((d_to_election == 1) ? "day" : "days") + 
                         " " +
                         "until the U.S. elections"); 
              }
              if(d_to_election<0 & d_to_i>0){
                ddd.text(today_text + ": " +
                        d_to_i + " " + 
                         ((d_to_i == 1) ? "day" : "days") + 
                         " " +
                         "until the inauguration"); 
              }
              if(typeof d.event !== "undefined"){
                eee.text(d.event).call(wrap,400);
                  /* add program info if available */
                  if(typeof d.program !=="undefined"){
                    eee.append("tspan")
                    .attr("x",eee.attr("x"))
                    .attr("dy","1.3em")
                    .attr("class","event_details")
                    .text("Program: " + d.program);
                  }
                var d_to_event = d3.timeDay.count(today,d.day);
                var extra_text = "";
                if(d_to_event>0){
                  extra_text = d_to_event + " " + ((d_to_event==1) ? "day" : "days") + " " + "from today";
                  eee.append("tspan")
                  .attr("x",eee.attr("x"))
                  .attr("dy","1.5em")
                  .attr("class","event_details")
                  .text(extra_text);
                }
              } 
            })
     .on("mouseout",
            function(d){
              var zzz = d3.select(this);
                
              zzz.selectAll("rect")
                .style("fill",d.fill_color);
                  /* .style("fill",
                         function(d){
                                      var check = d.indx == today_index;
                                      var out = check ? "orange" : "#eee";
                                      return out; 
              }); */
              zzz.selectAll("text")
                  .style("fill","#000")
                  .style("font-size","11pt");
              ddd.text("");
              eee.text("");
            });

});

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}






