<script setup lang="ts">
const petals = Array.from({ length: 12 }, (_, index) => ({
  kind: index % 3 === 0 ? 'peach' : 'rose',
  style: {
    '--petal-left': `${(index * 29 + 5) % 100}%`,
    '--petal-size': `${10 + (index % 4) * 3}px`,
    '--petal-duration': `${16 + (index % 5) * 2.5}s`,
    '--petal-delay': `${-index * 3.7}s`,
    '--petal-drift': `${index % 2 === 0 ? 70 : -90}px`,
    '--petal-turn': `${index % 2 === 0 ? 290 : -250}deg`,
  },
}))
</script>
<template>
  <div class="ambient-petals" aria-hidden="true">
    <span
      v-for="(petal, index) in petals"
      :key="index"
      :class="['falling-petal', 'falling-petal--' + petal.kind]"
      :style="petal.style"
    ></span>
  </div>
</template>
<style>
.ambient-petals {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
}
.falling-petal {
  position: absolute;
  top: -32px;
  left: var(--petal-left);
  width: var(--petal-size);
  height: calc(var(--petal-size) * 1.2);
  opacity: 0;
  background: radial-gradient(
    ellipse at 28% 20%,
    #ffe8ed 4%,
    #efa3b7 58%,
    #c97494 100%
  );
  border-radius: 55% 48% 60% 43%;
  clip-path: polygon(
    50% 10%,
    65% 1%,
    82% 3%,
    96% 18%,
    100% 38%,
    91% 63%,
    72% 85%,
    50% 100%,
    24% 82%,
    7% 59%,
    0 35%,
    5% 15%,
    22% 2%,
    37% 2%
  );
  animation: wedding-petal-fall var(--petal-duration) var(--petal-delay) linear
    infinite;
}
.falling-petal--peach {
  background: radial-gradient(
    ellipse at 30% 20%,
    #fff4f5 8%,
    #f5c6d0 60%,
    #e59bac 100%
  );
  border-radius: 55% 55% 45% 50%;
}
@keyframes wedding-petal-fall {
  0% {
    transform: translate3d(0, -30px, 0) rotate(0deg) rotateY(0deg);
    opacity: 0;
  }
  12% {
    opacity: 0.7;
  }
  45% {
    transform: translate3d(calc(var(--petal-drift) * -0.35), 45vh, 0)
      rotate(calc(var(--petal-turn) * 0.45)) rotateY(110deg);
    opacity: 0.55;
  }
  82% {
    opacity: 0.65;
  }
  100% {
    transform: translate3d(var(--petal-drift), 105vh, 0)
      rotate(var(--petal-turn)) rotateY(200deg);
    opacity: 0;
  }
}
.design-preview.motion-disabled .ambient-petals {
  display: none;
}
@media (max-width: 767px) {
  .falling-petal:nth-child(n + 9) {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ambient-petals {
    display: none;
  }
  .falling-petal {
    animation: none;
  }
}
</style>
