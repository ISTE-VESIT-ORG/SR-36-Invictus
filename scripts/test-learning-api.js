const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/learning-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleTitle: 'Test Module', topics: ['Test'], level: 'Beginner' }),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Request failed:', err);
  }
})();
