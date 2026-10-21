using SteadySteps.DAL.Data;
using SteadySteps.WebHost;
using SteadySteps.WebHost.Seeding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.AddLogging();
builder.AddSwagger();
builder.AddDbContext();
builder.AddIdentity();
builder.AddCors();
builder.AddAutoMapper();
builder.AddServices();
builder.AddDemoData();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<SteadyStepsDbContext>();
        await context.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying migrations.");
    }

    if (app.Environment.IsDevelopment())
    {
        try
        {
            await services.GetRequiredService<DemoDataSeeder>().SeedAsync();
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding demo data.");
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();