using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SteadySteps.DAL.Models;

public partial class Goal
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int GoalId { get; set; }

    public int? UserId { get; set; }

    public int? HabitId { get; set; }

    public int? Target { get; set; }

    public int? CurrentProgress { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    [ForeignKey("HabitId")]
    [InverseProperty("Goals")]
    public virtual Habit? Habit { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Goals")]
    public virtual User? User { get; set; }
}