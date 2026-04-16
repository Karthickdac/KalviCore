export default function DifferentiatorsSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "linear-gradient(180deg, #0a3d36 0%, #0d4f45 50%, #065f46 100%)" }}>
      <div className="absolute top-[1vh] right-[8vw] w-[25vw] h-[25vw] rounded-full border border-white/[0.03]" />
      <div className="absolute bottom-[-5vh] left-[3vw] w-[20vw] h-[20vw] rounded-full border border-white/[0.03]" />

      <div className="absolute top-[7vh] left-[6vw]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[3vw] h-[0.35vh] bg-warm rounded-full" />
          <span className="font-display text-[1.2vw] font-semibold text-warm tracking-widest uppercase">Why KalviCore</span>
        </div>
        <h2 className="font-display text-[4vw] font-extrabold text-white leading-[1.05] tracking-tight">
          Built Different
        </h2>
      </div>

      <div className="absolute top-[32vh] left-[6vw] right-[6vw] flex gap-[3vw]">
        <div className="flex-1">
          <div className="w-[4vw] h-[0.35vh] bg-warm rounded-full mb-[2vh]" />
          <h3 className="font-display text-[1.8vw] font-bold text-white mb-[1.5vh]">Tamil Nadu First</h3>
          <p className="font-body text-[1.3vw] text-teal-light/70 leading-relaxed">Purpose-built for the MKU affiliation model, semester patterns, and regulatory requirements of TN colleges.</p>
        </div>

        <div className="flex-1">
          <div className="w-[4vw] h-[0.35vh] bg-warm rounded-full mb-[2vh]" />
          <h3 className="font-display text-[1.8vw] font-bold text-white mb-[1.5vh]">Granular RBAC</h3>
          <p className="font-body text-[1.3vw] text-teal-light/70 leading-relaxed">30+ fine-grained permissions across Admin, Principal, HOD, Faculty, Staff, and Student roles.</p>
        </div>
      </div>

      <div className="absolute top-[62vh] left-[6vw] right-[6vw] flex gap-[3vw]">
        <div className="flex-1">
          <div className="w-[4vw] h-[0.35vh] bg-warm rounded-full mb-[2vh]" />
          <h3 className="font-display text-[1.8vw] font-bold text-white mb-[1.5vh]">Zero Fragmentation</h3>
          <p className="font-body text-[1.3vw] text-teal-light/70 leading-relaxed">One login, one database, one interface. No switching between apps for attendance, fees, or exams.</p>
        </div>

        <div className="flex-1">
          <div className="w-[4vw] h-[0.35vh] bg-warm rounded-full mb-[2vh]" />
          <h3 className="font-display text-[1.8vw] font-bold text-white mb-[1.5vh]">Instant Documents</h3>
          <p className="font-body text-[1.3vw] text-teal-light/70 leading-relaxed">Auto-generated hall tickets, certificates, ID cards, and mark statements. Print or export in seconds.</p>
        </div>
      </div>
    </div>
  );
}
