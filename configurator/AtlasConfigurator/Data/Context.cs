using AtlasConfigurator.Models.Auth;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;
namespace AtlasConfigurator.Data
{
    public class Context : DbContext
    {
        public Context(DbContextOptions<Context> options) : base(options)
        {
        }

        public DbSet<Material> Materials { get; set; }
        public DbSet<ProportionValue> ProportionValues { get; set; }
        public DbSet<ThicknessMultiplier> ThicknessMultiplier { get; set; }
        public DbSet<BandMultiplier> BandMultiplier { get; set; }
        public DbSet<MaterialMultiplier> MaterialMultiplier { get; set; }
        public DbSet<AtlasManagement> AtlasManagements { get; set; }
        public DbSet<Kerf> Kerfs { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Material>()
                .Property(m => m.Thickness)
                .HasColumnType("decimal(5, 3)"); // Match the database precision and scale
        }
    }
}
