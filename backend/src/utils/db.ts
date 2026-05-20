import { prisma } from '../index';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export async function getAnalyticsByFilter(
  orgId: string,
  eventType: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  return prisma.$queryRaw`
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      "eventType",
      COUNT(*) as count
    FROM "AnalyticsEvent"
    WHERE "organizationId" = ${orgId}
    AND "eventType" = ${eventType}
    AND timestamp >= ${new Date(startDate)}
    AND timestamp <= ${new Date(endDate)}
    GROUP BY DATE_TRUNC('day', timestamp), "eventType"
    ORDER BY date DESC
  `;
}

const AUDIT_LOG_ORDER_COLUMNS = new Set([
  'createdAt',
  'action',
  'userId',
  'resourceType',
  'resourceId',
]);

const SORT_DIRECTIONS = new Set(['ASC', 'DESC']);

export async function getAuditLogs(
  orgId: string,
  orderBy: string = 'createdAt',
  order: string = 'DESC'
): Promise<any[]> {
  if (!AUDIT_LOG_ORDER_COLUMNS.has(orderBy)) {
    throw new Error(`Invalid order column: ${orderBy}`);
  }

  if (!SORT_DIRECTIONS.has(order.toUpperCase())) {
    throw new Error(`Invalid sort direction: ${order}`);
  }

  const orderClause = Prisma.raw(`"${orderBy}" ${order.toUpperCase()}`);

  return prisma.$queryRaw`
    SELECT al.*, u.name as "userName", u.email as "userEmail"
    FROM "AuditLog" al
    JOIN "User" u ON al."userId" = u.id
    WHERE al."organizationId" = ${orgId}
    ORDER BY ${orderClause}
  `;
}

export async function searchEvents(
  orgId: string,
  searchQuery: string
): Promise<any[]> {
  const pattern = `%${searchQuery}%`;

  return prisma.$queryRaw`
    SELECT * FROM "AnalyticsEvent"
    WHERE "organizationId" = ${orgId}
    AND (
      "eventName" ILIKE ${pattern}
      OR properties::text ILIKE ${pattern}
    )
    LIMIT 1000
  `;
}

export async function bulkInsertEvents(
  events: Array<{
    organizationId: string;
    eventType: string;
    eventName: string;
    properties: any;
  }>
): Promise<void> {
  await prisma.analyticsEvent.createMany({
    data: events.map(e => ({
      id: uuidv4(),
      organizationId: e.organizationId,
      eventType: e.eventType,
      eventName: e.eventName,
      properties: e.properties,
      timestamp: new Date(),
    })),
  });
}

