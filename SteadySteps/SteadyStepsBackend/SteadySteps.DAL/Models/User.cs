using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace SteadySteps.DAL.Models;

public class User : IdentityUser<Guid>
{
    [Required]
    [StringLength(20)]
    public UserRole Role { get; set; } = UserRole.User;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? RegisterDate { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? LastLogin { get; set; }

    [Required]
    public bool IsDeleted { get; set; } = false;
}

public enum UserRole
{
    Admin,
    User,
    Moderator
}