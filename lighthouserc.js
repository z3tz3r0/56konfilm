module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/en', 'http://localhost:3000/th'],
      startServerCommand: 'npm run start',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        // Disable PWA checks as not requested
        'installable-manifest': 'off',
        'apple-touch-icon': 'off',
        'service-worker': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
