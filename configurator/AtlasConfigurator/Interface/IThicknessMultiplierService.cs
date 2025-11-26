using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Interface
{
    public interface IThicknessMultiplierService
    {
        Task<List<ThicknessMultiplier>> GetThicknessMultiplier();

    }
}
