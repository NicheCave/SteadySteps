using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.DAL.Models;

[Microsoft.EntityFrameworkCore.Index("Email", Name = "Users_Email_Key", IsUnique = true)]
[Microsoft.EntityFrameworkCore.Index("Username", Name = "Users_Username_Key", IsUnique = true)]
public partial class User
{
    [Key]
    public int UserId { get; set; }

    [StringLength(50)]
    public string Username { get; set; } = null!;

    [StringLength(255)]
    public string PasswordHash { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(20)]
    public string Role { get; set; } = null!;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? RegisterDate { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? LastLogin { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<AuthToken> AuthTokens { get; set; } = new List<AuthToken>();

    [InverseProperty("User")]
    public virtual ICollection<Goal> Goals { get; set; } = new List<Goal>();

    [InverseProperty("User")]
    public virtual ICollection<Habit> Habits { get; set; } = new List<Habit>();
}
