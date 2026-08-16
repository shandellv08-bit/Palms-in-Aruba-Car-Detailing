import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

function toNum(v: unknown): number {
  if (v === null || v === undefined) return 0;
  return typeof v === "object" && "toNumber" in (v as object)
    ? (v as { toNumber: () => number }).toNumber()
    : Number(v);
}

async function sumPayments(from: Date, to: Date) {
  const r = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { paidAt: { gte: from, lte: to } },
  });
  return toNum(r._sum.amount);
}

async function sumExpenses(from: Date, to: Date) {
  const r = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: from, lte: to } },
  });
  return toNum(r._sum.amount);
}

export async function getDashboardData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    todaysAppointments,
    todaysRevenue,
    todaysCompleted,
    todaysExpectedAgg,
    weekCompletedCount,
    weekRevenue,
    weekExpenses,
    weekNewCustomers,
    weekAppointmentCustomerIds,
    monthRevenue,
    monthExpenses,
    monthCompletedAppointments,
    monthCustomersAcquired,
    monthLeads,
    monthLeadsConverted,
    totalCustomers,
    activeRecurring,
    totalRevenueAgg,
    totalExpensesAgg,
    totalCompletedAppointments,
    latestTarget,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { scheduledDate: { gte: todayStart, lte: todayEnd } },
      include: { customer: true, vehicle: true },
      orderBy: { scheduledDate: "asc" },
    }),
    sumPayments(todayStart, todayEnd),
    prisma.appointment.count({
      where: {
        status: "COMPLETED",
        scheduledDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.appointment.aggregate({
      _sum: { finalPrice: true, quotedPrice: true },
      where: {
        scheduledDate: { gte: todayStart, lte: todayEnd },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    }),
    prisma.appointment.count({
      where: { status: "COMPLETED", scheduledDate: { gte: weekStart, lte: weekEnd } },
    }),
    sumPayments(weekStart, weekEnd),
    sumExpenses(weekStart, weekEnd),
    prisma.customer.count({ where: { dateAcquired: { gte: weekStart, lte: weekEnd } } }),
    prisma.appointment.findMany({
      where: { scheduledDate: { gte: weekStart, lte: weekEnd }, status: "COMPLETED" },
      select: { customerId: true },
    }),
    sumPayments(monthStart, monthEnd),
    sumExpenses(monthStart, monthEnd),
    prisma.appointment.findMany({
      where: { status: "COMPLETED", scheduledDate: { gte: monthStart, lte: monthEnd } },
      select: { customerId: true, finalPrice: true, quotedPrice: true },
    }),
    prisma.customer.count({ where: { dateAcquired: { gte: monthStart, lte: monthEnd } } }),
    prisma.lead.count({ where: { date: { gte: monthStart, lte: monthEnd } } }),
    prisma.lead.count({
      where: { date: { gte: monthStart, lte: monthEnd }, status: "CONVERTED" },
    }),
    prisma.customer.count(),
    prisma.recurringPlan.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.kpiTarget.findFirst({ orderBy: { periodStart: "desc" } }),
  ]);

  // repeat customers this week = customers who had a completed appointment this week AND have >1 total completed appointments
  const weekCustomerIds = [...new Set(weekAppointmentCustomerIds.map((a) => a.customerId))];
  let weekRepeatCustomers = 0;
  if (weekCustomerIds.length > 0) {
    const counts = await prisma.appointment.groupBy({
      by: ["customerId"],
      where: { customerId: { in: weekCustomerIds }, status: "COMPLETED" },
      _count: { _all: true },
    });
    weekRepeatCustomers = counts.filter((c) => c._count._all > 1).length;
  }

  const monthCustomerIds = [...new Set(monthCompletedAppointments.map((a) => a.customerId))];
  let monthRepeatCustomers = 0;
  if (monthCustomerIds.length > 0) {
    const counts = await prisma.appointment.groupBy({
      by: ["customerId"],
      where: { customerId: { in: monthCustomerIds }, status: "COMPLETED" },
      _count: { _all: true },
    });
    monthRepeatCustomers = counts.filter((c) => c._count._all > 1).length;
  }

  const monthTicketTotal = monthCompletedAppointments.reduce(
    (sum, a) => sum + (toNum(a.finalPrice) || toNum(a.quotedPrice)),
    0
  );
  const monthAverageTicket =
    monthCompletedAppointments.length > 0
      ? monthTicketTotal / monthCompletedAppointments.length
      : 0;
  const monthCustomerCount = monthCustomerIds.length;
  const monthRepeatPct =
    monthCustomerCount > 0 ? (monthRepeatCustomers / monthCustomerCount) * 100 : 0;
  const monthConversionRate = monthLeads > 0 ? (monthLeadsConverted / monthLeads) * 100 : 0;

  const totalRevenue = toNum(totalRevenueAgg._sum.amount);
  const totalExpenses = toNum(totalExpensesAgg._sum.amount);
  const netProfit = totalRevenue - totalExpenses;
  const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const avgJobValue =
    totalCompletedAppointments > 0 ? totalRevenue / totalCompletedAppointments : 0;

  let target = null;
  if (latestTarget) {
    const [targetRevenueActual, targetExpensesActual, targetCustomersActual, targetRepeatActual] =
      await Promise.all([
        sumPayments(latestTarget.periodStart, latestTarget.periodEnd),
        sumExpenses(latestTarget.periodStart, latestTarget.periodEnd),
        prisma.customer.count({
          where: { dateAcquired: { gte: latestTarget.periodStart, lte: latestTarget.periodEnd } },
        }),
        prisma.appointment.findMany({
          where: {
            status: "COMPLETED",
            scheduledDate: { gte: latestTarget.periodStart, lte: latestTarget.periodEnd },
          },
          select: { customerId: true },
        }),
      ]);
    const periodCustomerIds = [...new Set(targetRepeatActual.map((a) => a.customerId))];
    let periodRepeat = 0;
    if (periodCustomerIds.length > 0) {
      const counts = await prisma.appointment.groupBy({
        by: ["customerId"],
        where: { customerId: { in: periodCustomerIds }, status: "COMPLETED" },
        _count: { _all: true },
      });
      periodRepeat = counts.filter((c) => c._count._all > 1).length;
    }
    target = {
      ...latestTarget,
      targetAverageTicket: toNum(latestTarget.targetAverageTicket),
      targetRevenue: toNum(latestTarget.targetRevenue),
      targetExpenses: toNum(latestTarget.targetExpenses),
      targetProfit: toNum(latestTarget.targetProfit),
      actualRevenue: targetRevenueActual,
      actualExpenses: targetExpensesActual,
      actualProfit: targetRevenueActual - targetExpensesActual,
      actualCustomers: targetCustomersActual,
      actualRepeatCustomers: periodRepeat,
    };
  }

  return {
    today: {
      appointments: todaysAppointments,
      revenue: todaysRevenue,
      completedJobs: todaysCompleted,
      expectedRevenue:
        toNum(todaysExpectedAgg._sum.finalPrice) || toNum(todaysExpectedAgg._sum.quotedPrice),
    },
    week: {
      jobsCompleted: weekCompletedCount,
      revenue: weekRevenue,
      expenses: weekExpenses,
      profit: weekRevenue - weekExpenses,
      newCustomers: weekNewCustomers,
      repeatCustomers: weekRepeatCustomers,
    },
    month: {
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses,
      customers: monthCustomerCount,
      averageTicket: monthAverageTicket,
      repeatCustomerPct: monthRepeatPct,
      leads: monthLeads,
      conversionRate: monthConversionRate,
    },
    health: {
      totalCustomers,
      activeRecurring,
      totalRevenue,
      totalExpenses,
      netProfit,
      avgCustomerValue,
      avgJobValue,
    },
    target,
  };
}
