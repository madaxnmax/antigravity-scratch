using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Interface
{
    public interface IMaterialkMultiplierService
    {
        Task<List<MaterialMultiplier>> GetMaterialMultiplier();

    }
}
