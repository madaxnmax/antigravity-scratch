using AtlasConfigurator.Data;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace AtlasConfigurator.Services
{
    public class MaterialMultiplierService : IMaterialkMultiplierService
    {
        private readonly Context _context;

        public MaterialMultiplierService(Context context)
        {
            _context = context;
        }

        public async Task<List<MaterialMultiplier>> GetMaterialMultiplier()
        {
            return await _context.MaterialMultiplier.ToListAsync();
        }
    }
}
