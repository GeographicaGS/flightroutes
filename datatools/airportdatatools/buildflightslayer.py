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


from flightgeodlines import FlightGeodLines

__ALL_LARGE_AIRPORTS = True
__SINGLE_AIRPORT = "LHR" #IATA code


def main():
    try:
        apts_filename = "data/airports.csv"
        rts_filename = "data/routes.dat"
        rts_cols = ['airline_iata','airline_id','src_iata','src_id','dest_iata','dest_id','codeshare','stops','equipment']

        fgl = FlightGeodLines(apts_filename, rts_filename, rts_cols)
        airports, routes = fgl.loadData()

        if __ALL_LARGE_AIRPORTS:
            large_apts = fgl.getLargeApts(airports)

            for iata_code in large_apts:
                try:
                    fgl.run(airports, routes, iata_code, by_src=True, buildgeojson=False)

                except Exception as err:
                        print("Error running: {0}".format(err))

        else:
            iata_code = __SINGLE_AIRPORT
            fgl.run(airports, routes, iata_code, by_src=True, buildgeojson=False)

    except Exception as err:
            print("Error: {0}".format(err))

if __name__ == '__main__':
    main()
