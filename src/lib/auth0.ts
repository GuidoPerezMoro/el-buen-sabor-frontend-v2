import {Auth0Client} from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
  // Make the SDK always request an AT for API
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE ?? 'openid profile email', // can add offline_access later
  },
})
