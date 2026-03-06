import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to French by default
  // Could detect Accept-Language header in middleware for better UX
  redirect('/fr')
}
