Last flow execution: 6/12/2026, 11:26:38 PM GMT+5:30

## 📋 TL;DR
Google confirmed that ShinyHunters exploited a zero-day vulnerability in Oracle PeopleSoft (CVE-2026-35273), enabling unauthenticated remote code execution on PeopleTools 8.61/8.62 and related applications. The campaign, concentrated in the education sector, led to data theft from at least 100 organizations after exploitation was observed from late May to early June. Developers should ensure network segmentation, apply available mitigations, monitor for unusual remote code execution indicators, and plan for rapid patching or compensating controls once fixes are released.

---

## 📈 Trends Detected
- Zero-day exploitation in enterprise software
- Education sector targeted by cyberattacks

---

# 🛠️ Developer Tools & Platforms

## 🔥 Breaking

- **[Confidence: High]** **Google Confirms Exploitation of Oracle PeopleSoft Zero-Day by ShinyHunters** (Impact: 5) | [SecurityWeek](https://www.securityweek.com/google-confirms-exploitation-of-oracle-peoplesoft-zero-day-by-shinyhunters/) [SecurityAffairs](https://securityaffairs.com/193543/cyber-crime/oracle-peoplesoft-rce-flaw-used-as-zero-day-in-ongoing-shinyhunters-campaign.html) [TheNews](https://www.thenews.com.pk/latest/1405662-google-warns-that-shinyhunters-group-is-exploiting-oracle-flaw-to-target-education-sector)
  Summary: Google has confirmed that a PeopleSoft vulnerability mitigated by Oracle has been exploited by ShinyHunters as a zero-day to steal data from organizations. Oracle has released an out-of-band advisory and security alert for CVE-2026-35273, a critical unauthenticated remote code execution vulnerability impacting PeopleSoft Enterprise PeopleTools versions 8.61 and 8.62, as well as PeopleSoft Enterprise Applications. The software giant has released mitigations, but patches do not appear to be available. PeopleSoft is an ERP software suite used by many large organizations to manage a wide range of business functions, including HR, payroll, finance, supply chain, and campus operations. While the solution is used across many industries, the ShinyHunters campaign exploiting CVE-2026-35273 appears to have focused on the education sector. The University of Nottingham in the UK is the first confirmed victim. Mandiant and Google Threat Intelligence Group (GTIG) reported observing activity associated with the exploitation of the PeopleSoft zero-day between May 27 and June 9. The attacks have been attributed to ShinyHunters, which Google tracks as UNC6240. Google’s researchers notified more than 100 global organizations of potential exposure, the majority of which are based in the US, with 68% in the higher education sector. The tech giant said some of the targets blocked the attack, but others had their systems compromised and data stolen. ShinyHunters claims to have targeted roughly 300 PeopleSoft instances belonging to 100 organizations. The attacker staging environments hosted customized MeshCentral agents masquerading as legitimate cloud endpoints, which they used to run administrative command queries and deploy a custom lateral movement and defacement script, [victim_abbreviation]_fanout.sh. This campaign directly correlates with subsequent data leaks of stolen organization data published on the ShinyHunters Data Leak Site (DLS) on June 9, 2026. Google has shared remediation and hardening recommendations, as well as technical details on the attacks and indicators of compromise (IoCs). Oracle has not responded to SecurityWeek’s inquiry regarding exploitation. TrendAI (Trend Micro’s enterprise business), whose researchers have been credited by Oracle for reporting CVE-2026-35273, told SecurityWeek that it’s currently seeing limited exploitation of the vulnerability, but its investigation is ongoing.

---

## 📊 Pipeline Stats
| Metric | Value |
|--------|-------|
| Total Items Verified | 1 |
| ✅ High Confidence | 1 |
| ⚠️ Medium Confidence | 0 |
| ❌ Low Confidence | 0 |
| 🔍 Cross-Referenced | 1 |
| ⏰ Freshness Window | Last 12 hours |
| 🕐 Generated At | 6/12/2026, 11:26:38 PM GMT+5:30 |
