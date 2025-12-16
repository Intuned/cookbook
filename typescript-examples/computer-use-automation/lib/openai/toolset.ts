const shared = [
  {
    type: 'function',
    name: 'goto',
    description: 'Navigate to a specific URL in the browser. Use this to visit websites.',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Fully qualified URL to navigate to (e.g., https://example.com)',
        },
      },
      additionalProperties: false,
      required: ['url'],
    },
  },
  {
    type: 'function',
    name: 'back',
    description: 'Navigate back in the browser history to the previous page.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'forward',
    description: 'Navigate forward in the browser history to the next page.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
];

export default { shared };

