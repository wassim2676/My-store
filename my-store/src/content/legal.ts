import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

// ==================== ⚖️ النصوص القانونية الكاملة للمنصة ====================
// المرجع الملزم بالإنجليزية (كما تفعل أغلب المنصات العالمية)، وتظهر للزوار بكل اللغات مع تنبيه مترجم أعلى الصفحة.
// كل وثيقة: أقسام مرقّمة لها معرّف (للفهرس الجانبي والروابط المباشرة) ومحتوى من فقرات وقوائم وجداول.
export type LegalBlock = string | { list: string[] } | { table: { head: string[]; rows: string[][] } } | { note: string };
export type LegalSection = { id: string; title: string; body: LegalBlock[] };
export type LegalDoc = { effective: string; summary: string[]; sections: LegalSection[] };
export type LegalKey = "terms" | "privacy" | "cookies" | "disclosure" | "acceptableUse";

const N = SITE_NAME;
const MAIL = CONTACT_EMAIL;
const EFFECTIVE = "November 24, 2026";

// -------------------- 📜 شروط الاستخدام --------------------
const terms: LegalDoc = {
  effective: EFFECTIVE,
  summary: [
    `${N} gives affiliate marketers the tools to publish showcase pages, product reviews and articles that link to third-party stores.`,
    "You own your content and your commissions. You are responsible for what you publish and for following the rules of the affiliate programs you join.",
    "Don't publish misleading, illegal or infringing content, and don't misuse the platform. We may suspend accounts that do.",
    "The service is provided “as is”. Our liability is limited to the extent the law allows.",
  ],
  sections: [
    {
      id: "agreement",
      title: "1. Agreement to these terms",
      body: [
        `These Terms of Use (the “Terms”) form a binding agreement between you and ${N} (“${N}”, “we”, “us” or “our”) and govern your access to and use of the ${N} website, dashboard, public pages, application programming interfaces and any related services (together, the “Service”).`,
        "By creating an account, accepting a team invitation, publishing a page or otherwise using the Service, you confirm that you have read, understood and agree to these Terms, our Privacy Policy, our Cookie Policy and our Acceptable Use Policy, which are incorporated by reference. If you do not agree, do not use the Service.",
        "If you use the Service on behalf of a company or other organization, you represent that you are authorized to bind that organization to these Terms, and “you” refers to that organization.",
      ],
    },
    {
      id: "service",
      title: "2. What the Service does",
      body: [
        `${N} is a publishing platform for affiliate marketers and content creators. The Service lets you:`,
        {
          list: [
            "create a public showcase page (for example primeshelf.store/your-name, or your own custom domain) with your profile, social links and design;",
            "publish product offers with reviews, ratings, prices, images, coupons and a button that sends visitors to the retailer through your affiliate link;",
            "write and publish articles and buying guides;",
            "see statistics such as page views, clicks to stores, click-through rate and traffic sources;",
            "protect your affiliate links with features such as bot filtering and geographic targeting;",
            "connect your own domain, add advertising pixels and domain-verification tags, and invite team members to help you manage your page.",
          ],
        },
        `${N} is not a retailer, marketplace, payment processor or affiliate network. We do not sell the products shown on marketers' pages, we are not a party to any purchase made on a third-party store, and we do not pay or collect affiliate commissions on your behalf.`,
      ],
    },
    {
      id: "eligibility",
      title: "3. Eligibility",
      body: [
        "You must be at least 18 years old, or the age of legal majority where you live if higher, to create an account. You must be legally able to enter into a contract and not be barred from using the Service under any applicable law.",
        "You may not use the Service if we have previously suspended or terminated your account for breaching these Terms, unless we have given you written permission.",
      ],
    },
    {
      id: "accounts",
      title: "4. Your account and security",
      body: [
        "You must provide accurate, current and complete information when you register and keep it up to date. Each account is personal; you may not share your login credentials or let others access your account other than through the team features described below.",
        "You are responsible for all activity that happens under your account and for keeping your password confidential. Use a strong, unique password. Tell us immediately at " + MAIL + " if you suspect unauthorized access.",
        "We may send you service emails, such as account confirmation, password reset, security alerts, team invitations and approval requests. These messages are part of the Service and cannot be turned off while your account is active.",
      ],
    },
    {
      id: "teams",
      title: "5. Teams and collaborators",
      body: [
        "Page owners can invite other people (“team members”) by email to help manage their page. A team member works on the owner's page with access to the dashboard, except account email and password, team management and custom-domain settings.",
        "The page owner decides whether a team member's changes go live immediately or must first be approved. Approved changes are applied as if the owner had made them. The page owner remains fully responsible for all content published on their page, including content created by team members, and for removing team members who should no longer have access.",
        "Team members must follow these Terms and the instructions of the page owner. A team member may leave a team at any time; the page owner may suspend or remove a team member at any time.",
      ],
    },
    {
      id: "content",
      title: "6. Your content",
      body: [
        "“Your Content” means everything you or your team members upload, write or publish through the Service, including text, reviews, ratings, prices, images, videos, links, logos, articles and page settings.",
        `You keep all ownership rights in Your Content. To operate the Service, you grant ${N} a worldwide, non-exclusive, royalty-free, sublicensable licence to host, store, reproduce, adapt (for example resize images or generate link-preview images), publish, display and distribute Your Content solely for the purpose of providing, securing and improving the Service and promoting your page within the Service. This licence ends when you delete the content or your account, except for copies kept in routine backups for a limited time or where retention is required by law.`,
        "You represent and warrant that you own or have all necessary rights to Your Content, that it is accurate and not misleading, and that publishing it does not infringe any third party's rights or break any law or contract (including affiliate program agreements).",
        "We do not review content before it is published and we are not responsible for Your Content. We may, but are not obliged to, review, restrict or remove any content that we believe breaches these Terms or the law.",
      ],
    },
    {
      id: "affiliate",
      title: "7. Affiliate programs and third-party stores",
      body: [
        "You are solely responsible for joining, complying with and maintaining your relationship with each affiliate program or network you use (for example Amazon Associates, Walmart Affiliates, Target Partners, Impact, Awin, Rakuten, CJ or ShareASale). Many programs have strict rules about how links, prices, images, trademarks and disclosures may be used; you must follow them.",
        "Prices, availability, coupons and product details change frequently. You must keep your offers reasonably up to date and must not present outdated prices or expired deals as current. Where a program forbids showing prices that are not refreshed automatically, do not show them.",
        "Clicks on buy buttons pass through our redirect service so that we can count clicks and apply the link protection you choose. Purchases happen entirely on third-party websites, under their own terms and privacy policies. We are not responsible for third-party stores, products, prices, deliveries, refunds, or for whether a program credits you with a commission.",
        "You must display a clear affiliate disclosure where required. The Service shows a default disclosure on your page, which you may customize but should not remove where the law or a program requires one. See our Affiliate Disclosure page.",
      ],
    },
    {
      id: "acceptable-use",
      title: "8. Acceptable use",
      body: [
        "You agree to use the Service lawfully and in line with our Acceptable Use Policy. In particular, you must not publish misleading reviews or fake ratings, impersonate others, infringe intellectual property, distribute malware, spam, manipulate statistics, scrape the Service, interfere with its security or use it for any unlawful purpose.",
      ],
    },
    {
      id: "domains",
      title: "9. Custom domains",
      body: [
        "If you connect your own domain, you confirm that you own or are authorized to use it. You remain responsible for the domain registration, its renewal, DNS settings and any costs charged by your registrar.",
        "We provision SSL certificates through our hosting provider once your DNS is correctly configured. We cannot guarantee availability when DNS records are changed, removed or misconfigured, or when your registrar or network providers are unavailable.",
        "When you disconnect a domain or close your account, the domain stops pointing to your page. We do not acquire any rights in your domain.",
      ],
    },
    {
      id: "pixels",
      title: "10. Pixels, analytics and third-party tools",
      body: [
        "You may add third-party tracking tools to your page, such as a Meta Pixel or TikTok Pixel, and domain-verification tags. When you do, you act as an independent controller of the data those tools collect from your visitors and you are responsible for providing any notices and obtaining any consents required by law (for example cookie consent in the European Economic Area and the United Kingdom).",
        "Statistics shown in your dashboard are provided for information. They may differ from figures reported by affiliate networks or advertising platforms because of filtering of bots, ad blockers, browser privacy features and different counting methods.",
      ],
    },
    {
      id: "ip",
      title: `11. ${N}'s intellectual property`,
      body: [
        `The Service, including its software, design, templates, logos, the ${N} name and all related trademarks, is owned by ${N} or its licensors and is protected by intellectual-property laws. Except for the limited right to use the Service under these Terms, no rights are granted to you.`,
        `You may not copy, modify, reverse engineer, resell or create derivative works of the Service, or use the ${N} name or logo in a way that suggests endorsement, without our written permission. If you send us feedback or suggestions, we may use them freely without any obligation to you.`,
      ],
    },
    {
      id: "copyright",
      title: "12. Copyright and trademark complaints",
      body: [
        `We respect intellectual property rights. If you believe content on the Service infringes your copyright or trademark, send a notice to ${MAIL} including: your contact details; a description of the protected work or mark; the exact URL of the content; a statement that you have a good-faith belief that the use is not authorized; a statement, under penalty of perjury, that the information is accurate and that you are the rights holder or authorized to act on their behalf; and your physical or electronic signature.`,
        "We will review valid notices promptly and may remove or disable access to the content and notify the marketer, who may submit a counter-notice if they believe the removal was a mistake. We terminate the accounts of repeat infringers in appropriate circumstances.",
      ],
    },
    {
      id: "fees",
      title: "13. Fees",
      body: [
        `${N} currently provides its core features free of charge. We may introduce paid plans or features in the future. We will tell you about any new fees in advance, and you will never be charged unless you choose a paid plan. Your affiliate commissions are paid to you directly by the affiliate programs; ${N} does not take a share of them.`,
      ],
    },
    {
      id: "availability",
      title: "14. Changes and availability of the Service",
      body: [
        "We continuously improve the Service and may add, change or remove features. We aim to keep the Service available at all times but do not guarantee uninterrupted or error-free operation. Maintenance, updates, third-party outages or events beyond our control may cause interruptions.",
        "You are responsible for keeping your own copies of important content. We are not liable for any loss of data, although we take reasonable measures, including regular backups, to protect it.",
      ],
    },
    {
      id: "termination",
      title: "15. Suspension and termination",
      body: [
        "You may stop using the Service and delete your account at any time from your account settings or by contacting us.",
        "We may suspend or terminate your access, hide your page or remove content, with or without notice, if we reasonably believe that you have breached these Terms or the law, that your use creates risk or possible legal exposure for us or others, or if we are required to do so by law or by a competent authority. Where appropriate and lawful, we will tell you the reason and give you an opportunity to respond.",
        "On termination, your right to use the Service ends immediately. Sections that by their nature should survive termination, including those on content licences for backups, intellectual property, disclaimers, limitation of liability, indemnification and governing law, will survive.",
      ],
    },
    {
      id: "disclaimers",
      title: "16. Disclaimers",
      body: [
        "THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW.",
        `${N} does not guarantee any level of traffic, clicks, sales or commissions, and does not warrant the accuracy of any content published by marketers, including product information, prices, reviews or ratings. Visitors should verify product details on the retailer's website before buying.`,
      ],
    },
    {
      id: "liability",
      title: "17. Limitation of liability",
      body: [
        `TO THE FULLEST EXTENT PERMITTED BY LAW, ${N.toUpperCase()} AND ITS OWNERS, EMPLOYEES AND PARTNERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, COMMISSIONS, REVENUE, DATA, GOODWILL OR BUSINESS OPPORTUNITY, ARISING FROM OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE SERVICE.`,
        `OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM AND (B) ONE HUNDRED US DOLLARS (USD 100).`,
        "Some jurisdictions do not allow certain limitations of liability. In those jurisdictions, our liability is limited to the maximum extent permitted by law. Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud or for death or personal injury caused by negligence.",
      ],
    },
    {
      id: "indemnity",
      title: "18. Indemnification",
      body: [
        `You agree to defend, indemnify and hold harmless ${N} and its owners, employees and partners from any claims, damages, losses, liabilities, costs and expenses (including reasonable legal fees) arising from Your Content, your use of the Service, your breach of these Terms, your violation of any affiliate program agreement, or your violation of any law or third-party right.`,
      ],
    },
    {
      id: "law",
      title: "19. Governing law and disputes",
      body: [
        `Before starting any formal proceedings, please contact us at ${MAIL}; most concerns can be resolved quickly and informally. If a dispute cannot be resolved within 60 days, it will be settled by the competent courts of the place where ${N} is established, under the laws applicable there, without regard to conflict-of-law rules.`,
        "If you are a consumer, you keep the protection of the mandatory laws of your country of residence and may bring proceedings in your local courts where the law allows.",
      ],
    },
    {
      id: "changes",
      title: "20. Changes to these Terms",
      body: [
        "We may update these Terms from time to time, for example to reflect new features or legal requirements. We will post the updated version on this page and change the effective date. For material changes we will give you reasonable notice by email or in the dashboard before they take effect. If you continue to use the Service after the changes take effect, you accept the updated Terms; if you do not agree, you must stop using the Service.",
      ],
    },
    {
      id: "general",
      title: "21. General",
      body: [
        "These Terms, together with the policies referenced in them, are the entire agreement between you and us about the Service. If any provision is found unenforceable, the remaining provisions remain in full effect. Our failure to enforce a provision is not a waiver of our right to do so later. You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition or sale of assets. Translations are provided for convenience; the English version prevails.",
      ],
    },
    {
      id: "contact",
      title: "22. Contact us",
      body: [`Questions about these Terms? Email us at ${MAIL}. We usually reply within two business days.`],
    },
  ],
};

// -------------------- 🔒 سياسة الخصوصية --------------------
const privacy: LegalDoc = {
  effective: EFFECTIVE,
  summary: [
    "We collect only what we need to run the Service: your account details, the content you publish and aggregated statistics about your page.",
    "We don't sell personal information and we don't build advertising profiles of visitors.",
    "Visitor statistics are counted in aggregate (daily totals by page, offer and traffic source); we don't store a browsing history for each visitor.",
    "You can access, correct, export or delete your data at any time by contacting us.",
  ],
  sections: [
    {
      id: "intro",
      title: "1. Who we are and what this policy covers",
      body: [
        `This Privacy Policy explains how ${N} (“we”, “us”) collects, uses, shares and protects personal information when you use our website, dashboard and the public pages hosted on ${N} (including pages served on marketers' custom domains).`,
        "It applies to two groups of people: marketers and team members who create an account (“users”), and people who visit pages published with the Service (“visitors”).",
        `For account data and the operation of the platform, ${N} is the data controller. For data that a marketer chooses to collect on their own page through third-party tools they add (for example a Meta Pixel or TikTok Pixel), the marketer is an independent controller and their own privacy notice applies.`,
      ],
    },
    {
      id: "collect-users",
      title: "2. Information we collect from users",
      body: [
        {
          table: {
            head: ["Category", "Examples", "Source"],
            rows: [
              ["Account data", "Name, email address, password (stored only as a secure hash), account role, email verification status", "You, when you register or accept a team invitation"],
              ["Page and content data", "Page name and link, profile photo, cover, bio, social links, design settings, offers, reviews, prices, articles, uploaded images", "You and your team members"],
              ["Settings and integrations", "Custom domain, pixel IDs, domain-verification tags, audience and link-protection settings", "You"],
              ["Team data", "Invitations, team members' names and emails, change requests and approval history", "You and your team members"],
              ["Communications", "Messages you send to support, email delivery status", "You and our email provider"],
              ["Technical data", "Session cookies, sign-in timestamps, last activity, basic logs (IP address, browser type) kept for security", "Your device, automatically"],
            ],
          },
        },
      ],
    },
    {
      id: "collect-visitors",
      title: "3. Information processed about visitors",
      body: [
        "When someone visits a page published with the Service or clicks a buy button, we process limited technical information to deliver the page, count visits and protect affiliate links:",
        {
          list: [
            "Aggregated counters: number of page views, clicks to stores, filtered bot hits and visits from excluded countries, grouped by day, page, offer and traffic source (for example Instagram, TikTok, Google or direct). These counters do not identify individuals.",
            "Approximate country, derived by our hosting provider from the IP address at the time of the request, used to apply the marketer's geographic targeting. We do not store the IP address with these counters.",
            "Browser type (user agent) and request headers, used in real time to recognize bots and in-app browsers and to identify the traffic source.",
            "A short-lived first-party cookie (ps_src) that remembers the traffic source during the visit, so a later click can be attributed correctly. See our Cookie Policy.",
          ],
        },
        "We do not create visitor profiles, we do not track visitors across unrelated websites, and we do not sell visitor information.",
      ],
    },
    {
      id: "use",
      title: "4. How we use information",
      body: [
        {
          list: [
            "To provide the Service: host your page, store your content, generate link-preview images, redirect clicks to retailers, connect custom domains and run team features.",
            "To show you statistics about your page's performance and send notifications such as click milestones and daily summaries.",
            "To communicate with you: account confirmation, password resets, security notices, team invitations and approval requests, and replies to your questions.",
            "To keep the Service secure: prevent fraud, abuse, spam and bot traffic, and enforce our Terms and Acceptable Use Policy.",
            "To maintain and improve the Service, fix bugs and develop new features, using aggregated or de-identified information where possible.",
            "To comply with legal obligations and respond to lawful requests.",
          ],
        },
      ],
    },
    {
      id: "legal-bases",
      title: "5. Legal bases (EEA, UK and similar laws)",
      body: [
        {
          list: [
            "Performance of a contract: to provide the Service you signed up for.",
            "Legitimate interests: to keep the Service secure, measure aggregated usage, filter bots, protect affiliate links and improve our products, in a way that does not override your rights.",
            "Consent: where required, for example for non-essential cookies or marketing emails. You can withdraw consent at any time.",
            "Legal obligation: to keep records and respond to authorities where the law requires.",
          ],
        },
      ],
    },
    {
      id: "sharing",
      title: "6. How we share information",
      body: [
        "We do not sell or rent personal information. We share it only as follows:",
        {
          table: {
            head: ["Recipient", "Purpose"],
            rows: [
              ["Hosting and content delivery provider (Vercel)", "Serving the website and pages, SSL certificates, custom domains, approximate country detection"],
              ["Database provider (Supabase)", "Storing account data, content, uploads and aggregated statistics"],
              ["Email delivery provider (Resend)", "Sending account, security and team emails"],
              ["Font provider (Google Fonts)", "Delivering the typefaces used on pages; your browser connects to Google's servers to download them"],
              ["Third-party tools added by a marketer", "Only on that marketer's page, for example Meta or TikTok pixels or Google AdSense where enabled; governed by those providers' policies"],
              ["Your team", "Page owners and their team members can see changes, names and emails within their team"],
              ["Authorities and legal requests", "When required by law or to protect rights, safety and the integrity of the Service"],
              ["Business transfers", "If we are involved in a merger, acquisition or sale of assets, under equivalent protections"],
            ],
          },
        },
        "Our service providers process data on our instructions and are bound by confidentiality and data-protection obligations.",
      ],
    },
    {
      id: "transfers",
      title: "7. International transfers",
      body: [
        "Our providers may process data in countries other than yours, including the United States and the European Union. Where required, transfers are protected by appropriate safeguards such as the European Commission's Standard Contractual Clauses or equivalent mechanisms.",
      ],
    },
    {
      id: "retention",
      title: "8. How long we keep information",
      body: [
        {
          list: [
            "Account and content data: for as long as your account is active. When you delete your account, we delete or anonymize your data within 30 days, except where we must keep it longer by law.",
            "Aggregated statistics: for as long as your page exists; they contain no personal data about visitors.",
            "Password-reset and email-verification links: until used or expired (60 minutes and 48 hours respectively).",
            "Team invitations: until accepted or expired (7 days); change-request history for as long as the page exists.",
            "Security logs and backups: for a limited period, typically up to 90 days.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "9. Security",
      body: [
        "We use industry-standard measures to protect information, including encrypted connections (HTTPS) everywhere, hashed passwords, hashed single-use tokens for email links, access controls and regular backups. No method of transmission or storage is completely secure, so we cannot guarantee absolute security. Please use a strong, unique password and contact us immediately if you suspect any misuse.",
      ],
    },
    {
      id: "rights",
      title: "10. Your rights",
      body: [
        "Depending on where you live, you may have the right to:",
        {
          list: [
            "access the personal information we hold about you and receive a copy;",
            "correct inaccurate information (most of it can be edited directly in your dashboard);",
            "delete your information or your account;",
            "object to or restrict certain processing;",
            "receive your data in a portable format;",
            "withdraw consent where processing is based on consent;",
            "lodge a complaint with your local data-protection authority.",
          ],
        },
        `California residents have rights under the CCPA/CPRA, including to know, delete and correct personal information, and to opt out of the sale or sharing of personal information. We do not sell or share personal information for cross-context behavioural advertising. To exercise any right, email ${MAIL} from the address linked to your account. We will respond within the time required by law, usually within 30 days, and will not discriminate against you for exercising your rights.`,
      ],
    },
    {
      id: "children",
      title: "11. Children",
      body: [
        "The Service is not intended for children. Accounts are only available to people aged 18 or older, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.",
      ],
    },
    {
      id: "marketers",
      title: "12. Information for marketers about their visitors",
      body: [
        "If you add third-party pixels or analytics to your page, you are responsible for informing your visitors and obtaining any consent required by law in their country. If you collect personal information from visitors in any other way, for example through links to your own newsletter, your own privacy notice applies to that collection.",
      ],
    },
    {
      id: "changes",
      title: "13. Changes to this policy",
      body: [
        "We may update this policy to reflect changes to the Service or the law. We will post the new version here with a new effective date and, for material changes, notify users by email or in the dashboard.",
      ],
    },
    {
      id: "contact",
      title: "14. Contact",
      body: [`For any privacy question or request, contact us at ${MAIL}.`],
    },
  ],
};

// -------------------- 🍪 سياسة الكوكيز --------------------
const cookies: LegalDoc = {
  effective: EFFECTIVE,
  summary: [
    `${N} itself uses only a few first-party cookies that are needed to sign you in, remember your language and attribute clicks correctly.`,
    "We don't use advertising cookies of our own.",
    "Marketers can add third-party pixels to their own pages; those set their own cookies under the marketer's responsibility.",
  ],
  sections: [
    {
      id: "what",
      title: "1. What cookies are",
      body: [
        "Cookies are small text files stored on your device by your browser. Similar technologies include local storage and pixels (small pieces of code or images that send information to a server). In this policy, we call all of these “cookies”.",
        "First-party cookies are set by the website you are visiting; third-party cookies are set by another company, for example an advertising platform.",
      ],
    },
    {
      id: "ours",
      title: `2. Cookies set by ${N}`,
      body: [
        {
          table: {
            head: ["Cookie", "Purpose", "Type", "Duration"],
            rows: [
              ["authjs.session-token (and __Secure- variant)", "Keeps you signed in to your dashboard", "Strictly necessary", "Up to 30 days"],
              ["authjs.csrf-token", "Protects sign-in forms against cross-site request forgery", "Strictly necessary", "Session"],
              ["authjs.callback-url", "Returns you to the right page after signing in", "Strictly necessary", "Session"],
              ["NEXT_LOCALE", "Remembers the language you chose for the platform", "Functional", "1 year"],
              ["ps_page", "Remembers which page you are managing if you belong to several teams", "Functional", "1 year"],
              ["ps_src", "Remembers where a visitor came from (for example Instagram or TikTok) during the visit, so clicks are attributed to the right source in aggregated statistics. Contains only the source name.", "Analytics (first-party, aggregated)", "Session"],
            ],
          },
        },
        "We may also use your browser's local storage for small conveniences in the dashboard, such as remembering a closed notice.",
      ],
    },
    {
      id: "third-party",
      title: "3. Third-party cookies on marketers' pages",
      body: [
        "Marketers can add third-party tools to their own pages. If they do, those providers may set cookies or use similar technologies on visitors' devices:",
        {
          table: {
            head: ["Provider", "Typical cookies", "Purpose"],
            rows: [
              ["Meta (Facebook / Instagram) Pixel", "_fbp, fr", "Measuring ads and building advertising audiences for the marketer"],
              ["TikTok Pixel", "_ttp, ttcsid", "Measuring ads and building advertising audiences for the marketer"],
              ["Google AdSense (on articles, when enabled)", "Google advertising cookies", "Showing and measuring ads"],
            ],
          },
        },
        "These tools are chosen and controlled by the marketer, who is responsible for informing visitors and obtaining consent where required. Their use of your information is governed by the providers' own privacy policies. Pixels are never loaded for the page owner while they preview their own page.",
        "When you click a buy button, you are sent to a retailer's website (for example Amazon or Walmart). The retailer and the affiliate network may set their own cookies to credit the marketer with any resulting purchase; these are governed by their policies.",
      ],
    },
    {
      id: "control",
      title: "4. How to control cookies",
      body: [
        "You can block or delete cookies in your browser settings. Blocking strictly necessary cookies will prevent you from signing in to the dashboard. Most browsers also let you block third-party cookies only. You can opt out of personalised advertising through your Meta and TikTok ad settings and at optout.aboutads.info or youronlinechoices.eu.",
        "Many browsers offer a “Do Not Track” or Global Privacy Control signal. We do not use cookies for cross-site tracking, so these signals do not change how our own cookies work.",
      ],
    },
    {
      id: "changes",
      title: "5. Changes and contact",
      body: [`We may update this policy when we change the cookies we use. Questions? Contact ${MAIL}.`],
    },
  ],
};

// -------------------- 💸 إفصاح الأفلييت --------------------
const disclosure: LegalDoc = {
  effective: EFFECTIVE,
  summary: [
    `Pages published on ${N} are created by independent affiliate marketers.`,
    "When you buy through a link on those pages, the marketer may earn a commission at no extra cost to you.",
    `${N} does not take a share of marketers' commissions and does not sell the products shown.`,
  ],
  sections: [
    {
      id: "how",
      title: "1. How affiliate links work",
      body: [
        "Many pages on the Service contain affiliate links. When you click a “Buy on …” button and then make a purchase on the retailer's website, the retailer or affiliate network may pay the marketer who published the page a commission. The price you pay is the same whether or not you use the affiliate link.",
        "Retailers and networks commonly used by marketers include Amazon Associates, Walmart Affiliates, Target Partners, eBay Partner Network, Impact, Awin, Rakuten Advertising, CJ and ShareASale, among others.",
      ],
    },
    {
      id: "amazon",
      title: "2. Amazon Associates statement",
      body: [
        "Marketers who participate in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com (and other Amazon marketplaces), state: “As an Amazon Associate I earn from qualifying purchases.”",
        "Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. All other trademarks and logos shown on marketers' pages belong to their respective owners and are used for identification only.",
      ],
    },
    {
      id: "platform",
      title: `3. ${N}'s role`,
      body: [
        `${N} provides the publishing tools only. We are not the seller of any product, we do not handle orders, payments, shipping or returns, and we do not receive a share of marketers' affiliate commissions. Questions about an order should be sent to the retailer where the purchase was made.`,
        "Each marketer is responsible for the accuracy of their pages and for following the rules of the programs they join. A default disclosure is shown on every page; marketers may adapt its wording.",
      ],
    },
    {
      id: "reviews",
      title: "4. Reviews, ratings and prices",
      body: [
        "Reviews and ratings represent the personal opinion of the marketer who wrote them. Prices, availability and promotions are provided by the marketer and can change at any time; the price shown on the retailer's website at the time of purchase is the one that applies.",
        "Marketers must disclose any material connection with a brand, such as free products, sponsorships or payments, in line with the U.S. Federal Trade Commission's Endorsement Guides and similar rules in other countries.",
      ],
    },
    {
      id: "marketers",
      title: "5. Guidance for marketers",
      body: [
        {
          list: [
            "Keep the disclosure visible on your page and, where possible, near your links.",
            "Add the disclosure wording required by each program you use (for example the Amazon statement above).",
            "Disclose sponsorships and free products clearly in each review where they apply.",
            "Never present paid placements as independent recommendations.",
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "6. Contact",
      body: [`Questions about this disclosure? Contact us at ${MAIL}.`],
    },
  ],
};

// -------------------- 🛡️ سياسة الاستخدام المقبول --------------------
const acceptableUse: LegalDoc = {
  effective: EFFECTIVE,
  summary: [
    "Be honest with your audience, respect other people's rights and follow the rules of the affiliate programs you use.",
    "No illegal, harmful, misleading or infringing content, and no attempts to abuse or attack the Service.",
    "We may remove content or suspend accounts that break these rules.",
  ],
  sections: [
    {
      id: "purpose",
      title: "1. Purpose",
      body: [
        `This Acceptable Use Policy describes what is and isn't allowed on ${N}. It is part of our Terms of Use and applies to all users, team members and content on the Service, including pages served on custom domains.`,
      ],
    },
    {
      id: "content",
      title: "2. Prohibited content",
      body: [
        "You may not publish content that:",
        {
          list: [
            "is illegal, or promotes illegal activity, in the country where you live or where your audience is located;",
            "promotes or sells prohibited or heavily regulated goods, such as illegal drugs, weapons and ammunition, explosives, counterfeit goods, stolen goods, prescription medicines without authorization, or tobacco and vaping products to minors;",
            "contains sexually explicit material, or any content that sexualizes minors;",
            "is hateful, harassing, threatening or violent, or incites discrimination on the basis of protected characteristics;",
            "contains false health claims, dangerous advice, or presents unproven products as cures;",
            "promotes gambling, get-rich-quick schemes, pyramid schemes or misleading financial products;",
            "infringes copyrights, trademarks or other rights, including product photos, logos or reviews copied without permission where the owner does not allow it;",
            "contains malware, phishing pages or links to harmful websites.",
          ],
        },
      ],
    },
    {
      id: "honesty",
      title: "3. Honest affiliate marketing",
      body: [
        {
          list: [
            "Do not publish fake reviews, invented ratings or testimonials you cannot support.",
            "Do not show prices, discounts, coupons or deadlines you know to be false or outdated, and do not invent “limited time” pressure.",
            "Do not impersonate a brand, retailer, celebrity or another marketer, or suggest an official partnership that does not exist.",
            "Keep your affiliate disclosure visible and disclose sponsorships and free products.",
            "Follow the rules of each affiliate program you use, including restrictions on trademarks, brand bidding, prices, images and incentivised clicks.",
          ],
        },
      ],
    },
    {
      id: "traffic",
      title: "4. Traffic and link practices",
      body: [
        {
          list: [
            "Do not generate artificial clicks or views, use bots or click farms, or ask people to click links in exchange for rewards where a program forbids it.",
            "Do not send spam, unsolicited bulk messages or deceptive notifications to promote your page.",
            "Share your page links, not the redirect links behind buy buttons, on social networks; do not use redirect links to disguise the destination or to circumvent platform rules (cloaking).",
            "Do not use the Service to shorten or redirect to destinations other than legitimate retailer pages for your offers.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "5. Security and integrity of the Service",
      body: [
        {
          list: [
            "Do not attempt to access accounts, pages or data that are not yours, or probe, scan or test the vulnerability of the Service without our written permission.",
            "Do not interfere with or overload the Service, including through denial-of-service attacks or excessive automated requests.",
            "Do not scrape, copy or harvest data from the Service or other users' pages by automated means, except as allowed by robots.txt for search engines.",
            "Do not reverse engineer the Service or bypass any limits, access controls or approval workflows.",
          ],
        },
        `If you discover a security vulnerability, please report it responsibly to ${MAIL}. We appreciate good-faith reports and will not take action against researchers who follow responsible-disclosure practices.`,
      ],
    },
    {
      id: "enforcement",
      title: "6. Enforcement",
      body: [
        "We may investigate suspected violations and take any action we consider appropriate, including removing content, hiding a page, disabling buy buttons, suspending team members, disconnecting a custom domain, suspending or terminating accounts, and reporting illegal activity to the authorities. Where appropriate we will tell you about the action and the reason, and give you a chance to fix the issue or appeal.",
      ],
    },
    {
      id: "report",
      title: "7. Reporting abuse",
      body: [`To report content or behaviour that breaks this policy, email ${MAIL} with the page link and a short description. We review every report.`],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalKey, LegalDoc> = { terms, privacy, cookies, disclosure, acceptableUse };
