# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial MDA (Master Development Artifact) structure
- Comprehensive specification document (`docs/ORGSHIFT-QUIZ-SPEC.md`)
- AI features requirements (`docs/AI-FEATURES.md`)
- Database schema for Supabase (`docs/DB/SCHEMA.sql`)
- Workflow documentation (`docs/WORKFLOWS/NEWS_POLICY.md`)
- Security guardrails (`docs/GUARDRAILS.md`)
- Claude Code prompts for development
  - Bootstrap instructions (`prompts/claude/BOOTSTRAP.md`)
  - Iteration instructions (`prompts/claude/ITERATE.md`)
  - Review guidelines (`prompts/claude/REVIEW.md`)
- Sample fixtures for testing
  - News articles (`fixtures/news_sample.json`)
  - Policy documents (`fixtures/policy_sample.json`)
- Environment configuration template (`.env.example`)

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Defined secure connection settings for Supabase
- Established RLS (Row Level Security) requirements
- Set guidelines for service role key protection

## [0.1.0] - 2025-08-11

### Added
- Project initialization
- Basic folder structure
- README documentation

---

## Versioning Guidelines

- **Major version (X.0.0)**: Breaking changes, major architectural changes
- **Minor version (0.X.0)**: New features, non-breaking changes
- **Patch version (0.0.X)**: Bug fixes, minor improvements

## Release Process

1. Update version in package.json files
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v0.1.0 -m "Release version 0.1.0"`
4. Push tag: `git push origin v0.1.0`
5. Create GitHub release with release notes