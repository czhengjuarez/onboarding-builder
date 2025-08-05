# Known Issues

This document tracks known issues in the Onboarding Builder application that have been identified but are not currently planned for resolution.

## Template Re-seeding Behavior

**Issue**: When users intentionally delete all templates from their account, the system treats them as a "new" account and automatically re-seeds the starter template content.

**Impact**: 
- Users who want completely empty template accounts cannot achieve this
- Affects user experience for those who prefer to start from scratch
- Inconsistent behavior between templates and resources

**Technical Details**:
- Issue occurs only with templates, not with resources
- System checks if user has any templates and assumes "new user" if count is 0
- Resources side does not exhibit this behavior (users can have empty resource categories)
- Re-seeding logic was designed for genuinely new accounts but triggers for intentionally emptied accounts

**Status**: 
- ❌ **Not planned for fix** - Decision made not to resolve due to complexity and potential for introducing other issues
- 🔄 **Workaround**: Users need to keep at least one template to prevent re-seeding
- ✅ **Resources work correctly**: Can be safely deleted without triggering re-seeding behavior

**Attempted Solution** (abandoned):
- Add 'has_been_initialized' or 'has_been_seeded' flag to users table
- Track whether account has already received starter content
- Prevent automatic re-seeding for accounts that have been previously initialized
- This approach caused complications and was abandoned

---

## Template Cloning - Production Environment Issue

**Issue**: Template cloning copies resources but not template items when using shared template links in production environment.

**Impact**:
- Shared template links don't fully clone template content
- Users receive resources but miss the actual onboarding templates

**Technical Details**:
- Works correctly in local development environment
- Issue only occurs in production environment
- Clone endpoint logic is correct - retrieves and copies templates from owner_user_id
- Environment-specific issue, not code logic problem

**Status**:
- 🔍 **Under investigation** - Debug version deployed to production
- 📊 **Debug logs added** to track template retrieval and copying process
- 🎯 **Next steps**: Compare production logs with local logs to identify root cause

---

*Last updated: January 2025*
