'use strict';

var airports = {
  'JFK' : 'New York',
  'SFO' : 'San Francisco',
  'MEX' : 'México DF',
  'GRU' : 'São Paulo',
  'EZE' : 'Buenos Aires',
  'DME' : 'Moscow',
  'HND' : 'Tokyo',
  'SYD' : 'Sidney',
  'PEK' : 'Pekin',
  'JNB' : 'Johannesburg',
  'KEF' : 'Reykjavik',
  'YXU' : 'London',
  'YYZ' : 'Toronto',
  'MAD' : 'Madrid',
  'SVQ' : 'Sevilla',
  'BCN' : 'Barcelona',
  'SXF' : 'Berlin',
  'ZRH' : 'Zurich',
  'CDG' : 'Paris',
  'IST' : 'Istambul'
};

var map,
  $s1 = $('select#airport_1'),
  $s2 = $('select#airport_2'),
  layers = [null,null],
  username = 'alasarr';

function populateSelect($el){
  var html = '';
  for (var code in airports){
    html += '<option value="' + code + '">' + airports[code] + ' - ' + code + '</option>';
  }
  $el.html(html);
}

function start(){
  populateSelect($('select#airport_1'));
  populateSelect($('select#airport_2'));

  $('select#airport_1').val('JFK');
  $('select#airport_2').val('PEK');  
  
  map = new L.Map('map', {
    center: [0,0],
    zoom: 2,
    zoomControl : false
  });

  new L.Control.Zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
      attribution: 'Geographica'
  }).addTo(map);

  $('input[name="viz"]').click(refresh);
  $('select.ctrl_airport').change(refresh);

  refresh();
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
  var color = el == 0 ? '#0F3B82' : '#055D00';

  if (viztype == 'torque' || viztype == 'torqueblow'){
    var aggregation = viztype == 'torque' ? 'linear' : 'cumulative';
    var datafield = viztype == 'torque' ? 'frame' : 'frameblow';
    opts = {
      type: 'torque', 
      options: {
        query: "SELECT * FROM flight_routes_points WHERE orig='" + arpt + "'",   
        user_name: username, 
        cartocss:  Mustache.render($('#torque_cartocss').html(),{color: color,aggregation: 'linear',datafield : datafield})
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
  var viztype = $('input[name="viz"]:checked').val(),
    arpt1 = $s1.val(),
    arpt2 = $s2.val();


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
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt1}}' AND b.continent='EU' ) as eu1,"+
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt2}}' AND b.continent='EU' ) as eu2," +
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt1}}' AND b.continent='AF' ) as af1,"+
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt2}}' AND b.continent='AF' ) as af2," +
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt1}}' AND b.continent='AS' ) as as1,"+
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt2}}' AND b.continent='AS' ) as as2," +
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt1}}' AND b.continent='OC' ) as oc1,"+
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt2}}' AND b.continent='OC' ) as oc2," +
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt1}}' AND b.continent='NA' ) as na1,"+
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt2}}' AND b.continent='NA' ) as na2," +
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt1}}' AND b.continent='SA' ) as sa1,"+
                "(select count(*) from alasarr.flight_routes a "+
                  " INNER JOIN alasarr.airports b ON a.dest=b.iata_code " +
                  " where a.orig='{{arpt2}}' AND b.continent='SA' ) as sa2 " , 
                { arpt1: arpt1,arpt2: arpt2 })
    .done(function(data) {
      var d = data.rows[0],
        $dp = $("#datapanel"),
        $el1 = $dp.find(".el1"),
        $el2 = $dp.find(".el2");

      console.log(d);

        $el1.find("h6").html(arpt1);
        $el2.find("h6").html(arpt2);

        $el1.find(".nroutes_total").html(d.total1);
        $el2.find(".nroutes_total").html(d.total2);

        $el1.find(".nroutes_eu").html(d.eu1);
        $el2.find(".nroutes_eu").html(d.eu2);

        $el1.find(".nroutes_af").html(d.af1);
        $el2.find(".nroutes_af").html(d.af2);

        $el1.find(".nroutes_as").html(d.as1);
        $el2.find(".nroutes_as").html(d.as2);

        $el1.find(".nroutes_oc").html(d.oc1);
        $el2.find(".nroutes_oc").html(d.oc2);

        $el1.find(".nroutes_na").html(d.na1);
        $el2.find(".nroutes_na").html(d.na2);

        $el1.find(".nroutes_sa").html(d.sa1);
        $el2.find(".nroutes_sa").html(d.sa2);
    })
    .error(function(errors) {
      // errors contains a list of errors
      console.log("errors:" + errors);
    })
}


start();



