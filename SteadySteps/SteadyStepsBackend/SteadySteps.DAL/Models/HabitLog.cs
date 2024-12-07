using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SteadySteps.DAL.Models;

public partial class HabitLog
{
    [Key] public Guid LogId { get; set; } = Guid.NewGuid();

    public Guid HabitId { get; set; }

    [Required] public DateOnly LogDate { get; set; }

    [MaxLength(50)] public string? Status { get; set; }

    [MaxLength(500)] public string? Notes { get; set; }

    [Required] public bool IsDeleted { get; set; } = false;

    [ForeignKey(nameof(HabitId))]
    [JsonIgnore]
    public virtual Habit Habit { get; set; } = null!;
}