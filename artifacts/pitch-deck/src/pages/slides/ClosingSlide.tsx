const base = import.meta.env.BASE_URL;

export default function ClosingSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <img
        src={`${base}hero-campus.png`}
        crossOrigin="anonymous"
        alt="Campus background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,61,54,0.94) 0%, rgba(13,148,136,0.85) 50%, rgba(10,61,54,0.92) 100%)" }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="w-[5vw] h-[0.35vh] bg-warm rounded-full mb-[3vh]" />
        <h2 className="font-display text-[6vw] font-extrabold text-white leading-[0.95] tracking-tighter">
          KalviCore
        </h2>
        <p className="mt-[2vh] font-body text-[2.2vw] font-semibold text-warm leading-tight">
          Complete Campus. One Intelligent System.
        </p>
        <p className="mt-[4vh] font-body text-[1.5vw] text-teal-light/70 max-w-[45vw] leading-relaxed">
          Ready to transform how your institution operates. From admissions to alumni, every process unified in one platform.
        </p>

        <div className="mt-[6vh] flex items-center gap-[3vw]">
          <div className="text-center">
            <p className="font-display text-[1.3vw] font-semibold text-white/60 uppercase tracking-wider">Affiliation</p>
            <p className="font-display text-[1.5vw] font-bold text-warm mt-[0.5vh]">Madurai Kamaraj University</p>
          </div>
          <div className="w-[0.15vw] h-[5vh] bg-white/15 rounded-full" />
          <div className="text-center">
            <p className="font-display text-[1.3vw] font-semibold text-white/60 uppercase tracking-wider">Region</p>
            <p className="font-display text-[1.5vw] font-bold text-warm mt-[0.5vh]">Tamil Nadu, India</p>
          </div>
          <div className="w-[0.15vw] h-[5vh] bg-white/15 rounded-full" />
          <div className="text-center">
            <p className="font-display text-[1.3vw] font-semibold text-white/60 uppercase tracking-wider">Built By</p>
            <p className="font-display text-[1.5vw] font-bold text-warm mt-[0.5vh]">AutoMystics</p>
          </div>
        </div>
      </div>

      <div className="absolute top-[5vh] left-[5vw]">
        <div className="w-[8vw] h-[8vw] rounded-full border border-white/[0.06]" />
      </div>
      <div className="absolute bottom-[3vh] right-[5vw]">
        <div className="w-[10vw] h-[10vw] rounded-full border border-white/[0.06]" />
      </div>
    </div>
  );
}
