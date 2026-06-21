type SourceAggregateRow = {
  day: string;
  sourceKey: string;
  total: string;
};

export function pivotBySource(rows: SourceAggregateRow[]) {
  const byDay = new Map<
    string,
    {
      day: string;
      totalsBySource: Record<string, number>;
      grandTotal: number;
    }
  >();

  for (const row of rows) {
    const amount = Number(row.total);
    let entry = byDay.get(row.day);
    if (!entry) {
      entry = { day: row.day, totalsBySource: {}, grandTotal: 0 };
      byDay.set(row.day, entry);
    }
    entry.totalsBySource[row.sourceKey] =
      (entry.totalsBySource[row.sourceKey] ?? 0) + amount;
    entry.grandTotal += amount;
  }

  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}
