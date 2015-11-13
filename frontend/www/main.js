'use strict';

var questions = [{
  title : 'Which is the busiest airport by passengers traffic?',
  options: ['JFK','PEK','HND','ATL','LHR'],
  answer : 'ATL'
},
{
  title : ' Which airports have more flight connections?',
  options: ['CDG','PEK','FRA', 'ATL', 'AMS'],
  answer : 'FRA'
}];

var map,
  airports,
  arpt1 = 'ATL',
  arpt2 = 'FRA',
  layers = [null,null],
  username = 'alasarr',
  showQuiz = false,
  currentQuizQuestion = -1;

function start(){

  map = new L.Map('map', {
    center: [40,0],
    zoom: 2,
    zoomControl : false
  });

  new L.Control.Zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      attribution: 'Geographica'
  }).addTo(map);

  $('input[name="viz"]').click(refresh);

  var sql = new cartodb.SQL({ user: username });
  sql.execute('SELECT iata as code,apt_name as name,metro,iso_a3 as country_code,nroutes, ' +
          'round(passengers_2014/1000000::numeric,2) as passengers FROM airports_passengersdata order by iata')
    .done(function(data) {
      airports = data.rows;
      if(typeof(Storage) !== "undefined") {
        showQuiz = localStorage.showedQuiz=="true" ? false : true;
        if (showQuiz || true){
          runQuiz();
          //localStorage.showedQuiz = true;
        }
        else{
          refresh();
        }
      }
      else {
        showQuiz = true;
        refresh();
      }

      $('h4.airportcode').click(pickAirport);
    });
}

function drawLayer(opts){
  var arpt = opts.arpt,
    viztype = opts.viztype,
    el = opts.el;


  if (layers[el]){

      map.removeLayer(layers[el]);
      //layers[el].clear();
      layers[el] = null;
  }

  var opts;
  var color = el == 0 ? '#ffb400' : '#82b600';

  if (viztype == 'torque' || viztype == 'torqueblow'){
    var cartocss = viztype == 'torque' ?
      Mustache.render($('#torque_cartocss').html(),{color: color})
      : Mustache.render($('#torque_boom_cartocss').html(),{color: color});

    opts = {
      type: 'torque',
      options: {
        query: "SELECT * FROM flight_routes_points WHERE orig='" + arpt + "'",
        user_name: username,
        cartocss: cartocss
      }
    };
  }
  else if (viztype == 'geodesiclines'){
    opts = {
      type: 'cartodb',
      user_name: username,
       sublayers: [{
          sql: "SELECT * FROM flight_routes WHERE orig='" + arpt + "'", // Required
          cartocss:  Mustache.render($('#geodesiclines_cartocss').html(),{color: color})
      }]
    };
  }

   cartodb.createLayer(map,opts)
      .addTo(map)
      .on('done', function(layer) {
        layers[el] = layer;
      });

}
function refresh(){
  var viztype = $('input[name="viz"]:checked').val();

  drawLayer({
    arpt : arpt1,
    viztype : viztype,
    el : 0
  });

  drawLayer({
    arpt : arpt2,
    viztype : viztype,
    el : 1
  });

  var sql = new cartodb.SQL({ user: username });
  sql.execute("SELECT " +
                "(select count(*) from flight_routes where orig='{{arpt1}}') as total1," +
                "(select count(*) from alasarr.flight_routes where orig='{{arpt2}}') as total2,"+
                 "(select passengers_2014 from airports_passengersdata "+
                    " where iata='{{arpt1}}') as passengers1,"+
                "(select passengers_2014 from airports_passengersdata "+
                    " where iata='{{arpt2}}') as passengers2"
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt1}}' AND b.continent='EU' ) as eu1,"+
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt2}}' AND b.continent='EU' ) as eu2," +
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt1}}' AND b.continent='AF' ) as af1,"+
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt2}}' AND b.continent='AF' ) as af2," +
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt1}}' AND b.continent='AS' ) as as1,"+
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt2}}' AND b.continent='AS' ) as as2," +
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt1}}' AND b.continent='OC' ) as oc1,"+
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt2}}' AND b.continent='OC' ) as oc2," +
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt1}}' AND b.continent='NA' ) as na1,"+
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt2}}' AND b.continent='NA' ) as na2," +
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt1}}' AND b.continent='SA' ) as sa1,"+
                // "(select count(*) from alasarr.flight_routes a "+
                //   " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                //   " where a.orig='{{arpt2}}' AND b.continent='SA' ) as sa2" +
               ,

                { arpt1: arpt1,arpt2: arpt2 })
    .done(function(data) {
      var d = data.rows[0],
        $dp = $("#airportPanels"),
        $el1 = $dp.find("#panelarpt1"),
        $el2 = $dp.find("#panelarpt2");

        $el1.find(".airportcode").html(arpt1);
        $el2.find(".airportcode").html(arpt2);

        $el1.find(".nroutes_total").html(d.total1);
        $el2.find(".nroutes_total").html(d.total2);

        $el1.find(".passengers").html(parseFloat(d.passengers1/1000000).toFixed(2) + 'M');
        $el2.find(".passengers").html(parseFloat(d.passengers2/1000000).toFixed(2) + 'M');

        var a1 = getArpt(arpt1), a2 = getArpt(arpt2);

        $el1.find(".airportName").html(a1.name);
        $el2.find(".airportName").html(a2.name);

        $el1.find(".airportCity").html(a1.metro +' ('+a1.country_code+')');
        $el2.find(".airportCity").html(a2.metro +' ('+a2.country_code+')');

        // $el1.find(".nroutes_eu").html(d.eu1);
        // $el2.find(".nroutes_eu").html(d.eu2);

        // $el1.find(".nroutes_af").html(d.af1);
        // $el2.find(".nroutes_af").html(d.af2);

        // $el1.find(".nroutes_as").html(d.as1);
        // $el2.find(".nroutes_as").html(d.as2);

        // $el1.find(".nroutes_oc").html(d.oc1);
        // $el2.find(".nroutes_oc").html(d.oc2);

        // $el1.find(".nroutes_na").html(d.na1);
        // $el2.find(".nroutes_na").html(d.na2);

        // $el1.find(".nroutes_sa").html(d.sa1);
        // $el2.find(".nroutes_sa").html(d.sa2);


    })
    .error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
}



function getArpt(code){
  return _.findWhere(airports, {code: code});
}

function runQuiz(){
  $('#quiz').fadeIn(300);
  nextQuiz();
}

function nextQuiz(){

  currentQuizQuestion++;

  if (!questions.hasOwnProperty(currentQuizQuestion)){
    //quizCompleted();
    closeQuiz();
    return;
  }

  var template = $('#quiz_template').html(),
    opts = questions[currentQuizQuestion],
    $q = $('#quiz');

  for(var i=0; i<opts.options.length; i++){
    opts.options[i] = getArpt(opts.options[i]);
  }

  opts.questionnumber = currentQuizQuestion+1;
  opts.total = questions.length;

  $q.html(Mustache.render(template,opts));

  $q.find('[data-action="close"]').click(closeQuiz);
  $q.find('li').click(checkQuizQuestion);
  $q.find('input[name="dontshowquiz"]').click(dontShowQuizAgain)

  var lis = $q.find('li'),i = 0;

  var interval = setInterval(function(){
    var $el = $(lis[i]);
    $el.removeClass('hide').addClass('show');
    i++;
  
    if (i>=lis.length)
      clearInterval(interval);
  
  },800);

}

function checkQuizQuestion(){
  var answer = $(this).attr('data-answer'),
    parent = $(this).closest('li');

  if (answer == questions[currentQuizQuestion].answer){
    $(this).closest('ul').find('li').addClass('wrong');
    parent.removeClass('wrong').addClass('right');
  }
  else{
    parent.addClass('wrong');
    
  }
}

function closeQuiz(e){
  if (e) e.preventDefault();

  $('#quiz').fadeOut(300);
  currentQuizQuestion = -1;

  refresh();
}

function quizCompleted(){
  var template = $('#quiz_complete_template').html(),
    $q = $('#quiz');

  $q.html(Mustache.render(template));
  $q.find('[data-action="close"]').click(closeQuiz);
}

function dontShowQuizAgain(){
  if(typeof(Storage) !== "undefined") {
    if ($(this).is(':checked')){
      localStorage.showedQuiz = true;  
    }
    else{
      localStorage.showedQuiz = false;
    }
  }
}

function pickAirport(){

  var idPanel = $(this).closest('.panelAirport').attr('id'),
    renderClass = idPanel == 'panelarpt1' ? 'from' : 'to',
    template = $('#pick_airport_template').html(),
    $q = $('#list_airport_panel');

  $q.removeClass('from').removeClass('to').addClass(renderClass);

  var opts = {
    airports : airports
  }

  $q.html(Mustache.render(template,opts));

  $q.find('tr[data-code="'+ arpt1 +'"]').addClass('from');
  $q.find('tr[data-code="'+ arpt2 +'"]').addClass('to');

  $q.removeClass('hide').addClass('show');

  $q.find('.close').click(closeAirport);
  $q.find('tr[data-code]').click(function(){
    var code = $(this).attr("data-code");
    if (idPanel == 'panelarpt1'){
      arpt1 = code;
    }
    else{
      arpt2 = code;
    }
    closeAirport();

  });
}

function closeAirport(){
  var $q = $('#list_airport_panel');
  $q.removeClass('show').addClass('hide');
  refresh();

}


start();
