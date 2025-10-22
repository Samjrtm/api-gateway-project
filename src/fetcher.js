// Gère l'authentification + fetch avec cache session userId/sessionId
const axios = require('axios');
const cache = require('./cache');
const { apiUser, apiPass, apiAuthUrl, apiPosUrl } = require('./config');

async function getSession() {
  // Cherche session actuelle en cache
  let session = await cache.get('session');
  if (session) return JSON.parse(session);

  // Sinon fait login
  const url = `${apiAuthUrl}?UserName=${apiUser}&Password=${apiPass}`;
  console.log('URL de login:', url);
  const { data } = await axios.get(url);
  if (data.Status.Result !== 'ok') throw new Error('Login failed');
  const res = {
    userId: data.Result.UserIdGuid,
    sessionId: data.Result.SessionId
  };
  // Garder en cache pour 50 minutes
  await cache.setEx('session', 3000, JSON.stringify(res));
  return res;
}

// Fetch GPS positions depuis 3DTracking
async function fetchPositions(uid) {
  const { userId, sessionId } = await getSession();
  const url = `${apiPosUrl}?UserIdGuid=${userId}&SessionId=${sessionId}&Uid=${uid}&IncludeInputOutputs=true`;
  const { data } = await axios.get(url, { timeout: 10000 });
  return data;
}

module.exports = { fetchPositions };
