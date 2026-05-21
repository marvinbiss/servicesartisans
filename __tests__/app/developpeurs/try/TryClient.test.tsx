// @vitest-environment jsdom
/**
 * Tests — `TryClient.tsx` (Ralph 40).
 *
 * Smoke-tests the Client Component with a synthetic spec so the harness
 * stays decoupled from the live OpenAPI const. Asserts:
 *  - endpoint dropdown rendered
 *  - switching endpoint resets the body textarea to the new bodySample
 *  - parameters form rendered with required marker
 *  - Send disabled state toggles around a mocked `fetch`
 *  - error banner surfaces buildRequest errors (missing required param)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { TryClient } from '@/app/(public)/developpeurs/try/TryClient'

const SPEC = {
  paths: {
    '/api/v1/ping': {
      get: {
        tags: ['Meta'],
        summary: 'Ping',
        parameters: [],
      },
    },
    '/api/v1/ask': {
      post: {
        tags: ['AI'],
        summary: 'Ask AnswerEngine',
        requestBody: {
          content: {
            'application/json': {
              example: { query: 'Hello' },
            },
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      },
    },
  },
}

describe('<TryClient>', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the endpoint select with one option per operation', () => {
    render(<TryClient spec={SPEC} />)
    const select = screen.getByLabelText(/endpoint/i) as HTMLSelectElement
    expect(select).toBeTruthy()
    // 3 operations from the synthetic spec.
    expect(select.options.length).toBe(3)
  })

  it('seeds the body textarea with bodySample when switching to a POST op', () => {
    render(<TryClient spec={SPEC} />)
    const select = screen.getByLabelText(/endpoint/i) as HTMLSelectElement
    // Find the option for the POST /ask operation
    const askOption = Array.from(select.options).find((o) => o.value.startsWith('post-'))
    if (!askOption) throw new Error('Expected a POST option')
    fireEvent.change(select, { target: { value: askOption.value } })
    const textarea = screen.getByLabelText(/body \(json\)/i) as HTMLTextAreaElement
    expect(textarea.value).toContain('"query"')
    expect(textarea.value).toContain('"Hello"')
  })

  it('renders a required path parameter input with "required" marker', () => {
    render(<TryClient spec={SPEC} />)
    const select = screen.getByLabelText(/endpoint/i) as HTMLSelectElement
    const userOption = Array.from(select.options).find((o) => o.value.includes('/users/'))
    if (!userOption) throw new Error('Expected /users/{id} option')
    fireEvent.change(select, { target: { value: userOption.value } })
    // The label for `id` should mention "required"
    expect(screen.getByText(/required/i)).toBeTruthy()
  })

  it('surfaces buildRequest error when a required param is missing', async () => {
    render(<TryClient spec={SPEC} />)
    const select = screen.getByLabelText(/endpoint/i) as HTMLSelectElement
    const userOption = Array.from(select.options).find((o) => o.value.includes('/users/'))
    if (!userOption) throw new Error('Expected /users/{id} option')
    fireEvent.change(select, { target: { value: userOption.value } })
    // Clear the param value (it auto-seeds to example which is undefined here, so it should
    // be empty; just press Send and expect the error)
    const idInput = screen.getByLabelText(/^id/i) as HTMLInputElement
    fireEvent.change(idInput, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/required parameter missing/i)
    })
  })

  it('disables the Send button while a request is in flight', async () => {
    let resolveFetch: ((value: Response) => void) | null = null
    const slowFetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        })
    )
    vi.stubGlobal('fetch', slowFetch)

    render(<TryClient spec={SPEC} />)
    const button = screen.getByRole('button', { name: /send/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(true)
    })

    const resolve = resolveFetch as ((value: Response) => void) | null
    if (!resolve) throw new Error('fetch never called')
    resolve(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }))

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(false)
    })
    expect(slowFetch).toHaveBeenCalledTimes(1)
  })
})
