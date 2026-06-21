let cursor: Date | number = Date.now();
for (let i = 0; i < 3; i++) {
  cursor = Bun.cron.parse("* * * * *", cursor)!;
  console.log(cursor.toLocaleString()); // next three top-of-hour boundaries
}
