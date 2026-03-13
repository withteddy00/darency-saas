/**
 * Server-first Layout Architecture
 * 
 * This document outlines the server-first refactoring strategy for the app.
 * 
 * ## Current State
 * 
 * Most pages/components use 'use client' unnecessarily, increasing JS bundle.
 * 
 * ## Refactoring Strategy
 * 
 * ### 1. Locale Layout (app/[locale]/layout.tsx)
 * - Keep client components (AuthProvider, TranslationProvider) at leaf level
 * - Mark as server component where possible
 * 
 * ### 2. Landing Page (app/[locale]/page.tsx)
 * - Static content → Server Component
 * - Interactive parts → Client Components (SubscriptionModal, LanguageSwitcher)
 * 
 * ### 3. Client Component Isolation
 * - Isolate interactivity to smallest possible components
 * - Use composition to keep most of tree server-rendered
 * 
 * ## What Can Be Server Components
 * 
 * - Pages that only display data (no user interaction)
 * - Layouts that don't need client state
 * - Components that only render props
 * 
 * ## What Must Be Client Components
 * 
 * - Components using useState, useEffect
 * - Components using event handlers (onClick, onChange)
 * - Components using NextAuth SessionProvider
 * - Components using TranslationProvider
 * - Third-party components requiring client-side hydration
 * 
 * ## Conversion Rules
 * 
 * 1. If component uses 'use client', check if it's truly needed
 * 2. Move client logic to smallest child component
 * 3. Make parent component server-compatible
 * 4. Test for hydration errors
 * 
 * ## Performance Impact
 * 
 * Server Components:
 * - Zero JS sent to client for rendering
 * - Faster FCP (First Contentful Paint)
 * - Better SEO
 * 
 * Client Components:
 * - Only downloaded when needed
 * - Hydration happens incrementally
 */
