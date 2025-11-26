const axios = require('axios');

class PricingService {
    constructor() {
        // Mock data for now
        this.mockItems = [
            {
                ItemNumber: "SHEET-G10-NAT-0.25-36-48",
                NEMAGrade: "G10",
                Thicknesses: "0.25",
                Color: "Natural",
                WidthIn: "36",
                LengthIn: "48",
                MILSpec: "MIL-I-24768/2",
                BasePrice: 100.00
            },
            {
                ItemNumber: "SHEET-FR4-NAT-0.125-36-48",
                NEMAGrade: "FR4",
                Thicknesses: "0.125",
                Color: "Natural",
                WidthIn: "36",
                LengthIn: "48",
                MILSpec: "MIL-I-24768/27",
                BasePrice: 80.00
            },
            {
                ItemNumber: "ROD-G10-NAT-1.0-48",
                NEMAGrade: "G10",
                Thicknesses: "1.0", // Diameter
                Color: "Natural",
                LengthIn: "48",
                BasePrice: 50.00
            }
        ];
    }

    // Ported from BCItemTransformation.TransformBCItemAttributes
    async getItemAttributes(type) {
        // In real implementation, this would call BC API
        // For now, return mock items filtered by type logic (simplified)
        if (type === 'Sheet') {
            return this.mockItems.filter(i => i.ItemNumber.startsWith('SHEET'));
        } else if (type === 'Rod') {
            return this.mockItems.filter(i => i.ItemNumber.startsWith('ROD'));
        }
        return [];
    }

    // Ported from SheetHelper.FindNearestStocks
    findNearestStock(thickness, grade, color, type) {
        // Simplified logic: find exact match or closest thickness
        const items = this.mockItems.filter(i =>
            i.NEMAGrade === grade &&
            i.Color.toLowerCase() === color.toLowerCase() &&
            (type === 'Sheet' ? i.ItemNumber.startsWith('SHEET') : i.ItemNumber.startsWith('ROD'))
        );

        if (items.length === 0) return null;

        // Find closest thickness
        return items.reduce((prev, curr) => {
            return (Math.abs(parseFloat(curr.Thicknesses) - thickness) < Math.abs(parseFloat(prev.Thicknesses) - thickness) ? curr : prev);
        });
    }

    // Ported from GetSheetPricing.GetPricing (referenced in BCItemTransformation)
    async getPrice(customerNumber, itemNumber, quantity) {
        const item = this.mockItems.find(i => i.ItemNumber === itemNumber);
        if (!item) return 0;

        // Simple volume discount logic
        let multiplier = 1.0;
        if (quantity >= 10) multiplier = 0.9;
        if (quantity >= 50) multiplier = 0.8;

        return item.BasePrice * multiplier;
    }

    // Main calculation method for Sheets (Ported from SheetCalculation.cs)
    async calculateSheetPrice(sheetRequest) {
        const { grade, color, thickness, width, length, quantity } = sheetRequest;

        const stock = this.findNearestStock(parseFloat(thickness), grade, color, 'Sheet');
        if (!stock) {
            return { error: `No stock found for ${grade} ${color} ${thickness}"` };
        }

        const unitPrice = await this.getPrice("CUST001", stock.ItemNumber, quantity);

        // Calculate total price
        // Logic from SheetCalculation: 
        // If cut piece, we might need to account for yield (handled by OptiCutter usually, but here we just price the sheets needed)
        // For simple sheet pricing, it's Unit Price * Quantity

        return {
            itemNumber: stock.ItemNumber,
            description: `${stock.NEMAGrade} ${stock.Color} ${stock.Thicknesses}" x ${stock.WidthIn}" x ${stock.LengthIn}"`,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            stock: stock
        };
    }

    // Main calculation method for Rods (Ported from CutRodCalculation.cs)
    async calculateRodPrice(rodRequest) {
        const { grade, color, diameter, length, quantity } = rodRequest;

        const stock = this.findNearestStock(parseFloat(diameter), grade, color, 'Rod');
        if (!stock) {
            return { error: `No stock found for ${grade} ${color} ${diameter}"` };
        }

        const unitPrice = await this.getPrice("CUST001", stock.ItemNumber, quantity);

        return {
            itemNumber: stock.ItemNumber,
            description: `${stock.NEMAGrade} ${stock.Color} ${stock.Thicknesses}" OD x ${stock.LengthIn}"`,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            stock: stock
        };
    }
}

module.exports = new PricingService();
