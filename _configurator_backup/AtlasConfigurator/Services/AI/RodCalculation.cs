using AtlasConfigurator.Helpers.Rods;
using AtlasConfigurator.Models;
using AtlasConfigurator.Models.AI;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Workers;
using System.Globalization;

namespace AtlasConfigurator.Services.AI
{
    public class RodCalculation
    {
        private BCItemTransformation _bCItemTransformation;
        private RodHelper _helper;
        private List<ItemAttributes> itemAttributes = new List<ItemAttributes>();

        public RodCalculation(BCItemTransformation bCItemTransformation, RodHelper rodHelper)
        {
            _bCItemTransformation = bCItemTransformation;
            _helper = rodHelper;
        }

        public RodQuote rodQuote = new RodQuote();
        public List<RodQuote> rodQuotes = new List<RodQuote>();
        public List<QuantityPricing> quantityPricing = new List<QuantityPricing>();


        public async Task<List<RodQuote>> CalcRod(AIProcessResponse response, string customer, List<ItemAttributes> BCRods)
        {
            itemAttributes = BCRods;
            rodQuotes = new List<RodQuote>();
            rodQuote = new RodQuote();
            quantityPricing = new List<QuantityPricing>();

            foreach (var rod in response.rod_value)
            {
                if (string.IsNullOrEmpty(rod.Length))
                {
                    rodQuote = new RodQuote();
                    ItemAttributes selectedItem = null;

                    rodQuote.Quantity = rod.Quantity;
                    rodQuote.Customer = customer;
                    rodQuote.GradeDropdown = rod.Grade;
                    rodQuote.Color = rod.Color;
                    rodQuote.DiameterDropdown = decimal.Parse(rod.Diameter, CultureInfo.InvariantCulture);

                    selectedItem = itemAttributes
                        .Where(attr => attr.NEMAGrade == rod.Grade && attr.Thicknesses == rod.Diameter && attr.Color.ToLower() == rod.Color.ToLower())
                    .FirstOrDefault();

                    if (selectedItem == null)
                    {
                        continue;
                    }

                    quantityPricing = await _bCItemTransformation.CalculatePricingForQuantities(rod.Quantity, selectedItem.ItemNumber, customer);

                    if (quantityPricing == null)
                    {
                        continue;
                    }

                    rodQuote.ItemNo = selectedItem.ItemNumber;
                    rodQuote.Pricing = quantityPricing;

                    rodQuotes.Add(rodQuote);
                }
            }

            return rodQuotes;
        }
    }
}
