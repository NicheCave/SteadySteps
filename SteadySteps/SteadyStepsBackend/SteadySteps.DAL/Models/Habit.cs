using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.DAL.Models;

public partial class Habit
{
    [Key]
    public int HabitId { get; set; }

    public int? UserId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;
    
    [StringLength(1500)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? Frequency { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("Habit")]
    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();

    [InverseProperty("Habit")]
    public virtual ICollection<HabitLog> HabitLogs { get; set; } = new List<HabitLog>();

    [ForeignKey("UserId")]
    [InverseProperty("Habits")]
    public virtual User? User { get; set; }
}