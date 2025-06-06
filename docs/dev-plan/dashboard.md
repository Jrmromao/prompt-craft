development optimized for user experience and actionable insights.

---

## 🧭 Goal: **User Dashboard MVP**

The user dashboard should:

- Show current credits and usage
- Show latest prompts
- Show credit history
- Encourage upgrade (if applicable)

---

## ✅ Dashboard Sections

### 1. 🎯 **User Summary (Top Section)**

- Credits available: `user.credits`
- Current plan: `user.plan?.name ?? "Free"`
- Next reset date: (calculated, e.g. 1st of next month)
- Last prompt: `user.lastPromptAt`

**Bonus:** Add a "Use Prompt" CTA button here.

---

### 2. 🧠 **Recent Prompts Table**

Query last N prompts:

```ts
const prompts = await prisma.prompt.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  take: 10,
});
```

**Columns:**

- Input (truncated)
- Model
- Output (popover or modal)
- Credits Used
- Date

Use `@tanstack/react-table` with pagination.

---

### 3. 💳 **Credit History Table**

Query:

```ts
const history = await prisma.creditHistory.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

**Columns:**

- Type (enum → label color-coded)
- Amount (+green / –red)
- Description (e.g., “Monthly renewal”)
- Date

---

### 4. 📈 **Usage Stats (Optional but Powerful)**

- Bar chart of daily credits used (last 7 days)
- Total prompts this month
- Avg. cost per prompt

Use [Recharts](https://recharts.org) or `@nivo/bar`.

---

### 5. 🚀 **Upgrade CTA (if on Free/low credits)**

- Show plan comparison if `user.plan.name === 'Free' || user.credits < 10`
- Button: **Upgrade Plan** → `/billing`

---

## 🧱 Component Map

| Component                | Description                      |
| ------------------------ | -------------------------------- |
| `<UserSummaryCard />`    | Shows name, credits, plan        |
| `<RecentPromptsTable />` | Shows recent prompt runs         |
| `<CreditHistoryTable />` | Shows additions/usage of credits |
| `<UsageChart />`         | Optional daily usage visual      |
| `<UpgradeBanner />`      | CTA based on plan/credit status  |

---

## 🔐 API Route Samples

### `/api/user/dashboard`

Returns:

```ts
{
  user: { name, plan, credits, lastPromptAt },
  recentPrompts: [...],
  creditHistory: [...],
  usageStats: [...]
}
```

---

## 🎨 UI Tools

- TailwindCSS for layout/styling
- Lucide icons (credit card, bolt, book-open, etc.)
- Skeleton loaders (loading state)

---
