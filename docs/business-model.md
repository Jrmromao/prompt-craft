## 💡 **User Tiers Strategy**

### 🟢 **Free**

* 🎯 Goal: Convert to Lite/Pro
* 🎁 **Credits:** 10 (1,000 tokens total)
* ⚙️ **API:** DeepSeek
* 🧠 **Restrictions:**

  * Limited prompt types
  * No saving prompts
  * No prompt history
* 🔔 **Upgrade nudges:** Trigger upgrade modal at 7+ credits used or on error

---

### 🟡 **Lite — Weekly Subscription**

* 💰 **Price:** \$3/week (recurs)
* 🎁 **Credits:** 250/week (25,000 tokens)
* 📈 **Credit Cap:** 1,500 (to prevent hoarding)
* 🧠 **API:** DeepSeek
* ✅ **Features:**

  * Save up to 50 prompts
  * Prompt history
  * Pre-made prompt templates
* 🔄 **Renewal:** Every 7 days
* ⚠️ **Overflow handling:** Show modal if prompt requires more credits than balance, offer one-click top-up.

**Optional upsell:**
“Add +500 credits for \$1.50” if they're out of credits mid-week.

---

### 🔴 **Pro — Monthly Subscription**

* 💰 **Price:** **\$9–\$12/month** *(Sweet spot for early SaaS)*
* 🎁 **Credits:** 1,200–1,500/month (or unlimited light usage with fair usage cap)
* 📈 **Credit Cap:** Soft capped at 3,000–5,000
* 🧠 **API:** OpenAI GPT-4o
* ✅ **Features:**

  * Save unlimited prompts
  * Share prompts
  * Access to community prompt library
  * Image-to-prompt and multi-modal support *(future)*
  * Priority access / less rate limiting
* 🚨 **Overuse handling:** Modal to buy more credits or auto-top-up (e.g., \$5 for 1,000 credits)

---

## 🧮 **Token Usage Example**

* 1 prompt + 3 suggestions → \~400–800 tokens → 4–8 credits
* Casual users = <500 tokens/day = **Lite tier**
* Power users = 50,000+ tokens/month = **Pro tier**

---

## 🔧 Additional Notes

* Use **middleware** to block prompts if credit usage > available
* Modal: “You need 6 more credits. Add +100 credits for \$0.50?”
* Add **burn-rate indicator** (like: "You’ve used 82% of your credits this week")

---

## ✅ Summary

| Tier | Price     | Credits     | API Used   | Key Perks                      |
| ---- | --------- | ----------- | ---------- | ------------------------------ |
| Free | \$0       | 10 (1K tok) | DeepSeek   | Try before buy                 |
| Lite | \$3/week  | 250/week    | DeepSeek   | Templates, saved prompts       |
| Pro  | \$9–12/mo | 1,200–1,500 | OpenAI GPT | Best model, unlimited features |

---