import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before imports so hoisting works
// ---------------------------------------------------------------------------

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  listPortfolioItems,
  getPortfolioItem,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
  type PortfolioCreateInput,
  type PortfolioUpdateInput,
} from '@/lib/services/portfolio-service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockQueryBuilder(finalResult: Record<string, unknown> = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainable = (name: string) => {
    builder[name] = vi.fn().mockReturnValue(builder)
  }
  ;[
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'in',
    'is',
    'order',
    'range',
    'limit',
    'single',
    'maybeSingle',
  ].forEach(chainable)

  // Terminal methods return the final result
  builder.single = vi.fn().mockResolvedValue(finalResult)
  builder.maybeSingle = vi.fn().mockResolvedValue(finalResult)

  // Make builder thenable so await on chained .eq() works
  builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
    resolve(finalResult)
    return Promise.resolve(finalResult)
  })

  return builder
}

function createMockSupabase() {
  const fromMock = vi.fn()
  return { from: fromMock, _from: fromMock }
}

const ARTISAN_ID = 'artisan-uuid-001'
const ITEM_ID = 'item-uuid-001'

function makeCreateInput(overrides: Partial<PortfolioCreateInput> = {}): PortfolioCreateInput {
  return {
    title: 'Renovation cuisine',
    description: 'Belle cuisine moderne',
    image_url: 'https://example.com/img.jpg',
    media_type: 'image',
    is_featured: false,
    is_visible: true,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// listPortfolioItems
// ===========================================================================

describe('listPortfolioItems', () => {
  it('returns items with pagination', async () => {
    const items = [
      { id: '1', title: 'A' },
      { id: '2', title: 'B' },
    ]
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: items, error: null, count: 2 })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await listPortfolioItems(supabase as never, {
      artisanId: ARTISAN_ID,
      limit: 10,
      offset: 0,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toEqual(items)
      expect(result.data.total).toBe(2)
      expect(result.data.limit).toBe(10)
      expect(result.data.offset).toBe(0)
    }
  })

  it('returns empty array when no items', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await listPortfolioItems(supabase as never, {
      artisanId: ARTISAN_ID,
      limit: 10,
      offset: 0,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toEqual([])
      expect(result.data.total).toBe(0)
    }
  })

  it('handles pagination with offset', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [{ id: '3' }], error: null, count: 15 })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await listPortfolioItems(supabase as never, {
      artisanId: ARTISAN_ID,
      limit: 5,
      offset: 10,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.total).toBe(15)
      expect(result.data.offset).toBe(10)
      expect(result.data.limit).toBe(5)
    }
    expect(builder.range).toHaveBeenCalledWith(10, 14)
  })

  it('filters by mediaType when provided', async () => {
    const builder = createMockQueryBuilder()
    // range returns builder (chainable), then .eq('media_type') is called after
    builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      const result = { data: [], error: null, count: 0 }
      resolve(result)
      return Promise.resolve(result)
    })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    await listPortfolioItems(supabase as never, {
      artisanId: ARTISAN_ID,
      mediaType: 'video',
      limit: 10,
      offset: 0,
    })

    // eq called for artisan_id and media_type
    expect(builder.eq).toHaveBeenCalledWith('artisan_id', ARTISAN_ID)
    expect(builder.eq).toHaveBeenCalledWith('media_type', 'video')
  })

  it('filters by category when provided', async () => {
    const builder = createMockQueryBuilder()
    builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      const result = { data: [], error: null, count: 0 }
      resolve(result)
      return Promise.resolve(result)
    })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    await listPortfolioItems(supabase as never, {
      artisanId: ARTISAN_ID,
      category: 'cuisine',
      limit: 10,
      offset: 0,
    })

    expect(builder.eq).toHaveBeenCalledWith('category', 'cuisine')
  })

  it('returns error on DB failure', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' }, count: null })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await listPortfolioItems(supabase as never, {
      artisanId: ARTISAN_ID,
      limit: 10,
      offset: 0,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// getPortfolioItem
// ===========================================================================

describe('getPortfolioItem', () => {
  it('returns item when found', async () => {
    const item = { id: ITEM_ID, title: 'Test', artisan_id: ARTISAN_ID }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: item, error: null })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await getPortfolioItem(supabase as never, ITEM_ID, ARTISAN_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(item)
    }
  })

  it('returns 404 when item not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await getPortfolioItem(supabase as never, 'non-existent', ARTISAN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })

  it('returns 404 when wrong artisan_id (ownership check)', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    const supabase = createMockSupabase()
    supabase.from.mockReturnValue(builder)

    const result = await getPortfolioItem(supabase as never, ITEM_ID, 'wrong-artisan')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
      expect(result.error).toContain('non trouvé')
    }
  })
})

// ===========================================================================
// createPortfolioItem
// ===========================================================================

describe('createPortfolioItem', () => {
  it('creates item successfully with next display_order', async () => {
    const createdItem = { id: 'new-id', title: 'Renovation cuisine', display_order: 4 }
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      if (table === 'portfolio_items') {
        callIndex++
        if (callIndex === 1) {
          // Get highest display_order
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: { display_order: 3 }, error: null })
          return b
        }
        if (callIndex === 2) {
          // Insert
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: createdItem, error: null })
          return b
        }
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createPortfolioItem(supabase as never, ARTISAN_ID, makeCreateInput())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(createdItem)
    }
  })

  it('returns error on DB insert failure', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      if (table === 'portfolio_items') {
        callIndex++
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: null, error: null })
          return b
        }
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } })
          return b
        }
      }
      return createMockQueryBuilder()
    })

    const result = await createPortfolioItem(supabase as never, ARTISAN_ID, makeCreateInput())

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })

  it('sets display_order to 1 when no existing items', async () => {
    let insertedData: Record<string, unknown> | null = null
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      if (table === 'portfolio_items') {
        callIndex++
        if (callIndex === 1) {
          // No existing items
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
          return b
        }
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.insert = vi.fn().mockImplementation((data: Record<string, unknown>) => {
            insertedData = data
            return b
          })
          b.single = vi
            .fn()
            .mockResolvedValue({ data: { id: 'new', display_order: 1 }, error: null })
          return b
        }
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    await createPortfolioItem(supabase as never, ARTISAN_ID, makeCreateInput())

    expect(insertedData).not.toBeNull()

    expect(insertedData!.display_order).toBe(1)
  })
})

// ===========================================================================
// updatePortfolioItem
// ===========================================================================

describe('updatePortfolioItem', () => {
  it('updates item successfully', async () => {
    const updatedItem = { id: ITEM_ID, title: 'Updated title' }
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      if (table === 'portfolio_items') {
        callIndex++
        if (callIndex === 1) {
          // Verify ownership
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: { id: ITEM_ID }, error: null })
          return b
        }
        if (callIndex === 2) {
          // Update
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: updatedItem, error: null })
          return b
        }
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const input: PortfolioUpdateInput = { title: 'Updated title' }
    const result = await updatePortfolioItem(supabase as never, ITEM_ID, ARTISAN_ID, input)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(updatedItem)
    }
  })

  it('returns 404 when item not found for update', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    supabase.from.mockReturnValue(builder)

    const result = await updatePortfolioItem(supabase as never, 'non-existent', ARTISAN_ID, {
      title: 'X',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })
})

// ===========================================================================
// deletePortfolioItem
// ===========================================================================

describe('deletePortfolioItem', () => {
  it('deletes item successfully', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      if (table === 'portfolio_items') {
        callIndex++
        if (callIndex === 1) {
          // Verify ownership
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: { id: ITEM_ID }, error: null })
          return b
        }
        if (callIndex === 2) {
          // Delete — .delete().eq('id').eq('artisan_id') needs chaining then await
          const b = createMockQueryBuilder()
          b.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
            const result = { error: null }
            resolve(result)
            return Promise.resolve(result)
          })
          return b
        }
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await deletePortfolioItem(supabase as never, ITEM_ID, ARTISAN_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toContain('supprimé')
    }
  })

  it('returns 404 when item not found for delete', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    supabase.from.mockReturnValue(builder)

    const result = await deletePortfolioItem(supabase as never, 'non-existent', ARTISAN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })

  it('returns error when delete DB operation fails', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      if (table === 'portfolio_items') {
        callIndex++
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: { id: ITEM_ID }, error: null })
          return b
        }
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
            const result = { error: { message: 'FK constraint' } }
            resolve(result)
            return Promise.resolve(result)
          })
          return b
        }
      }
      return createMockQueryBuilder()
    })

    const result = await deletePortfolioItem(supabase as never, ITEM_ID, ARTISAN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// reorderPortfolioItems
// ===========================================================================

describe('reorderPortfolioItems', () => {
  it('reorders items successfully', async () => {
    const reorderItems = [
      { id: 'a', display_order: 1 },
      { id: 'b', display_order: 2 },
    ]
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        // Verify ownership — in() query
        const b = createMockQueryBuilder()
        b.in = vi.fn().mockResolvedValue({ data: [{ id: 'a' }, { id: 'b' }], error: null })
        return b
      }
      // Individual updates — .eq('id').eq('artisan_id') (re-filtre ownership)
      const b = createMockQueryBuilder()
      b.eq = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
      return b
    })

    const result = await reorderPortfolioItems(supabase as never, ARTISAN_ID, reorderItems)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toContain('mis à jour')
    }
  })

  it('returns 403 when some items do not belong to artisan', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    // Only 'a' belongs to artisan, 'b' does not
    builder.in = vi.fn().mockResolvedValue({ data: [{ id: 'a' }], error: null })
    supabase.from.mockReturnValue(builder)

    const result = await reorderPortfolioItems(supabase as never, ARTISAN_ID, [
      { id: 'a', display_order: 1 },
      { id: 'b', display_order: 2 },
    ])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(403)
    }
  })

  it('returns error when verification query fails', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.in = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    supabase.from.mockReturnValue(builder)

    const result = await reorderPortfolioItems(supabase as never, ARTISAN_ID, [
      { id: 'a', display_order: 1 },
    ])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})
