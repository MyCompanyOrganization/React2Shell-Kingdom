#!/bin/bash
# 🏰 Reset the Kingdom of Reactland

echo ""
echo "🔄 Restoring the Kingdom of Reactland..."
echo "   Removing all Imposters from the castle..."
echo ""

cd "$(dirname "$0")"

# Restart the container - this rebuilds the castle and removes all imposters
docker compose down > /dev/null 2>&1
docker compose up -d > /dev/null 2>&1

echo "⏳ The castle is being rebuilt..."
sleep 3

echo ""
echo "✅ The Kingdom has been restored!"
echo ""
echo "👥 Current Trusted Villagers:"
docker exec react-cve-poc cat /app/data/users.json 2>/dev/null || echo "   (Castle is still opening its gates...)"
echo ""
echo "🏰 Castle Portal: http://localhost:3000"
echo "🦹 To run the Imposter's attack: ./exploit/poc.sh"
echo ""
