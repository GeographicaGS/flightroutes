'use strict';

var questions = [{
  title : 'Which is the busiest airport by passengers traffic?',
  options: ['JFK','PEK','HND','ATL','LHR'],
  answer : 'ATL',
  ico: './images/FR_icon-pasajero.svg'
},
{
  title : ' Which airport has more flight connections?',
  options: ['CDG','PEK','FRA', 'ATL', 'AMS'],
  answer : 'FRA',
  ico: './images/FR_icon-airplane.svg'

}];

var map,
  airports,
  arpt1 = 'ATL',
  arpt2 = 'FRA',
  markers = [null,null],
  layers = [null,null],
  layers2 = [null,null],
  username = 'alasarr',
  showQuiz = false,
  currentQuizQuestion = -1,
  $tooltip;

function start(){

  map = new L.Map('map', {
    center: [40,0],
    zoom: 3,
    zoomControl : false,
    minZoom : 2
  });

  new L.Control.Zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      attribution: 'Geographica'
  }).addTo(map);

  $('#map').append('<div id="tooltipmap">ey!!!!!!</div>');

  $tooltip = $('#tooltipmap');

  $('input[name="viz"]').click(refresh);

  var sql = new cartodb.SQL({ user: username });
  sql.execute('SELECT st_x(the_geom) as lng, st_y(the_geom) as lat,iata as code,apt_name as name,metro,iso_a3 as country_code,'
          +'nroutes,nroutes_af,nroutes_as,nroutes_eu,nroutes_na,nroutes_oc,nroutes_sa,' +
          'round(passengers_2014/1000000::numeric,2) as passengers FROM airports_passengersdata order by iata')
    .done(function(data) {
      airports = data.rows;
      if(typeof(Storage) !== "undefined") {
        showQuiz = localStorage.showedQuiz=="true" ? false : true;
        if (showQuiz){
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

  if (layers2[el]){
    map.removeLayer(layers2[el]);
    //layers[el].clear();
    layers2[el] = null;
  }

   if (markers[el]){

      map.removeLayer(markers[el]);
      //layers[el].clear();
      markers[el] = null;
  }


  var completeArpt = getArpt(arpt);
  var icon = L.icon({
      iconUrl: el== 0 ? 'images/FR_icon_airp1.svg' :'images/FR_icon_airp2.svg',
      iconSize: [16, 32],
      iconAnchor: [8, 32],
      zIndexOffset : 1
  });

  markers[el] = L.marker([completeArpt.lat, completeArpt.lng],
    {icon: icon}).addTo(map);

  var htmlmarkerover = Mustache.render($('#tooltip_airport_template').html(),{
    title: completeArpt.code + ' Routes',
    subtitle: completeArpt.nroutes,
    fields : [
      {
        'title' : 'To Africa',
        'value' : completeArpt.nroutes_af
      },
      {
        'title' : 'To Asia',
        'value' : completeArpt.nroutes_as
      },
      {
        'title' : 'To Europe',
        'value' : completeArpt.nroutes_eu
      },
      {
        'title' : 'To North America',
        'value' : completeArpt.nroutes_na
      },
      {
        'title' : 'To Oceania',
        'value' : completeArpt.nroutes_oc
      },
      {
        'title' : 'To South America',
        'value' : completeArpt.nroutes_sa
      }
    ]
  });

  var moveoutrequest = false;
  markers[el].on('mouseover', function (e) {
    $tooltip.html(htmlmarkerover)
      .removeClass('arpt1').removeClass('arpt2')
      .addClass(el==0 ? 'arpt1' : 'arpt2')
      .show().css('left',e.originalEvent.pageX+'px').css('top',e.originalEvent.pageY+'px');
    moveoutrequest = false;
  });
  
  markers[el].on('mouseout', function (e) {
    moveoutrequest = true;
    setTimeout(function(){
      if (moveoutrequest)
        $tooltip.hide();  
    },300);
    
  });

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

    cartodb.createLayer(map,opts)
      .addTo(map)
      .on('done', function(layer) {
        layers[el] = layer;
        if (el==0){
          layer.on('pause', function() {
            if (layers[1]){
              layers[1].pause();
            }
          });
          layer.on('stop', function() {
            if (layers[1]){
              layers[1].stop();
            }
          }); 
          layer.on('play', function() {
            if (layers[1]){
              layers[1].play();
            }
          });  
        }
      });

      if (viztype == 'torque'){
        opts = {
          type: 'cartodb',
          user_name: username,
           sublayers: [{
              sql: "SELECT * FROM flight_routes a  WHERE orig='" + arpt + "'", // Required
              cartocss:  Mustache.render($('#geodesiclines_opacity_cartocss').html(),{color: color}),
              //interactivity: 'cartodb_id,orig,dest'
          }]
        };
        cartodb.createLayer(map,opts)
          .addTo(map)
          .on('done', function(layer) {
            layers2[el] = layer;
          });
      }
  
  }
  else if (viztype == 'geodesiclines'){
    opts = {
      type: 'cartodb',
      user_name: username,
       sublayers: [{
          sql: "SELECT * FROM flight_routes a  WHERE orig='" + arpt + "'", // Required
          cartocss:  Mustache.render($('#geodesiclines_cartocss').html(),{color: color}),
          //interactivity: 'cartodb_id,orig,dest'
      }]
    };

   // var tooltiptemplate = $('#tooltip_routes_template').html();

    cartodb.createLayer(map,opts)
      .addTo(map)
      .on('done', function(layer) {
        layers[el] = layer;
        // layer.getSubLayer(0).setInteraction(true);
        
        // var hovers = [];

        // layer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
        //   hovers[layer] = 1;
        //   if(_.any(hovers)) {
        //     $('#map').css('cursor', 'pointer');
        //   }
        //   var o = getArpt(data.orig);
        //   var d = getArpt(data.dest);
        //   var html = Mustache.render(tooltiptemplate,{
        //     fromcode: o.code,
        //     fromdesc: o.metro + ' (' + o.country_code +')',
        //     tocode: data.dest,
        //     todesc: d ? d.metro + ' (' + d.country_code +')' : ''
        //   });
        //   $tooltip.html(html)
        //     .removeClass('arpt1').removeClass('arpt2')
        //     .addClass(el==0 ? 'arpt1' : 'arpt2')
        //     .show().css('left',pos.x+'px').css('top',pos.y+'px');
        // });
        // layer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
        //   hovers[layer] = 0;
        //   if(!_.any(hovers)) {
        //     $('#map').css('cursor', 'auto');
        //   }
        //   $tooltip.fadeOut(300);
        // });
      });

  }



 

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
               ,

                { arpt1: arpt1,arpt2: arpt2 })
    .done(function(data) {
      var d = data.rows[0],
        $dp = $("#airportPanels"),
        $el1 = $dp.find("#panelarpt1"),
        $el2 = $dp.find("#panelarpt2");

        // $el1.find(".airportcode").html(arpt1);
        changeArpt(arpt1,$el1.find(".airportcode"));

        // $el2.find(".airportcode").html(arpt2);
        changeArpt(arpt2,$el2.find(".airportcode"));

        // $el1.find(".nroutes_total").html(d.total1);
        changeTotalRoutes($el1.find(".nroutes_total"),d.total1);


        // $el2.find(".nroutes_total").html(d.total2);
        changeTotalRoutes($el2.find(".nroutes_total"),d.total2);

        // $el1.find(".passengers").html(parseFloat(d.passengers1/1000000).toFixed(2) + 'M');
        changePassengers($el1.find(".passengers"),parseFloat(d.passengers1/1000000).toFixed(2));

        // $el2.find(".passengers").html(parseFloat(d.passengers2/1000000).toFixed(2) + 'M');
        changePassengers($el2.find(".passengers"),parseFloat(d.passengers2/1000000).toFixed(2));

        var a1 = getArpt(arpt1), a2 = getArpt(arpt2);

        $el1.find(".airportName").html(a1.name);
        $el2.find(".airportName").html(a2.name);

        $el1.find(".airportCity").html(a1.metro +' ('+a1.country_code+')');
        $el2.find(".airportCity").html(a2.metro +' ('+a2.country_code+')');

    })
    .error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
}

function changePassengers(elem, pass){
  var current = parseFloat(elem.text().replace('M',''));
  if(!current || current == ""){
    elem.html(pass + 'M');

  }else{
    var time = 0;
    while(current != pass){
      time += 50;
      if(Math.abs(pass - current) > 1){
        if(pass > current){
          current ++;
        }else{
          current --;
        }
        current =  current.toFixed(2);
        changePassengersWorker(elem,current, time);

      }else{
        current = pass;
        changePassengersWorker(elem,current, time);
      }

    }
  }
}

function changePassengersWorker(elem, current, time){
  setTimeout(function(){ 
    elem.html(current + 'M');
  }, time);
}

function changeTotalRoutes(elem, total){
  var current = elem.text();
  if(!current || current == ""){
    elem.html(total);

  }else{
    var time = 0;
    while(current != total){
      if(total > current){
        current ++;
      }else{
        current --;
      }
      time += 30;
      changeTotalRoutesWorker(elem,current, time);
    }
  }
}

function changeTotalRoutesWorker(elem, current, time){
  setTimeout(function(){
    elem.html(current);
  }, time);
}

var letters = ['A','B','C','D','E','F','G','H','I','J','K','L', 'M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

function changeArpt(arpt,elem){
  var aux = arpt.split('');
  var list = elem.find('li');

  if(list.length == 0 || aux.length != list.length){
    var html = '<ul>';
    for(var i=0; i<aux.length; i++){
      html += '<li>' + aux[i] + '</li>';
    }
    html += '</ul>';
    elem.html(html);

  }else{
    for(var i=0; i<list.length; i++){  
      // changeLetter($(list[i]),aux[i]);
      changeLetterWorker($(list[i]),aux[i]);    
    }
  }
}

function changeLetterWorker (elem,newLetter){
  setTimeout(function(){
    changeLetter(elem,newLetter)
  }, 0);
}

function getPosition(letter){
  for(var i=0; i<letters.length; i++){
    if(letters[i] ==  letter){
      return i;
    }
  }
}

function changeLetter(elem,newLetter){
  var letter = elem.text().toUpperCase();
  var pos =  getPosition(letter);
  var time = 0;
  for(pos; pos<letters.length; pos++){
    time += 50;
    
    // elem.text(letters[pos]);
    replaceWorker(elem, letters[pos], time);

    if(letters[pos] == newLetter){
      return
    }
    if(pos == letters.length - 1){
      pos = -1;
    }
  }
}


function replaceWorker(elem, l, time){
  setTimeout(function(){ 
    elem.text(l);
  }, time);
}



function getArpt(code){
  return _.findWhere(airports, {code: code});
}

function runQuiz(){
  $('#quiz').fadeIn(300);
  nextQuiz();
}

function nextQuiz(e){

  if (e) e.preventDefault();

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
    opts.options[i].datavalue = currentQuizQuestion==0 ? opts.options[i].passengers +'M' : opts.options[i].nroutes;
  }
  opts.nexttext = currentQuizQuestion==0 ? 'Next' : 'Explore';
  opts.datalabel = currentQuizQuestion==0 ? 'Pax./year': 'Routes';

  
  opts.questionnumber = currentQuizQuestion+1;
  opts.total = questions.length;


  $q.html(Mustache.render(template,opts));

  if(typeof(Storage) !== "undefined" && localStorage.showedQuiz=="true")
    $q.find('input[name="dontshowquiz"]').attr('checked',true);

  $q.find('[data-action="next"]').click(nextQuiz);
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
    $(this).closest('#quiz').find('.next').addClass('right')
      .find('img').attr('src','./images/FR_icon-direccion1.svg');
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
  $q.find('[data-action="close"]').click(nextQuiz);
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
