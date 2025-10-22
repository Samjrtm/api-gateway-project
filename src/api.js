const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { fetchPositions } = require("./fetcher");
const authMiddleware = require("./auth");
const { port } = require("./config");
const apiKeyManager = require("./apiKeyManager");

const app = express();

app.use(cors());
app.use(express.json());

app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/keys/create", authMiddleware, async (req, res) => {
  try {
    const { name, rateLimit, expiresAt } = req.body;
    const userId = req.user.sub || req.user.userId || 'test-user';

    const result = await apiKeyManager.createApiKey(userId, name, rateLimit, expiresAt);

    res.json({
      success: true,
      data: result,
      message: 'API key created successfully. Store this key securely - it cannot be retrieved again.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/keys", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.userId || 'test-user';
    const keys = await apiKeyManager.listApiKeys(userId);

    res.json({
      success: true,
      data: keys,
      count: keys.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/keys/:keyId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.userId || 'test-user';
    await apiKeyManager.revokeApiKey(req.params.keyId, userId);

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function apiKeyAuthMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];

  if (apiKey) {
    try {
      const keyData = await apiKeyManager.validateApiKey(apiKey);

      if (!keyData) {
        return res.status(403).json({ success: false, error: 'Invalid or expired API key' });
      }

      const withinLimit = await apiKeyManager.checkRateLimit(keyData.id, keyData.rate_limit);

      if (!withinLimit) {
        return res.status(429).json({ success: false, error: 'Rate limit exceeded' });
      }

      await apiKeyManager.logRequest(
        keyData.id,
        req.path,
        req.method,
        200,
        req.ip
      );

      req.user = { userId: keyData.user_id };
      return next();
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else if (authHeader) {
    return authMiddleware(req, res, next);
  } else {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
}

app.get("/api/vehicles/:uid/positions", apiKeyAuthMiddleware, async (req, res) => {
  try {
    const raw = await fetchPositions(req.params.uid);

    const vehicles = (raw.Result.Position || []).map((p) => ({
      id: p.Unit?.Uid,
      name: p.Unit?.Name,
      lastUpdate: p.Unit?.LastReportedTimeUTC,
      location: {
        lat: p.Latitude,
        lng: p.Longitude,
        address: p.Address,
      },
      status: {
        speed: p.Speed,
        unit: p.SpeedMeasure,
        heading: p.Heading,
        ignition: p.Ignition === "ON",
        engine: p.EngineStatus,
      },
    }));

    res.json({
      success: true,
      data: { vehicles },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.listen(port, () => console.log("API Gateway listening on " + port));
