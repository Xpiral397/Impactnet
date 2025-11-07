# ImpactNet - Complete Platform Architecture

## User Roles & Permissions

### 1. **Admin** (Highest Level)
**Dashboard:** Analytics & Management Hub
- View comprehensive analytics (donations, projects, campaigns)
- Manage all programs, schools, campaigns
- Add/Remove Managers
- Monitor all activities platform-wide
- Access all reports and insights

### 2. **Manager** (Middle Management)
**Dashboard:** Team Management
- Manage Executives (add/remove/assign)
- Schedule and conduct meetings (built-in video platform)
- Review team performance
- Approve/reject recommendations from executives
- Access team analytics

### 3. **Executive** (Operations Team - 3 Specialized Roles)

#### a) **Criteria Setter**
- Define eligibility criteria for programs
- Set requirements and standards
- Create evaluation frameworks
- Update criteria based on needs

#### b) **Base Reviewer**
- Initial review of member submissions
- Check basic eligibility (AI-assisted)
- Flag submissions for further review
- Provide initial feedback

#### c) **Final Selector**
- Make final approval decisions
- Review submissions flagged by Base Reviewer
- Select beneficiaries for programs
- Authorize fund distribution

### 4. **Member** (Beneficiaries/Applicants)
**Dashboard:** Request & Track
- Submit video requests (upload or record)
- Chat with AI assistant
- Track submission progress
- View eligibility status
- See approved programs

---

## Core Features

### A. **Landing Page Sections**
1. Hero Section (already done)
2. What We Do (already done)
3. Process Pipeline (already done)
4. Programs & Campaigns Showcase
5. Impact Stories (Video Testimonials)
6. Real-time Analytics Display
7. How to Apply
8. Meet Our Team
9. FAQ Section
10. Footer with Links

### B. **Admin Dashboard**
**Professional Name:** "Command Center"

**Features:**
- **Analytics Suite**
  - Total donations tracked
  - Active programs/campaigns
  - Member applications stats
  - Executive performance metrics
  - Geographic impact map

- **Program Management**
  - Create new programs (Education, Healthcare, Food, etc.)
  - Assign budgets
  - Set timelines
  - Monitor progress

- **Campaign Manager**
  - Launch fundraising campaigns
  - Track campaign performance
  - Donor management

- **School/Institution Registry**
  - Add partner schools
  - Track student beneficiaries
  - Monitor educational impact

- **Voice/Advocacy Hub**
  - Raise awareness campaigns
  - Petition management
  - Social impact stories

### C. **Manager Dashboard**
**Professional Name:** "Operations Hub"

**Features:**
- **Team Management**
  - Add/remove executives
  - Assign roles (Criteria Setter, Base Reviewer, Final Selector)
  - View team workload

- **Meeting Platform** (Built-in Video Conference)
  - Schedule meetings
  - Video calls with screen sharing
  - Meeting recordings
  - Chat during meetings
  - Invite multiple executives

- **Review Pipeline**
  - See all submissions in review
  - Track executive decisions
  - Override decisions if needed

- **Performance Metrics**
  - Executive productivity
  - Review turnaround time
  - Approval rates

### D. **Executive Dashboard**
**Professional Name:** "Review Portal"

**Role-Based Views:**

#### Criteria Setter View:
- Define program criteria
- Set eligibility requirements
- Create evaluation checklists
- Update standards

#### Base Reviewer View:
- Queue of new submissions
- AI eligibility check results
- Quick approve/reject/flag
- Add review notes

#### Final Selector View:
- Flagged submissions queue
- Detailed review interface
- Final approval authority
- Beneficiary selection

### E. **Member Dashboard**
**Professional Name:** "Impact Portal"

**Features:**
- Submit new video request (already created)
- Track submission status:
  - Submitted ✓
  - AI Eligibility Check ⏳
  - Base Review ⏳
  - Final Selection ⏳
  - Approved ✓ / Rejected ✗
- View assigned programs
- Progress tracking
- Chat with AI assistant
- Notification center

### F. **AI System**
**Professional Name:** "Eligibility Intelligence Engine"

**Functions:**
- Analyze video submissions
- Check basic eligibility (age, location, need)
- Flag suspicious/duplicate submissions
- Provide confidence scores
- Suggest program matches
- Generate eligibility reports

### G. **Video Meeting Platform**
**Professional Name:** "Collaborate Space"

**Features:**
- HD video calls
- Screen sharing
- Recording
- Chat
- Participant management
- Meeting scheduler
- Calendar integration

---

## Database Models Needed

### User Models:
- Admin
- Manager
- Executive (with role field)
- Member

### Program Models:
- Program (education, healthcare, etc.)
- Campaign
- School/Institution
- AdvocacyInitiative

### Submission Models:
- VideoRequest
- EligibilityCheck (AI results)
- Review (by executives)
- Approval

### Meeting Models:
- Meeting
- Participant
- Recording

---

## Professional Feature Names

Instead of generic names, use:

| Feature | Professional Name |
|---------|------------------|
| Admin Dashboard | Command Center |
| Manager Dashboard | Operations Hub |
| Executive Dashboard | Review Portal |
| Member Dashboard | Impact Portal |
| Programs | Impact Initiatives |
| Campaigns | Fundraising Drives |
| Video Submissions | Impact Requests |
| AI Checker | Eligibility Intelligence Engine |
| Meeting Platform | Collaborate Space |
| Analytics | Insights Dashboard |
| Reviews | Assessment Pipeline |

---

## Next Steps

1. ✅ Complete landing page (add missing sections)
2. Create Admin Command Center
3. Create Manager Operations Hub
4. Create Executive Review Portal
5. Enhance Member Impact Portal (already started)
6. Build video meeting platform
7. Integrate AI eligibility checker
8. Connect all dashboards with backend
9. Add role-based authentication
10. Deploy and test

---

## Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- WebRTC (video meetings)

**Backend:**
- Django 5.2
- Django REST Framework
- PostgreSQL (production)
- Celery (async tasks)
- OpenAI API (AI checker)

**Real-time:**
- WebSockets (Django Channels)
- Redis (caching & pub/sub)

**Video:**
- WebRTC for peer-to-peer
- MediaSoup for scalable meetings
- AWS S3 for video storage

---

This is the complete platform architecture for ImpactNet!
