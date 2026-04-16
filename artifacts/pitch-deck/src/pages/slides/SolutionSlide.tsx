const base = import.meta.env.BASE_URL;

export default function SolutionSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex">
      <div className="w-[50vw] h-full relative" style={{ background: "linear-gradient(180deg, #0a3d36 0%, #065f46 100%)" }}>
        <div className="absolute top-[7vh] left-[5vw] max-w-[40vw]">
          <div className="flex items-center gap-[1vw] mb-[2vh]">
            <div className="w-[3vw] h-[0.35vh] bg-warm rounded-full" />
            <span className="font-display text-[1.2vw] font-semibold text-warm tracking-widest uppercase">The Solution</span>
          </div>
          <h2 className="font-display text-[4vw] font-extrabold text-white leading-[1.05] tracking-tight">
            One System,
          </h2>
          <h2 className="font-display text-[4vw] font-extrabold text-teal-light leading-[1.05] tracking-tight">
            Every Function
          </h2>
          <p className="mt-[4vh] font-body text-[1.5vw] text-teal-light/80 leading-relaxed max-w-[36vw]">
            KalviCore unifies 38+ modules into a single, role-based platform that covers academics, administration, finance, and campus operations.
          </p>
        </div>

        <div className="absolute bottom-[6vh] left-[5vw] right-[3vw] flex gap-[2vw]">
          <div className="flex-1">
            <p className="font-display text-[3.5vw] font-extrabold text-warm leading-none">38+</p>
            <p className="font-body text-[1.2vw] text-teal-light/70 mt-[0.5vh]">Integrated Modules</p>
          </div>
          <div className="flex-1">
            <p className="font-display text-[3.5vw] font-extrabold text-warm leading-none">6</p>
            <p className="font-body text-[1.2vw] text-teal-light/70 mt-[0.5vh]">User Roles</p>
          </div>
          <div className="flex-1">
            <p className="font-display text-[3.5vw] font-extrabold text-warm leading-none">30+</p>
            <p className="font-body text-[1.2vw] text-teal-light/70 mt-[0.5vh]">Permissions</p>
          </div>
        </div>
      </div>

      <div className="w-[50vw] h-full relative" style={{ background: "linear-gradient(160deg, #f7faf9 0%, #e6f5f0 100%)" }}>
        <div className="absolute inset-[3vh_3vw] rounded-[1.5vw] overflow-hidden shadow-xl border border-primary/10">
          <img
            src={`${base}dashboard-view.png`}
            crossOrigin="anonymous"
            alt="KalviCore Dashboard"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
