@echo off
echo Adding information from 'prog.json' to the database.
curl -d "@prog.json" -H "Content-Type:application/json" http://localhost:9000/add-prog