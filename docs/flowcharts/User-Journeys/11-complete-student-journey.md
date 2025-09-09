# 🎯 Complete Student Journey (User Experience Flow)

**Journey Scope**: End-to-end student behavior support experience from incident to resolution

## Student Behavior Support Journey

```mermaid
flowchart TD
    A[Incident] --> B[Teacher Obs]
    B --> C[Create BSR]
    C --> D[Add Queue]
    D --> E[Assign Kiosk]
    E --> F[Refl Prompt]
    F --> G[Access Kiosk]
    G --> H[Load BSR Q]
    H --> I[Read Behavior]
    I --> J[Reflect]
    J --> K[Complete Q]
    K --> L[Submit]
    L --> M[Teacher Rev]
    M --> N[Feedback]
    N --> O[Receive FB]
    O --> P[Resolution]
    P --> Q[Implement]
    Q --> R[Monitor]
    R --> S[Family Comm]
    S --> T[Document]
```

**Legend:**
- **Incident**: Behavior incident happens
- **Teacher Obs**: Teacher observes behavior
- **Create BSR**: Teacher creates BSR
- **Add Queue**: Student added to queue
- **Assign Kiosk**: Student assigned to kiosk
- **Refl Prompt**: Student receives reflection prompt
- **Access Kiosk**: Student accesses kiosk station
- **Load BSR Q**: System loads BSR questions
- **Read Behavior**: Student reads behavior description
- **Reflect**: Student reflects on actions
- **Complete Q**: Student completes reflection questions
- **Submit**: Student submits for review
- **Teacher Rev**: Teacher reviews submission
- **Feedback**: Teacher provides feedback
- **Receive FB**: Student receives feedback
- **Resolution**: Resolution plan created
- **Implement**: Student implements strategies
- **Monitor**: Teacher monitors progress
- **Family Comm**: Family receives communication
- **Document**: Growth documented in system

## Detailed Student Experience Flow

```mermaid
flowchart TD
    A[Incident] --> B[Aware]
    B --> C[Wait]
    C --> D[Kiosk Notice]
    
    D --> E[Approach]
    E --> F[View BSR]
    F --> G[Read Desc]
    
    G --> H[Refl Q]
    H --> I[Q1:What?]
    H --> J[Q2:Feel?]
    H --> K[Q3:Different?]
    H --> L[Q4:Right?]
    
    I --> M[Type Resp]
    J --> M
    K --> M
    L --> M
    
    M --> N[Review]
    N --> O{Satisfied?}
    O -->|No| P[Edit]
    O -->|Yes| Q[Submit]
    
    P --> N
    Q --> R[Wait FB]
    
    R --> S[Receive Resp]
    S --> T{Type?}
    T -->|OK| U[Complete]
    T -->|Revise| V[More Refl]
    
    V --> W[Return]
    W --> H
    
    U --> X[Growth Plan]
    X --> Y[Monitor]
```

**Legend:**
- **Incident**: Behavior incident
- **Aware**: Student awareness
- **Wait**: Wait for assignment
- **Kiosk Notice**: Kiosk assignment notification
- **Approach**: Approach assigned kiosk
- **View BSR**: View BSR on screen
- **Read Desc**: Read teacher's description
- **Refl Q**: Self-reflection questions
- **Q1-Q4**: Questions 1-4 (What happened, How others felt, What differently, Make it right)
- **Type Resp**: Student types response
- **Review**: Review all answers
- **Satisfied**: Satisfied with responses
- **Edit**: Edit responses
- **Submit**: Submit for teacher review
- **Wait FB**: Wait for teacher feedback
- **Receive Resp**: Receive teacher response
- **Type**: Response type
- **OK**: Approved
- **Revise**: Needs revision
- **Complete**: BSR complete
- **More Refl**: Additional reflection required
- **Return**: Return to kiosk for revision
- **Growth Plan**: Follow growth plan strategies
- **Monitor**: Monitor personal progress

## Student Emotional Journey

```mermaid
flowchart TD
    A[Initial React] --> B{Emotion}
    B -->|Defensive| C[Resist]
    B -->|Confused| D[Uncertain]
    B -->|Remorseful| E[Ready]
    
    C --> F[Kiosk Exp]
    D --> F
    E --> F
    
    F --> G[Guided Q]
    G --> H[Self-Disc]
    H --> I[Understand]
    
    I --> J[Ownership]
    J --> K[Problem-Solve]
    K --> L[Commit]
    
    L --> M[Growth]
    M --> N[Self-Aware]
    N --> O[Better Choice]
```

**Legend:**
- **Initial React**: Initial reaction
- **Emotion**: Emotional state
- **Resist**: Resistance to process
- **Uncertain**: Uncertainty about expectations
- **Ready**: Ready for reflection
- **Kiosk Exp**: Kiosk experience
- **Guided Q**: Guided reflection questions
- **Self-Disc**: Self-discovery process
- **Understand**: Understanding impact
- **Ownership**: Ownership of actions
- **Problem-Solve**: Problem-solving mindset
- **Commit**: Commitment to change
- **Growth**: Positive growth experience
- **Self-Aware**: Increased self-awareness
- **Better Choice**: Better future choices

## Kiosk Interaction Experience

```mermaid
sequenceDiagram
    participant S as Student
    participant K as Kiosk Interface
    participant SYS as System
    participant T as Teacher Dashboard

    S->>K: Approach assigned kiosk
    K->>SYS: Load student's BSR
    SYS->>K: Display BSR information
    K->>S: Show behavior description
    
    Note over S,K: Self-reflection process begins
    
    K->>S: Display Question 1
    S->>K: Enter response
    K->>S: Display Question 2
    S->>K: Enter response
    K->>S: Display Question 3
    S->>K: Enter response
    K->>S: Display Question 4
    S->>K: Enter response
    
    K->>S: Show review screen
    S->>K: Confirm submission
    K->>SYS: Save student responses
    SYS->>T: Notify teacher of completion
    K->>S: Show confirmation message
    
    Note over S: Student leaves kiosk
    Note over T: Teacher reviews submission
```

## Journey Phases

### 🔴 Phase 1: Incident & Assignment (30 seconds)
**Student Experience:**
- Incident occurs in classroom/school setting
- Student receives immediate kiosk assignment notification
- Teacher directs student to specific kiosk
- Student leaves classroom for reflection

**Emotional State:** Often defensive or confused
**Support Needed:** Clear, immediate communication about process

### 🟡 Phase 2: Kiosk Reflection (5-10 minutes)
**Student Experience:**
- Immediately approaches assigned kiosk (iPad station)
- Views teacher's description of behavior
- Responds to four guided reflection questions
- Reviews and submits responses

**Emotional State:** Transition from resistance to understanding
**Support Needed:** User-friendly interface and focused questions

### 🔵 Phase 3: Teacher Review & Return (2-3 minutes)
**Student Experience:**
- Teacher immediately reviews submission
- Receives immediate feedback and guidance
- May need brief additional reflection if required
- Returns to class once approved

**Emotional State:** Anticipation for immediate feedback
**Support Needed:** Quick, constructive teacher feedback

### 🟢 Phase 4: Immediate Return to Class
**Student Experience:**
- Returns to classroom immediately after approval
- Continues with regular classroom activities
- Implements learned strategies in real-time
- Brief follow-up with teacher as needed

**Emotional State:** Relief and readiness to move forward
**Support Needed:** Smooth re-entry into classroom environment

**Total Process Time:** 15-20 minutes maximum from incident to return to class

## Stakeholder Experience Requirements

### 👤 Student-Centered Design
- **Simple Interface**: Age-appropriate design for middle school students
- **Clear Instructions**: Step-by-step guidance through reflection process
- **Emotional Support**: Encouraging messages and positive framing
- **Privacy**: Safe space for honest reflection without judgment

### 🍎 Teacher Support
- **Quick Creation**: Efficient BSR creation process
- **Quality Reviews**: Tools for providing meaningful feedback
- **Progress Tracking**: Visibility into student growth over time
- **Communication**: Easy coordination with families and support staff

### 👨‍👩‍👧‍👦 Family Engagement
- **Transparency**: Clear communication about incidents and responses
- **Home Strategies**: Guidance for supporting student at home
- **Progress Updates**: Regular communication about student growth
- **Collaboration**: Opportunity to participate in support planning

### 🏫 Administrative Oversight
- **System Monitoring**: Real-time visibility into process effectiveness
- **Data Insights**: Analytics on behavioral trends and interventions
- **Resource Management**: Efficient allocation of support resources
- **Compliance**: Documentation for required reporting and accountability

## Success Indicators

### 📈 Student Growth Metrics
- **Self-Awareness**: Increased understanding of behavior impact
- **Problem-Solving**: Improved ability to identify alternative choices
- **Responsibility**: Greater ownership of actions and consequences
- **Relationship Skills**: Better understanding of others' perspectives

### 🎯 Process Effectiveness
- **Completion Rates**: High percentage of students completing reflections
- **Quality Responses**: Thoughtful, detailed reflection submissions
- **Behavior Improvement**: Reduced repeat incidents
- **Student Satisfaction**: Positive feedback about the reflection process

### 🏆 Long-term Outcomes
- **Behavioral Growth**: Sustained improvement in student choices
- **Academic Success**: Positive correlation with academic performance
- **School Climate**: Improved overall school behavioral culture
- **Student Voice**: Increased student agency in behavior management

## Cross-Journey Integration

### 🔗 Teacher Workflow Connection
- Seamless handoff from teacher BSR creation to student reflection
- Clear communication channels between teacher and student experiences
- Efficient review and feedback processes

### 🔗 Administrative Oversight Connection
- Real-time monitoring of student progress through journey
- Data collection for system improvement and accountability
- Resource allocation based on student needs and journey bottlenecks

### 🔗 Family Communication Connection
- Appropriate family notification and involvement at key journey points
- Home-school collaboration opportunities
- Transparent communication about student progress and growth

## Cross-References
- **Teacher Journey**: `12-teacher-workflow-journey.md` - Complementary educator experience
- **Admin Journey**: `13-admin-oversight-journey.md` - System monitoring and management
- **System Implementation**: `SPRINT-02-LAUNCH/` - Foundation enabling this journey