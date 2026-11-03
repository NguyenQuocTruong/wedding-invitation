<script setup lang="ts">
import type { WeddingActivity } from '../../config/preview'
defineProps<{ events: WeddingActivity[] }>()
</script>
<template>
  <section
    id="timeline"
    class="wedding-timeline"
    aria-labelledby="timeline-title"
    data-reveal
  >
    <header>
      <p class="timeline-eyebrow">WEDDING TIMELINE</p>
      <h2 id="timeline-title">Lịch trình ngày cưới</h2>
      <p class="timeline-date">{{ events[0]?.dateLabel }}</p>
    </header>
    <ol class="timeline-list">
      <li v-for="activity in events" :key="activity.id" class="timeline-event">
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-card">
          <svg
            v-if="activity.id === 'meal'"
            class="timeline-icon"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M8 6v11m5-11v11m5-11v11M8 13h10m-10 4c0 7 10 7 10 0m-5 6v19M35 6c-7 5-9 15-2 18h4V6h-2Zm2 18v18"
            />
          </svg>
          <svg
            v-else
            class="timeline-icon"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="28" r="12" />
            <circle cx="31" cy="28" r="12" />
            <path d="m25 9 4-5h6l4 5-7 7-7-7Zm0 0h14M13 11l4-5 5 5-5 5-4-5Z" />
          </svg>
          <div>
            <time :datetime="activity.dateTime">{{ activity.time }}</time>
            <h3>{{ activity.title }}</h3>
          </div>
        </div>
      </li>
    </ol>
    <p v-if="events[0]" class="timeline-venue">
      {{ events[0].venue }}<br /><span>{{ events[0].address }}</span>
    </p>
  </section>
</template>
<style scoped>
.wedding-timeline {
  max-width: 720px;
  margin: 0 auto;
  padding: 72px 24px 64px;
  color: #465640;
  background: #fafbf7;
  text-align: center;
  font-family: Georgia, 'Times New Roman', serif;
}
.wedding-timeline header {
  margin-bottom: 44px;
}
.wedding-timeline .timeline-eyebrow {
  margin: 0 0 12px;
  color: #819474;
  font:
    11px/1.5 system-ui,
    sans-serif;
  letter-spacing: 0.2em;
}
.wedding-timeline h2 {
  margin: 0;
  font-size: clamp(24px, 5vw, 34px);
  font-weight: 400;
  line-height: 1.3;
}
.wedding-timeline .timeline-date {
  margin: 12px 0 0;
  color: #747c6f;
  font-size: 13px;
}
.timeline-list {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}
.timeline-list::before {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 50%;
  width: 1px;
  background: #bfc9b8;
}
.timeline-event {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 142px;
  width: 100%;
}
.timeline-dot {
  position: absolute;
  left: calc(50% - 3px);
  top: calc(50% - 3px);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid #8b9c7f;
  background: #fafbf7;
}
.timeline-card {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  width: calc(50% - 24px);
  text-align: right;
}
.timeline-card time {
  display: block;
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}
.timeline-card h3 {
  margin: 6px 0 0;
  color: #565d50;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}
.timeline-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}
.timeline-event:nth-child(even) {
  justify-content: flex-end;
}
.timeline-event:nth-child(even) .timeline-card {
  flex-direction: row-reverse;
  text-align: left;
}
.timeline-venue {
  margin: 36px 0 0;
  font-size: 15px;
  line-height: 1.8;
}
.timeline-venue span {
  color: #7b8274;
  font-size: 12px;
}
@media (max-width: 479px) {
  .wedding-timeline {
    padding: 56px 20px;
  }
  .timeline-card {
    flex-direction: column;
    gap: 12px;
    width: calc(50% - 20px);
    text-align: center;
  }
  .timeline-event:nth-child(even) .timeline-card {
    flex-direction: column;
    text-align: center;
  }
  .timeline-card h3 {
    font-size: 15px;
  }
  .timeline-icon {
    width: 36px;
    height: 36px;
  }
  .timeline-event {
    min-height: 160px;
  }
}
</style>
