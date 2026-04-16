import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Shield, BookOpen, Users, Briefcase, UserCheck, User, Home, Library, Building2, Bus, ChevronDown, KeyRound, ArrowLeft, Mail, Lock } from "lucide-react";

const LOGIN_ROLES = [
  { value: "Admin", label: "Admin", idLabel: "Staff ID", idPlaceholder: "Enter your Staff ID", icon: Shield, color: "from-orange-500 to-amber-600" },
  { value: "Principal", label: "Principal", idLabel: "Staff ID", idPlaceholder: "Enter your Staff ID", icon: UserCheck, color: "from-purple-500 to-violet-600" },
  { value: "HOD", label: "HOD", idLabel: "Staff ID", idPlaceholder: "Enter your Staff ID", icon: BookOpen, color: "from-blue-500 to-indigo-600" },
  { value: "Faculty", label: "Faculty", idLabel: "Staff ID", idPlaceholder: "Enter your Staff ID", icon: Users, color: "from-emerald-500 to-teal-600" },
  { value: "Staff", label: "Staff", idLabel: "Staff ID", idPlaceholder: "Enter your Staff ID", icon: Briefcase, color: "from-amber-500 to-yellow-600" },
  { value: "Student", label: "Student", idLabel: "Roll Number", idPlaceholder: "Enter your Roll Number", icon: User, color: "from-cyan-500 to-blue-600" },
  { value: "Parent", label: "Parent", idLabel: "Parent ID", idPlaceholder: "Enter your Parent ID", icon: Home, color: "from-green-500 to-emerald-600" },
];

const PORTALS = [
  { path: "/parent-portal", label: "Parent Portal", desc: "Child's info & noticeboard", icon: Home, color: "from-green-500 to-emerald-600" },
  { path: "/librarian-portal", label: "Librarian", desc: "Books & issued records", icon: Library, color: "from-amber-500 to-orange-600" },
  { path: "/warden-portal", label: "Hostel Warden", desc: "Rooms & complaints", icon: Building2, color: "from-indigo-500 to-violet-600" },
  { path: "/transport-portal", label: "Transport Mgr", desc: "Routes & vehicles", icon: Bus, color: "from-cyan-500 to-teal-600" },
];

export default function LoginPage() {
  const { login, mustChangePassword, changePassword, clearMustChangePassword } = useAuth();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState(LOGIN_ROLES[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "";

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Failed to send reset email");
      } else {
        setForgotMessage(data.message || "If the email exists, a reset link has been sent.");
      }
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    if (newPassword.length < 6) {
      setChangeError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("Passwords do not match");
      return;
    }
    setChangeLoading(true);
    try {
      await changePassword(newPassword);
    } catch (err: any) {
      setChangeError(err.message || "Failed to change password");
    } finally {
      setChangeLoading(false);
    }
  };

  if (mustChangePassword) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 ring-1 ring-white/10 mb-5 mx-auto">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Change Your Password</h1>
            <p className="text-white/50 text-sm mt-2">You must set a new password before continuing</p>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/20 p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {changeError && (
                  <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">
                    {changeError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                      className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-11 rounded-xl pr-11"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs font-medium">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-teal-500/25 border-0" disabled={changeLoading}>
                  {changeLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Set New Password & Continue"}
                </Button>
              </form>
              <button onClick={clearMustChangePassword} className="mt-4 w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors">
                <ArrowLeft className="inline w-3 h-3 mr-1" />Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-1 ring-white/10 mb-5 mx-auto">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
            <p className="text-white/50 text-sm mt-2">Enter your registered email to receive a password reset link</p>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/20 p-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">{forgotError}</div>
                )}
                {forgotMessage && (
                  <div className="bg-emerald-500/10 text-emerald-400 text-sm p-3 rounded-xl border border-emerald-500/20">{forgotMessage}</div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs font-medium">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                    className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-teal-500/50 focus:ring-teal-500/20 h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 border-0" disabled={forgotLoading}>
                  {forgotLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </Button>
              </form>
              <button onClick={() => { setShowForgotPassword(false); setForgotMessage(""); setForgotError(""); }} className="mt-4 w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors">
                <ArrowLeft className="inline w-3 h-3 mr-1" />Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-teal-500/20 ring-1 ring-white/10 mb-5 mx-auto">
            <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Automystics Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">KalviCore</h1>
          <p className="text-teal-300/60 text-sm font-medium mt-1">Complete Campus. One Intelligent System</p>
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
                <Label className="text-white/70 text-xs font-medium">Login As</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full h-11 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white px-3 flex items-center justify-between hover:border-teal-500/40 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedRole.color} flex items-center justify-center`}>
                        <selectedRole.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-medium">{selectedRole.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {roleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden max-h-72 overflow-y-auto">
                      {LOGIN_ROLES.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleDropdownOpen(false);
                            setUsername("");
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left ${selectedRole.value === role.value ? "bg-teal-500/10 border-l-2 border-l-teal-500" : ""}`}
                        >
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                            <role.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{role.label}</div>
                            <div className="text-[10px] text-white/40">{role.idLabel}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium">{selectedRole.idLabel}</Label>
                <Input
                  placeholder={selectedRole.idPlaceholder}
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

              <div className="flex justify-end">
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-teal-400/70 hover:text-teal-300 transition-colors">
                  Forgot Password?
                </button>
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
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Portals</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PORTALS.map((portal) => (
                <button
                  key={portal.path}
                  onClick={() => navigate(portal.path)}
                  className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <portal.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-white/70 group-hover:text-white/90 transition-colors">{portal.label}</span>
                  <span className="text-[9px] text-white/30 leading-tight">{portal.desc}</span>
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
