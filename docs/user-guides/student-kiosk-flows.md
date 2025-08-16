# 🎓 Student Kiosk Flows - Interactive Visual Guide

## Overview
This guide shows students exactly what to expect when using the kiosk system for behavior reflections. Each step includes visual cues and clear instructions for a successful experience.

---

## 🚶‍♂️ Approaching the Kiosk

### What Students See First

<lov-mermaid>
journey
    title Student Arrives at Kiosk
    section Finding the Kiosk
      Leave classroom with pass    : 3: Student
      Walk to assigned kiosk area  : 4: Student
      Find correct kiosk number    : 4: Student
    section Initial Interaction
      See welcome screen          : 5: Student
      Read student name on screen : 5: Student
      Feel reassured by friendly UI: 4: Student
    section Getting Ready
      Take a deep breath          : 3: Student
      Read instructions carefully : 4: Student
      Prepare to begin process    : 4: Student
</lov-mermaid>

### Kiosk Welcome Screen Wireframe

<lov-mermaid>
graph TB
    subgraph "🖥️ Kiosk Welcome Screen"
        subgraph "🎯 Header Section"
            A["🏫 School Logo & Name<br/>Behavior Reflection Kiosk #1"]
            B["👋 Welcome Message<br/>Hello, [Student Name]!"]
            C["📝 Brief Instructions<br/>You're here to complete a reflection"]
        end
        
        subgraph "📋 Information Panel"
            D["👨‍🏫 Teacher Information<br/>Sent by: [Teacher Name]"]
            E["⏰ Estimated Time<br/>This will take about 10-15 minutes"]
            F["🎯 Purpose Statement<br/>This helps you think about what happened"]
        end
        
        subgraph "🎨 Visual Elements"
            G["🌟 Encouraging Graphics<br/>Friendly, non-threatening design"]
            H["🎨 School Colors<br/>Familiar branding"]
            I["📱 Touch-Friendly Buttons<br/>Large, easy to tap"]
        end
        
        subgraph "🚀 Action Section"
            J["👆 Tap to Continue<br/>Large, prominent button"]
            K["❓ Need Help Button<br/>Call for assistance"]
        end
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    style B fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    style E fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style F fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style J fill:#fff3e0,stroke:#f57c00,stroke-width:3px
</lov-mermaid>

---

## 🔐 Authentication Flow

### Login Process Steps

<lov-mermaid>
stateDiagram-v2
    [*] --> WelcomeScreen : Student arrives
    WelcomeScreen --> LoginPrompt : Tap "Continue"
    LoginPrompt --> EnterID : Show ID field
    EnterID --> EnterPassword : ID entered
    EnterPassword --> Validating : Submit credentials
    Validating --> Success : Valid credentials
    Validating --> Error : Invalid credentials
    Error --> EnterID : Try again
    Success --> ReflectionStart : Access granted
    ReflectionStart --> [*] : Begin reflection
    
    note right of LoginPrompt : Clear, simple instructions<br/>Student-friendly language
    note right of Error : Helpful error messages<br/>Encourage to try again
    note right of Success : Positive confirmation<br/>Ready to begin
</lov-mermaid>

### Login Screen Interface

<lov-mermaid>
graph TB
    subgraph "🔐 Student Login Interface"
        subgraph "📋 Instructions"
            A["👨‍🎓 Login Instructions<br/>Enter your student information"]
            B["🆔 Student ID Help<br/>Your 6-digit student number"]
            C["🔑 Password Help<br/>Same password you use for computers"]
        end
        
        subgraph "📝 Input Fields"
            D["🆔 Student ID Field<br/>Large, clear number input"]
            E["🔑 Password Field<br/>Secure text input with show/hide"]
            F["👁️ Show Password Toggle<br/>Help verify correct entry"]
        end
        
        subgraph "🎯 Action Buttons"
            G["✅ Login Button<br/>Large, prominent action"]
            H["❓ Forgot Info Button<br/>Get help with credentials"]
            I["🏠 Return to Welcome<br/>Go back if needed"]
        end
        
        subgraph "📢 Feedback Area"
            J["✅ Success Messages<br/>Positive confirmation"]
            K["❌ Error Messages<br/>Helpful, non-threatening"]
            L["⏳ Loading Indicator<br/>Shows system is working"]
        end
    end
    
    A --> D
    B --> D
    C --> E
    D --> G
    E --> G
    F --> E
    G --> J
    G --> K
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style D fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style J fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style K fill:#ffebee,stroke:#c62828,stroke-width:2px
</lov-mermaid>

---

## 💭 Reflection Process

### Complete Reflection Journey

<lov-mermaid>
journey
    title Student Reflection Experience
    section Getting Started
      See reflection introduction   : 4: Student
      Read about the 4 questions   : 4: Student
      Understand the purpose        : 3: Student
    section Question 1 - What Happened
      Read question carefully       : 4: Student
      Think about the incident      : 3: Student
      Type honest response         : 3: Student
      Review and edit answer       : 4: Student
    section Question 2 - Your Intentions
      Read about hopes/goals       : 4: Student
      Reflect on original intent   : 3: Student
      Explain what you wanted      : 4: Student
      Consider different outcomes  : 4: Student
    section Question 3 - Impact on Others
      Think about affected people  : 3: Student
      Consider various perspectives: 4: Student
      Show understanding of impact : 4: Student
      Express empathy              : 5: Student
    section Question 4 - Expectations
      Review classroom rules       : 4: Student
      Think about better choices   : 4: Student
      Plan for future situations   : 5: Student
      Commit to improvement        : 5: Student
    section Final Review
      Read all responses          : 4: Student
      Make final edits            : 4: Student
      Feel confident about answers: 4: Student
      Submit reflection           : 5: Student
</lov-mermaid>

### Reflection Interface Wireframes

<lov-mermaid>
graph TB
    subgraph "💭 Question Interface Design"
        subgraph "📊 Progress Section"
            A["📈 Progress Bar<br/>Question 2 of 4"]
            B["🎯 Step Indicator<br/>Visual progress dots"]
            C["⏰ Time Indicator<br/>No pressure, take your time"]
        end
        
        subgraph "❓ Question Section"
            D["❓ Question Title<br/>What were you hoping would happen?"]
            E["📝 Question Details<br/>Think about what you wanted to achieve"]
            F["💡 Helpful Prompts<br/>• What was your goal?<br/>• What did you expect?<br/>• How did you think others would react?"]
        end
        
        subgraph "✍️ Response Area"
            G["📝 Large Text Area<br/>Comfortable typing space"]
            H["📊 Character Counter<br/>Encourages thoughtful responses"]
            I["💾 Auto-Save Indicator<br/>Your work is being saved"]
        end
        
        subgraph "🎯 Navigation"
            J["⬅️ Previous Button<br/>Go back to edit"]
            K["➡️ Next Button<br/>Continue to next question"]
            L["👀 Review All<br/>See all responses"]
        end
    end
    
    A --> D
    B --> D
    C --> E
    D --> F
    E --> G
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style D fill:#f1f8e9,stroke:#388e3c,stroke-width:3px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style K fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
</lov-mermaid>

---

## ❓ The Four Reflection Questions

### Question 1: What Did You Do?

<lov-mermaid>
graph LR
    subgraph "❓ Question 1 Interface"
        subgraph "🎯 Question Focus"
            A["❓ Main Question<br/>What did you do?"]
            B["📝 Explanation<br/>Describe what happened from your perspective"]
        end
        
        subgraph "💡 Helpful Prompts"
            C["💭 Think About:<br/>• What actions did you take?<br/>• What did you say?<br/>• How did you behave?<br/>• What was the sequence of events?"]
            D["🎯 Be Honest:<br/>This is your chance to share your side"]
        end
        
        subgraph "✍️ Response Guidelines"
            E["📏 Length Suggestion<br/>2-3 sentences minimum"]
            F["🎨 Tone Guidance<br/>Be honest and respectful"]
            G["💪 Encouragement<br/>There's no wrong answer, just be truthful"]
        end
    end
    
    A --> C
    B --> C
    C --> E
    D --> F
    E --> G
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style C fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

### Question 2: What Were You Hoping?

<lov-mermaid>
graph LR
    subgraph "❓ Question 2 Interface"
        subgraph "🎯 Question Focus"
            A["❓ Main Question<br/>What were you hoping would happen?"]
            B["📝 Explanation<br/>Think about your intentions and goals"]
        end
        
        subgraph "💡 Helpful Prompts"
            C["💭 Consider:<br/>• What was your goal?<br/>• What did you want to achieve?<br/>• How did you expect others to react?<br/>• What was your plan?"]
            D["🎯 Intention Focus:<br/>Help us understand your thinking"]
        end
        
        subgraph "✍️ Response Guidelines"
            E["🤔 Reflection Depth<br/>Think about your real motivations"]
            F["💡 Growth Mindset<br/>Understanding helps us learn"]
            G["🌟 No Judgment<br/>We want to understand, not blame"]
        end
    end
    
    A --> C
    B --> C
    C --> E
    D --> F
    E --> G
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style C fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

### Question 3: Who Was Impacted?

<lov-mermaid>
graph LR
    subgraph "❓ Question 3 Interface"
        subgraph "🎯 Question Focus"
            A["❓ Main Question<br/>Who was impacted by what happened?"]
            B["📝 Explanation<br/>Think about how others were affected"]
        end
        
        subgraph "💡 Helpful Prompts"
            C["👥 Consider All People:<br/>• Other students<br/>• Your teacher<br/>• Yourself<br/>• Anyone else present"]
            D["💭 Types of Impact:<br/>• How did they feel?<br/>• Was their learning affected?<br/>• Did it change the class environment?"]
        end
        
        subgraph "✍️ Response Guidelines"
            E["❤️ Show Empathy<br/>Try to understand others' feelings"]
            F["🔍 Be Thorough<br/>Think about all the effects"]
            G["🌱 Growth Opportunity<br/>Understanding impact helps us grow"]
        end
    end
    
    A --> C
    B --> C
    C --> E
    D --> F
    E --> G
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style C fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

### Question 4: What's Expected?

<lov-mermaid>
graph LR
    subgraph "❓ Question 4 Interface"
        subgraph "🎯 Question Focus"
            A["❓ Main Question<br/>What's expected in our classroom?"]
            B["📝 Explanation<br/>Show your understanding of our rules and expectations"]
        end
        
        subgraph "💡 Helpful Prompts"
            C["📚 Think About:<br/>• Classroom rules<br/>• How we treat each other<br/>• What good behavior looks like<br/>• What you could do differently"]
            D["🎯 Future Planning:<br/>How will you handle this better next time?"]
        end
        
        subgraph "✍️ Response Guidelines"
            E["💪 Show Understanding<br/>Demonstrate you know the expectations"]
            F["🔮 Plan Ahead<br/>What will you do differently?"]
            G["🌟 Positive Focus<br/>Focus on success and growth"]
        end
    end
    
    A --> C
    B --> C
    C --> E
    D --> F
    E --> G
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style C fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

---

## 👀 Review & Submit Process

### Final Review Interface

<lov-mermaid>
graph TB
    subgraph "👀 Review Your Responses"
        subgraph "📋 Response Summary"
            A["📝 Question 1 Summary<br/>Brief preview of response"]
            B["📝 Question 2 Summary<br/>Brief preview of response"]
            C["📝 Question 3 Summary<br/>Brief preview of response"]
            D["📝 Question 4 Summary<br/>Brief preview of response"]
        end
        
        subgraph "✏️ Edit Options"
            E["✏️ Edit Q1<br/>Go back and revise"]
            F["✏️ Edit Q2<br/>Go back and revise"]
            G["✏️ Edit Q3<br/>Go back and revise"]
            H["✏️ Edit Q4<br/>Go back and revise"]
        end
        
        subgraph "🎯 Final Actions"
            I["👀 Read Everything<br/>Make sure you're happy with responses"]
            J["✅ Submit Reflection<br/>Send to your teacher"]
            K["❌ Continue Editing<br/>Make more changes"]
        end
        
        subgraph "📊 Quality Check"
            L["📏 Response Length<br/>Are your answers complete?"]
            M["💭 Thoughtfulness<br/>Did you really think about each question?"]
            N["✅ Completeness<br/>All questions answered?"]
        end
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J
    I --> K
    J --> L
    L --> M
    M --> N
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style I fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style J fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style L fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
</lov-mermaid>

### Submission Confirmation Flow

<lov-mermaid>
stateDiagram-v2
    [*] --> ReviewComplete : All questions answered
    ReviewComplete --> FinalCheck : Click "Submit"
    FinalCheck --> ConfirmDialog : Show confirmation
    ConfirmDialog --> Submitting : User confirms
    ConfirmDialog --> ReviewComplete : User cancels
    Submitting --> Success : Reflection saved
    Success --> ThankYou : Show completion
    ThankYou --> Instructions : Next steps
    Instructions --> [*] : Return to class
    
    note right of FinalCheck : "Are you ready to submit?"<br/>Last chance to edit
    note right of Success : "Great job completing<br/>your reflection!"
    note right of Instructions : "Return to class<br/>Teacher will review soon"
</lov-mermaid>

---

## 🎉 Completion & Success

### Success Screen Design

<lov-mermaid>
graph TB
    subgraph "🎉 Reflection Complete!"
        subgraph "🌟 Celebration Section"
            A["🎉 Success Animation<br/>Positive, encouraging visuals"]
            B["🌟 Congratulations Message<br/>Great job completing your reflection!"]
            C["💪 Effort Recognition<br/>Thank you for your thoughtful responses"]
        end
        
        subgraph "📋 Next Steps"
            D["👨‍🏫 Teacher Review<br/>Your teacher will read your reflection"]
            E["⏰ Timeline<br/>You'll hear back within 24 hours"]
            F["🏫 Return Instructions<br/>Go back to your classroom now"]
        end
        
        subgraph "📞 Support Options"
            G["❓ Questions?<br/>Ask your teacher if you have concerns"]
            H["🆘 Need Help?<br/>Office staff can assist"]
            I["📝 Feedback<br/>How was this experience?"]
        end
        
        subgraph "🎯 Final Actions"
            J["🏠 Return to Class<br/>Large, clear button"]
            K["🖥️ Kiosk Ready<br/>System prepares for next student"]
        end
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    
    style A fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    style B fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style F fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style J fill:#fff3e0,stroke:#f57c00,stroke-width:3px
</lov-mermaid>

---

## 🔄 Revision Process (If Needed)

### When Teacher Requests Revision

<lov-mermaid>
journey
    title Revision Process Experience
    section Getting Notification
      Return to kiosk area         : 3: Student
      See revision message         : 2: Student
      Read teacher feedback        : 3: Student
      Understand what to improve   : 4: Student
    section Review Previous Work
      See original responses       : 4: Student
      Read teacher's suggestions   : 4: Student
      Understand specific areas    : 5: Student
      Feel supported, not criticized: 4: Student
    section Making Improvements
      Focus on suggested areas     : 4: Student
      Add more detail where needed : 4: Student
      Think deeper about questions : 5: Student
      Show growth in understanding : 5: Student
    section Resubmission
      Review improved responses    : 5: Student
      Feel proud of better work    : 5: Student
      Submit revised reflection    : 5: Student
      Return to class with confidence: 5: Student
</lov-mermaid>

### Revision Interface Design

<lov-mermaid>
graph TB
    subgraph "📝 Revision Interface"
        subgraph "💬 Teacher Feedback"
            A["👨‍🏫 Teacher Message<br/>Encouraging, specific feedback"]
            B["🎯 Areas to Improve<br/>Specific questions or sections"]
            C["💡 Suggestions<br/>Helpful guidance for improvement"]
        end
        
        subgraph "📋 Original Responses"
            D["👀 Previous Answer<br/>What you wrote before"]
            E["✏️ Edit Mode<br/>Improve your response"]
            F["💾 Track Changes<br/>See what you're updating"]
        end
        
        subgraph "🎯 Revision Tools"
            G["💡 Improvement Prompts<br/>Think more deeply about..."]
            H["📏 Quality Indicators<br/>Length and detail suggestions"]
            I["✅ Progress Tracker<br/>Which sections are improved"]
        end
        
        subgraph "🚀 Resubmission"
            J["👀 Review Changes<br/>See your improvements"]
            K["✅ Submit Revision<br/>Send improved reflection"]
            L["🌟 Growth Celebration<br/>Acknowledge improvement effort"]
        end
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
    G --> J
    H --> K
    I --> L
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style E fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style K fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    style L fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
</lov-mermaid>

---

## 💡 Tips for Students

### How to Write Great Reflections

<lov-mermaid>
graph LR
    subgraph "✨ Writing Great Reflections"
        subgraph "📝 Content Tips"
            A["💭 Be Honest<br/>Tell the truth about what happened"]
            B["📏 Be Complete<br/>Answer all parts of each question"]
            C["🤔 Think Deeply<br/>Don't just give surface answers"]
        end
        
        subgraph "💪 Attitude Tips"
            D["🌱 Growth Mindset<br/>This is a learning opportunity"]
            E["❤️ Show Empathy<br/>Think about how others felt"]
            F["🎯 Take Responsibility<br/>Own your choices and actions"]
        end
        
        subgraph "✍️ Writing Tips"
            G["📖 Use Complete Sentences<br/>Write clearly and carefully"]
            H["🔍 Give Examples<br/>Specific details help explain"]
            I["🎨 Use Your Own Voice<br/>Write like you're talking to a friend"]
        end
    end
    
    style A fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style D fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

---

## 🆘 Student Help & Support

### Getting Help When Needed

<lov-mermaid>
flowchart TD
    A[❓ Need Help?] --> B{🤔 What kind of help?}
    
    B -->|🔐 Login Problems| C[🆘 Press "Need Help" button<br/>📞 Someone will come assist<br/>🔑 Bring your student ID]
    
    B -->|❓ Don't Understand Question| D[📖 Read the prompts again<br/>💭 Take time to think<br/>✋ Ask for clarification if needed]
    
    B -->|✍️ Don't Know What to Write| E[💡 Start with what you remember<br/>🎯 Focus on one thing at a time<br/>📝 Even short answers are okay]
    
    B -->|🖥️ Technical Problems| F[🔄 Try refreshing/restarting<br/>🆘 Press help button<br/>👨‍💼 Tech support will assist]
    
    C --> G[✅ Help is Available]
    D --> G
    E --> G
    F --> G
    
    style A fill:#ffebee,stroke:#c62828,stroke-width:2px
    style G fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
</lov-mermaid>

---

## 🎯 Understanding the Purpose

### Why We Do Reflections

<lov-mermaid>
graph TB
    subgraph "🎯 Purpose of Reflection"
        subgraph "🌱 Personal Growth"
            A["🤔 Self-Awareness<br/>Understanding your choices"]
            B["💪 Responsibility<br/>Owning your actions"]
            C["🎯 Better Decisions<br/>Learning for next time"]
        end
        
        subgraph "❤️ Relationship Building"
            D["👥 Understanding Others<br/>How your actions affect people"]
            E["🤝 Trust Building<br/>Honest communication matters"]
            F["🏫 Community Care<br/>We all help each other succeed"]
        end
        
        subgraph "📚 Learning Focus"
            G["📖 Not Punishment<br/>This is about learning"]
            H["🌟 Growth Opportunity<br/>Everyone makes mistakes"]
            I["🎉 Celebration<br/>We celebrate your growth"]
        end
    end
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style D fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

---

*This student kiosk guide is designed to make the reflection process clear, supportive, and empowering. The goal is student growth and learning, not punishment. For additional resources, see [Teacher Workflows](teacher-workflows.md) and [Admin Operations](admin-operations.md).*