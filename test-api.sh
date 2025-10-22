#!/bin/bash

echo "===================================="
echo "API Gateway Test Suite"
echo "===================================="
echo ""

API_URL="http://localhost:8000"

echo "1. Testing Health Endpoint..."
HEALTH=$(curl -s $API_URL/health)
echo "Response: $HEALTH"
echo ""

echo "2. Generating JWT Token..."
TOKEN=$(node src/test-token.js 2>&1 | grep "^eyJ" | head -1)
echo "Token generated: ${TOKEN:0:50}..."
echo ""

echo "3. Testing Create API Key (requires JWT)..."
echo "   Run this manually after starting the server:"
echo "   curl -X POST $API_URL/api/keys/create \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"Authorization: Bearer $TOKEN\" \\"
echo "     -d '{\"name\":\"Test Key\",\"rateLimit\":100}'"
echo ""

echo "4. Testing List API Keys (requires JWT)..."
echo "   Run this manually after starting the server:"
echo "   curl $API_URL/api/keys \\"
echo "     -H \"Authorization: Bearer $TOKEN\""
echo ""

echo "===================================="
echo "Test Complete!"
echo "===================================="
echo ""
echo "To start the server: npm start"
echo "To start the dashboard: npm run dev"
echo ""
