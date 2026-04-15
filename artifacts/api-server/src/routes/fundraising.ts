import { Router, type IRouter } from "express";
import { db, fundraisingCampaignsTable, donationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/fundraising/campaigns", requireAuth, async (_req, res): Promise<void> => {
  try {
    const campaigns = await db.select().from(fundraisingCampaignsTable).orderBy(desc(fundraisingCampaignsTable.createdAt));
    res.json(campaigns);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/fundraising/campaigns", requireAuth, requirePermission("settings"), async (req, res): Promise<void> => {
  try {
    const { title, description, goalAmount, startDate, endDate, category, createdBy } = req.body;
    if (!title || !goalAmount || !startDate) { res.status(400).json({ error: "Title, goal amount, and start date required" }); return; }
    const [campaign] = await db.insert(fundraisingCampaignsTable).values({
      title, description, goalAmount: String(goalAmount), startDate, endDate, category: category || "General", createdBy,
    }).returning();
    await logActivity("campaign_created", `Fundraising campaign: ${title}`, String(campaign.id));
    res.json(campaign);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/fundraising/campaigns/:id", requireAuth, requirePermission("settings"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updateData = { ...req.body };
    if (updateData.goalAmount) updateData.goalAmount = String(updateData.goalAmount);
    if (updateData.raisedAmount) updateData.raisedAmount = String(updateData.raisedAmount);
    const [campaign] = await db.update(fundraisingCampaignsTable).set(updateData).where(eq(fundraisingCampaignsTable.id, id)).returning();
    if (!campaign) { res.status(404).json({ error: "Not found" }); return; }
    res.json(campaign);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/fundraising/campaigns/:id", requireAuth, requirePermission("settings"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await db.delete(donationsTable).where(eq(donationsTable.campaignId, id));
    const [c] = await db.delete(fundraisingCampaignsTable).where(eq(fundraisingCampaignsTable.id, id)).returning();
    if (!c) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/fundraising/donations", requireAuth, async (req, res): Promise<void> => {
  try {
    const { campaignId } = req.query;
    const conditions: any[] = [];
    if (campaignId) conditions.push(eq(donationsTable.campaignId, Number(campaignId)));
    const donations = conditions.length > 0
      ? await db.select().from(donationsTable).where(and(...conditions)).orderBy(desc(donationsTable.createdAt))
      : await db.select().from(donationsTable).orderBy(desc(donationsTable.createdAt));
    const campaigns = await db.select().from(fundraisingCampaignsTable);
    const enriched = donations.map(d => ({
      ...d,
      campaignTitle: campaigns.find(c => c.id === d.campaignId)?.title || "General Donation",
    }));
    res.json(enriched);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/fundraising/donations", requireAuth, requirePermission("fees"), async (req, res): Promise<void> => {
  try {
    const { campaignId, donorName, donorType, donorEmail, donorPhone, donorRelation, amount, paymentMode, transactionId, donationDate, purpose, remarks } = req.body;
    if (!donorName || !amount || !donationDate) { res.status(400).json({ error: "Donor name, amount, and date required" }); return; }
    const receiptNumber = `DON-${Date.now().toString(36).toUpperCase()}`;
    const [donation] = await db.insert(donationsTable).values({
      campaignId: campaignId ? Number(campaignId) : null, donorName, donorType: donorType || "Individual",
      donorEmail, donorPhone, donorRelation, amount: String(amount), paymentMode: paymentMode || "Cash",
      transactionId, donationDate, purpose, receiptNumber, remarks,
    }).returning();

    if (campaignId) {
      const allDonations = await db.select().from(donationsTable).where(eq(donationsTable.campaignId, Number(campaignId)));
      const totalRaised = allDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
      await db.update(fundraisingCampaignsTable).set({ raisedAmount: String(totalRaised) }).where(eq(fundraisingCampaignsTable.id, Number(campaignId)));
    }

    await logActivity("donation_received", `Donation from ${donorName}: ₹${amount}`, String(donation.id));
    res.json(donation);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/fundraising/donations/:id", requireAuth, requirePermission("fees"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [donation] = await db.delete(donationsTable).where(eq(donationsTable.id, id)).returning();
    if (!donation) { res.status(404).json({ error: "Not found" }); return; }
    if (donation.campaignId) {
      const remaining = await db.select().from(donationsTable).where(eq(donationsTable.campaignId, donation.campaignId));
      const totalRaised = remaining.reduce((sum, d) => sum + Number(d.amount || 0), 0);
      await db.update(fundraisingCampaignsTable).set({ raisedAmount: String(totalRaised) }).where(eq(fundraisingCampaignsTable.id, donation.campaignId));
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/fundraising/stats", requireAuth, async (_req, res): Promise<void> => {
  try {
    const campaigns = await db.select().from(fundraisingCampaignsTable);
    const donations = await db.select().from(donationsTable);
    const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalGoal = campaigns.reduce((sum, c) => sum + Number(c.goalAmount || 0), 0);
    res.json({
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === "Active").length,
      totalDonations: donations.length,
      totalRaised,
      totalGoal,
      progressPercent: totalGoal > 0 ? ((totalRaised / totalGoal) * 100).toFixed(1) : "0",
      donorTypes: {
        individual: donations.filter(d => d.donorType === "Individual").length,
        corporate: donations.filter(d => d.donorType === "Corporate").length,
        alumni: donations.filter(d => d.donorType === "Alumni").length,
        parent: donations.filter(d => d.donorType === "Parent").length,
        faculty: donations.filter(d => d.donorType === "Faculty").length,
      },
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
