using AtlasConfigurator.Data;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace AtlasConfigurator.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly Context _context;

        public MaterialService(Context context)
        {
            _context = context;
        }

        public async Task<List<string>> GetGradesAsync()
        {
            return await _context.Materials.Select(m => m.Grade).Distinct().ToListAsync();
        }

        public async Task<List<decimal>> GetThicknessesByGradeAsync(string grade)
        {
            return await _context.Materials
                                  .Where(m => m.Grade == grade)
                                  .Select(m => m.Thickness)
                                  .Distinct()
                                  .ToListAsync();
        }
        public async Task<List<string>> GetSizesByGradeAndThicknessAsync(string grade, decimal thickness)
        {
            return await _context.Materials
                                  .Where(m => m.Grade == grade && m.Thickness == thickness)
                                  .Select(m => m.Size)
                                  .Distinct()
                                  .ToListAsync();
        }
        public async Task<List<string>> GetColorsByGradeAndThicknessAndSizeAsync(string grade, decimal thickness, string size)
        {
            return await _context.Materials
                                  .Where(m => m.Grade == grade && m.Thickness == thickness && m.Size == size)
                                  .Select(m => m.Color)
                                  .Distinct()
                                  .ToListAsync();
        }


        public async Task<List<Material>> GetMaterialByNo(string No)
        {
            return await _context.Materials.Where(m => m.No == No).Distinct().ToListAsync();
        }
        public async Task<decimal> GetMaterialKerfByGradeThickness(string grade, decimal thickness)
        {
            try
            {
                var kerfValue = await _context.Kerfs
                                          .Where(k => k.Grade == grade && k.Thickness <= thickness)
                                          .OrderByDescending(k => k.Thickness)
                                          .Select(k => (decimal)k.KerfValue)
                                          .FirstOrDefaultAsync();
                if (kerfValue == null)
                {
                    return 0.2M;
                }

                return kerfValue;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return 0.2M;

            }
            // Find the highest thickness that is less than or equal to the given thickness

        }

    }

}
