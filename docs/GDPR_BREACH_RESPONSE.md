# Data Breach Response Plan

## 1. Detection & Assessment (0-4 hours)

### Immediate Actions
- **Incident Lead**: CTO or designated security officer takes command
- **Containment**: Isolate affected systems, revoke compromised credentials
- **Assessment**: Determine scope (what data, how many users, breach type)

### Severity Classification
- **Critical**: Personal data + passwords/payment info exposed
- **High**: Email addresses + usage data exposed
- **Medium**: Metadata only, no PII
- **Low**: Attempted breach, no data accessed

## 2. Notification Timeline (GDPR Article 33 & 34)

### Supervisory Authority (72 hours max)
**When Required**: Any breach likely to result in risk to user rights/freedoms

**Contact**: 
- Primary: Irish Data Protection Commission (if EU HQ in Ireland)
- Email: info@dataprotection.ie
- Phone: +353 57 868 4800

**Notification Must Include**:
- Nature of breach (categories and approximate number of users)
- DPO contact details
- Likely consequences
- Measures taken/proposed

### Affected Users (Without Undue Delay)
**When Required**: High risk to user rights/freedoms

**Communication Method**: Email to affected users

**Must Include**:
- What happened in plain language
- What data was compromised
- What we're doing about it
- What they should do (change password, monitor accounts)
- Contact point for questions

## 3. Response Procedures

### Critical Breach (Passwords/Payment Data)
```
Hour 0-1:   Isolate systems, assemble response team
Hour 1-4:   Assess scope, begin forensics
Hour 4-24:  Notify DPO, prepare authority notification
Hour 24-72: Submit notification to supervisory authority
Hour 24-96: Notify affected users via email
Day 3-30:   Full forensic investigation, remediation
```

### High Breach (PII Exposed)
```
Hour 0-2:   Containment and assessment
Hour 2-48:  Prepare notifications
Hour 48-72: Notify supervisory authority
Hour 48-96: Notify affected users
```

## 4. Breach Log Template

All breaches must be logged in `breach_log` database table:

```sql
CREATE TABLE breach_log (
  id UUID PRIMARY KEY,
  detected_at TIMESTAMP NOT NULL,
  breach_type VARCHAR(50),
  severity VARCHAR(20),
  affected_users_count INT,
  data_categories TEXT[],
  containment_actions TEXT,
  authority_notified_at TIMESTAMP,
  users_notified_at TIMESTAMP,
  resolution_date TIMESTAMP,
  lessons_learned TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Contact Information

**Data Protection Officer**: dpo@promptcraft.ai  
**Security Team**: security@promptcraft.ai  
**Emergency Hotline**: [To be assigned]

**External Contacts**:
- Hosting Provider: [AWS/Vercel support]
- Legal Counsel: [Law firm contact]
- Cyber Insurance: [Policy number and contact]

## 6. Post-Incident Review

Within 30 days of resolution:
- Root cause analysis
- Update security measures
- Staff training on lessons learned
- Update this response plan if needed
- Document in annual GDPR compliance report
