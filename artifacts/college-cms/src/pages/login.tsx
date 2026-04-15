import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, Eye, EyeOff, Shield, BookOpen, Users, Briefcase, UserCheck, User } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Admin", username: "college_admin", password: "Admin@123", icon: Shield, color: "from-orange-500 to-amber-600", desc: "Full system access" },
  { label: "Principal", username: "principal", password: "Principal@123", icon: UserCheck, color: "from-purple-500 to-violet-600", desc: "Institution head" },
  { label: "HOD", username: "hod_cse", password: "Hod@123", icon: BookOpen, color: "from-blue-500 to-indigo-600", desc: "Department head" },
  { label: "Faculty", username: "faculty_cse", password: "Faculty@123", icon: Users, color: "from-emerald-500 to-teal-600", desc: "Teaching staff" },
  { label: "Staff", username: "office_staff", password: "Staff@123", icon: Briefcase, color: "from-amber-500 to-yellow-600", desc: "Office & security" },
  { label: "Student", username: "student_cse", password: "Student@123", icon: User, color: "from-cyan-500 to-blue-600", desc: "Student portal" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setError("");
    setLoadingRole(account.label);
    try {
      await login(account.username, account.password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 rounded-2xl shadow-2xl shadow-teal-500/30 ring-1 ring-white/10 mb-5">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">KalviCore</h1>
          <p className="text-teal-300/60 text-sm font-medium mt-1">Complete Campus. One Intelligent System</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-white/50">Affiliated to Madurai Kamaraj University</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/20 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium">Username</Label>
                <Input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                  className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-11 rounded-xl pr-11"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-teal-500/25 border-0 transition-all duration-200"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
              </Button>
            </form>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Quick Login</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.label}
                  onClick={() => handleQuickLogin(account)}
                  disabled={loadingRole !== null}
                  className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200 disabled:opacity-50"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    {loadingRole === account.label ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <account.icon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-white/70 group-hover:text-white/90 transition-colors">{account.label}</span>
                  <span className="text-[9px] text-white/30 leading-tight">{account.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-white/20 text-center">
          KalviCore College Management System &middot; MK University
        </p>
      </div>
    </div>
  );
}
