This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ClerkProvider Integration Requirement

If you use Clerk authentication (e.g., `useUser`, `useClerk`, etc.), you **must** wrap your application with `<ClerkProvider>` at the top level (e.g., in `components/Providers.tsx`).

**Example:**

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function Providers({ children }) {
  return (
    <ClerkProvider>
      {/* other providers */}
      {children}
    </ClerkProvider>
  );
}
```

If you do not do this, you will encounter runtime errors such as:

> useClerk can only be used within the <ClerkProvider /> component.

Always ensure `ClerkProvider` wraps your app to avoid these issues.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Development Plan: Advanced Version Comparison Features

To further enhance the version comparison experience, consider implementing the following advanced features:

1. **Mobile Responsiveness**
   - Stack side-by-side columns vertically on small screens for better readability.
   - Ensure all comparison cards and controls are touch-friendly.

2. **Sticky Headers**
   - Make field headers (e.g., Content, Description) sticky within their cards for easier navigation when scrolling through long content.

3. **Field-level Navigation**
   - Add a summary or quick links at the top of the comparison dialog to jump directly to changed fields.
   - Optionally, highlight only fields that have changes for faster review.

4. **Change Summary**
   - Display a summary at the top (e.g., "3 fields changed: Content, Tags, Metadata").
   - Optionally, show a badge or icon next to changed fields in the UI.

5. **Accessibility Improvements**
   - Ensure color contrast meets WCAG standards for all highlights and badges.
   - Add ARIA labels and keyboard navigation for all interactive elements.
   - Test with screen readers to ensure a great experience for all users.

6. **Performance Optimizations**
   - For prompts with very large content or many versions, consider virtualizing the version list and diff rendering.

7. **Extensibility**
   - Make it easy to add new fields to the version model and comparison UI in the future.

---

**These enhancements will provide a best-in-class, accessible, and scalable version comparison experience for all users.**
