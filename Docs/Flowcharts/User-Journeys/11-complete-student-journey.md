# 🎯 Complete Student Journey (User Experience Flow)

**Journey Scope**: End-to-end student behavior support experience from incident to resolution

## Student Behavior Support Journey

<lov-mermaid>
journey
    title Complete Student Behavior Support Journey
    section Incident Occurs
      Behavior incident happens: 2: Student
      Teacher observes behavior: 4: Teacher
      Teacher creates BSR: 5: Teacher
      Student added to queue: 5: System
    section Reflection Assignment
      Student assigned to kiosk: 5: System
      Student receives reflection prompt: 4: Student
      Student accesses kiosk station: 3: Student
      System loads BSR questions: 5: System
    section Self-Reflection Process
      Student reads behavior description: 3: Student
      Student reflects on actions: 4: Student
      Student completes reflection questions: 4: Student
      Student submits for review: 5: Student
    section Review & Feedback
      Teacher reviews submission: 4: Teacher
      Teacher provides feedback: 5: Teacher
      Student receives feedback: 4: Student
      Resolution plan created: 5: Teacher, Student
    section Follow-up & Growth
      Student implements strategies: 4: Student
      Teacher monitors progress: 4: Teacher
      Family receives communication: 3: Family
      Growth documented in system: 5: System
</lov-mermaid>

## Detailed Student Experience Flow

<lov-mermaid>
flowchart TD
    A[Behavior Incident] --> B[Student Awareness]
    B --> C[Wait for Assignment]
    C --> D[Kiosk Assignment Notification]
    
    D --> E[Approach Assigned Kiosk]
    E --> F[View BSR on Screen]
    F --> G[Read Teacher's Description]
    
    G --> H[Self-Reflection Questions]
    H --> I[Question 1: What Happened?]
    H --> J[Question 2: How Did Others Feel?]
    H --> K[Question 3: What Could You Do Differently?]
    H --> L[Question 4: How Will You Make It Right?]
    
    I --> M[Student Types Response]
    J --> M
    K --> M
    L --> M
    
    M --> N[Review All Answers]
    N --> O{Satisfied with Responses?}
    O -->|No| P[Edit Responses]
    O -->|Yes| Q[Submit for Teacher Review]
    
    P --> N
    Q --> R[Wait for Teacher Feedback]
    
    R --> S[Receive Teacher Response]
    S --> T{Response Type}
    T -->|Approved| U[BSR Complete - Growth Plan]
    T -->|Needs Revision| V[Additional Reflection Required]
    
    V --> W[Return to Kiosk for Revision]
    W --> H
    
    U --> X[Follow Growth Plan Strategies]
    X --> Y[Monitor Personal Progress]
    
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style G fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style M fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style Q fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style U fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
</lov-mermaid>

## Student Emotional Journey

<lov-mermaid>
flowchart TD
    A[Initial Reaction] --> B{Emotional State}
    B -->|Defensive| C[Resistance to Process]
    B -->|Confused| D[Uncertainty About Expectations]
    B -->|Remorseful| E[Ready for Reflection]
    
    C --> F[Kiosk Experience]
    D --> F
    E --> F
    
    F --> G[Guided Reflection Questions]
    G --> H[Self-Discovery Process]
    H --> I[Understanding Impact]
    
    I --> J[Ownership of Actions]
    J --> K[Problem-Solving Mindset]
    K --> L[Commitment to Change]
    
    L --> M[Positive Growth Experience]
    M --> N[Increased Self-Awareness]
    N --> O[Better Future Choices]
    
    style F fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style H fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style J fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style M fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style O fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
</lov-mermaid>

## Kiosk Interaction Experience

<lov-mermaid>
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
</lov-mermaid>

## Journey Phases

### 🔴 Phase 1: Incident & Assignment (5-10 minutes)
**Student Experience:**
- Incident occurs in classroom/school setting
- Teacher explains that a BSR will be created
- Student waits for kiosk assignment notification
- Receives instruction on which kiosk to visit

**Emotional State:** Often defensive or confused
**Support Needed:** Clear communication about process and expectations

### 🟡 Phase 2: Kiosk Reflection (15-25 minutes)
**Student Experience:**
- Approaches assigned kiosk (iPad station)
- Views teacher's description of behavior
- Responds to guided reflection questions
- Reviews and submits responses

**Emotional State:** Transition from resistance to understanding
**Support Needed:** User-friendly interface and thoughtful question design

### 🔵 Phase 3: Teacher Review & Feedback (2-24 hours)
**Student Experience:**
- Waits for teacher to review submission
- Receives feedback and guidance
- May need to complete additional reflection
- Works with teacher on resolution plan

**Emotional State:** Anticipation and readiness for feedback
**Support Needed:** Timely, constructive teacher feedback

### 🟢 Phase 4: Growth & Implementation (Ongoing)
**Student Experience:**
- Implements agreed-upon strategies
- Practices new behaviors
- Receives ongoing support and monitoring
- Celebrates growth and progress

**Emotional State:** Empowered and motivated for positive change
**Support Needed:** Consistent reinforcement and celebration of progress

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