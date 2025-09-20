const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql/';

router.post('/', async (req, res) => {
  try {
    console.log('Incoming request body:', req.body);  // Log incoming request

    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0', // Add User-Agent header to mimic browser
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      // Forward response status and error text
      const errorText = await response.text();
      console.error(`LeetCode API returned status ${response.status}: ${errorText}`);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('LeetCode API response:', data);  // Log LeetCode response

    res.json(data);
  } catch (error) {
    console.error('LeetCode proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from LeetCode API' });
  }
});

module.exports = router;
