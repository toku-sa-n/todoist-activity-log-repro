import { TodoistApi } from '@doist/todoist-sdk';

const response = {
  user_plan_limits: {
    current: { activity_log: true },
    next: null,
  },
};

const api = new TodoistApi('unused', {
  customFetch: async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {},
    json: async () => response,
    text: async () => JSON.stringify(response),
  }),
});

await api.sync({ resourceTypes: ['user_plan_limits'], syncToken: '*' });
