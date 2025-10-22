const crypto = require('crypto');
const supabase = require('./supabase');

function generateApiKey() {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
}

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

async function createApiKey(userId, name, rateLimit = 100, expiresAt = null) {
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      key_hash: keyHash,
      user_id: userId,
      name: name,
      rate_limit: rateLimit,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create API key: ' + error.message);
  }

  return {
    id: data.id,
    apiKey: apiKey,
    name: data.name,
    rateLimit: data.rate_limit,
    createdAt: data.created_at,
    expiresAt: data.expires_at
  };
}

async function validateApiKey(apiKey) {
  const keyHash = hashApiKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error('Database error: ' + error.message);
  }

  if (!data) {
    return null;
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return data;
}

async function logRequest(apiKeyId, endpoint, method, statusCode, ipAddress) {
  await supabase
    .from('api_requests')
    .insert({
      api_key_id: apiKeyId,
      endpoint: endpoint,
      method: method,
      status_code: statusCode,
      ip_address: ipAddress
    });
}

async function checkRateLimit(apiKeyId, rateLimit) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('api_requests')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', apiKeyId)
    .gte('created_at', oneMinuteAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return false;
  }

  return count < rateLimit;
}

async function listApiKeys(userId) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, name, is_active, rate_limit, last_used_at, created_at, expires_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to list API keys: ' + error.message);
  }

  return data;
}

async function revokeApiKey(apiKeyId, userId) {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', apiKeyId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to revoke API key: ' + error.message);
  }

  return true;
}

module.exports = {
  createApiKey,
  validateApiKey,
  logRequest,
  checkRateLimit,
  listApiKeys,
  revokeApiKey
};
