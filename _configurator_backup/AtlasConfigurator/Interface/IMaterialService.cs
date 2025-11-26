using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Interface
{
    public interface IMaterialService
    {
        Task<List<string>> GetGradesAsync();
        Task<List<decimal>> GetThicknessesByGradeAsync(string grade);
        Task<List<string>> GetColorsByGradeAndThicknessAndSizeAsync(string grade, decimal thickness, string size);
        Task<List<Material>> GetMaterialByNo(string No);
        Task<List<string>> GetSizesByGradeAndThicknessAsync(string grade, decimal thickness);
        Task<decimal> GetMaterialKerfByGradeThickness(string grade, decimal thickness);
    }
}
