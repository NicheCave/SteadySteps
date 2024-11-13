using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.DAL.Models;

public partial class HabitLog
{
    [Key]
    public int LogId { get; set; }

    public int? HabitId { get; set; }

    public DateOnly LogDate { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public string? Notes { get; set; }

    [ForeignKey("HabitId")]
    [InverseProperty("HabitLogs")]
    public virtual Habit? Habit { get; set; }
}