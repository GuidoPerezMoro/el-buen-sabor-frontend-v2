import {redirect} from 'next/navigation'

// Server component: immediately redirect to Auth0 Universal Login in "signup" mode.
// Uses the built-in /auth/login route from @auth0/nextjs-auth0 (App Router integration).
// If you ever change returnTo, you only update it here.
export default function SignUpPage() {
  redirect('/auth/login?screen_hint=signup&returnTo=/post-login')
}
