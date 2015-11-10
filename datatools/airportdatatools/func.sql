CREATE OR REPLACE FUNCTION flight_routes_create_frame() RETURNS void AS $$
DECLARE
  airport varchar(3); 
  tid integer;
  tframe integer;
  tframeblow integer;
  frameinc integer;
  frameblowinc integer;
BEGIN
  frameinc = 8;
  frameblowinc = 2;
  FOR airport in select orig from flight_routes group by orig LOOP
    tframe = 1;
    tframeblow = 1;
    FOR tid in (select gid from flight_routes where orig=airport) LOOP
      UPDATE flight_routes SET frame=tframe,frameblow=tframeblow WHERE gid=tid;
      tframe = tframe + frameinc;
      tframeblow = tframeblow + frameblowinc;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- CREATE TABLE flight_routes_points (
--   id        serial,
--   the_geom  geometry(Point),
--   orig  varchar(3),
--   dest  varchar(3),
--   frame integer,
--   CONSTRAINT id PRIMARY KEY(id)
-- );

-- CREATE INDEX flight_routes_points_thegeom_idx ON flight_routes_points USING GIST (the_geom);

CREATE OR REPLACE FUNCTION line2points(line geometry,distance numeric) RETURNS setof geometry AS $$
DECLARE
  gap numeric;
  pos numeric;
BEGIN
  
  gap = distance / ST_Length(line);
  pos = 0;

  WHILE pos<=1.0 LOOP
    RETURN NEXT ST_LineInterpolatePoint(line,pos);
    pos = pos + gap;
  END LOOP;

  IF pos != 1.0 THEN
    RETURN NEXT ST_LineInterpolatePoint(line,1);
  END IF;

  RETURN;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION multiline2points(multiline geometry,distance numeric) RETURNS setof geometry AS $$
DECLARE
  l numeric;
  gap numeric;
  pos numeric;
  gtype text;
  r record;
  p record;
BEGIN
  
  for r in select st_dump(multiline) as g loop
    for p in select line2points((r.g).geom,distance) as g loop
      --raise notice 'P: %',st_x(p.g);
      return NEXT p.g;
    end loop;
  end loop;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION flight_routes_createpoints(distance numeric) RETURNS void AS $$
DECLARE
  l numeric;
  route flight_routes%ROWTYPE;
  tframe integer;
  tframeblow integer;
  p record;
  n integer;
  frameinc integer;
BEGIN
  
  TRUNCATE flight_routes_points;
  n = 0;
  frameinc = 1;
  FOR route in (select * from flight_routes where orig in 
    ( 'JFK','SFO','MEX','GRU','EZE','DME','HND','SYD','PEK','JNB','KEF','YXU','YYZ',
      'MAD','SVQ','BCN','SXF','ZRH','ZRH','CDG','IST'))
   LOOP

    tframe = route.frame;
    tframeblow = route.frameblow;
    FOR p in select multiline2points(route.the_geom,distance) as g LOOP
      INSERT INTO flight_routes_points (the_geom,orig,dest,frame,frameblow) VALUES (p.g,route.orig,route.dest,tframe,tframeblow);
      tframe = tframe + frameinc;
      tframeblow = tframeblow + frameinc;
    END LOOP;
    --raise notice 'Routes completed',n;
    n = n + 1;
    if n % 1000 = 0 then
      raise notice '% routes done',n;
    end if;
  END LOOP;
END;
$$ LANGUAGE plpgsql;


--SELECT flight_routes_create_frame();