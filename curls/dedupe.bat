@echo off
echo Removing duplicates from the database.
curl -d "{}" -H "Content-Type:application/json" http://localhost:9000/dedupe