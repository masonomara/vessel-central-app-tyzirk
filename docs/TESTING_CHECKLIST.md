
# Vessel & Co. Testing Checklist

## Authentication Testing

### Owner Role
- [ ] Login with owner credentials
- [ ] View all owned vessels
- [ ] View maintenance tasks (read-only)
- [ ] View issues (read-only)
- [ ] View supply requests (read-only)
- [ ] View documents
- [ ] View expenses
- [ ] Approve/deny supply requests
- [ ] Logout successfully

### Manager Role
- [ ] Login with manager credentials
- [ ] View managed vessels
- [ ] Create maintenance tasks
- [ ] Edit maintenance tasks
- [ ] Delete maintenance tasks
- [ ] Assign tasks to crew
- [ ] View and manage issues
- [ ] Approve/deny supply requests
- [ ] Upload documents
- [ ] Add expenses
- [ ] View activity logs
- [ ] Logout successfully

### Crew Role
- [ ] Login with crew credentials
- [ ] View assigned vessels
- [ ] View assigned maintenance tasks
- [ ] Complete maintenance tasks
- [ ] Report issues
- [ ] Add issue comments
- [ ] Create supply requests
- [ ] View documents
- [ ] Upload photos/videos
- [ ] Logout successfully

## Data Persistence Testing
- [ ] Create data and restart app - data persists
- [ ] Logout and login - correct data loads
- [ ] Switch roles - correct data filters apply
- [ ] Offline mode - data accessible
- [ ] Data sync after reconnection

## Navigation Testing
- [ ] All tab navigation works
- [ ] Back button behavior correct
- [ ] Deep linking works (if implemented)
- [ ] Modal presentations work
- [ ] Navigation after logout redirects to login

## Form Validation Testing
- [ ] Empty fields show validation errors
- [ ] Invalid email formats rejected
- [ ] Date pickers work correctly
- [ ] File uploads work
- [ ] Photo uploads work
- [ ] Required fields enforced

## UI/UX Testing
- [ ] All buttons have proper contrast
- [ ] Loading states display correctly
- [ ] Empty states are user-friendly
- [ ] Success messages appear
- [ ] Error messages are clear
- [ ] Haptic feedback works
- [ ] Animations are smooth
- [ ] No UI elements hidden by tab bar

## Performance Testing
- [ ] App launches quickly
- [ ] Lists scroll smoothly
- [ ] No memory leaks
- [ ] Images load efficiently
- [ ] No frame drops during animations

## Platform-Specific Testing

### iOS
- [ ] Safe area insets respected
- [ ] Native tabs work correctly
- [ ] Haptics work
- [ ] Status bar styling correct
- [ ] Keyboard behavior correct

### Android
- [ ] Top padding for notch
- [ ] Back button behavior
- [ ] Material icons display
- [ ] Permissions requested properly
- [ ] Keyboard behavior correct

## Edge Cases
- [ ] Very long text in fields
- [ ] Large number of items in lists
- [ ] Rapid button tapping
- [ ] Network interruption during action
- [ ] Low storage space
- [ ] Low battery mode
- [ ] Different screen sizes
- [ ] Landscape orientation

## Security Testing
- [ ] Sensitive data not logged
- [ ] Session expires appropriately
- [ ] Unauthorized access prevented
- [ ] Input sanitization works
- [ ] File upload restrictions enforced

## Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Sufficient color contrast
- [ ] Touch targets large enough
- [ ] Text scalability
- [ ] Keyboard navigation (web)
