using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Interface
{
    public interface IProportionValueService
    {
        Task<List<ProportionValue>> GetProportionsByLAndW(string l, string w);
        Task<List<ProportionValue>> GetProportions();
    }
}
