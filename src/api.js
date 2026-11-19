async function request(path, options) {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
  return body;
}

export function getFeed() {
  return request('/feed');
}

export function getMatches() {
  return request('/matches');
}

export function postSwipe(profileId, action) {
  return request('/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, action }),
  });
}
