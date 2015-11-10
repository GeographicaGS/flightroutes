# -*- coding: utf-8 -*-
#
#  Author: Cayetano Benavent, 2015.
#  cayetano.Benavent@geographica.gs
#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#


import  os
import shutil
import pandas as pd
from shapely.geometry import Point, mapping
from fiona import collection
from fiona.crs import from_epsg


def run(apts_filename, apts_shp, epsg_cd=4326):
    lon = "longitude_deg"
    lat = "latitude_deg"

    apts_schema = getAptsSchema()

    apts_df = pd.read_csv(apts_filename, keep_default_na=False)

    out_crs = from_epsg(epsg_cd)

    with collection(apts_shp, "w", "ESRI Shapefile", apts_schema, crs=out_crs) as output:
        for index, row in apts_df.iterrows():
            pt_geom = Point(row[lon], row[lat])
            output.write({
                "properties": {"id": row["id"],
                               "ident": row["ident"],
                               "type": row["type"],
                               "name": row["name"],
                               "latitude_deg": row["latitude_deg"],
                               "longitude_deg": row["longitude_deg"],
                               "elevation_ft": row["elevation_ft"],
                               "continent": row["continent"],
                               "iso_country": row["iso_country"],
                               "iso_region": row["iso_region"],
                               "municipality": row["municipality"],
                               "scheduled_service": row["scheduled_service"],
                               "gps_code": row["gps_code"],
                               "iata_code": row["iata_code"],
                               "local_code": row["local_code"],
                               "home_link": row["home_link"],
                               "wikipedia_link": row["wikipedia_link"],
                               "keywords": row["keywords"]
                               },
                "geometry": mapping(pt_geom)
            })

            if index in range(0,100001, 10000):
                print "\t{:,.0f} Elements builded...".format(index)

        print "\t{:,.0f} Elements builded...".format(index)


def createNewDir(dir_path):
    """
    Helper method...
    """
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
    os.makedirs(dir_path)

def getAptsSchema():
    """
    This method returns the needed schema
    to build airport shapefile layer
    """
    return {
            'geometry': 'Point',
            'properties': { "id": "int",
                            "ident": "str",
                            "type": "str",
                            "name": "str",
                            "latitude_deg": "float",
                            "longitude_deg": "float",
                            "elevation_ft": "int",
                            "continent": "str",
                            "iso_country": "str",
                            "iso_region": "str",
                            "municipality": "str",
                            "scheduled_service": "str",
                            "gps_code": "str",
                            "iata_code": "str",
                            "local_code": "str",
                            "home_link": "str",
                            "wikipedia_link": "str",
                            "keywords": "str"
                        }
        }

def main():
    try:
        apts_filename = "data/airports.csv"
        apts_shp = "/tmp/airports/airports.shp"

        print "\nCreating airport layer from CSV:", apts_filename

        createNewDir(os.path.dirname(apts_shp))

        run(apts_filename, apts_shp)

        print "Successfully builded shapefile!: {}\n".format(apts_shp)

    except Exception as err:
            print("Error: {0}".format(err))

if __name__ == '__main__':
    main()
