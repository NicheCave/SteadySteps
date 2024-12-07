using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SteadySteps.DAL.Models;

public partial class Habit
{
    [Key] public Guid HabitId { get; set; } = Guid.NewGuid();

    public Guid? UserId { get; set; }

    [Required] [StringLength(100)] public string Name { get; set; } = null!;

    [StringLength(1500)] public string? Description { get; set; }

    [StringLength(50)] public string? Frequency { get; set; }

    [Column(TypeName = "timestamp without time zone")] public DateTime? CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")] public DateTime? UpdatedAt { get; set; }

    [Required] public bool IsDeleted { get; set; } = false;

    [ForeignKey(nameof(UserId))]
    [JsonIgnore]
    public virtual User? User { get; set; }

    [InverseProperty("Habit")]
    [JsonIgnore]
    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();

    [InverseProperty("Habit")]
    [JsonIgnore]
    public virtual ICollection<HabitLog> HabitLogs { get; set; } = new List<HabitLog>();
}