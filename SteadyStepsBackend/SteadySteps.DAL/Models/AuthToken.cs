using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.DAL.Models;

public partial class AuthToken
{
    [Key]
    public int TokenId { get; set; }

    public int? UserId { get; set; }

    [StringLength(255)]
    public string Token { get; set; } = null!;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? ExpiresAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AuthTokens")]
    public virtual User? User { get; set; }
}