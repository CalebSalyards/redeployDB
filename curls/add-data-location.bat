@echo off
echo Adding information from 'data-location.json' to the database.
curl -d "@data-location0.json" -H "Content-Type:application/json" http://localhost:9000/add-data-location
curl -d "@data-location1.json" -H "Content-Type:application/json" http://localhost:9000/add-data-location
curl -d "@data-location2.json" -H "Content-Type:application/json" http://localhost:9000/add-data-location