# Migration History

## Background

This project's initial database was bootstrapped in a development environment with two early migrations:
- `20250228000000_init` — initial core schema
- `20250311_payment_bangladesh` — payment models (bKash/Nagad)

Those migrations were later consolidated into `20250408000000_baseline` (a complete schema snapshot used for environment resets and clean setups). The baseline is the source of truth for provisioning fresh databases.

## Forward-only additive migrations (always preferred for schema changes)

| Migration | Description |
|-----------|-------------|
| `20250408001000_add_gender_rating_breakdown` | Adds `gender` to `tutor_profiles`; adds 5 sub-rating columns to `reviews` |
| `20250408002000_add_grade_levels_teaching_mode` | Adds `grade_levels` (String[]) and `teaching_mode` to `tutor_profiles` |

All future schema changes MUST use additive forward-only migrations. Do not modify the baseline.
