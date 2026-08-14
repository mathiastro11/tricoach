from pathlib import Path

path = Path("patch-v012.py")
text = path.read_text()

old1 = '''page_text = replace_once(
    page_text,
    \'\'\'      const savedPlanHistory = localStorage.getItem("tricoach-plan-history");
      const savedWeeklyReview = localStorage.getItem("tricoach-weekly-review");\'\'\',
    \'\'\'      const savedPlanHistory = localStorage.getItem("tricoach-plan-history");
      const savedTrainingArchive = localStorage.getItem("tricoach-training-archive");
      const savedWeeklyReview = localStorage.getItem("tricoach-weekly-review");\'\'\',
    "archive local restore key"
)'''

new1 = '''page_text = replace_once(
    page_text,
    \'\'\'          const savedPlanHistory =
            localStorage.getItem("tricoach-plan-history");
          const savedWeeklyReview =
            localStorage.getItem("tricoach-weekly-review");\'\'\',
    \'\'\'          const savedPlanHistory =
            localStorage.getItem("tricoach-plan-history");
          const savedTrainingArchive =
            localStorage.getItem("tricoach-training-archive");
          const savedWeeklyReview =
            localStorage.getItem("tricoach-weekly-review");\'\'\',
    "archive local restore key"
)'''

old2 = '''page_text = replace_once(
    page_text,
    \'\'\'          if (savedPlanHistory) {
            setPlanHistory(JSON.parse(savedPlanHistory));
          }

          if (savedWeeklyReview) {\'\'\',
    \'\'\'          if (savedPlanHistory) {
            setPlanHistory(JSON.parse(savedPlanHistory));
          }

          if (savedTrainingArchive) {
            setTrainingArchive(
              JSON.parse(savedTrainingArchive)
            );
          }

          if (savedWeeklyReview) {\'\'\',
    "archive local restore"
)'''

# old2 may already be correct; leave it if so.

if old1 not in text:
    raise SystemExit("Fant ikke den gamle restore-blokken i patch-v012.py")

text = text.replace(old1, new1, 1)

path.write_text(text)

print("✅ v0.12 patch-script fikset automatisk")
