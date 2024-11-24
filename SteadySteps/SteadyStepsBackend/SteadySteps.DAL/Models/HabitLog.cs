using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SteadySteps.DAL.Models;

public partial class HabitLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LogId { get; set; }

    public int? HabitId { get; set; }

    public DateOnly LogDate { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public string? Notes { get; set; }

    public bool IsDeleted { get; set; } = false;

    [ForeignKey("HabitId")]
    [InverseProperty("HabitLogs")]
    public virtual Habit? Habit { get; set; }
}