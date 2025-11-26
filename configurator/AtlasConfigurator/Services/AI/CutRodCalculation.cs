using AtlasConfigurator.Helpers.Rods;
using AtlasConfigurator.Models;
using AtlasConfigurator.Models.AI;
using AtlasConfigurator.Models.CutRod;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Workers;
using System.Globalization;


namespace AtlasConfigurator.Services.AI
{
    public class CutRodCalculation
    {
        private BCItemTransformation _bCItemTransformation;
        private CutRodHelper _helper;
        private List<ItemAttributes> itemAttributes = new List<ItemAttributes>();
        private Workers.CutRod.Pricing _pricing;
        private AtlasConfigurator.Workers.CutRod.Optimizations _optimizations;
        private Authentication _authentication;


        public CutRodCalculation(BCItemTransformation bCItemTransformation,
            CutRodHelper rodHelper,
            Workers.CutRod.Pricing pricing,
            AtlasConfigurator.Workers.CutRod.Optimizations optimizations,
            Authentication authentication)
        {
            _bCItemTransformation = bCItemTransformation;
            _helper = rodHelper;
            _pricing = pricing;
            _optimizations = optimizations;
            _authentication = authentication;
        }

        public CutRodQuote cutRodQuote = new CutRodQuote();
        public List<CutRodQuote> cutRodQuotes = new List<CutRodQuote>();
        public List<QuantityPricing> quantityPricing = new List<QuantityPricing>();

        private decimal KerfData = 0.2M;


        public async Task<List<CutRodQuote>> CalcCutRod(AIProcessResponse response, string customer, List<ItemAttributes> BCRods, string connectionId)
        {
            itemAttributes = BCRods;
            cutRodQuotes = new List<CutRodQuote>();
            cutRodQuote = new CutRodQuote();
            quantityPricing = new List<QuantityPricing>();

            foreach (var rod in response.rod_value)
            {
                cutRodQuote = new CutRodQuote();
                if (!string.IsNullOrEmpty(rod.Length))
                {
                    ItemAttributes selectedItem = null;
                    List<ItemAttributes> stocks = new List<ItemAttributes>();

                    cutRodQuote.Customer = customer;
                    cutRodQuote.GradeDropdown = rod.Grade;
                    cutRodQuote.DiameterDropdown = decimal.Parse(rod.Diameter, CultureInfo.InvariantCulture);
                    cutRodQuote.Quantity = rod.Quantity;
                    cutRodQuote.Kerf = KerfData;
                    cutRodQuote.Length = decimal.TryParse(rod.Length, out decimal length) ? length : 0m;
                    cutRodQuote.LengthMinus = decimal.TryParse(rod.RodLengthToleranceMinus, out decimal lengthMinus) ? lengthMinus : 0m;
                    cutRodQuote.LengthPlus = decimal.TryParse(rod.LengthTolerancePlus, out decimal lengthPlus) ? lengthPlus : 0m;

                    cutRodQuote.Color = rod.Color;

                    if (cutRodQuote.DiameterDropdown == null)
                    {
                        cutRodQuote.DiameterDropdown = int.Parse(rod.Diameter, CultureInfo.InvariantCulture);
                    }

                    decimal lengthValue = (cutRodQuote.Length - cutRodQuote.LengthMinus) + 0.010M;

                    selectedItem = itemAttributes
                                        .Where(attr => attr.NEMAGrade == rod.Grade && attr.Thicknesses == rod.Diameter && attr.Color.ToLower() == rod.Color.ToLower())
                                        .FirstOrDefault();

                    stocks.Add(selectedItem);

                    cutRodQuote.ItemNo = selectedItem.ItemNumber;

                    var cutPiece = new CutPiece
                    {
                        Length = lengthValue,
                        Quantity = int.Parse(rod.Quantity),
                        Diameter = Convert.ToDecimal(cutRodQuote.DiameterDropdown),
                        ToleranceMinusLength = cutRodQuote.LengthMinus,
                        TolerancePlusLength = cutRodQuote.LengthPlus,
                        Grade = cutRodQuote.GradeDropdown
                    };


                    var result = await _helper.SetupCutRodPricing(cutPiece, customer, cutRodQuote, stocks, connectionId);

                    cutRodQuote.Pricing.Add(result);
                    cutRodQuotes.Add(cutRodQuote);
                    cutRodQuote = new CutRodQuote();
                }
            }

            return cutRodQuotes;
        }
    }
}
