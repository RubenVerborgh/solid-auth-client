# solid-auth-client

[![Build Status](https://travis-ci.org/solid/solid-auth-client.svg?branch=master)](https://travis-ci.org/solid/solid-auth-client)
[![Coverage Status](https://coveralls.io/repos/github/solid/solid-auth-client/badge.svg?branch=master)](https://coveralls.io/github/solid/solid-auth-client?branch=master)

Opaquely authenticates solid clients

## About

Solid currently supports two cross-origin authentication protocols,
[WebID-TLS](https://www.w3.org/2005/Incubator/webid/spec/tls/) and
[WebID-OIDC](https://github.com/solid/webid-oidc-spec).

This library abstracts away the implementation details of these specs so that
clients don't have to handle different authentication protocols.

## API

*This API doc uses [flow](https://flow.org/) type annotations for clarity.
They're just here to show you the types of arguments expected by exported
functions.  You don't have to know anything about flow.*

### types

```
type authResponse =
  { session: ?session
  , fetch: fetch
  }

type session =
  { idp: string
  , webId: string
  , accessToken?: string
  , idToken?: string
  }
```

### `login`

```
login (idp: string, {
  redirectUri?: string,
  storage?: Storage
}): Promise<authResponse>
```

Authenticates the user with their IDP (identity provider) and promises an object
containing the user's session and a `fetch` function.

When the user is successfully authenticated, the session will be non-null and
the `fetch` function (same API as [whatwg
fetch](https://fetch.spec.whatwg.org/)) can be used to request any resource on
the web, passing credentials when necessary.

When the user is not found from the IDP, the session will be `null`, and the
`fetch` will be a plain old fetch.

Auth flows like OIDC require the user to give consent on their identity
provider.  In such cases, this function redirects the user to their auth
provider, which sort of breaks the promise.  All you have to do is call
`currentSession` when the user gives consent and lands back in your app.

If there's an error during the auth handshake, the Promise will reject.

Options:
- `redirectUri` (default current window location): a URI to be redirected back to with credentials for auth flows which involve redirects
- `storage`: An object implementing the storage interface for persisting credentials.  `localStorage` is the default in the browser.

### `currentSession`

```
currentSession (storage?: Storage): Promise<authResponse>
```

Finds the current session, and returns it along with a `fetch` function, if
their session is still active, otherwise `null` and a regular fetch.

### `logout`

```
logout (storage?: Storage): Promise<void>
```

Clears the active user session.

Note: this is an unsupported use case in WebID-TLS.  Once your browser provides
its client cert to a web server, there's no going back!  So for WebID-TLS, the
only thing this will do is clear the session from the store.

### `fetch`

Fetches a resource from the web.  Same API as
[fetch](https://fetch.spec.whatwg.org/), but retries with credentials when
it encounters a `401` with a `WWW-Authenticate` header which matches a
recognized authenticate scheme.

```
fetch: (url: RequestInfo, options?: Object) => Promise<Response>
```
