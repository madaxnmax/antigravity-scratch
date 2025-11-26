using AtlasConfigurator.Data;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace AtlasConfigurator.Services
{
    public class BandMultiplierService : IBandMultiplierService
    {
        private readonly Context _context;

        public BandMultiplierService(Context context)
        {
            _context = context;
        }
        public async Task<List<BandMultiplier>> GetBandMultiplier()
        {
            return await _context.BandMultiplier.ToListAsync();
        }
    }
}
