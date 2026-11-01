# Todoist SDK `activity_log` validation bug

The Todoist API documents `activity_log` as a Boolean, but
`@doist/todoist-sdk` 15.13.0 validates it as a number.
This example passes `activity_log: true` and produces a `ZodError`.

- [API documentation](https://developer.todoist.com/api/v1/#tag/Sync/User-plan-limits)
- [SDK schema](https://github.com/Doist/todoist-sdk-typescript/blob/v15.13.0/src/types/sync/resources/user-plan-limits.ts)

## Run

Use Node.js 24.x and npm. Verified with Node.js 24.22.2 and npm 12.2.1.

```bash
git clone https://github.com/toku-sa-n/todoist-activity-log-repro.git
cd todoist-activity-log-repro
npm ci
npm test
```

The script supplies fixed responses through `customFetch`.

## Result

```text
ZodError: [
  {
    "expected": "number",
    "code": "invalid_type",
    "path": [
      "userPlanLimits",
      "current",
      "activityLog"
    ],
    "message": "Invalid input: expected number, received boolean"
  }
]
```

The Boolean value should be accepted. Instead, the SDK throws this error and
`npm test` exits with code 1, reproducing the bug.
