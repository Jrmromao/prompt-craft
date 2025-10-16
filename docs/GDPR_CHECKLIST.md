# GDPR Compliance Checklist

Use this checklist to maintain 100% GDPR compliance on an ongoing basis.

---

## 🔄 Daily Tasks

- [ ] Monitor breach detection alerts
- [ ] Check data retention cleanup script ran successfully
- [ ] Review any new data subject requests
- [ ] Monitor compliance dashboard for anomalies

**Automated**: Most daily tasks run via cron jobs

---

## 📅 Weekly Tasks

- [ ] Review data subject request queue
- [ ] Check average response times (<72 hours)
- [ ] Review audit logs for suspicious activity
- [ ] Monitor consent rates and trends

**Time Required**: 30 minutes  
**Owner**: DPO or designated compliance officer

---

## 📆 Monthly Tasks (DPO Checklist)

### Data Subject Requests
- [ ] Review all DSARs from past month
- [ ] Calculate average response time
- [ ] Identify any bottlenecks in process
- [ ] Update DSAR workflow if needed

### Data Breaches
- [ ] Review breach log for patterns
- [ ] Check all breaches properly documented
- [ ] Verify authority notifications sent on time
- [ ] Verify user notifications sent on time

### Access & Security
- [ ] Review access logs for unusual activity
- [ ] Audit admin user list (remove inactive)
- [ ] Check MFA enabled for all admins
- [ ] Review failed login attempts

### New Processing Activities
- [ ] Document any new data processing activities
- [ ] Update Records of Processing Activities (ROPA)
- [ ] Conduct DPIA if high-risk processing
- [ ] Update privacy policy if needed

**Time Required**: 2-3 hours  
**Owner**: DPO

---

## 📊 Quarterly Tasks

### Compliance Report
- [ ] Run automated compliance report: `npm run gdpr:report`
- [ ] Review all metrics and trends
- [ ] Identify any compliance gaps
- [ ] Create action plan for improvements

### Documentation Review
- [ ] Review and update privacy policy
- [ ] Review and update cookie policy
- [ ] Review and update terms of service
- [ ] Update Records of Processing Activities (ROPA)

### Vendor Management
- [ ] Review all vendor DPAs (expiring soon?)
- [ ] Check vendor security certifications (SOC 2, ISO 27001)
- [ ] Update sub-processor list
- [ ] Conduct vendor risk assessment

### Training
- [ ] Train new employees on GDPR
- [ ] Refresh training for existing staff
- [ ] Update training materials if needed
- [ ] Document training completion

### Data Retention
- [ ] Run data retention cleanup: `npm run gdpr:cleanup`
- [ ] Verify old data deleted per policy
- [ ] Check retention compliance rate (>95%)
- [ ] Update retention schedules if needed

### Consent Management
- [ ] Review consent rates and trends
- [ ] Test consent flows (cookie banner, preferences)
- [ ] Update consent language if needed
- [ ] Audit consent records for accuracy

**Time Required**: 1 full day  
**Owner**: DPO + Legal + Engineering

---

## 📅 Annual Tasks

### Full Compliance Audit
- [ ] Conduct comprehensive GDPR audit
- [ ] Review all 7 principles of GDPR
- [ ] Check all data subject rights supported
- [ ] Verify all technical measures in place
- [ ] Review organizational measures

### Data Protection Impact Assessment (DPIA)
- [ ] Review all existing DPIAs
- [ ] Update DPIAs for changed processing
- [ ] Conduct new DPIAs for new features
- [ ] Document DPO consultation

### Transfer Impact Assessment (TIA)
- [ ] Review all cross-border data transfers
- [ ] Update TIA for changed circumstances
- [ ] Check third country laws for changes
- [ ] Verify SCCs still adequate
- [ ] Update supplementary measures if needed

### Vendor Audits
- [ ] Audit all critical vendors
- [ ] Request updated security certifications
- [ ] Review vendor breach history
- [ ] Update vendor risk scores
- [ ] Renegotiate contracts if needed

### Breach Response Drill
- [ ] Conduct simulated data breach
- [ ] Test notification procedures
- [ ] Verify 72-hour timeline achievable
- [ ] Update breach response plan
- [ ] Document lessons learned

### Policy Updates
- [ ] Review all GDPR documentation
- [ ] Update for regulatory changes
- [ ] Update for business changes
- [ ] Get legal review of updates
- [ ] Publish updated policies

### Staff Training
- [ ] Annual GDPR refresher for all staff
- [ ] Role-specific training updates
- [ ] Test staff knowledge
- [ ] Document training completion
- [ ] Update training materials

### Management Review
- [ ] Present compliance status to leadership
- [ ] Review budget for compliance activities
- [ ] Discuss any regulatory changes
- [ ] Plan compliance roadmap for next year
- [ ] Get sign-off from CEO/Board

**Time Required**: 1-2 weeks  
**Owner**: DPO + Legal + Engineering + Management

---

## 🚨 Ad-Hoc Tasks (As Needed)

### New Feature Launch
- [ ] Conduct DPIA if high-risk
- [ ] Update privacy policy
- [ ] Update ROPA
- [ ] Implement privacy by design
- [ ] Get DPO sign-off
- [ ] Update user documentation

### New Vendor Onboarding
- [ ] Negotiate and sign DPA
- [ ] Sign Standard Contractual Clauses (if non-EU)
- [ ] Conduct vendor risk assessment
- [ ] Add to sub-processor list
- [ ] Update privacy policy (if needed)
- [ ] Notify users of new sub-processor (30 days)

### Data Breach Incident
- [ ] Activate breach response plan
- [ ] Contain the breach immediately
- [ ] Assess scope and severity
- [ ] Notify DPO within 4 hours
- [ ] Notify supervisory authority within 72 hours
- [ ] Notify affected users without undue delay
- [ ] Document in breach log
- [ ] Conduct post-incident review

### Regulatory Change
- [ ] Review new GDPR guidance/rulings
- [ ] Assess impact on current practices
- [ ] Update policies and procedures
- [ ] Implement technical changes if needed
- [ ] Train staff on changes
- [ ] Document compliance updates

### User Complaint
- [ ] Acknowledge complaint within 24 hours
- [ ] Investigate thoroughly
- [ ] Respond within 30 days
- [ ] Implement corrective actions
- [ ] Document complaint and resolution
- [ ] Report to DPO

---

## 📋 Pre-Launch Checklist (New Markets)

### Before Launching in New EU Country
- [ ] Verify GDPR compliance (this checklist)
- [ ] Translate privacy policy to local language
- [ ] Translate cookie consent to local language
- [ ] Check for country-specific requirements
- [ ] Identify local supervisory authority
- [ ] Update contact information
- [ ] Test all consent flows in local language
- [ ] Train local support team on GDPR

---

## 🎯 Compliance Health Indicators

### Green (Healthy) ✅
- Average DSAR response time: <48 hours
- Data retention compliance: >95%
- No critical breaches in past 90 days
- All vendor DPAs signed and current
- Consent rate: >20%
- All staff trained in past 12 months

### Yellow (Needs Attention) ⚠️
- Average DSAR response time: 48-72 hours
- Data retention compliance: 90-95%
- 1 medium breach in past 90 days
- 1-2 vendor DPAs expiring soon
- Consent rate: 10-20%
- Some staff training overdue

### Red (Critical) 🚨
- Average DSAR response time: >72 hours
- Data retention compliance: <90%
- Any critical breach in past 90 days
- Any vendor DPA expired or missing
- Consent rate: <10%
- Majority of staff training overdue

**Action Required**: If any metric is RED, immediate action required by DPO.

---

## 📞 Emergency Contacts

### Data Breach
1. **Immediate**: Notify DPO (dpo@promptcraft.ai)
2. **Within 4 hours**: Notify Security Team (security@promptcraft.ai)
3. **Within 24 hours**: Notify Legal Counsel
4. **Within 72 hours**: Notify Irish DPC (+353 57 868 4800)

### Regulatory Inquiry
1. **Immediate**: Notify DPO
2. **Within 24 hours**: Notify Legal Counsel
3. **Within 48 hours**: Prepare response with documentation

### User Complaint
1. **Within 24 hours**: Acknowledge receipt
2. **Within 7 days**: Provide initial response
3. **Within 30 days**: Provide final resolution

---

## 🔧 Tools & Scripts

### Automated Scripts
```bash
# Generate compliance report
npm run gdpr:report

# Run data retention cleanup
npm run gdpr:cleanup

# Export user data (DSAR)
npm run gdpr:export -- --userId=<user-id>

# Privacy scan
npm run privacy:scan
```

### Dashboards
- **Compliance Dashboard**: `/admin/gdpr-compliance`
- **Audit Logs**: `/admin/audit-logs`
- **User Requests**: `/admin/data-requests`
- **Breach Log**: `/admin/breach-log`

### Documentation
- **Breach Response Plan**: `/docs/GDPR_BREACH_RESPONSE.md`
- **DPO Responsibilities**: `/docs/GDPR_DPO.md`
- **Privacy by Design**: `/docs/GDPR_PRIVACY_BY_DESIGN.md`
- **Cross-Border Transfers**: `/docs/GDPR_CROSS_BORDER_TRANSFERS.md`
- **100% Compliance Summary**: `/docs/GDPR_100_COMPLIANCE.md`

---

## 📈 Metrics to Track

### Key Performance Indicators (KPIs)
- **DSAR Response Time**: Target <48 hours (Limit: 72 hours)
- **Data Retention Compliance**: Target >95%
- **Breach Incidents**: Target 0 critical, 0 high
- **Consent Rate**: Target >30%
- **Vendor Compliance**: Target 100%
- **Training Completion**: Target 100%

### Trend Analysis
- Month-over-month DSAR volume
- Consent rate trends
- Breach incident trends
- Compliance score trends

---

## ✅ Sign-Off

**Monthly Review**:
- Reviewed By: _________________ (DPO)
- Date: _________________
- Status: ☐ Green ☐ Yellow ☐ Red
- Action Items: _________________

**Quarterly Review**:
- Reviewed By: _________________ (DPO + Legal)
- Date: _________________
- Compliance Score: _____%
- Next Review: _________________

**Annual Review**:
- Reviewed By: _________________ (DPO + Legal + CEO)
- Date: _________________
- Compliance Score: _____%
- Board Approval: ☐ Yes ☐ No
- Next Review: _________________

---

**Last Updated**: 2025-10-16  
**Version**: 1.0  
**Owner**: Data Protection Officer
