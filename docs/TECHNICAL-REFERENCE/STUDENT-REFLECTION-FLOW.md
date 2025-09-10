# Student Reflection Flow - Technical Reference

## Overview

The Student Reflection Flow is a structured workflow for students completing behavior reflections on kiosks. It follows a systematic approach using consistent interaction patterns with slider components to guide students through reflection, ownership, and planning.

## Design Principles

- **Consistent interaction**: Same slider design across all steps (5 icons or circles)
- **Headings frame purpose**: Short labels explain what each slider represents
- **Real-time captions**: Two- to three-word captions appear above sliders as they move
- **Repetition for learning**: Students master one interaction pattern and reuse it throughout

## Components Used

### MoodSlider (Not currently used in flow)
- Row of 5 faces (😢😟😐🙂😄)
- Students tap to select mood
- Used for initial mood assessment

### AccountabilitySlider
- 5 circles (◯◔◑◕●) with progression visualization
- Captions: "Not mine" → "A little mine" → "Half mine" → "Mostly mine" → "All mine"
- Used in Steps 1-3 for ownership assessment

### CommitmentSlider
- Same 5-circle design as accountability
- Captions: "Not ready" → "A little ready" → "Half ready" → "Almost ready" → "Fully ready"
- Used in Step 4 for commitment to change

## Student Journey

| Step | Question | UI Components | Slider Used |
|------|----------|---------------|-------------|
| **1. Incident** | "What did you do that led to being sent out of class?" | Textarea + AccountabilitySlider | "Not mine" → "All mine" |
| **2. Intent** | "What were you hoping would happen when you acted that way?" | Textarea + AccountabilitySlider | "Not mine" → "All mine" |
| **3. Impact** | "Who else was impacted by your behavior, and in what way?" | Textarea + AccountabilitySlider | "Not mine" → "All mine" |
| **4. Plan** | "Write two sentences that show you understand what's expected of you when you go back to class." | Textarea + CommitmentSlider | "Not ready" → "Fully ready" |

## Implementation Details

### Database Schema
The reflection data includes both text responses and slider values:
```sql
reflections table:
- question_1_response (text)
- question_2_response (text) 
- question_3_response (text)
- question_4_response (text)
- accountability_step1 (integer 1-5)
- accountability_step2 (integer 1-5)
- accountability_step3 (integer 1-5)
- commitment_step4 (integer 1-5)
```

### Component Integration
- KioskTwo component renders both textarea and appropriate slider for each step
- Slider values are captured and stored alongside text responses
- Real-time captions update as students interact with sliders
- Navigation between steps preserves both text and slider values

### Exit Flow
- Student completes Step 4 and submits
- Returns to existing completion screen in KioskTwo
- No additional summary or new exit sequence
- Flow ends with final submission to database

## File Locations

- Main Component: `src/components/KioskTwo.tsx`
- Slider Components: 
  - `src/components/AccountabilitySlider.tsx`
  - `src/components/CommitmentSlider.tsx`
  - `src/components/StudentMoodSlider.tsx`

## Status

✅ **Implemented**: Enhanced KioskTwo with 4-step reflection workflow
✅ **Implemented**: AccountabilitySlider integrated into Steps 1-3
✅ **Implemented**: CommitmentSlider integrated into Step 4
✅ **Implemented**: Database schema updated with slider value columns
✅ **Implemented**: Component alignment with specified labels and icons
✅ **Implemented**: Data persistence for both text and slider values

## Future Enhancements

- Voice input option for text responses  
- Analytics on accountability/commitment trends
- Adaptive questioning based on slider responses
- Integration with teacher feedback system
- Real-time caption updates above sliders during interaction