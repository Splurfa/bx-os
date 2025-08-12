name: Feature PR

description: Submit changes for review

title: "feat: <short description>"

body:
  - type: markdown
    attributes:
      value: |
        Provide screenshots/GIFs and test evidence.
  - type: textarea
    id: changes
    attributes:
      label: Summary of changes
  - type: textarea
    id: tests
    attributes:
      label: Tests and results
