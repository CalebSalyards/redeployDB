@echo off
echo Adding information from 'tag.json' to the database.
curl -d "@tag.json" -H "Content-Type:application/json" http://localhost:9000/add-tag