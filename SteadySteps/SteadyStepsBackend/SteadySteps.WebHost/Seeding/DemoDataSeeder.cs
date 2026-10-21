using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;

namespace SteadySteps.WebHost.Seeding;

/// <summary>
/// Fills the demo account with a plausible history so the dashboard, progress and
/// insights pages have something to draw. Idempotent: if the account already owns
/// habits, the seeder leaves everything alone.
/// </summary>
public class DemoDataSeeder(
    SteadyStepsDbContext context,
    UserManager<User> userManager,
    IOptions<DemoDataOptions> options,
    ILogger<DemoDataSeeder> logger)
{
    private readonly DemoDataOptions _options = options.Value;

    /// <summary>Fixed so a reseeded database tells exactly the same story.</summary>
    private const int RandomSeed = 20_260_807;

    /// <summary>Days with no activity at all, counted back from today — a holiday and a bad week.</summary>
    private static readonly int[] BlankDaysAgo = [41, 42, 43, 76, 77];

    private sealed record HabitPlan(
        string Name,
        string Description,
        string Frequency,
        int WeeklyTarget,
        double BaseAdherence,
        DayOfWeek[]? OnlyOn,
        Func<Random, string> Status,
        string[] Notes);

    private static readonly HabitPlan[] Plans =
    [
        new(
            "Steps",
            "Ten thousand a day. The lift doesn't count.",
            "Daily",
            WeeklyTarget: 7,
            BaseAdherence: 0.80,
            OnlyOn: null,
            Status: rng => $"{rng.Next(6_200, 13_800):N0} steps",
            Notes:
            [
                "Walked the long way home along the canal.",
                "Rainy — split it into three short loops.",
                "Desk day. Made it up after dinner.",
                "Hit ten thousand before lunch for once.",
            ]),
        new(
            "Hydration",
            "Eight glasses of water before the evening.",
            "Daily",
            WeeklyTarget: 7,
            BaseAdherence: 0.72,
            OnlyOn: null,
            Status: rng => $"{rng.Next(4, 10)} glasses",
            Notes:
            [
                "Bottle on the desk works better than good intentions.",
                "Too much coffee, not enough water.",
                "Easy day — hot outside.",
            ]),
        new(
            "Sleep",
            "Lights out by eleven, seven hours minimum.",
            "Daily",
            WeeklyTarget: 7,
            BaseAdherence: 0.68,
            OnlyOn: null,
            Status: rng => $"{rng.Next(6, 9)}h {rng.Next(0, 12) * 5:00}m",
            Notes:
            [
                "Phone stayed in the other room. Noticeable difference.",
                "Late film. Regretted it at seven.",
                "Woke twice but got back down quickly.",
            ]),
        new(
            "Mindfulness",
            "Ten minutes sitting, first thing, before the inbox.",
            "Daily",
            WeeklyTarget: 6,
            BaseAdherence: 0.55,
            OnlyOn: null,
            Status: rng => $"{rng.Next(1, 5) * 5} min",
            Notes:
            [
                "Restless throughout, but sat it out.",
                "Ten minutes on the balcony.",
                "Shorter session — overslept.",
            ]),
        new(
            "Strength training",
            "Three sessions a week. Progressive overload, no heroics.",
            "3× weekly",
            WeeklyTarget: 3,
            BaseAdherence: 0.74,
            OnlyOn: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
            Status: rng => new[] { "Push day", "Pull day", "Legs", "Full body" }[rng.Next(4)],
            Notes:
            [
                "Added 2.5kg to the squat.",
                "Shoulder grumbled — kept it light.",
                "Short session, still counts.",
            ]),
        new(
            "Reading",
            "Twenty pages before bed instead of the phone.",
            "Daily",
            WeeklyTarget: 5,
            BaseAdherence: 0.50,
            OnlyOn: null,
            Status: rng => $"{rng.Next(10, 46)} pages",
            Notes:
            [
                "Finished the chapter and then some.",
                "Two pages and out cold.",
                "Started something new.",
            ]),
    ];

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (!_options.Enabled)
            return;

        // FindByNameAsync matches on the normalized name, so an account registered as
        // "StrangerDanger" is still found when the configured name is "strangerdanger".
        var user = await userManager.FindByNameAsync(_options.Username)
                   ?? await userManager.FindByEmailAsync(_options.Email);

        if (user == null)
        {
            user = new User
            {
                UserName = _options.Username,
                Email = _options.Email,
                EmailConfirmed = true,
                RegisterDate = DateTime.UtcNow.AddDays(-_options.HistoryDays),
            };

            var created = await userManager.CreateAsync(user, _options.Password);
            if (!created.Succeeded)
            {
                logger.LogWarning(
                    "Demo data: could not create the '{Username}' account — {Errors}",
                    _options.Username,
                    string.Join("; ", created.Errors.Select(e => e.Description)));
                return;
            }

            logger.LogInformation("Demo data: created the '{Username}' account.", _options.Username);
        }

        // Top up rather than replace: any habit the account already has — hand-made or
        // seeded on an earlier run — is left exactly as it is, and only the missing
        // demo habits get created. That keeps repeated startups from duplicating data.
        var existingNames = await context.Habits
            .Where(h => h.UserId == user.Id)
            .Select(h => h.Name)
            .ToListAsync(ct);
        var existing = existingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = Plans.Where(p => !existing.Contains(p.Name)).ToArray();
        if (missing.Length == 0)
        {
            logger.LogInformation("Demo data: '{Username}' already has every demo habit.", _options.Username);
            return;
        }

        var rng = new Random(RandomSeed);
        var today = DateOnly.FromDateTime(DateTime.Today);
        var firstDay = today.AddDays(-(_options.HistoryDays - 1));
        var createdAt = DateTime.SpecifyKind(
            firstDay.ToDateTime(new TimeOnly(7, 30)),
            DateTimeKind.Unspecified);
        var blankDays = BlankDaysAgo.Select(daysAgo => today.AddDays(-daysAgo)).ToHashSet();

        var habits = new List<Habit>();
        var logs = new List<HabitLog>();
        var goals = new List<Goal>();

        foreach (var plan in missing)
        {
            var habit = new Habit
            {
                UserId = user.Id,
                Name = plan.Name,
                Description = plan.Description,
                Frequency = plan.Frequency,
                CreatedAt = createdAt,
            };
            habits.Add(habit);

            var loggedInLastWeek = 0;

            for (var offset = 0; offset < _options.HistoryDays; offset++)
            {
                var date = firstDay.AddDays(offset);

                if (blankDays.Contains(date))
                    continue;

                if (plan.OnlyOn != null && !plan.OnlyOn.Contains(date.DayOfWeek))
                    continue;

                // The habit sticks better as the weeks go by — early history is patchy,
                // recent history is close to the intended frequency.
                var maturity = (double)offset / Math.Max(_options.HistoryDays - 1, 1);
                var adherence = Math.Min(0.95, plan.BaseAdherence + 0.18 * maturity);

                if (rng.NextDouble() > adherence)
                    continue;

                var daysAgo = today.DayNumber - date.DayNumber;
                if (daysAgo < 7)
                    loggedInLastWeek++;

                logs.Add(new HabitLog
                {
                    HabitId = habit.HabitId,
                    LogDate = date,
                    Status = plan.Status(rng),
                    Notes = rng.NextDouble() < 0.14 ? plan.Notes[rng.Next(plan.Notes.Length)] : null,
                });
            }

            goals.Add(new Goal
            {
                UserId = user.Id,
                HabitId = habit.HabitId,
                Target = plan.WeeklyTarget,
                CurrentProgress = loggedInLastWeek,
                StartDate = firstDay,
                EndDate = today.AddDays(30),
                CreatedAt = createdAt,
            });
        }

        context.Habits.AddRange(habits);
        context.Goals.AddRange(goals);
        context.HabitLogs.AddRange(logs);
        await context.SaveChangesAsync(ct);

        logger.LogInformation(
            "Demo data: seeded {Habits} habits, {Goals} goals and {Logs} logs for '{Username}'.",
            habits.Count, goals.Count, logs.Count, _options.Username);
    }
}
