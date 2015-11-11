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
