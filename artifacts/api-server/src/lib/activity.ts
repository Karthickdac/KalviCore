import { db, activityLogTable } from "@workspace/db";

export async function logActivity(type: string, description: string, entityName: string) {
  await db.insert(activityLogTable).values({ type, description, entityName });
}
