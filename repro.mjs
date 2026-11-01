import assert from 'node:assert/strict';
import { TodoistApi } from '@doist/todoist-sdk';

// No credentials or live API calls: every response is synthetic.
globalThis.fetch = async () => { throw new Error('Network disabled'); };

function makeApi(activityLog) {
  return new TodoistApi('fake-token', {
    baseUrl: 'https://offline.invalid',
    customFetch: async (url, options) => {
      assert.equal(new URL(url).hostname, 'offline.invalid');
      assert.equal(options.method, 'POST');
      assert.ok(new URL(url).pathname.endsWith('/sync'));
      assert.deepEqual(JSON.parse(options.body), {
        resource_types: ['user_plan_limits'],
        sync_token: '*',
      });
      const data = {
        user_plan_limits: {
          current: {
            max_projects: 10,
            ...(activityLog === undefined ? {} : { activity_log: activityLog }),
          },
          next: null,
        },
      };
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        json: async () => data,
        text: async () => JSON.stringify(data),
      };
    },
  });
}

for (const value of [true, false, undefined]) {
  const run = () => makeApi(value).sync({
    resourceTypes: ['user_plan_limits'],
    syncToken: '*',
  });

  if (typeof value === 'boolean') {
    await assert.rejects(run, (error) => {
      assert.equal(error.name, 'ZodError');
      assert.deepEqual(error.issues, [{
        expected: 'number',
        code: 'invalid_type',
        path: ['userPlanLimits', 'current', 'activityLog'],
        message: 'Invalid input: expected number, received boolean',
      }]);
      return true;
    });
    console.log(`BUG REPRODUCED: activity_log=${value} rejected at userPlanLimits.current.activityLog (expected number, received boolean)`);
  } else {
    const result = await run();
    assert.deepEqual(result.userPlanLimits, {
      current: { maxProjects: 10 },
      next: null,
    });
    console.log('ACCEPTED AS EXPECTED: activity_log omitted');
  }
}
