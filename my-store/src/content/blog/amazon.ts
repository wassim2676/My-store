import type { BlogArticle } from "./types";

export const AMAZON_ARTICLES: BlogArticle[] = [
  {
    slug: "amazon-associates-approval-guide",
    network: "amazon",
    kind: "Guide",
    title: "How to Get Approved for Amazon Associates in 2026 (and Stay Approved)",
    seoTitle: "How to Get Approved for Amazon Associates in 2026",
    description: "A step-by-step guide to the Amazon Associates application: what Amazon reviews, how to land your first 3 sales in 180 days and how to avoid rejection.",
    keywords: ["amazon associates approval", "join amazon affiliate program", "amazon associates 3 sales 180 days", "amazon affiliate application"],
    published: "2026-11-10",
    excerpt: "Amazon approves your account only after real sales. Here is how to prepare your site, pass the review and make your first three qualifying sales.",
    body: `Most people think signing up for Amazon Associates is the hard part. It isn't. Anyone can fill in the form in ten minutes. The real test starts afterwards: Amazon gives you **180 days to generate three qualifying sales**, then a human reviewer looks at your site or social profile before your account is fully approved. Miss either step and the account is closed.

This guide explains exactly what happens at each stage and how to set yourself up so the review is a formality instead of a gamble.

## What Amazon actually reviews

When your application is reviewed, Amazon is answering one question: *is this a genuine publisher that adds value for shoppers?* In practice the reviewer looks at:

- **Original content.** Reviews, comparisons and recommendations written by you, not copied product descriptions.
- **A clear topic.** A page about "home coffee gear" or "travel tech" is easier to approve than a random mix of products.
- **Enough substance.** Amazon does not publish a minimum, but a page with a handful of thin links looks unfinished. Aim for at least 10–15 well-presented recommendations with your own notes.
- **Accurate traffic sources.** The websites, apps and social profiles you list in the application must be the ones actually sending clicks.
- **A visible disclosure.** The sentence "As an Amazon Associate I earn from qualifying purchases" must appear on the page.

If you build your page on Primeshelf, the disclosure is shown automatically and every product gets its own review page, which helps the "original content" signal. You can still edit the wording in your page settings.

## Step 1: Prepare before you apply

Do not apply with an empty page. Spend a few days building the foundation first:

1. **Pick a focused niche.** Think about what you already talk about and what your audience asks you. Kitchen, fitness, baby gear, gaming setups and home office are popular because people buy often.
2. **Publish 10–15 recommendations.** Each one should say who the product is for, what you like, what to watch out for and a short verdict.
3. **Add an about section.** A short bio and your social links make the page feel like it belongs to a real person.
4. **Write one long article.** A buying guide such as "The best budget air fryers for small kitchens" shows the reviewer you create genuine content.

## Step 2: Fill in the application correctly

The form asks for your websites and mobile apps, your profile, and how you drive traffic. A few tips:

- List every place you will share links, including your Primeshelf page and your Instagram, TikTok or YouTube profiles.
- Choose topics that match your content honestly.
- In the traffic section, describe your real methods, for example "product reviews on my page shared in Instagram stories and YouTube descriptions".
- Your **store ID** (your tracking tag) is permanent. Pick something professional.

## Step 3: Make three qualifying sales in 180 days

This is where most applications fail. A qualifying sale is a purchase made by a real customer through your link — **purchases by you, your family or anyone you pay or reward do not count** and can get you banned.

### Where the first sales usually come from

- **Your existing audience.** Share one strong recommendation at a time instead of a wall of links. A story that shows the product in use converts far better.
- **Problem-solving posts.** "What I use to keep my coffee hot for six hours" beats "Check out my Amazon page".
- **Seasonal moments.** Prime Day, Black Friday and back-to-school bring buyers who are ready to purchase.
- **Search traffic.** Long-tail articles take time to rank, but they keep producing sales long after your first 180 days.

> Tip: track which recommendations get clicks from your dashboard and double down on the ones that work. Three sales is a low bar once you share the right product with the right audience.

## Step 4: Pass the final review

After your third sale, Amazon reviews the account. Before that happens, check that:

- Every page you listed is live and matches what you described.
- Your disclosure is visible.
- You are not displaying prices that could be outdated (more on this in our guide to [Amazon Associates rules](/blog/amazon-associates-rules-mistakes)).
- You haven't used Amazon's logo or a name like "Amazon Deals Store" that suggests you are Amazon.

## Common reasons applications are rejected

- **Not enough content** or a page that only lists links.
- **Traffic sources not listed** in the application.
- **Incentivized clicks**, such as "click my link to support me" promotions.
- **Self-purchases** or sales from friends and family.
- **Trademark misuse** in the page name or images.

If you are rejected, you can apply again later with an improved page. Fix the reason first; reapplying unchanged rarely works.

## After approval: build a page that keeps earning

Approval is the start, not the finish. Learn how commissions are calculated in our guide to [Amazon commission rates and the 24-hour cookie](/blog/amazon-associates-commission-rates), find better products with our [Amazon product research method](/blog/best-amazon-products-to-promote), and grow your reach with [social media strategies for Amazon links](/blog/promote-amazon-affiliate-links-social-media).

If you also want to diversify, programs like [Walmart](/blog/walmart-affiliate-program-guide) and [Target Partners](/blog/target-partners-affiliate-program-guide) work well alongside Amazon, so a single slow month on one store doesn't hurt your income.`,
    faq: [
      { q: "How long does Amazon Associates approval take?", a: "Your account is provisionally active right away, but final approval happens after your third qualifying sale within 180 days, followed by a manual review that usually takes a few days." },
      { q: "Can I join Amazon Associates without a website?", a: "Yes. Amazon accepts social media profiles and mobile apps as traffic sources, as long as you list them in your application and they contain original content." },
      { q: "Do my own purchases count toward the 3 sales?", a: "No. Purchases by you, your family or anyone you incentivize do not count and violate the Operating Agreement." },
      { q: "What happens if I don't make 3 sales in 180 days?", a: "Amazon closes the account. You can reapply later with a new application once your content and traffic are stronger." },
    ],
  },
  {
    slug: "amazon-associates-commission-rates",
    network: "amazon",
    kind: "Commissions",
    title: "Amazon Associates Commission Rates and the 24-Hour Cookie, Explained",
    seoTitle: "Amazon Commission Rates & 24-Hour Cookie Explained",
    description: "How Amazon Associates commissions work: category rates, the 24-hour cookie, the 90-day cart rule, bounties and practical ways to raise your earnings per click.",
    keywords: ["amazon associates commission rates", "amazon affiliate cookie duration", "amazon 24 hour cookie", "amazon bounty program"],
    published: "2026-11-11",
    excerpt: "Category rates, the 24-hour cookie and the 90-day cart rule decide how much you earn. Here's how they work and how to use them to your advantage.",
    body: `Amazon pays a percentage of each qualifying purchase, and that percentage depends on the product category. Add a short cookie window and a few special rules, and two marketers with the same traffic can earn very different amounts. Once you understand the mechanics, you can design your content to earn more from every click.

## How Amazon commissions are calculated

Your commission is a **percentage of the item price** (before taxes, shipping and gift wrap) for every qualifying purchase made through your link. The rate is set by the product's category in Amazon's published fee schedule.

Rates range from roughly **1% to 10%**. Historically, categories such as luxury beauty have sat at the top, many home, kitchen and fashion categories in the middle, and groceries, video game consoles and some electronics near the bottom. Amazon updates the schedule from time to time, so always check the current Associates fee page before planning content around a specific rate.

### You earn on the whole cart

Here is the detail many beginners miss: you don't only earn on the product you recommended. If a visitor clicks your link for a coffee grinder and then buys a grinder, filters and a new phone case, **you earn on all of it**, each item at its own category rate.

That is why Amazon converts so well. Shoppers already have accounts, saved payment methods and Prime, so they often add more to the cart.

## The 24-hour cookie and the 90-day cart rule

When someone clicks your link, Amazon sets a cookie that lasts **24 hours**. Any qualifying purchase in that window is credited to you.

There is an important extension: if the shopper **adds an item to their cart within those 24 hours**, you still earn on that item if they complete the purchase within **90 days**, as long as they don't click another associate's link in between.

### What this means for your content

- **Urgency helps.** Deals, limited-time coupons and seasonal events encourage buying within the 24-hour window.
- **"Add to cart" moments matter.** Content that encourages people to save an item for later, such as gift guides published a few weeks before the holidays, benefits from the 90-day rule.
- **Late clicks win.** The last associate link clicked gets the credit, so being the final, most helpful recommendation before purchase is valuable.

## Bounties: fixed payments for sign-ups

Besides commissions, Amazon pays **fixed bounties** when visitors start free trials or sign up for programs such as Prime, Audible or Kindle Unlimited through your link. Amounts and eligible programs change regularly, so check the current bounty list in your Associates dashboard.

Bounties pair well with relevant content. A page about long drives or commuting is a natural place to mention an audiobook trial.

## How to increase your earnings per click

Rates are fixed, but your **earnings per click (EPC)** are not. These levers make the biggest difference:

1. **Recommend products people buy soon.** Problem-solving items convert inside the 24-hour window far better than "someday" purchases.
2. **Feature a mix of price points.** A premium pick raises average order value; a budget pick keeps conversion high.
3. **Write comparisons.** "Option A vs Option B" content catches visitors right before they decide.
4. **Update for seasons.** Prime Day, Black Friday, Cyber Monday and back-to-school can triple conversion rates.
5. **Send traffic to a page, not a raw link.** A review page with pros, cons and a clear verdict warms visitors up before they reach Amazon, so more of them buy.

## A quick earnings example

Imagine 1,000 visitors click through to Amazon in a month. If 8% buy and the average cart is $60 at a blended 4% commission, you earn:

| Clicks | Conversion | Orders | Avg. cart | Blended rate | Earnings |
| --- | --- | --- | --- | --- | --- |
| 1,000 | 8% | 80 | $60 | 4% | $192 |

Raise conversion to 10% with better reviews and average cart value to $75 with a premium option, and the same traffic earns **$300**. That's the power of improving your page rather than chasing more clicks.

## Tracking what actually works

Use separate tracking IDs for different traffic sources (for example one for Instagram and one for YouTube) inside your Amazon account, and watch which offers get the most clicks in your Primeshelf dashboard. Combining both views tells you which products and platforms deserve more attention.

## Next steps

If you're still waiting for full approval, read our [Amazon Associates approval guide](/blog/amazon-associates-approval-guide). Then learn how to choose winners with our [Amazon product research method](/blog/best-amazon-products-to-promote) and keep your account safe by avoiding the [most common rule violations](/blog/amazon-associates-rules-mistakes).

Comparing programs? See how [Walmart's commissions](/blog/walmart-affiliate-commission-rates) and [eBay Partner Network payouts](/blog/ebay-partner-network-commission-rates) stack up.`,
    faq: [
      { q: "How long does the Amazon affiliate cookie last?", a: "24 hours from the click. If the visitor adds an item to their cart within that time, you can still earn on it if they buy within 90 days." },
      { q: "Do I earn commission on products I didn't link to?", a: "Yes. You earn on qualifying items bought in the same session, each at its own category rate." },
      { q: "Are Amazon commission rates the same in every country?", a: "No. Each Amazon marketplace has its own Associates program and fee schedule." },
      { q: "When does Amazon pay affiliate commissions?", a: "Amazon pays roughly 60 days after the end of the month in which the qualifying purchase was shipped, once you reach the payment threshold for your chosen method." },
    ],
  },
  {
    slug: "best-amazon-products-to-promote",
    network: "amazon",
    kind: "Strategy",
    title: "How to Find the Best Amazon Products to Promote as an Affiliate",
    seoTitle: "How to Find the Best Amazon Products to Promote",
    description: "A practical product research method for Amazon affiliates: evergreen vs seasonal picks, price sweet spots, review signals and how to build a page that converts.",
    keywords: ["best amazon products to promote", "amazon affiliate product research", "what to sell on amazon associates", "amazon affiliate niche"],
    published: "2026-11-12",
    excerpt: "Great Amazon affiliates don't promote what's popular — they promote what their audience needs. Here's a repeatable method to find those products.",
    body: `There is no universal list of "best Amazon products to promote". The best product is the one your audience is already looking for, at a price they're comfortable with, from a listing that won't disappoint them. This guide gives you a repeatable method to find those products and present them so they convert.

## Start with your audience, not the bestseller list

Bestseller pages are useful for ideas, but every affiliate sees the same list. Your advantage is knowing your audience. Ask yourself:

- What problems do people message me about?
- What products appear in my videos or photos that people ask about?
- What does my audience buy every month, every season, once in a lifetime?

Write down 20 product ideas based on those answers before you open Amazon. You'll end up with a list that's personal and far less competitive.

## The four product types every page needs

A balanced page mixes four kinds of products:

1. **Everyday essentials.** Low price, frequent purchase, high conversion. Think coffee filters, resistance bands, phone stands.
2. **Hero products.** The item your niche revolves around, such as an espresso machine for a coffee page. Higher price, slower decisions, big commissions.
3. **Upgrades and accessories.** Items people buy after the hero product: grinders, scales, cases, mounts.
4. **Seasonal picks.** Gifts, holiday decor, summer gear, back-to-school supplies that spike at predictable times.

Essentials give you steady sales, heroes give you big orders, accessories grow cart value, and seasonal picks give you peaks.

## Signals that a product is worth recommending

Before adding a product to your page, check these signals on its Amazon listing:

- **Review volume and recency.** Hundreds of recent reviews show steady demand.
- **Rating distribution.** A 4.4 with detailed positive reviews often beats a perfect 5.0 from a handful of buyers.
- **Read the 2- and 3-star reviews.** They tell you the real downsides — perfect material for your "keep in mind" section.
- **Stock and delivery.** Products that are frequently out of stock waste your traffic.
- **Variations.** Colors and sizes give shoppers choice and keep them on the listing.
- **Price stability.** Wildly fluctuating prices make your recommendation look wrong next week.

## Find the price sweet spot

Price changes buying behavior:

| Price range | Buyer behavior | Content that works |
| --- | --- | --- |
| Under $30 | Impulse, fast decisions | Short reviews, "under $25" lists |
| $30 – $150 | Light research | Comparisons, pros and cons |
| $150+ | Careful research, often days | In-depth reviews, long-term tests |

Most successful pages concentrate on the middle band, add a few impulse buys to lift conversion and feature one or two premium heroes to lift average order value.

## Use categories with strong commissions — but don't chase them blindly

Category rates matter (see our [Amazon commission rates guide](/blog/amazon-associates-commission-rates)), but a 10% category your audience doesn't buy earns nothing. A 3% product that people buy every month can outperform it easily. Use rates as a tiebreaker, not a starting point.

## Validate with search demand

Search behavior tells you what people want answered. Look for long-tail questions in your niche, such as "best quiet blender for apartment" or "espresso machine under 300". These phrases show buying intent and are much easier to rank for than broad terms.

Turn each strong question into an article or a section of your page. Over time, these pages bring visitors who are already ready to buy.

## Present products so they convert

Finding the product is half the work. On your page, each recommendation should include:

- **Who it's for** in one sentence.
- **What you love** — two or three specific benefits.
- **What to keep in mind** — honest drawbacks build trust.
- **A short verdict** and a clear button.

On Primeshelf, every offer gets its own review page with these sections, a rating, coupon field and a "Buy on Amazon" button styled in Amazon's colors. Featured picks appear at the top so your heroes get the attention they deserve.

## Review and refresh every month

Set a monthly routine:

1. Check which offers got the most clicks.
2. Replace products that went out of stock or dropped in rating.
3. Move seasonal products to the top before their season.
4. Add one new comparison or guide.

Small, regular updates keep your page fresh for visitors and search engines.

## Keep going

Promote your best picks with our [social media playbook for Amazon links](/blog/promote-amazon-affiliate-links-social-media), and make sure your page follows every requirement in our [Amazon Associates rules guide](/blog/amazon-associates-rules-mistakes). Looking for deal-driven audiences? Compare with the [best Walmart products to promote](/blog/best-walmart-products-to-promote).`,
    faq: [
      { q: "What are the most profitable Amazon affiliate niches?", a: "Niches where people buy often and research before purchasing, such as kitchen, home office, fitness, baby gear and tech accessories, tend to perform well. The best niche is still the one your audience trusts you in." },
      { q: "Should I promote expensive or cheap Amazon products?", a: "Both. Low-priced items lift conversion and expensive items lift average order value. Most pages perform best with a mix centered on mid-priced products." },
      { q: "How many products should I list on my page?", a: "Start with 10 to 15 carefully reviewed products and add more over time. Quality and honest notes matter more than volume." },
    ],
  },
  {
    slug: "promote-amazon-affiliate-links-social-media",
    network: "amazon",
    kind: "Social",
    title: "How to Promote Amazon Affiliate Links on Instagram, TikTok and YouTube",
    seoTitle: "Promote Amazon Affiliate Links on Instagram & TikTok",
    description: "Proven ways to share Amazon affiliate links on Instagram, TikTok, YouTube and Pinterest without breaking the rules — content formats, link placement and disclosures.",
    keywords: ["promote amazon affiliate links", "amazon affiliate instagram", "amazon affiliate tiktok", "amazon links youtube description"],
    published: "2026-11-13",
    excerpt: "Social platforms limit links and Amazon limits how they're shared. Here's how to build a social funnel that respects both — and actually converts.",
    body: `Social media is where most affiliate purchases start. Someone sees a product in a video, saves it, and buys it a few hours later. The challenge is that social platforms limit where links can go, and Amazon has rules about how its links are shared. The solution is a simple funnel: **content on social, one link in your bio, a page that does the selling.**

## Why one page beats a dozen raw links

Posting raw Amazon links everywhere has three problems:

1. Instagram and TikTok don't allow clickable links in regular captions.
2. Visitors who land directly on Amazon haven't been convinced yet.
3. You can't see which content is driving clicks.

A single page link solves all three. Put your Primeshelf link in your bio, and send every viewer there. Each product has a review that warms the visitor up, and your dashboard shows which offers and which platforms bring clicks.

> Always share your page links, not the redirect links behind buy buttons. Platforms trust links that show a real page.

## Instagram

**What works:** Reels that show a product solving a problem, carousel posts comparing options, and stories with a link sticker.

- **Reels:** Open with the result ("My kitchen counter, finally clear"), then show the product. End with "Link in bio — it's the first pick on my page".
- **Stories:** Use the link sticker to send people directly to the product's review page.
- **Highlights:** Create highlights for categories ("Kitchen", "Desk setup") so new followers can find past recommendations.
- **Captions:** Keep the disclosure visible, for example "#ad — I earn from qualifying purchases".

## TikTok

TikTok rewards authenticity and speed. The best affiliate videos feel like a friend's recommendation, not an ad.

- **Hook in the first second.** "Stop buying cheap phone stands — get this one" works better than a slow intro.
- **Show real use.** Unboxings, before/after and "three things I'd buy again" formats perform well.
- **Bio link.** Once your account allows a website link, use your page URL. Pin a comment that says where to find the product.
- **Series.** "Amazon finds under $30, part 7" keeps people coming back.

## YouTube

YouTube is the strongest platform for considered purchases because viewers watch longer and descriptions allow links.

- **Reviews and comparisons** catch buyers right before they decide.
- **Description links:** Link to your page or directly to individual product pages, with the disclosure near the top of the description.
- **Pinned comment:** Repeat the most important link.
- **Shorts:** Use short clips to drive viewers to the full review.

## Pinterest

Pinterest users plan purchases — perfect for home, kitchen, fashion and gift content. Create pins that link to your product pages, use descriptive titles ("Small kitchen organization ideas under $50") and pin seasonal content 4–6 weeks before the season.

## What Amazon does not allow

Social promotion must still follow the Operating Agreement:

- **No links in emails, PDFs, e-books or offline material.** Share your page link instead.
- **No link cloaking that hides Amazon as the destination.** Your page's buy button clearly sends people to Amazon, which is fine.
- **No incentivized clicks.** "Click my link to support me" or giveaways for clicking are not allowed.
- **No paid ads bidding on Amazon trademarks** without permission.
- **Clear disclosure** wherever you share recommendations.

Read the full list in our guide to [Amazon Associates rules](/blog/amazon-associates-rules-mistakes).

## Track what each platform brings

Tag the links you share with the platform name — your Primeshelf "Share & pixels" page gives you ready-made links for Instagram, TikTok, YouTube and more. Then compare **visits and clicks by source** in your dashboard. You'll quickly see that one platform drives browsers while another drives buyers, and you can focus your energy accordingly.

## A weekly content rhythm that works

- **Monday:** One problem-solving Reel or TikTok.
- **Wednesday:** A carousel or comparison post.
- **Friday:** Stories with link stickers to your top three offers.
- **Monthly:** One YouTube review or long-form video.

Consistency beats volume. Three good posts a week, all pointing to one well-built page, will outperform daily posts with scattered links.

## Next steps

Choose what to feature with our [Amazon product research method](/blog/best-amazon-products-to-promote) and understand what each click is worth in our [commission rates guide](/blog/amazon-associates-commission-rates). The same social strategy works for [Target](/blog/promote-target-products-social-media) and [Sephora](/blog/promote-sephora-products-instagram-tiktok) if you want to diversify.`,
    faq: [
      { q: "Can I post Amazon affiliate links on Instagram?", a: "Yes, as long as they're disclosed and you list Instagram as a traffic source in your Associates account. Since captions aren't clickable, use your bio link, stories link stickers or a page that lists your products." },
      { q: "Can I put Amazon affiliate links on TikTok?", a: "You can share your page link in your TikTok bio and point viewers to it. Always disclose the affiliate relationship." },
      { q: "Do I need to disclose affiliate links on social media?", a: "Yes. Both the FTC and Amazon require a clear disclosure near the recommendation, such as '#ad' or 'I earn from qualifying purchases'." },
    ],
  },
  {
    slug: "amazon-associates-rules-mistakes",
    network: "amazon",
    kind: "Compliance",
    title: "Amazon Associates Rules: 12 Mistakes That Get Accounts Closed",
    seoTitle: "Amazon Associates Rules: 12 Mistakes to Avoid",
    description: "Avoid the Amazon Associates violations that close accounts: outdated prices, image rules, emails, self-purchases, disclosures, trademarks and incentivized clicks.",
    keywords: ["amazon associates rules", "amazon affiliate account closed", "amazon operating agreement", "amazon affiliate disclosure"],
    published: "2026-11-14",
    excerpt: "Amazon closes accounts without warning — sometimes with unpaid commissions. These are the 12 rules affiliates break most often and how to stay safe.",
    body: `Amazon is one of the most generous affiliate programs in reach, and one of the strictest in enforcement. Accounts can be closed with little warning, and commissions earned from violating activity may not be paid. The good news: almost every closure comes from a short list of avoidable mistakes.

*This guide is a practical overview, not legal advice. Always read the current Amazon Associates Operating Agreement and Program Policies, which change from time to time.*

## 1. Showing prices that may be outdated

Amazon prices change constantly. Displaying a static price that's no longer accurate is one of the most common violations. If you show prices, they must come from Amazon's Product Advertising API or be clearly timestamped and kept current.

**Safe approach:** On Amazon offers, leave the price field empty or update it frequently. Your review, rating and pros and cons do the selling; the visitor sees the current price on Amazon.

## 2. Using product images incorrectly

Amazon product images may only be displayed through approved tools such as SiteStripe or the Product Advertising API. Downloading and re-uploading Amazon's images is not allowed.

**Safe approach:** Use your own photos (they convert better anyway) or images provided through Amazon's approved tools.

## 3. Putting links in emails, PDFs or e-books

Amazon links may not appear in emails, newsletters sent as attachments, PDFs, e-books or offline material.

**Safe approach:** Link to your page instead. The visitor reads your recommendation there and clicks through from the website.

## 4. Buying through your own links

Purchases you make through your own links — or that friends and family make to help you — are not allowed and are easy for Amazon to detect.

## 5. Incentivizing clicks or purchases

"Click my link so I can earn" messages, giveaways for clicks, cash-back on Amazon purchases and similar incentives violate the agreement.

## 6. Hiding that the link goes to Amazon

Link cloaking that disguises Amazon as the destination is not allowed. A clear "Buy on Amazon" button is the right approach. Shortened links from Amazon's own tools are fine.

## 7. Forgetting the disclosure

You must clearly state: **"As an Amazon Associate I earn from qualifying purchases."** The FTC also requires disclosures to be clear and close to the recommendation. Primeshelf shows a disclosure on every page by default; keep it visible.

## 8. Not listing all your traffic sources

Every website, app and social profile where you share links must be listed in your Associates account. Adding a new TikTok or YouTube channel? Update your account first.

## 9. Misusing Amazon's trademarks

Names like "Amazon Deals Hub", Amazon's logo in your profile picture, or domains containing "amazon" suggest you are Amazon or officially affiliated. Use your own brand.

## 10. Bidding on Amazon terms in paid ads

Paid search ads that bid on "Amazon" or related trademark keywords, or that send paid traffic directly to Amazon, are restricted.

## 11. Making medical or false claims

Reviews that promise cures, guarantee results or invent experiences mislead shoppers and can violate both Amazon's policies and consumer protection laws. Be honest about what you've tested.

## 12. Using links in apps or contexts you didn't disclose

Links inside private messaging apps, browser extensions or software you didn't declare may be considered unapproved traffic.

## A compliance checklist for your page

Use this before every big update:

- Disclosure visible on the page and on social posts.
- No outdated prices on Amazon offers.
- Images are your own or from approved Amazon tools.
- All traffic sources listed in your Associates account.
- No Amazon trademarks in your page name or profile picture.
- Reviews reflect real opinions and honest drawbacks.

## What to do if you receive a warning

Amazon sometimes sends a notice before closing an account. Fix the issue immediately, document what you changed and reply clearly. If your account is closed, read the reason carefully; some closures can be appealed, but repeated violations rarely are.

## Diversify to protect your income

Even compliant accounts benefit from not relying on one program. Many marketers add [Walmart](/blog/walmart-affiliate-program-guide), [Target](/blog/target-partners-affiliate-program-guide) or [Best Buy](/blog/best-buy-affiliate-program-guide) offers to their pages so one policy change never wipes out their income.

## Keep learning

New to the program? Start with our [Amazon approval guide](/blog/amazon-associates-approval-guide). Ready to grow? Read about [commission rates](/blog/amazon-associates-commission-rates), [product research](/blog/best-amazon-products-to-promote) and [social promotion](/blog/promote-amazon-affiliate-links-social-media). You can also review Primeshelf's own [affiliate disclosure](/affiliate-disclosure) and [acceptable use policy](/acceptable-use).`,
    faq: [
      { q: "Can I show Amazon prices on my website?", a: "Only if they're accurate. Amazon requires prices to come from its Product Advertising API or be kept current. Many affiliates simply omit prices and let visitors see the current price on Amazon." },
      { q: "Will Amazon pay my commissions if my account is closed?", a: "Commissions tied to violations may be withheld. Follow the rules carefully to avoid losing earned income." },
      { q: "Can I use Amazon product photos?", a: "Only through Amazon's approved tools such as SiteStripe or the Product Advertising API. Your own photos are always allowed." },
      { q: "Is a short link like amzn.to allowed?", a: "Yes. Amazon's own short links are allowed. What's not allowed is cloaking that hides that the destination is Amazon." },
    ],
  },
];
