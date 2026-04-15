import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, IndianRupee, Target, TrendingUp, Plus, Users, Calendar, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function FundraisingPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [tab, setTab] = useState("campaigns");
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [donationDialog, setDonationDialog] = useState(false);

  const [campaignForm, setCampaignForm] = useState({ title: "", description: "", goalAmount: "", startDate: "", endDate: "", category: "General" });
  const [donationForm, setDonationForm] = useState({ campaignId: "", donorName: "", donorType: "Individual", donorEmail: "", donorPhone: "", donorRelation: "", amount: "", paymentMode: "Cash", transactionId: "", donationDate: "", purpose: "", remarks: "" });

  const { data: stats } = useQuery({ queryKey: ["fundraising-stats"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/fundraising/stats`, { headers }); return r.json(); } });
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/fundraising/campaigns`, { headers }); return r.json(); } });
  const { data: donations = [] } = useQuery({ queryKey: ["donations"], queryFn: async () => { const r = await fetch(`${API_BASE}/api/fundraising/donations`, { headers }); return r.json(); } });

  const invalidateAll = () => { ["fundraising-stats", "campaigns", "donations"].forEach(k => qc.invalidateQueries({ queryKey: [k] })); };

  const addCampaign = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/fundraising/campaigns`, { method: "POST", headers, body: JSON.stringify(campaignForm) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Campaign created" }); setCampaignDialog(false); setCampaignForm({ title: "", description: "", goalAmount: "", startDate: "", endDate: "", category: "General" }); invalidateAll(); },
    onError: () => toast({ title: "Failed to create campaign", variant: "destructive" }),
  });

  const addDonation = useMutation({
    mutationFn: async () => { const r = await fetch(`${API_BASE}/api/fundraising/donations`, { method: "POST", headers, body: JSON.stringify(donationForm) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Donation recorded" }); setDonationDialog(false); setDonationForm({ campaignId: "", donorName: "", donorType: "Individual", donorEmail: "", donorPhone: "", donorRelation: "", amount: "", paymentMode: "Cash", transactionId: "", donationDate: "", purpose: "", remarks: "" }); invalidateAll(); },
    onError: () => toast({ title: "Failed to record donation", variant: "destructive" }),
  });

  const deleteDonation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`${API_BASE}/api/fundraising/donations/${id}`, { method: "DELETE", headers }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Donation removed" }); invalidateAll(); },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`${API_BASE}/api/fundraising/campaigns/${id}`, { method: "DELETE", headers }); if (!r.ok) throw new Error("Failed"); return r.json(); },
    onSuccess: () => { toast({ title: "Campaign deleted" }); invalidateAll(); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fundraising & Donations</h1>
          <p className="text-muted-foreground">Manage fundraising campaigns and track donations from parents, alumni, and community.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Target className="w-6 h-6 mx-auto mb-1 text-blue-500" /><p className="text-2xl font-bold">{stats?.totalCampaigns || 0}</p><p className="text-xs text-muted-foreground">Campaigns</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Heart className="w-6 h-6 mx-auto mb-1 text-red-500" /><p className="text-2xl font-bold">{stats?.totalDonations || 0}</p><p className="text-xs text-muted-foreground">Donations</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><IndianRupee className="w-6 h-6 mx-auto mb-1 text-green-500" /><p className="text-2xl font-bold">₹{Number(stats?.totalRaised || 0).toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Total Raised</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="w-6 h-6 mx-auto mb-1 text-amber-500" /><p className="text-2xl font-bold">{stats?.progressPercent || 0}%</p><p className="text-xs text-muted-foreground">Goal Progress</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Fundraising Campaigns</CardTitle>
                <Dialog open={campaignDialog} onOpenChange={setCampaignDialog}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />New Campaign</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1"><Label>Title *</Label><Input value={campaignForm.title} onChange={e => setCampaignForm({...campaignForm, title: e.target.value})} placeholder="e.g., Library Renovation Fund" /></div>
                      <div className="space-y-1"><Label>Description</Label><Textarea value={campaignForm.description} onChange={e => setCampaignForm({...campaignForm, description: e.target.value})} rows={2} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Goal Amount (₹) *</Label><Input type="number" value={campaignForm.goalAmount} onChange={e => setCampaignForm({...campaignForm, goalAmount: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Category</Label>
                          <Select value={campaignForm.category} onValueChange={v => setCampaignForm({...campaignForm, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{["General", "Infrastructure", "Scholarship", "Sports", "Library", "Lab Equipment", "Cultural", "Emergency Relief", "Student Welfare"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Start Date *</Label><Input type="date" value={campaignForm.startDate} onChange={e => setCampaignForm({...campaignForm, startDate: e.target.value})} /></div>
                        <div className="space-y-1"><Label>End Date</Label><Input type="date" value={campaignForm.endDate} onChange={e => setCampaignForm({...campaignForm, endDate: e.target.value})} /></div>
                      </div>
                      <Button className="w-full" onClick={() => addCampaign.mutate()} disabled={!campaignForm.title || !campaignForm.goalAmount || !campaignForm.startDate || addCampaign.isPending}>{addCampaign.isPending ? "Creating..." : "Create Campaign"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {(campaigns as any[]).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No campaigns created yet</p>
              ) : (
                <div className="space-y-4">
                  {(campaigns as any[]).map((c: any) => {
                    const goal = Number(c.goalAmount || 0);
                    const raised = Number(c.raisedAmount || 0);
                    const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                    return (
                      <div key={c.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{c.title}</h3>
                            <p className="text-xs text-muted-foreground">{c.description || "No description"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={c.status === "Active" ? "default" : c.status === "Completed" ? "secondary" : "outline"}>{c.status}</Badge>
                            <Badge variant="outline">{c.category}</Badge>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCampaign.mutate(c.id)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>₹{raised.toLocaleString("en-IN")} raised</span>
                            <span className="text-muted-foreground">of ₹{goal.toLocaleString("en-IN")}</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">{pct.toFixed(1)}% complete</p>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span><Calendar className="w-3 h-3 inline mr-1" />{c.startDate}{c.endDate ? ` — ${c.endDate}` : ""}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Donation Records</CardTitle>
                <Dialog open={donationDialog} onOpenChange={setDonationDialog}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Record Donation</Button></DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Record Donation</DialogTitle></DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="space-y-1"><Label>Campaign (optional)</Label>
                        <Select value={donationForm.campaignId} onValueChange={v => setDonationForm({...donationForm, campaignId: v})}>
                          <SelectTrigger><SelectValue placeholder="General donation" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">General (no campaign)</SelectItem>
                            {(campaigns as any[]).filter((c: any) => c.status === "Active").map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Donor Name *</Label><Input value={donationForm.donorName} onChange={e => setDonationForm({...donationForm, donorName: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Donor Type</Label>
                          <Select value={donationForm.donorType} onValueChange={v => setDonationForm({...donationForm, donorType: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{["Individual", "Corporate", "Alumni", "Parent", "Faculty", "Community", "NGO", "Government"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Email</Label><Input value={donationForm.donorEmail} onChange={e => setDonationForm({...donationForm, donorEmail: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Phone</Label><Input value={donationForm.donorPhone} onChange={e => setDonationForm({...donationForm, donorPhone: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Amount (₹) *</Label><Input type="number" value={donationForm.amount} onChange={e => setDonationForm({...donationForm, amount: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Date *</Label><Input type="date" value={donationForm.donationDate} onChange={e => setDonationForm({...donationForm, donationDate: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label>Payment Mode</Label>
                          <Select value={donationForm.paymentMode} onValueChange={v => setDonationForm({...donationForm, paymentMode: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{["Cash", "Cheque", "Online/UPI", "Bank Transfer", "DD"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1"><Label>Transaction ID</Label><Input value={donationForm.transactionId} onChange={e => setDonationForm({...donationForm, transactionId: e.target.value})} /></div>
                      </div>
                      <div className="space-y-1"><Label>Relation to Institution</Label><Input value={donationForm.donorRelation} onChange={e => setDonationForm({...donationForm, donorRelation: e.target.value})} placeholder="e.g., Alumni Batch 2018, Parent of student" /></div>
                      <div className="space-y-1"><Label>Purpose</Label><Input value={donationForm.purpose} onChange={e => setDonationForm({...donationForm, purpose: e.target.value})} placeholder="e.g., Towards lab equipment" /></div>
                      <div className="space-y-1"><Label>Remarks</Label><Textarea value={donationForm.remarks} onChange={e => setDonationForm({...donationForm, remarks: e.target.value})} rows={2} /></div>
                      <Button className="w-full" onClick={() => addDonation.mutate()} disabled={!donationForm.donorName || !donationForm.amount || !donationForm.donationDate || addDonation.isPending}>{addDonation.isPending ? "Recording..." : "Record Donation"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Donor</TableHead><TableHead>Type</TableHead><TableHead>Campaign</TableHead><TableHead>Amount</TableHead><TableHead>Mode</TableHead><TableHead>Date</TableHead><TableHead>Receipt</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {(donations as any[]).length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No donations recorded</TableCell></TableRow> :
                  (donations as any[]).map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell><div><p className="font-medium text-sm">{d.donorName}</p>{d.donorRelation && <p className="text-xs text-muted-foreground">{d.donorRelation}</p>}</div></TableCell>
                      <TableCell><Badge variant="outline">{d.donorType}</Badge></TableCell>
                      <TableCell className="text-sm">{d.campaignTitle || "General"}</TableCell>
                      <TableCell className="font-medium">₹{Number(d.amount || 0).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-sm">{d.paymentMode}</TableCell>
                      <TableCell className="text-sm">{d.donationDate}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.receiptNumber || "-"}</TableCell>
                      <TableCell><Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteDonation.mutate(d.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
