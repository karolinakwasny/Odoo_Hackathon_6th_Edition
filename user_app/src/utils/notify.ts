export type NotifyTone = 'green' | 'yellow' | 'red'

export function notify(title: string, message: string, tone: NotifyTone = 'green') {
  window.dispatchEvent(new CustomEvent('compute-commons-notify', {
    detail: { title, message, tone },
  }))
}
