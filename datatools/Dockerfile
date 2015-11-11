from debian:jessie

RUN apt-get update && \
apt-get -y install python-setuptools libgeos-c1 python-pip python-dev libgdal-dev git && \
pip install shapely numpy pandas fiona && \
git clone https://github.com/GeographicaGS/GeodesicLinesToGIS.git && cd GeodesicLinesToGIS && python setup.py install

# Cleaning
#RUN cd .. && rm -R GeodesicLinesToGIS && apt-get -y remove --purge python-dev libgdal-dev git python-setuptools python-pip
RUN cd .. && rm -R GeodesicLinesToGIS 

WORKDIR "/src/app"