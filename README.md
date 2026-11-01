# Todoist SDK `activity_log` validation reproduction

The Todoist API documents `activity_log` as a Boolean, with a separate Integer
`activity_log_limit`. In `@doist/todoist-sdk` 15.13.0, `PlanLimitsSchema` instead
defines `activityLog` as `z.number().int().optional()`.

The SDK converts snake_case response keys to camelCase before validating the
Sync response. Consequently, documented Boolean `activity_log` values fail
validation at `userPlanLimits.current.activityLog`.

Official references:

- [API: user plan limits and user plan info](https://developer.todoist.com/api/v1/#tag/Sync/User-plan-limits)
- [SDK 15.13.0: plan limits schema](https://github.com/Doist/todoist-sdk-typescript/blob/v15.13.0/src/types/sync/resources/user-plan-limits.ts)
- [SDK 15.13.0: HTTP response transformation](https://github.com/Doist/todoist-sdk-typescript/blob/v15.13.0/src/transport/http-client.ts)
- [SDK 15.13.0: Sync request validation](https://github.com/Doist/todoist-sdk-typescript/blob/v15.13.0/src/transport/sync-request.ts)

## Requirements and execution

Use Node.js **24.x** with npm. Tested with Node.js **24.19.0** and npm **11.9.0**.
The SDK dependency is pinned to **15.13.0**; `package-lock.json` locks its
transitive dependencies.

From this directory:

```bash
npm ci
npm test
```

Dependency installation requires access to the npm registry. The reproduction
itself makes no live API calls and requires no Todoist account or credentials.
It supplies a fake token, uses `https://offline.invalid`, returns fully synthetic
responses through the SDK's `customFetch` option, and blocks global `fetch`.
The synthetic `max_projects: 10` value does not describe an account or plan.

## Expected result

After npm's test-script banner, the script prints:

```text
activity_log=true: ZodError at userPlanLimits.current.activityLog (expected number, received boolean)
activity_log=false: ZodError at userPlanLimits.current.activityLog (expected number, received boolean)
activity_log omitted: success (maxProjects=10, next=null)
PASS: all 3 cases matched; no live API calls.
```

Exit code **0** and `PASS` confirm reproduction of the defect, **not a healthy
SDK**. Both Boolean cases assert the complete Zod issue, including error type,
path, and message. The omission control asserts successful parsing of
`maxProjects: 10` and `next: null`. Unexpected behavior fails with a nonzero exit
code. A future SDK fix would require updating these reproduction assertions.

This demonstrates a response-schema mismatch using synthetic data. It does not
establish the behavior or deployed version of a hosted service.

## Suggested correction

Align the SDK schema with the documented fields:

```ts
activityLog: z.boolean().optional(),
activityLogLimit: z.number().int().optional(),
```

No SDK implementation is modified by this repository.
