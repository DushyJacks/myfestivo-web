# changes required for testing

## Browse events

- Resize the poster size to a 4:3 ratio from the already existing size (which is most likely 16:9).

## Host your event

- Add constraints for the event date and registration deadline. The dates/days past should not be available/shown for both ‘Event Date’ and ‘Registration Deadline’. The difference between the event date and the current date should be at least 2 days. Restrict the availability of the registration deadline between the current date and the event date.
- Remove the total seats. (cause we are giving total participants to each event)
- Inside Intra-College → add department filtering by the departments dropdown with options: Computer Science, Cyber Security, AI/ML, BCA
- Remove the 02A - Event Coordinators section at the top.
- In 03 - Sub events → move “Max Participants” below the Solo or Team. If the solo is selected, it should be “Max Participants”; if the Team is selected, it should be “Max Teams”
- In 03 - Sub events Rename “Coordinators” → “In-charges” for better understanding
- In 03 - Sub events → Coordinators will be assigned by simply typing the name or email. (These people must be in the friends list, so that if they just type a few characters, autofill should be enabled for them to click and add.)
- Add a toggle to Prize Money so that the host can add or not add the prize details. If it’s on, they can enter, and by default, it’s off.
- Change and simplify the coordinator’s dropdown list to “Host”, “Coordinators”, and “Volunteers” from “Head”, “Logistics”, “Finance”, “Comms”.

## Profile

- When visiting the profile, display only the information. Add the edit icon in the top right corner if users wish to edit details.
- Department → Add a dropdown menu with the department’s name, just like mentioned before in the intra-events. Options are Computer Science, Cyber Security, AI/ML, BCA.
- Keep the college email verification as not required/mandatory to participate in intra-college events.

## Inside an event

- Chat → Restrict chat access for the In-charges and the participants. 
(The host can access all chats; In-charges and participants have only the general and their event chat)
- Task → Make the description not optional; replace ‘add’ with ‘assign’.
- Task → Only the person who was assigned a task should be able to change the progress of a task.
- Task → Increase the size of the “In-progress” button & “Done” button. Change the background colour of “To-do” to red, “In-progress” to yellow, and “Done” to green.
- Task → On date selection (add text “Deadline”)
- Task → Also add the column (like a chat window) called “Work Update” To post the completed work that is assigned/not assigned.

## Dashboard

- Move the Friends tab to the menu between the Host Event and Profile from the Dashboard.

## Host side changes

- Change the Registration Open button inside the Edit Events tab.
- Edit options are only available to the event creator.

## Check & test these things:

Inside an event → Automation:

- Check if the Registration confirmation and 24hr Reminder is working.
- In Manual push notifications, split the message content into an email subject and body.

**Very Important things to check and consider:**

- Rate limit - Add a rate limit on all public endpoints (IP, user-based, sensible defaults, graceful 429s)(Max 5 attempts per 15 mins on login routes)
- Strict Input Validation & Sanitization - Strict Input checks on all user inputs (schema based, type checks, length limits, reject unexpected fields).
- Secure API key handling - Move the keys to env variables, remove hard-coded keys, ensure no keys are exposed to client-side.
- Follow OWASP best practices, include clear comments and not break existing functionality.
- Check for Authorization token expiry and keep the access token to 1 Day and Refresh to 7 days.

## General Important Changes

- Platform/site is quite slow and laggy
- The site may look good on the desktop version. But on mobile web, it's not optimised. It's very shabby, laggy and buggy. Make it mobile-first and friendly. 
- Change the UI. It’s so dull and dark. Include Light and Dark options. Make it simple but visually attractive with a few colours. Improve the overall performance of the site and make it SEO-friendly.
- Make the site user-friendly and accessible. It shouldn’t be too hard to navigate and understand the site.