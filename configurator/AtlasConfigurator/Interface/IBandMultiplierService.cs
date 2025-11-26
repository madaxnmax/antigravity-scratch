using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Interface
{
    public interface IBandMultiplierService
    {
        Task<List<BandMultiplier>> GetBandMultiplier();

    }
}
