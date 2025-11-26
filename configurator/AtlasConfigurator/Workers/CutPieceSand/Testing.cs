using AtlasConfigurator.Interface;

namespace AtlasConfigurator.Workers.CutPieceSand
{
    public class Testing
    {
        private readonly IMaterialkMultiplierService _mm;
        private readonly IThicknessMultiplierService _tm;
        private readonly IBandMultiplierService _bm;

        public Testing(IMaterialkMultiplierService mm, IThicknessMultiplierService tm, IBandMultiplierService bm)
        {
            _mm = mm;
            _tm = tm;
            _bm = bm;
        }

        public async Task TestingMethod()
        {
            try
            {
                var materialMultiplier = await _mm.GetMaterialMultiplier();
                var thicknessMultiplier = await _tm.GetThicknessMultiplier();
                var bandMultiplier = await _bm.GetBandMultiplier();
            }
            catch (Exception ex)
            {
                // Log or handle the exception
                Console.WriteLine(ex.Message);
            }

        }
    }
}
