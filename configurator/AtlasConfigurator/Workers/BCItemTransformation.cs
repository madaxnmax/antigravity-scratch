using AtlasConfigurator.Models.BusinessCentral;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Services;

namespace AtlasConfigurator.Workers
{
    public class BCItemTransformation
    {
        private readonly Authentication _authentication;
        private readonly GetSheetPricing getSheetPricing;
        public BCItemTransformation(Authentication authentication, GetSheetPricing getSheetPricing)
        {
            _authentication = authentication;
            this.getSheetPricing = getSheetPricing;
        }
        public async Task<List<ItemAttributes>> TransformBCItemAttributes(string Type)
        {
            List<BCItemAttributesProperty> itemAttributes = new List<BCItemAttributesProperty>();
            if (Type == "Sheet")
            {
                itemAttributes = await _authentication.GetListOfItemAttributesSheet();
            }
            else if (Type == "Rod")
            {
                itemAttributes = await _authentication.GetListOfItemAttributesRod();
            }
            else if (Type == "Tube")
            {
                itemAttributes = await _authentication.GetListOfItemAttributesTube();
            }

            var itemDetailsList = new List<ItemAttributes>();

            foreach (var attr in itemAttributes)
            {
                var item = itemDetailsList.FirstOrDefault(i => i.ItemNumber == attr.ItemNumber);
                if (item == null)
                {
                    // Corrected to pass itemNumber to the constructor
                    item = new ItemAttributes(attr.ItemNumber);
                    item.GrossWeight = attr.grossWeight;
                    item.NetWeight = attr.netWeight;
                    itemDetailsList.Add(item);
                }
                switch (attr.itemAttributeName)
                {
                    case "NEMA Grade":
                        item.NEMAGrade = item.Rolled == true
                            ? $"{attr.itemAttributeValueName} (Rolled)"
                            : attr.itemAttributeValueName;
                        break;
                    case "Thickness (In)":
                        item.Thicknesses = attr.itemAttributeValueName;
                        break;
                    case "Color":
                        item.Color = attr.itemAttributeValueName;
                        break;
                    case "Width (In)":
                        item.WidthIn = attr.itemAttributeValueName;
                        break;
                    case "MIL-Spec":
                        item.MILSpec = attr.itemAttributeValueName;
                        break;
                    case "MIL-Type":
                        item.MILType = attr.itemAttributeValueName;
                        break;
                    case "Length (In)":
                        item.LengthIn = attr.itemAttributeValueName;
                        break;
                    case "ThickPlus":
                        item.ThickPlus = attr.itemAttributeValueName;
                        break;
                    case "ThickMinus":
                        item.ThickMinus = attr.itemAttributeValueName;
                        break;
                    case "Net Weight":
                        item.NetWeight = decimal.Parse(attr.itemAttributeValueName);
                        break;
                    case "Lam Rod Type":
                        if (attr.itemAttributeValueName == "Rolled and Molded")
                        {
                            item.Rolled = true;
                        }
                        else
                        {
                            item.Rolled = false;
                        }
                        break;
                        // Add cases for other attributes as needed
                }
                if (item.NEMAGrade != null && item.Rolled.Value)
                {
                    item.NEMAGrade = $"{item.NEMAGrade} (Rolled)";
                }
            }
            if (Type == "Sheet")
            {
                itemDetailsList.RemoveAll(item =>
                string.IsNullOrWhiteSpace(item.NEMAGrade) ||
                string.IsNullOrWhiteSpace(item.Thicknesses) ||
                string.IsNullOrWhiteSpace(item.Color) ||
                string.IsNullOrWhiteSpace(item.WidthIn) ||
                string.IsNullOrWhiteSpace(item.LengthIn) ||
                item.ItemNumber.EndsWith("D") ||
                item.ItemNumber.Contains("PS")
);
            }
            else if (Type == "Rod")
            {
                itemDetailsList.RemoveAll(item =>
                string.IsNullOrWhiteSpace(item.NEMAGrade) ||
                string.IsNullOrWhiteSpace(item.Thicknesses) ||
                string.IsNullOrWhiteSpace(item.LengthIn) ||
                  string.IsNullOrWhiteSpace(item.Color)
);
            }

            return itemDetailsList;
            // Now itemDetailsList contains a structured representation of your items.

        }

        public async Task<List<QuantityPricing>> CalculatePricingForQuantities(string quantitiesStr, string itemNumber, string customerNumber)
        {
            var quantityPricings = new List<QuantityPricing>();

            // Split the quantities string by commas and iterate over each quantity
            var quantities = quantitiesStr.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var quantityStr in quantities)
            {
                // Trim spaces and try to parse the quantity
                if (int.TryParse(quantityStr.Trim(), out int quantity))
                {
                    // Retrieve or calculate the price per item for this quantity
                    decimal pricePerItem = await GetPricePerItem(customerNumber, itemNumber, quantity);

                    // Create a new QuantityPricing object and add it to the list
                    var pricing = new QuantityPricing(quantity, pricePerItem);
                    quantityPricings.Add(pricing);
                }
                else
                {
                    // Handle the case where a quantity couldn't be parsed
                    // This might involve logging an error, or adding a placeholder value to indicate an issue
                }
            }

            return quantityPricings;
        }
        public async Task<List<QuantityPricing>> CalculatePricingForCustomSheetsOnly(string quantitiesStr, string itemNumber, decimal pricePer, int minQty)
        {
            var quantityPricings = new List<QuantityPricing>();

            // Split the quantities string by commas and iterate over each quantity
            var quantities = quantitiesStr.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var quantityStr in quantities)
            {
                // Trim spaces and try to parse the quantity
                if (int.TryParse(quantityStr.Trim(), out int quantity))
                {
                    // Retrieve or calculate the price per item for this quantity
                    decimal pricePerItem = pricePer;
                    if (quantity < minQty)
                    {
                        quantity = minQty;
                    }


                    // Create a new QuantityPricing object and add it to the list
                    var pricing = new QuantityPricing(quantity, pricePerItem);
                    quantityPricings.Add(pricing);
                }
                else
                {
                    // Handle the case where a quantity couldn't be parsed
                    // This might involve logging an error, or adding a placeholder value to indicate an issue
                }
            }

            return quantityPricings;
        }
        public async Task<QuantityPricing> CalculatePricingForQuantitySimple(int quantitity, string itemNumber, string customerNumber)
        {
            // Retrieve or calculate the price per item for this quantity
            decimal pricePerItem = await GetPricePerItem(customerNumber, itemNumber, quantitity);

            // Create a new QuantityPricing object and add it to the list
            var pricing = new QuantityPricing(quantitity, pricePerItem);

            return pricing;
        }

        // Example placeholder method for getting the price per item based on quantity
        // You'll need to replace this with your actual pricing logic
        private async Task<decimal> GetPricePerItem(string customer, string item, int quantity)
        {
            var result = await getSheetPricing.GetPricing(customer, item, quantity);
            // Placeholder logic for example purposes
            // In a real application, you might look up the price in a database, or calculate it based on some formula
            return result; // Example fixed price per item
        }

    }
}
