using AtlasConfigurator.Components;
using AtlasConfigurator.Data;
using AtlasConfigurator.Helpers.CustomGrind;
using AtlasConfigurator.Helpers.Rods;
using AtlasConfigurator.Helpers.Sheets;
using AtlasConfigurator.Helpers.Washers;
using AtlasConfigurator.Hubs;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Services;
using AtlasConfigurator.Services.AI;
using AtlasConfigurator.Workers;
using AtlasConfigurator.Workers.CutPieceSand;
using Microsoft.EntityFrameworkCore;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddScoped<ThemeService>();
AzureVaultAuthentication az = new AzureVaultAuthentication();
var dbCon = az.RetrieveSecret("SQLProduction");
string connectionString = dbCon;

builder.Services.AddDbContext<Context>(options =>
    options.UseSqlServer(connectionString),
   ServiceLifetime.Scoped);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyHeader()
               .AllowAnyMethod()
               .SetIsOriginAllowed(_ => true)
               .AllowCredentials();
    });
});
builder.Services.AddSignalR();
builder.Services.AddSingleton<JobTaskManager>();


builder.Services.AddScoped<AzureVaultAuthentication>();
builder.Services.AddScoped<Authentication>();
builder.Services.AddScoped<Pricing>();
builder.Services.AddScoped<Costing>();
builder.Services.AddScoped<BCItemTransformation>();
builder.Services.AddScoped<SmartCalculationService>();
builder.Services.AddScoped<IMaterialService, MaterialService>();
builder.Services.AddScoped<IProportionValueService, ProportionValueService>();
builder.Services.AddScoped<IThicknessMultiplierService, ThicknessMultiplierService>();
builder.Services.AddScoped<IBandMultiplierService, BandMultiplierService>();
builder.Services.AddScoped<IMaterialkMultiplierService, MaterialMultiplierService>();
builder.Services.AddScoped<IAtlasManagementService, AtlasManagementService>();
builder.Services.AddScoped<PricingRetrieveData>();
builder.Services.AddScoped<Testing>();
builder.Services.AddScoped<Optimizations>();
builder.Services.AddScoped<AtlasConfigurator.Workers.CutRod.Pricing>();
builder.Services.AddScoped<AtlasConfigurator.Workers.CutRod.Optimizations>();
builder.Services.AddScoped<AtlasConfigurator.Workers.CutRod.Costing>();


builder.Services.AddScoped<Sanding>();
builder.Services.AddScoped<GetSheetPricing>();

builder.Services.AddScoped<WorkOsAuthService>();

builder.Services.AddHttpClient<WorkOsAuthService>();

builder.Services.AddScoped<WasherHelper>();
builder.Services.AddScoped<SheetHelper>();
builder.Services.AddScoped<CutSheetHelper>();
builder.Services.AddScoped<RodHelper>();
builder.Services.AddScoped<CutRodHelper>();
builder.Services.AddScoped<CustomGrindHelper>();

builder.Services.AddScoped<WasherCalculation>();
builder.Services.AddScoped<SheetCalculation>();
builder.Services.AddScoped<CutSheetCalculation>();
builder.Services.AddScoped<CutSheetHelper>();
builder.Services.AddScoped<RodCalculation>();
builder.Services.AddScoped<CutRodCalculation>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddControllersWithViews();

builder.WebHost.UseSetting(WebHostDefaults.DetailedErrorsKey, "true");
string applicationInsightsConnectionString = "InstrumentationKey=33fd6854-721f-4553-933f-d8f164437944;IngestionEndpoint=https://eastus2-3.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus2.livediagnostics.monitor.azure.com/;ApplicationId=e8ead81c-e1ee-45bd-9e71-591a10eb319e"; // Replace with your Application Insights connection string from Azure

builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = applicationInsightsConnectionString;
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseCors("AllowAll");
app.MapHub<JobStatusHub>("/jobStatusHub"); // SignalR Hub Endpoint
app.UseAntiforgery();
app.MapControllers();




app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
