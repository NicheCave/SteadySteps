using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SteadySteps.DAL.Models;

public partial class AuthToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TokenId { get; set; }

    public int? UserId { get; set; }

    [StringLength(255)]
    public string Token { get; set; } = null!;

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [Column(TypeName = "timestamp without time zone")]
    public DateTime? ExpiresAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    [ForeignKey("UserId")]
    [InverseProperty("AuthTokens")]
    [JsonIgnore] 
    public virtual User? User { get; set; }
}