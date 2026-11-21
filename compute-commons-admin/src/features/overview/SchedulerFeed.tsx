import { schedulerEvents } from "../../mocks/dashboard"

export function SchedulerFeed() {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Scheduler activity</h2>
          <p>Recent decisions from the network scheduler</p>
        </div>
        <span className="live-label">LIVE</span>
      </div>

      <div className="event-list">
        {schedulerEvents.map((event) => (
          <div className="event" key={event.id}>
            <span className={`event-marker ${event.type}`} />

            <div className="event-content">
              <strong>{event.title}</strong>
              <span>{event.description}</span>
            </div>

            <time>{event.time}</time>
          </div>
        ))}
      </div>
    </section>
  )
}