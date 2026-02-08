/**
 * Import Job Tracker
 * Tracks progress of collection and enrichment jobs in import_jobs table
 * Supports pause/resume via cursor-based checkpointing
 */

import { supabase } from './supabase-admin'

export interface JobProgress {
  totalItems: number
  processedItems: number
  createdItems: number
  updatedItems: number
  skippedItems: number
  errorItems: number
}

export class JobTracker {
  private jobId: string | null = null
  private progress: JobProgress = {
    totalItems: 0,
    processedItems: 0,
    createdItems: 0,
    updatedItems: 0,
    skippedItems: 0,
    errorItems: 0,
  }

  constructor(
    private readonly jobType: string,
    private readonly params: Record<string, unknown> = {}
  ) {}

  /**
   * Start a new job or resume an existing one
   */
  async start(): Promise<{ resumed: boolean; cursor: string | null; params: Record<string, unknown> }> {
    // Check for an existing paused/running job of same type
    const { data: existingJob } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('job_type', this.jobType)
      .in('status', ['running', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingJob) {
      this.jobId = existingJob.id
      this.progress = {
        totalItems: existingJob.total_items || 0,
        processedItems: existingJob.processed_items || 0,
        createdItems: existingJob.created_items || 0,
        updatedItems: existingJob.updated_items || 0,
        skippedItems: existingJob.skipped_items || 0,
        errorItems: existingJob.error_items || 0,
      }

      // Mark as running
      await supabase
        .from('import_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', this.jobId)

      console.log(`Resuming job ${this.jobId} (${existingJob.processed_items}/${existingJob.total_items} processed)`)

      return {
        resumed: true,
        cursor: existingJob.last_cursor,
        params: existingJob.params || {},
      }
    }

    // Create new job
    const { data: newJob, error } = await supabase
      .from('import_jobs')
      .insert({
        job_type: this.jobType,
        status: 'running',
        params: this.params,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !newJob) {
      throw new Error(`Failed to create job: ${error?.message}`)
    }

    this.jobId = newJob.id
    console.log(`Started new job ${this.jobId}`)

    return { resumed: false, cursor: null, params: this.params }
  }

  /**
   * Update progress counters
   */
  async updateProgress(delta: Partial<JobProgress>, cursor?: string): Promise<void> {
    if (delta.totalItems !== undefined) this.progress.totalItems = delta.totalItems
    if (delta.processedItems) this.progress.processedItems += delta.processedItems
    if (delta.createdItems) this.progress.createdItems += delta.createdItems
    if (delta.updatedItems) this.progress.updatedItems += delta.updatedItems
    if (delta.skippedItems) this.progress.skippedItems += delta.skippedItems
    if (delta.errorItems) this.progress.errorItems += delta.errorItems

    const update: Record<string, unknown> = {
      total_items: this.progress.totalItems,
      processed_items: this.progress.processedItems,
      created_items: this.progress.createdItems,
      updated_items: this.progress.updatedItems,
      skipped_items: this.progress.skippedItems,
      error_items: this.progress.errorItems,
    }

    if (cursor) {
      update.last_cursor = cursor
    }

    if (this.jobId) {
      await supabase
        .from('import_jobs')
        .update(update)
        .eq('id', this.jobId)
    }
  }

  /**
   * Log an error
   */
  async logError(error: string, context?: Record<string, unknown>): Promise<void> {
    if (!this.jobId) return

    const { data: job } = await supabase
      .from('import_jobs')
      .select('error_log')
      .eq('id', this.jobId)
      .single()

    const errorLog = Array.isArray(job?.error_log) ? job.error_log : []
    errorLog.push({
      timestamp: new Date().toISOString(),
      error,
      ...context,
    })

    // Keep only last 100 errors
    const trimmedLog = errorLog.slice(-100)

    await supabase
      .from('import_jobs')
      .update({
        last_error: error,
        error_log: trimmedLog,
      })
      .eq('id', this.jobId)
  }

  /**
   * Mark job as paused (for graceful shutdown)
   */
  async pause(cursor: string): Promise<void> {
    if (!this.jobId) return

    await supabase
      .from('import_jobs')
      .update({
        status: 'paused',
        last_cursor: cursor,
        total_items: this.progress.totalItems,
        processed_items: this.progress.processedItems,
        created_items: this.progress.createdItems,
        updated_items: this.progress.updatedItems,
        skipped_items: this.progress.skippedItems,
        error_items: this.progress.errorItems,
      })
      .eq('id', this.jobId)

    console.log(`Job ${this.jobId} paused at cursor: ${cursor}`)
  }

  /**
   * Mark job as completed
   */
  async complete(): Promise<void> {
    if (!this.jobId) return

    await supabase
      .from('import_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_items: this.progress.totalItems,
        processed_items: this.progress.processedItems,
        created_items: this.progress.createdItems,
        updated_items: this.progress.updatedItems,
        skipped_items: this.progress.skippedItems,
        error_items: this.progress.errorItems,
      })
      .eq('id', this.jobId)

    console.log(`Job ${this.jobId} completed`)
  }

  /**
   * Mark job as failed
   */
  async fail(error: string): Promise<void> {
    if (!this.jobId) return

    await supabase
      .from('import_jobs')
      .update({
        status: 'failed',
        last_error: error,
        completed_at: new Date().toISOString(),
      })
      .eq('id', this.jobId)

    console.log(`Job ${this.jobId} failed: ${error}`)
  }

  getProgress(): JobProgress {
    return { ...this.progress }
  }

  getJobId(): string | null {
    return this.jobId
  }
}
