/**
 * Extracts initials from user's full name or username.
 * e.g., "Prasoon Pathak" -> "P"
 * e.g., "Alex Johnson" -> "A"
 */
export function getUserInitials(user) {
  if (!user) return 'U';
  
  const fullName = (user.full_name || user.fullName || user.name || '').trim();
  if (fullName) {
    const firstWord = fullName.split(/\s+/)[0];
    if (firstWord && /[a-zA-Z]/.test(firstWord[0])) {
      return firstWord[0].toUpperCase();
    }
  }

  // Fallback to username
  const username = (user.username || '').trim();
  if (username) {
    // If username starts with letter, use it
    if (/[a-zA-Z]/.test(username[0])) {
      return username[0].toUpperCase();
    }
    // If username is numeric roll number (e.g. 2402840109004), check if there are any letters or fallback to 'S' for Student, 'F' for Faculty
    if (user.role === 'STUDENT') return 'S';
    if (user.role === 'FACULTY') return 'F';
    if (user.role === 'ADMIN') return 'A';
    return username[0];
  }

  return 'U';
}

/**
 * Returns human-readable display name for the user
 * Prefers full_name if available, otherwise username
 */
export function getUserDisplayName(user) {
  if (!user) return 'User';
  if (user.full_name && user.full_name.trim()) return user.full_name.trim();
  if (user.name && user.name.trim()) return user.name.trim();
  return user.username || 'User';
}

/**
 * Returns specific account designation or department label
 * e.g. "Student • CSE (Year 4)" or "Professor • Dept of CSE" or "System Administrator"
 */
export function getUserAccountLabel(user) {
  if (!user) return 'Account';
  if (user.account_label && user.account_label.trim()) return user.account_label.trim();
  if (user.designation && user.department) return `${user.designation} • ${user.department}`;
  if (user.branch) return `Student • ${user.branch}`;
  if (user.role === 'ADMIN') return 'System Administrator';
  if (user.role === 'FACULTY') return 'Faculty Member';
  return 'Student Account';
}

/**
 * Returns account identifier (e.g. Roll Number / Employee ID)
 */
export function getUserIdentifier(user) {
  if (!user) return '';
  return user.identifier || user.enrollment_number || user.employee_id || user.username || '';
}

