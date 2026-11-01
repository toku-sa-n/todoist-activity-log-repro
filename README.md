# Todoist SDK `activity_log` validation bug

The Todoist API documents `activity_log` as a Boolean, but
`@doist/todoist-sdk` 15.13.0 validates it as a number.
Both `true` and `false` therefore cause a `ZodError`.

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

## Results

| `activity_log` | Actual result |
|---|---|
| `true` | `ZodError`: expected number, received boolean |
| `false` | `ZodError`: expected number, received boolean |
| Omitted | Success |

The error occurs at `userPlanLimits.current.activityLog`.
Both Boolean values should be accepted.

`PASS` and exit code 0 mean the bug was reproduced as expected, not that the SDK is working correctly.
