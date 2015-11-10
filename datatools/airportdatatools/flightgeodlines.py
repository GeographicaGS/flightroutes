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


import os
import shutil
import numpy as np
import pandas as pd
from geodesiclinestogis.geodesicline2gisfile import GeodesicLine2Gisfile


class FlightGeodLines(object):

    def __init__(self, apts_fl, rts_fl, rts_cols):
        self.__apts_fl = apts_fl
        self.__rts_fl = rts_fl
        self.__rts_cols = rts_cols


    def __loadData(self, apts_csv, rts_csv, rts_cols):
        """
        Loading airport and routes data
        """
        apts = pd.read_csv(apts_csv)
        rts = pd.read_csv(rts_csv, names=rts_cols)

        return(apts, rts)


    def __getRoutesBySrc(self, iata_src, rts_df, prnt_rslt=True):
        """
        Getting routes by source airport
        """
        rts_df = rts_df.sort(columns="dest_iata")
        rts_by_src = rts_df[rts_df["src_iata"] == iata_src]["dest_iata"]
        rts_by_src_d = rts_by_src.drop_duplicates()

        tot_routes = rts_by_src_d.count()

        if prnt_rslt:
            print "Total routes {0}: {1}".format(iata_src, tot_routes)

        return(rts_by_src_d, tot_routes)


    def __getRoutesByDst(self, iata_dst, rts_df, prnt_rslt=True):
        """
        Getting routes by destination airport
        """
        rts_df_d = rts_df.drop_duplicates(subset="dest_iata")
        rts_by_dst = rts_df_d[rts_df_d["dest_iata"] == iata_dst]["src_iata"]
        tot_routes = rts_by_dst.count()

        if prnt_rslt:
            print "Total routes {0}: {1}".format(iata_dst, tot_routes)

        return(rts_by_dst, tot_routes)


    def __getDstGeom(self, apts, rts_by_src):
        rt_lst = [rt for rt in rts_by_src]

        dst_geom = apts[apts["iata_code"].isin(rt_lst)][["iata_code","latitude_deg","longitude_deg"]]
        dst_geom = dst_geom.sort(columns="iata_code").drop_duplicates(subset="iata_code")

        lat_dst = dst_geom.latitude_deg.values
        lon_dst = dst_geom.longitude_deg.values

        coords_dst = np.array([lon_dst, lat_dst])
        coords_dst_t = coords_dst.T

        return coords_dst_t


    def __getSrcGeom(self, apts, apt_src):
        """
        """
        src_geom = apts[apts["iata_code"] == apt_src][["iata_code","latitude_deg","longitude_deg"]]

        lat_src = src_geom.latitude_deg.values
        lon_src = src_geom.longitude_deg.values

        coords_src = np.array([lon_src, lat_src])
        coords_src_t = coords_src.T

        return coords_src_t


    def __getRoutesGeoms(self, coords_src_dst, folderpath, layername, buildgeojson, props):
        """
        """
        gtg = GeodesicLine2Gisfile()
        gtg.gdlToGisFileMulti(coords_src_dst, folderpath, layername, prop=props, gjs=buildgeojson)


    def __createNewDir(self, dir_path):
        """
        Helper method...
        """
        if os.path.exists(dir_path):
            shutil.rmtree(dir_path)
        os.makedirs(dir_path)


    def getLargeApts(self, airports):
        """
        Getting large (type) airports around the world...
        """
        lapt = airports[airports["type"] == "large_airport"]["iata_code"]
        lapt_cl = lapt.dropna()

        return(lapt_cl.tolist())

    def loadData(self):
        return(self.__loadData(self.__apts_fl, self.__rts_fl, self.__rts_cols))


    def run(self, airports, routes, iata_code, by_src=True, buildgeojson=True, basepath="/tmp/flightdata"):
        """
        Run computations to get flight geodesic lines.

            :airports, airports data loaded.
            :routes, routes data loaded.
            :iata_code, IATA code for origin or destination airport
                to start computations.
            :by_src, if computations are done by source airport
                (default True).
            :buildgeojson, build GeoJSON format, in addition to Shapefile (default True)
            :basepath, base folder to store output files (default "/tmp")
        """

        if by_src:
            # Geom routes by SRC
            __iata_src = iata_code
            rts_by_src, tot_routes = self.__getRoutesBySrc(__iata_src, routes)

            coords_src_t = self.__getSrcGeom(airports, __iata_src)
            coords_dst_t = self.__getDstGeom(airports, rts_by_src)

            coord_dim = coords_dst_t.shape[0]

            coords_src_dst = np.hstack((np.tile(coords_src_t,(coord_dim,1)), coords_dst_t))

            folderpath = os.path.join(basepath, "airpt_geod_line_{}".format(__iata_src))
            layername = "air_route_{}".format(__iata_src)

            self.__createNewDir(folderpath)

            props = ["{0}_{1}".format(__iata_src, i) for i in rts_by_src.tolist()]

            self.__getRoutesGeoms(coords_src_dst, folderpath, layername, buildgeojson, props)

        else:
            # Geom routes by DST
            __iata_dst = iata_code
            rts_by_dst, tot_routes = self.__getRoutesByDst(__iata_dst, routes)

            coords_src_t = self.__getSrcGeom(airports, __iata_dst)
            coords_dst_t = self.__getDstGeom(airports, rts_by_dst)

            coord_dim = coords_dst_t.shape[0]

            coords_src_dst = np.hstack((np.tile(coords_src_t,(coord_dim,1)), coords_dst_t))

            folderpath = os.path.join(basepath, "airpt_geod_line_dst_{}".format(__iata_src))
            layername = "air_route_dst{}".format(__iata_dst)

            self.__createNewDir(folderpath)

            props = ["{0}_{1}".format(__iata_dst, i) for i in rts_by_dst.tolist()]

            self.__getRoutesGeoms(coords_src_dst, folderpath, layername, buildgeojson, props)
