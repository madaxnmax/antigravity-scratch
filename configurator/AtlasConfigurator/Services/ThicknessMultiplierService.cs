using AtlasConfigurator.Data;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace AtlasConfigurator.Services
{
    public class ThicknessMultiplierService : IThicknessMultiplierService
    {
        private readonly Context _context;

        public ThicknessMultiplierService(Context context)
        {
            _context = context;
        }

        public async Task<List<ThicknessMultiplier>> GetThicknessMultiplier()
        {
            return await _context.ThicknessMultiplier.ToListAsync();
        }
    }
}
