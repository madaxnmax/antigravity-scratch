using AtlasConfigurator.Data;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace AtlasConfigurator.Services
{
    public class ProportionValueService : IProportionValueService
    {
        private readonly Context _context;

        public ProportionValueService(Context context)
        {
            _context = context;
        }

        public async Task<List<ProportionValue>> GetProportionsByLAndW(string l, string w)
        {
            return await _context.ProportionValues.Where(m => m.Length == Convert.ToInt32(l) && m.Width == Convert.ToInt32(w)).ToListAsync();
        }
        public async Task<List<ProportionValue>> GetProportions()
        {
            return await _context.ProportionValues.ToListAsync();
        }

    }
}
