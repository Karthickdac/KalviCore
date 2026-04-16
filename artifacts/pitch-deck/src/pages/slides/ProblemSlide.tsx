export default function ProblemSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "linear-gradient(160deg, #f7faf9 0%, #e6f5f0 100%)" }}>
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] rounded-bl-[20vw]" style={{ background: "linear-gradient(180deg, rgba(13,148,136,0.06) 0%, transparent 100%)" }} />
      <div className="absolute bottom-0 left-0 w-[25vw] h-[25vh] rounded-tr-[12vw]" style={{ background: "linear-gradient(0deg, rgba(13,148,136,0.04) 0%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[6vw]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[3vw] h-[0.35vh] bg-primary rounded-full" />
          <span className="font-display text-[1.2vw] font-semibold text-primary tracking-widest uppercase">The Challenge</span>
        </div>
        <h2 className="font-display text-[4.5vw] font-extrabold text-teal-dark leading-[1] tracking-tight">
          Campus Management
        </h2>
        <h2 className="font-display text-[4.5vw] font-extrabold text-primary leading-[1] tracking-tight">
          Is Broken
        </h2>
      </div>

      <div className="absolute top-[42vh] left-[6vw] right-[6vw] flex gap-[2.5vw]">
        <div className="flex-1 bg-white rounded-[1vw] p-[2.5vw] shadow-sm border border-primary/10">
          <div className="w-[3vw] h-[3vw] rounded-full bg-red-50 flex items-center justify-center mb-[2vh]">
            <span className="font-display text-[1.5vw] font-bold text-red-500">1</span>
          </div>
          <h3 className="font-display text-[1.6vw] font-bold text-teal-dark mb-[1vh]">Fragmented Systems</h3>
          <p className="font-body text-[1.3vw] text-muted leading-relaxed">Attendance in one app, fees in another, exams on paper. Data silos waste hours daily.</p>
        </div>

        <div className="flex-1 bg-white rounded-[1vw] p-[2.5vw] shadow-sm border border-primary/10">
          <div className="w-[3vw] h-[3vw] rounded-full bg-amber-50 flex items-center justify-center mb-[2vh]">
            <span className="font-display text-[1.5vw] font-bold text-amber-500">2</span>
          </div>
          <h3 className="font-display text-[1.6vw] font-bold text-teal-dark mb-[1vh]">Manual Processes</h3>
          <p className="font-body text-[1.3vw] text-muted leading-relaxed">Hall tickets, certificates, and mark statements generated manually, consuming weeks per semester.</p>
        </div>

        <div className="flex-1 bg-white rounded-[1vw] p-[2.5vw] shadow-sm border border-primary/10">
          <div className="w-[3vw] h-[3vw] rounded-full bg-primary/10 flex items-center justify-center mb-[2vh]">
            <span className="font-display text-[1.5vw] font-bold text-primary">3</span>
          </div>
          <h3 className="font-display text-[1.6vw] font-bold text-teal-dark mb-[1vh]">Zero Visibility</h3>
          <p className="font-body text-[1.3vw] text-muted leading-relaxed">Principals and HODs lack real-time dashboards. Decisions are made on outdated data.</p>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[6vw]">
        <p className="font-body text-[1.4vw] text-muted italic">Most colleges still run on spreadsheets, registers, and disconnected tools.</p>
      </div>
    </div>
  );
}
