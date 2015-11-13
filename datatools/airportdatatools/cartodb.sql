ALTER TABLE flight_routes ADD COLUMN orig varchar(3);
ALTER TABLE flight_routes ADD COLUMN dest varchar(3);
ALTER TABLE flight_routes ADD COLUMN frame integer;
ALTER TABLE flight_routes ADD COLUMN frameblow integer;

UPDATE flight_routes set orig=substring(prop from 1 for 3),dest=substring(prop from 5 for 3);

CREATE INDEX fr_orig_idx ON flight_routes(orig);
CREATE INDEX fr_dest_idx ON flight_routes(dest);
CREATE INDEX fr_frame_idx ON flight_routes(frame);
CREATE INDEX fr_frameblow_idx ON flight_routes(frameblow);
ALTER TABLE flight_routes DROP COLUMN prop;

ALTER TABLE flight_routes_points ADD COLUMN orig varchar(3);
ALTER TABLE flight_routes_points ADD COLUMN frame integer;
ALTER TABLE flight_routes_points ADD COLUMN frameblow integer;
CREATE INDEX frp_orig_idx ON flight_routes_points(orig);
CREATE INDEX frp_frame_idx ON flight_routes_points(frame);
CREATE INDEX frp_frameblow_idx ON flight_routes_points(frameblow);




CREATE INDEX airports_iatacode_idx ON airports(iata_code);

ALTER TABLE airports_passengersdata ADD COLUMN nroutes integer;
UPDATE airports_passengersdata set nroutes=(select count(*) from flight_routes b where b.orig=iata)

update airports_passengersdata set the_geom=(select the_geom from alasarr.airports a where a.iata_code=iata AND a.type<>'closed')

ALTER TABLE airports_passengersdata ADD COLUMN nroutes_eu integer;
UPDATE airports_passengersdata SET nroutes_eu=(select count(*) from alasarr.flight_routes a
                 INNER JOIN alasarr.airports b ON a.dest=b.iata_code 
                 WHERE a.orig=iata AND b.continent='EU');

ALTER TABLE airports_passengersdata ADD COLUMN nroutes_af integer;
UPDATE airports_passengersdata SET nroutes_af=(select count(*) from alasarr.flight_routes a
                 INNER JOIN alasarr.airports b ON a.dest=b.iata_code 
                 WHERE  a.orig=iata AND b.continent='AF');

ALTER TABLE airports_passengersdata ADD COLUMN nroutes_as integer;
UPDATE airports_passengersdata SET nroutes_as=(select count(*) from alasarr.flight_routes a
                 INNER JOIN alasarr.airports b ON a.dest=b.iata_code 
                 WHERE  a.orig=iata AND b.continent='AS');

ALTER TABLE airports_passengersdata ADD COLUMN nroutes_oc integer;
UPDATE airports_passengersdata SET nroutes_oc=(select count(*) from alasarr.flight_routes a
                 INNER JOIN alasarr.airports b ON a.dest=b.iata_code 
                 WHERE  a.orig=iata AND b.continent='OC');

ALTER TABLE airports_passengersdata ADD COLUMN nroutes_na integer;
UPDATE airports_passengersdata SET nroutes_na=(select count(*) from alasarr.flight_routes a
                 INNER JOIN alasarr.airports b ON a.dest=b.iata_code 
                 WHERE  a.orig=iata AND b.continent='NA');

ALTER TABLE airports_passengersdata ADD COLUMN nroutes_sa integer;

UPDATE airports_passengersdata SET nroutes_sa=(select count(*) from alasarr.flight_routes a
                 INNER JOIN alasarr.airports b ON a.dest=b.iata_code 
                 WHERE  a.orig=iata AND b.continent='SA');



