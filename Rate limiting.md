# Rate limiting

| **Endpoint Type** | **Recommended Limit** | **Window** | **Primary Purpose** |
| --- | --- | --- | --- |
| **Authentication** (Login, Password Reset) | 10 requests | 1 minute | Prevents credential stuffing and brute-force attacks. |
| **Sensitive Actions** (Checkout, OTP) | 5 requests | 1 minute | Thwarts carding bots, ticket scalping, and SMS fraud. |
| **Standard App Pages** (Dashboard, Feeds) | 100 requests | 1 minute | Accommodates heavy legitimate human browsing and assets. |
| **Search / Heavy Queries** | 20 requests | 1 minute | Protects the database from resource-exhaustion attacks. |
| **Public Public APIs** (Free Tier) | 100 requests | 1 minute | Prevents standard API abuse from third-party developers. |