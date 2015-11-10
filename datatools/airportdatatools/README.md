# Airport data tools
Computing Flight Routes Geometries and building World Airports layer.

CRS for output shapefiles: EPSG:4326

TODO:
- Destiny flight
- improve data cleaning proccess...

## Requeriments
- Numpy.
- Pandas.
- Fiona.
- Shapely.
- GeodesicLinesTogis (https://github.com/GeographicaGS/GeodesicLinesToGIS)

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
Default folder for merge shap file: /tmp/flightdata/merged/merged.shp

## Data sources
Raw data used to compute flight route geometries:

### Airports
http://ourairports.com/data/

#### Routes
http://openflights.org/data.html


## About author
Developed by Cayetano Benavent.
GIS Analyst at Geographica.

http://www.geographica.gs

## License
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.
