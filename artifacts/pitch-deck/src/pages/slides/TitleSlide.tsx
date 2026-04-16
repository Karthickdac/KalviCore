const base = import.meta.env.BASE_URL;

export default function TitleSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <img
        src={`${base}hero-campus.png`}
        crossOrigin="anonymous"
        alt="College campus"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,61,54,0.92) 0%, rgba(13,148,136,0.78) 50%, rgba(10,61,54,0.88) 100%)" }} />

      <div className="absolute top-[5vh] right-[5vw]">
        <img
          src={`${base}automystics-logo.png`}
          crossOrigin="anonymous"
          alt="AutoMystics logo"
          className="h-[8vh] w-auto object-contain"
        />
      </div>

      <div className="absolute top-[6vh] left-[6vw] flex items-center gap-[1vw]">
        <div className="w-[3vw] h-[0.35vh] bg-warm rounded-full" />
        <span className="font-display text-[1.4vw] font-medium text-teal-light tracking-widest uppercase">Introducing</span>
      </div>

      <div className="absolute left-[6vw] top-[22vh] max-w-[55vw]">
        <h1 className="font-display text-[7vw] font-extrabold text-white leading-[0.9] tracking-tighter">
          KalviCore
        </h1>
        <div className="mt-[3vh] flex items-center gap-[1.5vw]">
          <div className="w-[5vw] h-[0.4vh] bg-warm rounded-full" />
          <p className="font-body text-[2.2vw] font-semibold text-teal-light leading-tight">
            Complete Campus.
          </p>
        </div>
        <p className="font-body text-[2.2vw] font-semibold text-teal-light leading-tight ml-[6.5vw]">
          One Intelligent System.
        </p>
        <p className="mt-[5vh] font-body text-[1.5vw] text-teal-light/80 max-w-[40vw] leading-relaxed">
          A comprehensive college management platform purpose-built for Arts and Science institutions in Tamil Nadu.
        </p>
      </div>

      <div className="absolute bottom-[6vh] left-[6vw] flex items-center gap-[2vw]">
        <span className="font-display text-[1.3vw] font-medium text-white/60">Affiliated to</span>
        <span className="font-display text-[1.4vw] font-semibold text-warm">Madurai Kamaraj University</span>
      </div>

      <div className="absolute right-[4vw] bottom-[4vh]">
        <div className="w-[12vw] h-[12vw] rounded-full border border-white/10" />
        <div className="absolute top-[2vw] left-[2vw] w-[8vw] h-[8vw] rounded-full border border-white/5" />
      </div>
    </div>
  );
}
