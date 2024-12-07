using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SteadySteps.DAL.Models;

public partial class Goal
{
    [Key] public Guid GoalId { get; set; } = Guid.NewGuid();

    public Guid? UserId { get; set; }

    public Guid? HabitId { get; set; }

    public int? Target { get; set; }

    public int? CurrentProgress { get; set; }

    [Required] public bool IsDeleted { get; set; } = false;

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [Column(TypeName = "timestamp without time zone")] public DateTime? CreatedAt { get; set; }

    [ForeignKey(nameof(HabitId))]
    [JsonIgnore]
    public virtual Habit? Habit { get; set; }
    
    [ForeignKey(nameof(UserId))]
    [JsonIgnore]
    public virtual User? User { get; set; }
}