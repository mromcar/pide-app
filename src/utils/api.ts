export function jsonOk(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status })
}
export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), { status })
}
