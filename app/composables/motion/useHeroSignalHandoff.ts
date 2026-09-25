// app/composables/motion/useHeroSignalHandoff.ts
//
// Module-level singleton bridging Hero's Signal exit to What We Build's
// entry (Milestone 4B), per 04-homepage-spec.md's "Designed Continuity,
// Not Arbitrary Proximity" handoff requirement: "Signal's exit position and
// What We Build's entry origin share a normalized alignment anchor — same
// 12-column key line, matching directional momentum, matching perceived
// position." This is a separate, purpose-built composable rather than
// reusing `useHeroHandoff` (that one carries the old word-disassembly
// effect's 3-landing-point/rotation shape for EditorialIntro/WhyPasti — a
// different mechanism this milestone must not disturb, since WhyPasti still
// consumes it unchanged).
//
// Hero publishes its Signal route's horizontal position once, expressed as
// a fraction of viewport width (not a raw pixel value — Hero and What We
// Build are different DOM subtrees at different scroll offsets, so a
// fixed-pixel handoff would go stale the moment either section's layout
// changes). What We Build reads it once at mount to align its own
// standby-Signal/curtain-origin to the same macro-grid key line.

const signalXFraction = ref<number | null>(null)

export function useHeroSignalHandoff() {
  function publishSignalX(xFraction: number) {
    signalXFraction.value = xFraction
  }

  return {
    signalXFraction: readonly(signalXFraction),
    publishSignalX
  }
}
