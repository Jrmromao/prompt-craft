# Cross-Border Data Transfer Compliance

## Legal Basis for Transfers (GDPR Chapter V)

### Current Infrastructure
- **Primary Database**: [Region - e.g., EU-West-1]
- **Backup Location**: [Region]
- **CDN**: Global (Vercel Edge Network)
- **Third-Party Services**: See vendor list below

### Transfer Mechanisms

#### 1. Adequacy Decisions (Article 45)
Countries with EU adequacy decision (no additional safeguards needed):
- ✅ Andorra, Argentina, Canada (commercial), Faroe Islands, Guernsey
- ✅ Israel, Isle of Man, Japan, Jersey, New Zealand
- ✅ South Korea, Switzerland, United Kingdom, Uruguay

**PromptCraft Status**: If all infrastructure in adequate countries, no SCCs needed.

#### 2. Standard Contractual Clauses (SCCs) - Article 46
Required when transferring to non-adequate countries (e.g., USA).

**EU Commission SCCs (2021)**: Module Two (Controller to Processor)

#### 3. Binding Corporate Rules (BCRs)
Not applicable - PromptCraft is not a multinational corporate group.

## Vendor Data Transfer Assessment

### Vercel (Hosting)
- **Location**: USA (non-adequate)
- **Mechanism**: Standard Contractual Clauses ✅
- **DPA**: Signed
- **Data**: User data, prompts, analytics
- **Action**: SCC in place

### Upstash (Redis Cache)
- **Location**: USA (non-adequate)
- **Mechanism**: Standard Contractual Clauses ✅
- **DPA**: Signed
- **Data**: Cached API responses (temporary)
- **Action**: SCC in place

### Clerk (Authentication)
- **Location**: USA (non-adequate)
- **Mechanism**: Standard Contractual Clauses ✅
- **DPA**: Signed
- **Data**: Email, name, auth tokens
- **Action**: SCC in place

### Stripe (Payments)
- **Location**: USA (non-adequate)
- **Mechanism**: Standard Contractual Clauses ✅
- **DPA**: Signed
- **Data**: Payment info, billing address
- **Action**: SCC in place

### OpenAI (AI Models)
- **Location**: USA (non-adequate)
- **Mechanism**: Standard Contractual Clauses ✅
- **DPA**: Signed
- **Data**: Prompts, API usage (not stored by OpenAI per DPA)
- **Action**: SCC in place + Zero retention policy

## Standard Contractual Clauses Template

### Module Two: Controller to Processor

**Data Exporter** (Controller): PromptCraft  
**Data Importer** (Processor): [Vendor Name]

#### Clause 1: Purpose and Scope
These clauses apply to the transfer of personal data from PromptCraft (EU) to [Vendor] (USA) for the purpose of [service description].

#### Clause 2: Data Protection Safeguards
The data importer shall:
- Process data only on documented instructions
- Ensure confidentiality of persons authorized to process
- Implement appropriate technical and organizational measures
- Engage sub-processors only with prior authorization
- Assist with data subject rights requests
- Assist with security incidents and DPIAs
- Delete or return data at end of contract

#### Clause 3: Data Subject Rights
Data subjects can:
- Access their data
- Rectify inaccurate data
- Erase data (right to be forgotten)
- Restrict processing
- Object to processing
- Data portability

#### Clause 4: Obligations of the Data Importer
The processor must:
- Notify controller of data breaches within 24 hours
- Conduct regular security audits
- Maintain records of processing activities
- Cooperate with supervisory authorities
- Not transfer data to third countries without authorization

#### Clause 5: Sub-Processors
- List of approved sub-processors: [Appendix]
- 30-day notice required for new sub-processors
- Same level of protection required

#### Clause 6: Liability and Indemnification
- Data importer liable for damages caused by processing
- Indemnification for GDPR violations
- Insurance requirements: [Amount]

#### Clause 7: Termination
- Either party can terminate with 30 days notice
- Data must be deleted or returned within 30 days
- Certification of deletion required

#### Clause 8: Governing Law
- Governed by laws of Ireland (EU member state)
- Disputes resolved in Irish courts
- Data subjects can sue in their home country

### Appendix 1: Data Processing Details

**Categories of Data Subjects**:
- PromptCraft users (developers, businesses)
- Website visitors

**Categories of Personal Data**:
- Identity data: name, email, username
- Technical data: IP address, browser type, device ID
- Usage data: prompts, API calls, tokens used
- Financial data: payment info (Stripe only)

**Sensitive Data**: None (no special categories under Article 9)

**Processing Operations**:
- Storage and hosting
- Analytics and monitoring
- Customer support
- Billing and payments

**Retention Period**:
- Active users: Duration of account
- Deleted users: 30 days soft delete, then permanent
- Usage logs: 90 days
- Billing: 7 years (legal requirement)

**Sub-Processors**:
| Name | Service | Location | Safeguards |
|------|---------|----------|------------|
| AWS | Infrastructure | USA | SCC |
| Cloudflare | CDN | Global | SCC |

### Appendix 2: Technical and Organizational Measures

**Access Control**:
- Role-based access control (RBAC)
- Multi-factor authentication for admin access
- Principle of least privilege
- Regular access reviews

**Encryption**:
- TLS 1.3 for data in transit
- AES-256 for data at rest
- Encrypted backups
- Key rotation every 90 days

**Logging and Monitoring**:
- All access logged
- Real-time security monitoring
- Automated anomaly detection
- 1-year log retention

**Incident Response**:
- 24-hour breach notification
- Documented incident response plan
- Regular security drills
- Forensic investigation capability

**Business Continuity**:
- Daily backups
- 99.9% uptime SLA
- Disaster recovery plan
- Redundant infrastructure

**Compliance**:
- SOC 2 Type II certified
- Annual penetration testing
- Quarterly vulnerability scans
- GDPR compliance audits

## Transfer Impact Assessment (TIA)

Required after Schrems II ruling to assess if SCCs provide adequate protection.

### 1. Identify Transfer
- What data is transferred?
- To which country?
- What legal basis?

### 2. Assess Third Country Laws
- Does the country have surveillance laws?
- Can government access data without due process?
- Are there adequate legal remedies?

**USA Assessment**:
- ⚠️ FISA 702 allows surveillance
- ⚠️ Executive Order 12333 concerns
- ✅ CLOUD Act provides some protections
- ✅ Legal remedies available

### 3. Evaluate Supplementary Measures
Beyond SCCs, we implement:
- ✅ End-to-end encryption where possible
- ✅ Pseudonymization of user data
- ✅ Data minimization
- ✅ Contractual restrictions on government access
- ✅ Transparency reports

### 4. Document Decision
- TIA completed: [Date]
- Reviewed by: DPO + Legal Counsel
- Conclusion: Transfer permitted with SCCs + supplementary measures
- Next review: [Date + 1 year]

## Data Localization Options

### EU-Only Infrastructure (Future)
If required for enterprise customers:
- Database: AWS EU-West-1 (Ireland)
- Cache: Upstash EU region
- CDN: EU-only edge nodes
- AI: EU-based models (Mistral, Aleph Alpha)

**Cost Impact**: +30% infrastructure costs  
**Implementation**: 2-3 months

### Data Residency Guarantees
For enterprise plan:
- Contractual guarantee data stays in EU
- No transfers to third countries
- EU-only sub-processors
- Regular compliance audits

## Compliance Checklist

Before transferring data to third countries:

- [ ] Identify all data transfers
- [ ] Check if country has adequacy decision
- [ ] If not, implement SCCs
- [ ] Conduct Transfer Impact Assessment
- [ ] Implement supplementary measures
- [ ] Document decision and rationale
- [ ] Update privacy policy
- [ ] Inform data subjects if required
- [ ] DPO review and approval
- [ ] Annual review of transfers

## Privacy Policy Disclosure

Required disclosure in privacy policy:

```
INTERNATIONAL DATA TRANSFERS

Your personal data may be transferred to and processed in countries outside 
the European Economic Area (EEA), including the United States.

We ensure adequate protection through:
- Standard Contractual Clauses approved by the EU Commission
- Transfer Impact Assessments
- Supplementary security measures (encryption, pseudonymization)
- Contractual restrictions on data access

For a copy of the safeguards we use, contact: dpo@promptcraft.ai
```

## Monitoring and Review

### Quarterly
- Review list of data transfers
- Check vendor compliance with SCCs
- Update sub-processor list
- Monitor changes in third country laws

### Annually
- Full Transfer Impact Assessment
- Review and update SCCs
- Audit vendor security measures
- Update this documentation

### Ad-Hoc
- When new vendor added
- When vendor changes location
- When third country laws change
- After court rulings (e.g., Schrems III)

**Last Updated**: [Date]  
**Next Review**: [Date + 3 months]  
**Reviewed By**: [DPO Name] + [Legal Counsel]
