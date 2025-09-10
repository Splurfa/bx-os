# Student Reflection Flow - Technical Reference

## Overview

The Student Reflection Flow is an 8-step structured workflow for students completing behavior reflections on kiosks. It separates slider interactions from narrative prompts to simplify the interface and maintain focus. Each step has a single purpose: either text input OR slider interaction, never both combined.

## Design Principles

- **Separate slider steps**: Mood, accountability, and commitment sliders appear in dedicated steps, not combined with narrative prompts
- **Distinct mood components**: Self-reflection mood slider and "others' feelings" mood slider are treated as separate elements with different purposes
- **Headings frame purpose**: Short labels explain what each slider represents
- **Real-time captions**: Two- to three-word captions appear above sliders as they move
- **Repetition for learning**: Students master one interaction pattern and reuse it throughout

## Components Used

### StudentMoodSlider - Self-Reflection
- Row of 5 faces (😢😟😐🙂😄)
- Students tap to indicate how they were feeling at the time of or just before the incident
- Used in Steps 2 and 7 for personal emotional state

### StudentMoodSlider - Others' Perception
- Row of 5 faces (😢😟😐🙂😄)
- Students tap to indicate how they believe others felt about their behavior
- Used in Step 5 followup for empathy assessment

### AccountabilitySlider
- 5 circles (◯◔◑◕●) with progression visualization
- Captions: "None" → "A little" → "Some" → "Most" → "All"
- Heading: **"How much responsibility do you take for this incident?"**
- Used in Step 3 for ownership assessment

### CommitmentSlider
- Same 5-circle design as accountability
- Captions: "Not ready" → "A little ready" → "Half ready" → "Almost ready" → "Fully ready"
- Used in Step 8 for commitment to change

## Student Journey (8 Steps)

| Step | Heading/Label | UI Components | Purpose |
|------|---------------|---------------|---------|
| **1. Incident** | "What did you do that led to being sent out of class?" | Narrative text input only | Describe the behavior |
| **2. Mood Before** | "How were you feeling just before or during the incident?" | StudentMoodSlider (Self-Reflection) | Emotional state at incident |
| **3. Accountability** | "How much responsibility do you take for this incident?" | AccountabilitySlider | Ownership assessment |
| **4. Intent** | "What were you hoping would happen when you acted that way?" | Narrative text input only | Understanding motivation |
| **5. Impact** | "Who else was affected by your behaviour, and how do you think they felt?" | Narrative text input only | Identifying affected parties |
| **5b. Others' Mood** | (Follows Step 5 immediately) | StudentMoodSlider (Others' Perception) | Empathy for others' feelings |
| **6. Plan** | "What will you do differently next time?" | Narrative text input only | Future behavior planning |
| **7. Mood Now** | "How do you feel now?" | StudentMoodSlider (Self-Reflection) | Current emotional state |
| **8. Commitment** | "How ready are you to follow through?" | CommitmentSlider | Commitment to change |

## Implementation Details

### Database Schema
The reflection data includes text responses and slider values for the 8-step workflow:
```sql
reflections table:
- step1_incident_response (text) - What did you do that led to being sent out of class?
- step2_mood_before (integer 1-5) - How were you feeling just before or during the incident?
- step3_accountability (integer 1-5) - How much responsibility do you take for this incident?
- step4_intent_response (text) - What were you hoping would happen when you acted that way?
- step5_impact_response (text) - Who else was affected by your behaviour, and how do you think they felt?
- step5_others_mood (integer 1-5) - Others' mood perception
- step6_plan_response (text) - What will you do differently next time?
- step7_mood_after (integer 1-5) - How do you feel now?
- step8_commitment (integer 1-5) - How ready are you to follow through?
```

### Component Integration
- KioskTwo component completely refactored for 8-step separated workflow
- Each step is either text input OR slider interaction, never both combined
- StudentMoodSlider used for Steps 2, 5b (others), and 7
- AccountabilitySlider used for Step 3 with updated labels ("None" → "All")
- CommitmentSlider used for Step 8
- Real-time progress tracking and step navigation
- Data persistence for all 8 steps of reflection data

### Exit Flow
- Student completes Step 8 (commitment slider) and submits
- Returns to existing completion screen in KioskTwo
- No additional summary or new exit sequence
- Flow ends with final submission to database

## File Locations

- Main Component: `src/components/KioskTwo.tsx` (completely refactored)
- Slider Components: 
  - `src/components/AccountabilitySlider.tsx` (updated labels)
  - `src/components/CommitmentSlider.tsx`
  - `src/components/StudentMoodSlider.tsx`
- Database Hook: `src/hooks/useSupabaseQueue.ts` (updated submitReflection function)

## Status

✅ **Implemented**: Complete 8-step reflection workflow with separated steps
✅ **Implemented**: Database schema migration for new 8-step structure  
✅ **Implemented**: StudentMoodSlider for Steps 2, 5b, and 7
✅ **Implemented**: AccountabilitySlider for Step 3 with updated labels
✅ **Implemented**: CommitmentSlider for Step 8
✅ **Implemented**: Step-by-step navigation with progress tracking
✅ **Implemented**: Data validation and persistence for all 8 steps
✅ **Implemented**: Updated submitReflection function for new data structure

## Future Enhancements

- Voice input option for text responses  
- Analytics on mood patterns and accountability/commitment trends
- Adaptive questioning based on slider responses
- Integration with teacher feedback system for 8-step format
- Real-time caption updates above sliders during interaction