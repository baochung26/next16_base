# Token Refresh Guide

## Problem

When an access token expires, users should not be forced to log in again immediately.

## Approach

Use refresh token flow in the API client:

1. API request fails with `401`
2. Client sends refresh token request
3. New access token is stored
4. Original request is retried once

## Implementation Notes

- Refresh logic should be centralized in interceptor code.
- Prevent refresh loops by marking retried requests.
- If refresh fails, clear session and redirect to login.

## Checklist

- Retry exactly once after successful refresh
- Avoid multiple parallel refresh calls for the same expiration event
- Keep refresh endpoint and token rotation behavior aligned with backend
