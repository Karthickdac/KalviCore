export default function SecuritySlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "linear-gradient(160deg, #f7faf9 0%, #e6f5f0 100%)" }}>
      <div className="absolute top-0 left-0 w-[50vw] h-[50vh] rounded-br-[25vw]" style={{ background: "linear-gradient(180deg, rgba(13,148,136,0.05) 0%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[6vw] max-w-[50vw]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[3vw] h-[0.35vh] bg-primary rounded-full" />
          <span className="font-display text-[1.2vw] font-semibold text-primary tracking-widest uppercase">Architecture</span>
        </div>
        <h2 className="font-display text-[4vw] font-extrabold text-teal-dark leading-[1.05] tracking-tight">
          Enterprise-Grade,
        </h2>
        <h2 className="font-display text-[4vw] font-extrabold text-primary leading-[1.05] tracking-tight">
          College-Ready
        </h2>
      </div>

      <div className="absolute top-[40vh] left-[6vw] right-[6vw] flex gap-[2vw]">
        <div className="flex-1 bg-white rounded-[1vw] p-[2vw] border border-primary/10 shadow-sm">
          <div className="flex items-center gap-[0.8vw] mb-[1.5vh]">
            <div className="w-[2.5vw] h-[2.5vw] rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-display text-[1.2vw] font-bold text-primary">R</span>
            </div>
            <h3 className="font-display text-[1.5vw] font-bold text-teal-dark">React + Vite</h3>
          </div>
          <p className="font-body text-[1.2vw] text-muted leading-relaxed">Fast, modern SPA with instant navigation and responsive design across all devices.</p>
        </div>

        <div className="flex-1 bg-white rounded-[1vw] p-[2vw] border border-primary/10 shadow-sm">
          <div className="flex items-center gap-[0.8vw] mb-[1.5vh]">
            <div className="w-[2.5vw] h-[2.5vw] rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-display text-[1.2vw] font-bold text-primary">E</span>
            </div>
            <h3 className="font-display text-[1.5vw] font-bold text-teal-dark">Express + PostgreSQL</h3>
          </div>
          <p className="font-body text-[1.2vw] text-muted leading-relaxed">Robust REST API with Drizzle ORM, JWT authentication, and session-safe database operations.</p>
        </div>

        <div className="flex-1 bg-white rounded-[1vw] p-[2vw] border border-primary/10 shadow-sm">
          <div className="flex items-center gap-[0.8vw] mb-[1.5vh]">
            <div className="w-[2.5vw] h-[2.5vw] rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-display text-[1.2vw] font-bold text-primary">S</span>
            </div>
            <h3 className="font-display text-[1.5vw] font-bold text-teal-dark">Secure by Default</h3>
          </div>
          <p className="font-body text-[1.2vw] text-muted leading-relaxed">Role-based access control, permission caching, audit logs, and encrypted credentials throughout.</p>
        </div>
      </div>

      <div className="absolute bottom-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <div className="flex items-center gap-[1.5vw]">
          <div className="h-[0.3vh] w-[2vw] bg-primary/30 rounded-full" />
          <span className="font-display text-[1.3vw] font-medium text-muted">Razorpay Integration</span>
          <div className="h-[0.3vh] w-[2vw] bg-primary/30 rounded-full" />
          <span className="font-display text-[1.3vw] font-medium text-muted">Object Storage</span>
          <div className="h-[0.3vh] w-[2vw] bg-primary/30 rounded-full" />
          <span className="font-display text-[1.3vw] font-medium text-muted">OpenAPI Spec</span>
          <div className="h-[0.3vh] w-[2vw] bg-primary/30 rounded-full" />
          <span className="font-display text-[1.3vw] font-medium text-muted">CSV Bulk Import</span>
        </div>
      </div>
    </div>
  );
}
