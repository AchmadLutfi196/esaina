export function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Top-left Bleu Ciel orb */}
      <div className="ambient-orb animate-float-slow -top-28 -left-28 h-[28rem] w-[28rem] bg-bleu-ciel/35 blur-[90px]" />

      {/* Top-right Butter Yellow warm glow */}
      <div className="ambient-orb animate-float-reverse top-1/4 -right-24 h-[24rem] w-[24rem] bg-butter-yellow/45 blur-[85px]" />

      {/* Center-bottom Bleu Ciel deep pool */}
      <div className="ambient-orb animate-float-reverse bottom-12 left-1/4 h-[32rem] w-[32rem] bg-bleu-ciel/30 blur-[100px]" />

      {/* Lower-right Orange Pastel warm accent */}
      <div className="ambient-orb animate-float-slow animate-pulse-subtle top-2/3 right-1/4 h-[22rem] w-[22rem] bg-orange-pastel/25 blur-[80px]" />
    </div>
  );
}
