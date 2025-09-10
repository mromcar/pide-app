export const notify = {
  success(msg: string) {
    (globalThis as any)?.toast?.success?.(msg) ?? console.info('✅', msg)
  },
  error(msg: string) {
    (globalThis as any)?.toast?.error?.(msg) ?? console.error('❌', msg)
  },
  info(msg: string) {
    (globalThis as any)?.toast?.info?.(msg) ?? console.log('ℹ️', msg)
  },
}
