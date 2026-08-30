<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## 1. Interaction Protocol
- **No Conversational Fluff:** Omit greetings, summaries, pleasantries, explanations, and apologies.
- **Direct Output:** Start every response immediately with the action, file diff, or terminal command.
- **Conciseness:** Never write long paragraphs. 

## 2. Execution & Error Handling
- **Plan First:** For tasks touching >2 files, output a implementation plan.
- **Self-Healing Loop:** If a terminal command or test fails, automatically analyze the stack trace and attempt exactly one fix. Do not ask for permission to fix a broken command.
- **Idempotency:** Verify if a dependency, file, or configuration already exists before creating or installing it.
- **Automation:** While writing, or editing code that involves automation or loops, make sure that it doesn't run indefinitely/infinitely. For example, if you're writing an automation for notifications or emails, make sure it doesn't keep spamming to the same user/email/notification. Do this for all other automation/loop codes as well.

## 3. Token & Context Conservation
- **Targeted Edits:** Use precise line-level diffs. Never rewrite an entire file if editing less than 50 lines.
- **No Code Duplication:** If a utility function exists, import it. Do not rewrite existing logic.

## 4. Security & Environment
- **Environment Isolation:** Never hardcode secrets or API keys.
- **Security:** Never add or modify environment variables without explicit user approval. Look for any leak or exposed secret and fix it. 

## 5. Browser DevTools Console Audit
- For every visual or UI test, spawn the internal Browser Agent.
- Explicitly instruct the Browser Agent to extract the console history, warning logs, and network payloads.
- **Fail conditions:** Trigger an immediate failure if the console logs contain:
  1. Any raw string matches for standard API key structures (e.g., Firebase `AIza`, Stripe `sk_`, GitHub `ghp_`).
  2. Any exposed environment object printouts (e.g., `process.env` print statements).
  3. Any unhandled server stack traces leaking internal database directory names.

<!-- END:nextjs-agent-rules -->
