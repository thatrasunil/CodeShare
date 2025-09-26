# TODO: Enhance Responsiveness and Real-time for Room Page

## Breakdown of Approved Plan

1. **Enhance Responsiveness in App.css**
   - Improve mobile layout: Stack main-layout vertically on small screens.
   - Make participants pane collapsible/hidden on mobile.
   - Adjust chat pane to be full-width on mobile when open.
   - Reduce padding and font sizes on small screens.
   - Ensure editor toolbar buttons are touch-friendly.

2. **Add Cursor Tracking in Editor.js**
   - Add state for cursors: Map of userId to cursor position.
   - Emit 'cursor-update' on editor cursor change with line, column.
   - Listen for 'cursor-update' from others and update state.
   - Use Monaco decorations to display other users' cursors as colored lines/indicators.

3. **Update Server.js for Cursor Tracking**
   - Add socket listener for 'cursor-update' and broadcast to room.

4. **Testing and Polish**
   - Test responsiveness on different screen sizes (desktop, tablet, mobile).
   - Test real-time features: code sync, chat, participants, cursor tracking.
   - Fix any layout issues or bugs.
   - Ensure animations work smoothly on mobile.

Progress:
- [x] Enhance Responsiveness in App.css
- [x] Add Cursor Tracking in Editor.js
- [x] Update Server.js for Cursor Tracking
- [ ] Testing and Polish
