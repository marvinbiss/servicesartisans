/**
 * Local stub provider for promptfoo.
 *
 * Returns `vars.expected_answer` verbatim. The point of this provider is to
 * exercise the eval *infrastructure* (JSONL parsing, asserter dispatch,
 * GitHub Actions wiring) without making any live LLM call. When the Ralph 4
 * follow-up wires real HTTP calls via `LLMProvider.complete()`, swap this
 * stub for `file://scripts/llm-provider-bridge.mjs` and observe what
 * actually passes.
 *
 * Promptfoo provider contract:
 *   export default async function call({ prompt, vars }) -> { output, ... }
 *
 * @see https://www.promptfoo.dev/docs/providers/custom-script/
 */

export default async function localStub(context) {
  const vars = context?.vars ?? {}
  const expected = vars.expected_answer
  return {
    output: expected !== undefined && expected !== null ? String(expected) : 'INCONNU',
    tokenUsage: {
      total: Math.ceil(String(context?.prompt ?? '').length / 4),
    },
  }
}
