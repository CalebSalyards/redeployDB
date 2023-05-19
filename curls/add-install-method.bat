@echo off
echo Adding information from 'install-method.json' to the database.
curl -d "@install-method.json" -H "Content-Type:application/json" http://localhost:9000/add-install-method