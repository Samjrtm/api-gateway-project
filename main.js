const authMethodSelect = document.getElementById('authMethod');
const jwtGroup = document.getElementById('jwtGroup');
const apikeyGroup = document.getElementById('apikeyGroup');

authMethodSelect.addEventListener('change', (e) => {
  if (e.target.value === 'jwt') {
    jwtGroup.style.display = 'block';
    apikeyGroup.style.display = 'none';
  } else {
    jwtGroup.style.display = 'none';
    apikeyGroup.style.display = 'block';
  }
});

const tabs = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;

    tabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

function getAuthHeaders() {
  const authMethod = document.getElementById('authMethod').value;
  const headers = {
    'Content-Type': 'application/json'
  };

  if (authMethod === 'jwt') {
    const token = document.getElementById('jwtToken').value.trim();
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
  } else {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
  }

  return headers;
}

function getBaseUrl() {
  return document.getElementById('baseUrl').value.trim() || 'http://localhost:8000';
}

function displayResponse(data, status, time) {
  const output = document.getElementById('responseOutput');
  const statusCode = document.getElementById('statusCode');
  const responseTime = document.getElementById('responseTime');

  output.textContent = JSON.stringify(data, null, 2);

  statusCode.textContent = `${status}`;
  statusCode.className = `status-badge ${status >= 200 && status < 300 ? 'status-success' : 'status-error'}`;

  responseTime.textContent = `${time}ms`;
}

async function makeRequest(url, options = {}) {
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    const endTime = performance.now();
    const time = Math.round(endTime - startTime);

    const data = await response.json();
    displayResponse(data, response.status, time);

    return data;
  } catch (error) {
    const endTime = performance.now();
    const time = Math.round(endTime - startTime);

    displayResponse(
      { success: false, error: error.message },
      0,
      time
    );
  }
}

window.fetchVehiclePositions = async () => {
  const uid = document.getElementById('vehicleUid').value.trim();

  if (!uid) {
    alert('Please enter a vehicle UID');
    return;
  }

  const url = `${getBaseUrl()}/api/vehicles/${uid}/positions`;
  await makeRequest(url);
};

window.checkHealth = async () => {
  const url = `${getBaseUrl()}/health`;
  await makeRequest(url);
};

window.createApiKey = async () => {
  const name = document.getElementById('keyName').value.trim();
  const rateLimit = parseInt(document.getElementById('rateLimit').value);

  if (!name) {
    alert('Please enter a key name');
    return;
  }

  const url = `${getBaseUrl()}/api/keys/create`;
  await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({
      name,
      rateLimit,
      expiresAt: null
    })
  });
};

window.listApiKeys = async () => {
  const url = `${getBaseUrl()}/api/keys`;
  await makeRequest(url);
};

window.revokeApiKey = async () => {
  const keyId = document.getElementById('keyIdToRevoke').value.trim();

  if (!keyId) {
    alert('Please enter a key ID');
    return;
  }

  if (!confirm('Are you sure you want to revoke this API key?')) {
    return;
  }

  const url = `${getBaseUrl()}/api/keys/${keyId}`;
  await makeRequest(url, {
    method: 'DELETE'
  });
};
