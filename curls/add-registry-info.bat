@echo off
echo Adding information from 'registry-info.json' to the database.
curl -d "@registry-info.json" -H "Content-Type:application/json" http://localhost:9000/add-registry-info