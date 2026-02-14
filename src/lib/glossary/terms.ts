export interface GlossaryTerm {
  slug: string;
  title: string;
  category: "Feasibility" | "Project Delivery" | "Procurement" | "Risk & Compliance";
  definition: string;
  content: string;
  upscaleConnection: string;
  relatedSlugs: string[];
  metaDescription: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "feasibility-study",
    title: "Feasibility Study",
    category: "Feasibility",
    definition:
      "A feasibility study is a financial analysis that determines whether a property development project will generate an acceptable return before committing capital.",
    content: `A feasibility study is the single most important document in property development. Before you buy the land, before you engage an architect, before you even shake hands on a deal — you run the numbers. If they don't stack up, you walk away. If they do, you move forward with confidence.

The core of a feasibility study is straightforward: what will it cost to build, what can you sell it for, and what's left over? But the devil is in the detail. Land acquisition costs, stamp duty, holding costs, construction costs, professional fees, marketing, GST — every line item matters. Miss one, and your projected 20% margin can evaporate to 5%.

Most developers use spreadsheets for feasibility. The problem is that spreadsheets break. Formulas get overwritten, assumptions get buried, and by the time you're presenting to a lender, you're not sure if the numbers are even right. Worse, when market conditions change — and they always do — updating a spreadsheet model is painful and error-prone.

A good feasibility study also tests sensitivity. What happens if construction costs blow out by 10%? What if sales prices drop? What if settlement takes three months longer than expected? These scenarios determine whether your project can survive real-world conditions, not just best-case assumptions.`,
    upscaleConnection: `UpScale's feasibility module was built specifically for small-to-medium property developers who are tired of fighting spreadsheets. You input your land costs, construction budget, sales revenue, and funding structure — and the platform calculates your development margin, total development costs, GST position, and project-level IRR automatically.

Every assumption is visible, every calculation is traceable, and when something changes, you update one number and everything recalculates. No broken formulas, no hidden cells, no guesswork.`,
    relatedSlugs: ["development-margin", "preliminaries-construction"],
    metaDescription:
      "Learn what a feasibility study is in property development, why it matters before committing capital, and how to run one properly.",
  },
  {
    slug: "progress-claims",
    title: "Progress Claims",
    category: "Project Delivery",
    definition:
      "A progress claim is a contractor's formal request for payment for work completed during a specific period on a construction project.",
    content: `Progress claims are the financial heartbeat of any construction project. Every month (or whatever period the contract specifies), the contractor submits a claim for work they've completed. The superintendent or project manager reviews it, certifies an amount, and the developer pays. This cycle repeats from first shovel to practical completion.

The claim typically breaks down the contract into line items — foundations, framing, roofing, fit-out — and shows what percentage of each item has been completed. It's not just "we did some work, pay us." It's a detailed account that should reconcile with the original contract sum and any approved variations.

Where progress claims get messy is in the gap between "claimed" and "certified." A contractor might claim $200,000 of work, but the superintendent only certifies $170,000 because some work isn't to standard, or the percentage complete is overstated. This gap creates tension, and if it's not managed properly, it leads to disputes, cash flow problems, and project delays.

Under security of payment legislation in Australia, there are strict timeframes for responding to progress claims. Miss a deadline and you could end up owing the full claimed amount by default — even if the work wasn't done properly. Knowing your obligations and tracking every claim is non-negotiable.`,
    upscaleConnection: `UpScale tracks every progress claim from submission through certification to payment. You can see the full history of each claim, compare claimed versus certified amounts, and track cumulative progress against the contract sum. No more chasing spreadsheets or digging through emails to find last month's claim.

The platform also tracks retention amounts automatically, so you always know exactly how much is being held and when it's due for release.`,
    relatedSlugs: [
      "variations-construction",
      "retention-construction",
      "practical-completion",
    ],
    metaDescription:
      "Understand progress claims in construction: how contractors request payment, the claim-certification process, and why tracking them matters.",
  },
  {
    slug: "variations-construction",
    title: "Variations (Construction)",
    category: "Project Delivery",
    definition:
      "A variation is a change to the original scope, cost, or timeline of a construction contract, formally documented and requiring approval before work proceeds.",
    content: `Variations are inevitable in construction. No matter how good your documentation is, something will change. The council might require a design modification. The client might want an upgrade. You might hit rock where the geotech report said there'd be clay. When this happens, the change needs to be formally documented as a variation.

A variation captures what's changing, why, how much it will cost, and whether it affects the program. It goes through an approval workflow — typically from draft, to submitted for review, to approved or rejected. This paper trail is essential because variations are one of the biggest sources of disputes in construction.

The financial impact of variations compounds quickly. One $5,000 variation is manageable. Twenty of them — totalling $100,000 on a $1M contract — is a 10% cost blowout that can destroy your project margin. This is why tracking variations in real time, not in a spreadsheet updated once a month, is critical for developers.

Smart developers also distinguish between "directed variations" (changes the principal requests) and "constructive variations" (work the contractor claims was outside the original scope). The latter are often contentious and require careful documentation to resolve.`,
    upscaleConnection: `UpScale gives you a live register of every variation on every project. Each variation tracks the cost impact and time impact, moves through a clear status workflow (draft, submitted, approved, rejected), and rolls up into your project budget automatically. You see the total variation exposure at a glance — no surprises at the end of the job.`,
    relatedSlugs: [
      "progress-claims",
      "scope-of-works",
      "extension-of-time",
    ],
    metaDescription:
      "Learn what construction variations are, how they're managed, and why tracking cost and time impacts is critical for property developers.",
  },
  {
    slug: "extension-of-time",
    title: "Extension of Time (EOT)",
    category: "Risk & Compliance",
    definition:
      "An extension of time is a formal claim by a contractor for additional time to complete the works due to qualifying causes of delay beyond their control.",
    content: `An extension of time — or EOT — is the contractor's mechanism for getting more time when things outside their control delay the project. Rain that exceeds historical averages, design changes directed by the principal, late access to the site, even global pandemics — these can all be qualifying causes for an EOT.

Why does this matter to a developer? Because the contract completion date isn't just a target — it's a legally binding obligation with financial consequences. If the contractor finishes late without an approved EOT, they owe you liquidated damages (LDs). But if they have a valid EOT that you failed to assess properly, those LDs are unenforceable.

The EOT process is time-sensitive. Most contracts require the contractor to give notice within a set number of days of the delay occurring. The superintendent then has to assess the claim and either approve days, reject the claim, or approve a different number of days. Every step needs to be documented.

For developers, EOTs also have cash flow implications. A longer construction period means extended holding costs — interest on your development finance, extended prelims, and potentially delayed settlement income. Even a two-week extension can cost tens of thousands on a leveraged project.`,
    upscaleConnection: `UpScale tracks every EOT claim with the days claimed, days approved, cause of delay, and impact on the completion date. You can see at a glance how your program is tracking against the original contract date and make informed decisions about how delays affect your project timeline and budget.`,
    relatedSlugs: [
      "variations-construction",
      "practical-completion",
      "site-diary",
    ],
    metaDescription:
      "Understand extensions of time (EOT) in construction: when contractors can claim extra time, the approval process, and the financial impact on developers.",
  },
  {
    slug: "site-diary",
    title: "Site Diary",
    category: "Project Delivery",
    definition:
      "A site diary is a daily record of activities, conditions, and events on a construction site, serving as a contemporaneous log for project management and dispute resolution.",
    content: `A site diary is the daily record of what happened on site. Weather conditions, workforce numbers, equipment on site, work completed, safety observations, visitors, delays — it all goes in the diary. It sounds mundane, but a well-kept site diary is one of the most valuable documents on a construction project.

Why? Because construction disputes are often settled based on contemporaneous records. If a contractor claims two weeks of rain delays six months after the fact, the site diary is what proves or disproves it. If there's an accident and WorkSafe investigates, the diary shows what safety measures were in place. If a subcontractor claims they were on site for five days but you only saw them for three, the diary is your evidence.

The problem with traditional site diaries is that they're often handwritten, inconsistent, or simply not done. A superintendent might fill in Monday's diary on Thursday from memory, which defeats the purpose of a contemporaneous record. And paper diaries are impossible to search, aggregate, or report on.

Good project managers treat the site diary as non-negotiable daily practice — like brushing your teeth. Five minutes at the end of each day to record conditions, progress, and any issues. That discipline pays for itself the first time you need to defend a claim or explain a delay.`,
    upscaleConnection: `UpScale's site diary is purpose-built for daily recording. Each entry captures weather, work summary, safety notes, delays, and photos. You can log labour by trade, equipment usage, and visitor sign-ins — all structured and searchable. When a dispute arises, you can pull up any day's record in seconds instead of flipping through a paper notebook.`,
    relatedSlugs: [
      "extension-of-time",
      "practical-completion",
      "defects-liability-period",
    ],
    metaDescription:
      "Learn why site diaries matter in construction, what to record daily, and how contemporaneous records protect developers in disputes.",
  },
  {
    slug: "practical-completion",
    title: "Practical Completion",
    category: "Project Delivery",
    definition:
      "Practical completion is the contractual milestone when a building is sufficiently complete for its intended purpose, triggering key obligations like defects liability and final payment.",
    content: `Practical completion (PC) is one of the most significant milestones in a construction contract. It's the point at which the works are complete — or complete enough — for the building to be used for its intended purpose, even if minor defects remain. When PC is reached, several critical things happen simultaneously.

First, the risk of loss or damage typically transfers from the contractor to the developer. Second, the defects liability period begins — usually 12 months during which the contractor must return to fix any defects that emerge. Third, the contractor is entitled to release of the first half of retention monies. And fourth, the clock stops on liquidated damages.

Getting PC right matters because it triggers real financial consequences. If you certify PC too early, you lose your leverage to get the contractor to finish properly. If you delay PC unreasonably, the contractor can claim additional costs. The superintendent's role in assessing PC is critical — they need to inspect the works, identify any outstanding items, and make a judgment call on whether what's left is genuinely minor.

For developers selling off-the-plan, practical completion also triggers settlement timelines with purchasers. Miss PC and your buyers start getting nervous — or worse, start exercising sunset clauses. This is why PC tracking isn't just a contract admin task; it's a commercial imperative.`,
    upscaleConnection: `UpScale tracks your project timeline from start to practical completion, including all the events that affect it — approved variations, extensions of time, and program changes. You can see exactly where your project stands relative to the contracted completion date, so there are no surprises when PC approaches.`,
    relatedSlugs: [
      "defects-liability-period",
      "retention-construction",
      "progress-claims",
    ],
    metaDescription:
      "Learn what practical completion means in construction, what it triggers contractually, and why it's a critical milestone for property developers.",
  },
  {
    slug: "retention-construction",
    title: "Retention (Construction)",
    category: "Project Delivery",
    definition:
      "Retention is a percentage of each progress payment withheld by the principal as security against defective work, typically released in two stages — at practical completion and at the end of the defects liability period.",
    content: `Retention is money you hold back from the contractor's progress payments as a form of security. Typically 5% of each certified amount is withheld (sometimes with a cap at 5% of the contract sum), held in two equal portions. The first half is released at practical completion; the second half is released at the end of the defects liability period.

The logic is simple: if the contractor walks off the job or refuses to fix defects, you have money to cover the cost of getting someone else to do it. Without retention, your only recourse is legal action — slow, expensive, and uncertain.

But retention is also a source of tension. Contractors see it as their money being held hostage. Subcontractors — who are often the ones doing the actual work — can be particularly affected because retention flows down the contract chain. A head contractor might hold retention from twenty subcontractors, creating significant cash flow pressure on smaller businesses.

There's been a push in Australia toward trust arrangements for retention funds (already legislated in some states), and some developers use alternative security instruments like bank guarantees instead. Whatever mechanism you use, tracking retention accurately is essential — you need to know exactly how much is held, against which contracts, and when it's due for release.`,
    upscaleConnection: `UpScale automatically calculates retention on every progress claim and tracks cumulative retention held across your project. When practical completion hits, you can see exactly how much first-half retention is due for release, and the platform tracks the defects liability period countdown for second-half release.`,
    relatedSlugs: [
      "progress-claims",
      "practical-completion",
      "defects-liability-period",
    ],
    metaDescription:
      "Understand retention in construction contracts: how it works, why it's held, release triggers, and how to track it across your project.",
  },
  {
    slug: "defects-liability-period",
    title: "Defects Liability Period",
    category: "Risk & Compliance",
    definition:
      "The defects liability period (DLP) is a contractually defined period after practical completion during which the contractor is obligated to return and rectify any defects that become apparent.",
    content: `The defects liability period — typically 12 months from practical completion — is your safety net. During this time, if a tap starts leaking, a door doesn't close properly, or a crack appears in the render, the contractor is contractually obligated to come back and fix it at their cost. It's not a warranty in the consumer law sense, but it serves a similar purpose.

For developers, managing the DLP well is about being systematic. You need to identify defects, notify the contractor in writing, give them reasonable time to rectify, and follow up if they don't. Most contracts require you to issue a final defects list near the end of the DLP — this is your last chance to get things fixed under the contract.

The DLP also has financial implications. The second half of retention (typically 2.5% of the contract sum) is held until the DLP expires and all defects are rectified. If the contractor doesn't fix defects, you can use that retention money to engage someone else to do the work. But you need to follow the correct contractual process — you can't just pocket the retention.

Where developers often get caught out is on multi-unit projects where different buildings reach PC at different times. Each building has its own DLP, which means you could be managing overlapping defects periods across multiple stages — all with different expiry dates and different retention release triggers.`,
    upscaleConnection: `UpScale tracks practical completion dates and calculates defects liability period expiry automatically. Combined with retention tracking and progress claim history, you have a complete picture of your contractual obligations and the money tied up in each project phase.`,
    relatedSlugs: [
      "practical-completion",
      "retention-construction",
      "site-diary",
    ],
    metaDescription:
      "Learn about the defects liability period in construction: how it works after practical completion, contractor obligations, and managing defects systematically.",
  },
  {
    slug: "tender-process",
    title: "Tender Process",
    category: "Procurement",
    definition:
      "The tender process is the structured method of inviting, receiving, evaluating, and awarding contractor bids for construction work packages.",
    content: `The tender process is how you find the right contractor at the right price. You prepare a tender package — drawings, specifications, bill of quantities, contract conditions — and invite contractors to submit a price. They review the documents, visit the site, ask clarifications, and submit their bid by a deadline.

For small developers, tendering is often informal — you get three quotes and pick the cheapest. But this approach is risky. The cheapest price isn't always the best value, and without a structured evaluation process, you might miss critical differences in scope, exclusions, or programme assumptions that make a "cheap" tender expensive in practice.

A proper tender evaluation considers more than just price. You look at the contractor's track record, their financial capacity, their proposed programme, their key personnel, and their understanding of the project. You might interview shortlisted tenderers. You check references. You compare scope inclusions and exclusions across tenders to make sure you're comparing apples with apples.

The tender process also sets the tone for the entire construction phase. A well-run tender — clear documentation, fair process, reasonable evaluation period — signals to contractors that you're a professional developer who will manage the project properly. A messy tender — incomplete drawings, unrealistic deadlines, constant changes — signals the opposite and often results in inflated prices because contractors price the risk of working with you.`,
    upscaleConnection: `UpScale manages the full tender lifecycle — from creating tender packages with estimated values, through receiving and comparing submissions, to awarding contracts. You can track the status of every tender (draft, open, evaluation, awarded), compare bids side by side, and maintain a clear audit trail of your procurement decisions.`,
    relatedSlugs: [
      "scope-of-works",
      "preliminaries-construction",
      "variations-construction",
    ],
    metaDescription:
      "Learn how the construction tender process works: preparing packages, evaluating bids, and awarding contracts for property development projects.",
  },
  {
    slug: "preliminaries-construction",
    title: "Preliminaries (Construction)",
    category: "Feasibility",
    definition:
      "Preliminaries are the time-related overhead costs of running a construction project — site establishment, supervision, insurance, temporary services, and project management — that aren't tied to specific building work.",
    content: `Preliminaries — often called "prelims" — are the costs of being on site, as opposed to the costs of building something. They include the site office, the project manager's salary, insurance, temporary fencing, site amenities, security, safety equipment, crane hire, and a dozen other things that don't directly put bricks on top of each other but are essential to making it happen.

Prelims are typically quoted as a lump sum or a monthly rate, and they're one of the most important numbers in a construction contract. Why? Because prelims are time-dependent. If a project runs four months longer than planned (due to variations, delays, weather — whatever), the prelims bill increases proportionally. On a project with $80,000/month in prelims, a four-month delay adds $320,000 to your costs.

This is why prelims are a critical consideration in feasibility studies. Underestimate your construction programme by even a few months and your feasibility margin gets eaten by additional prelims. Experienced developers budget conservatively for programme duration and include contingency specifically for extended prelims.

Prelims also explain why contractors care about programme so much. The faster they finish, the less they spend on prelims — and the more margin they make. This alignment of interests (developer wants it done fast, contractor makes more money finishing fast) is one of the few areas where developer and contractor incentives naturally align.`,
    upscaleConnection: `UpScale's feasibility module includes a detailed cost breakdown where preliminaries are modelled as line items within your construction budget. When you adjust your programme duration, you can immediately see the impact on total development costs and project margin — no spreadsheet gymnastics required.`,
    relatedSlugs: [
      "feasibility-study",
      "development-margin",
      "scope-of-works",
    ],
    metaDescription:
      "Understand construction preliminaries: what they cover, why they're time-dependent, and how they impact your development feasibility and project margin.",
  },
  {
    slug: "development-margin",
    title: "Development Margin",
    category: "Feasibility",
    definition:
      "Development margin is the profit from a property development expressed as a percentage of total development costs or gross realisation, measuring the financial return on the project.",
    content: `Development margin is the number that tells you whether a project is worth doing. It's your profit expressed as a percentage — either of total development costs (the more common method) or of gross realisation (total sales revenue). A margin on cost of 20% means for every dollar you spend, you make 20 cents profit. Simple.

But what constitutes an acceptable margin depends on the project's risk profile. A straightforward duplex on a clean site with pre-sales might be viable at 15% margin on cost. A complex mixed-use development with contamination risk, council uncertainty, and no pre-sales might need 25-30% to justify the risk. Your lender will have a view on this too — most won't fund below 15-20% margin on cost.

The trap with development margin is that it's only as reliable as the assumptions behind it. If your construction cost estimate is 10% too low, your actual margin will be significantly less than projected. If your sales prices are optimistic, same problem. This is why sensitivity analysis — testing what happens when assumptions change — is just as important as the base-case margin number.

Experienced developers also distinguish between margin on cost and return on equity. You might have a 20% margin on cost, but if you're only putting in 10% equity (with the rest funded by debt), your return on equity is much higher. Understanding this leverage effect is fundamental to structuring development finance.`,
    upscaleConnection: `UpScale calculates your development margin automatically from your feasibility inputs — land costs, construction costs, professional fees, selling costs, and revenue. It shows margin on cost, margin on GR, and total developer's profit. Change any input and the margin updates instantly, so you can test scenarios and find the sweet spot before committing capital.`,
    relatedSlugs: [
      "feasibility-study",
      "preliminaries-construction",
      "retention-construction",
    ],
    metaDescription:
      "Learn what development margin means in property development, how it's calculated, what constitutes an acceptable return, and why sensitivity testing matters.",
  },
  {
    slug: "scope-of-works",
    title: "Scope of Works",
    category: "Procurement",
    definition:
      "A scope of works is a detailed document defining exactly what work is included in a construction contract — materials, methods, quality standards, and exclusions — forming the basis for pricing and delivery.",
    content: `The scope of works is the document that defines what the contractor is actually building. It's the bridge between the architect's drawings and the contractor's price. Without a clear scope, you're not comparing tenders — you're comparing guesses. And those guesses will haunt you through the entire construction phase in the form of variations and disputes.

A good scope of works is specific. It doesn't say "install kitchen" — it says "supply and install 2-pac kitchen cabinetry to joinery drawings J-01 to J-04, with 20mm Caesarstone benchtops in Osprey, Blanco undermount sink, and Dorf Maximus mixer tap." The more specific the scope, the less room for interpretation, and the fewer variations you'll deal with later.

Equally important is what's excluded. A scope document should explicitly state what's not included. Is site clearing in the builder's scope? Are authority connection fees? Is landscaping? If these aren't addressed, both parties will assume the other is responsible — and by the time you figure it out, it's a variation.

For developers managing multiple consultants and contractors, scope coordination is critical. The architect's scope needs to align with the engineer's scope, which needs to align with the builder's scope. Gaps between scopes mean work that nobody has priced. Overlaps mean work that's been priced twice. Neither is good for your budget.`,
    upscaleConnection: `UpScale helps you manage the procurement process from scope definition through tender evaluation to contract award. By tracking every tender package with its estimated value and comparing submissions, you can ensure that contractors are pricing the same scope — and that nothing falls through the gaps.`,
    relatedSlugs: [
      "tender-process",
      "variations-construction",
      "preliminaries-construction",
    ],
    metaDescription:
      "Learn what a scope of works is in construction, why specificity matters, how to handle exclusions, and how it connects to tendering and variations.",
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((term) => term.slug === slug);
}

export function getTermsByCategory(): Record<string, GlossaryTerm[]> {
  return glossaryTerms.reduce(
    (acc, term) => {
      if (!acc[term.category]) {
        acc[term.category] = [];
      }
      acc[term.category].push(term);
      return acc;
    },
    {} as Record<string, GlossaryTerm[]>,
  );
}
