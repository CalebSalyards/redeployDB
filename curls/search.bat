@echo off
echo Adding information from 'search.json' to the database.
curl -d "@search.json" -H "Content-Type:application/json" http://localhost:9000/search