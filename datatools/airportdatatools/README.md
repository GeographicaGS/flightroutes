# Airport data tools
Computing Flight Routes Geometries and building World Airports layer.

CRS for output shapefiles: EPSG:4326


## Requeriments
- Numpy.
- Pandas.
- Fiona.
- Shapely.
- GeodesicLinesTogis (https://github.com/GeographicaGS/GeodesicLinesToGIS)
- PostgreSQL/PostGIS

To install GeodesicLinesTogis last version (REQUIRED!!):
(See requirements)
```
$ pip install GeodesicLinesToGIS
```

You've a Docker image avalaible with the requirements, do yourself a favor and use it.

You can either build it
```
$ docker build -t geographica/airportdatatools .
```
Or download the image form docker hub
```
$ docker pull geographica/airportdatatools
```

## Usage
If you're using docker:
```
$ docker run --rm -it -v $(pwd)/airportdatatools:/src/app geographica/airportdatatools
```

- Run world airports shapefile building:
```
$ python buildairportlayer.py
```
Default folder for merge shp file: /tmp/airports/airports.shp

- Run flight routes shapefile building for all world large airports:
```
$ python buildflightslayer.py

$ sh merge_shp.sh
```
Default folder for merge shp file: /tmp/flightdata/merged/merged.shp

Import it to postgis
```
shp2pgsql -s 4326 -g the_geom -W LATIN1 merged.shp  flight_routes > flight_routes.sql 

psql -U postgres -d <db> -f flight_routes.sql
```

Proccessing data for PostGIS:
```
select flight_routes_create_frame();

select flight_routes_createpoints(0.4);
```

Export flight_routes
```
$ pgsql2shp -h db -u postgres -P postgres -f flight_routes test "select * from flight_routes where orig in ('ATL','PEK','LHR','HND','LAX','DXB','ORD','CDG','DFW','HKG','FRA','CGK','IST','AMS','CAN','SIN','JFK','DEN','PVG','KUL','SFO','BKK','ICN','CLT','LAS','PHX','MAD','IAH','MIA','GRU','DEL','MUC','SYD','YYZ','FCO','LGW','SHA','CTU','BCN','SEA','SZX','TPE','MCO','EWR','NRT','MSP','BOM','MEX','MNL','DME')"
```

Export flight_routes_points
```
$ pgsql2shp -h db -u postgres -P postgres test flight_routes_points;
```

## Data sources
Raw data used to compute flight route geometries:

#### Airports
http://ourairports.com/data/

#### Routes
http://openflights.org/data.html

#### Airport total passengers
http://www.aci.aero/
http://en.wikipedia.org/wiki/List_of_the_world%27s_busiest_airports_by_passenger_traffic#2014_statistics


## About author
Developed by Alberto Asuero and Cayetano Benavent.

Geographica - http://www.geographica.gs

## Useful queries

Top airports by routes
```
with s as (SELECT count(*),orig FROM alasarr.flight_routes group by orig)
select * from s order by count DESC
```

Top airports by passengers
```
SELECT iata,passengers_2014 FROM alasarr.airports_passengersdata order by passengers_2014 dESC
```

## License
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
