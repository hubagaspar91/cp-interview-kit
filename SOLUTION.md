# Rationale behind the solution

Since the task was largely free and as I've interpreted, it's meant to measure judgement as well as tech skill, the solution I've chosen is a practical one: I've put myself in the shoes of a senior dev or fractional CTO brought in to fix a broken platform.

The way that I would approach this would be to set up a hierarchy and based on that, prioritize fixes.

In my solution, I was operating with the following high-level hierarchy:

1) Security vulnerabilities
This is the most critical category, since such issues have the most severe blast radius, and can not only result in a complete loss of customer trust, but dire financial and perhaps even legal implications for the company. This category includes: credential mishandling, authentication and authorization issues, tenant data isolation bugs, etc.

2) UX breaking bugs
This I've identified as the second most important category, since a broken UX can create mistrust and customer churn almost as quickly as a security breach. Issues in this category are: UI crashes, unresponsive UI elements (buttons, etc.), stale data and other frontend-side state management issues, laggy or slow UI, etc.

3) Performance
The lack of performance optimization can lead to elevated infra costs and can also materialize in the form of UX issues and degraded service performance. Examples include: memory leaks, slow DB queries, heavy synchronous computation that could be made asynchronous, frontend rendering optimizations, etc.

4) Maintainability and continuous integration
This category is the least critical in my nomenclature, as it's more about how an app can evolve and expand without degradation over time, and not its correctness or usefulness at any given point in time - therefore the connection between such issues and UX and business outcomes is indirect (but nevertheless real). Examples include: lack of automated test suites and CI, lack of consistent code patterns, lack of ample abstractions and code reuse, lack of documentation, lack of code style consistency, etc.

Due to the limited time available for this exercise, I made the choice to only tackle issues I deemed critical from the first category, and neglect the others for now.

The themes of the three respective commits:
- Credential handling
- JWT auth
- Tenant isolation

## Credential handling

### Replace MD5 as password hashing algorithm

MD5 is not fit to secure passwords, as it is vulnerable to brute-force attacks. Replaced it with bcrypt, updated to use the new async `hashPassword`/`verifyPassword` password functions everywhere - also in the seed script.

### Don't store plaintext apiKey in the database

It is bad security practice to store plaintext api key in a database, as it increases the blast radius of a potential data leak (just like the md5 hashing). The accepted way to handle this is to only return the plaintext apiKey on creation, and later only use the hash to verify validity.

### Transfer-ownership re-authentication

Found incidentally while scoping the credential category: the `/transfer-ownership` endpoint accepted a `password` field but never verified it, so ownership could be transferred without re-authenticating the current owner — a stolen session could escalate to a permanent account takeover this way. It's a small, low-criticality fix (the route is already gated by `requireOwner`) that sat cleanly inside the credentials theme. There's also a UX breaking bug in this feature, which was out of scope for my current submission (contract mismatch with the frontend).

### Credential leaks

Fixed multiple instances of credentials or secrets leaking to the frontend or logged as plaintext.

### Removed dead crypto helpers

Removed verifiably unused crypto code as part of the credentials cleanup effort.
