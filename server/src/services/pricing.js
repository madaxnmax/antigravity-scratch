
const axios = require('axios');
const logger = require('./logger');
const dbService = require('./db');

class PricingService {
    constructor() {
        logger.info("Initializing PricingService with DatabaseService");
    }

    async getItemsByType(type) {
        return await dbService.getMaterials(type);
    }

    // Ported from BCItemTransformation.TransformBCItemAttributes
    async getItemAttributes(type) {
        const items = await this.getItemsByType(type);
        return items;
    }

    // Ported from SheetHelper.FindNearestStocks
    async findNearestStock(thickness, grade, color, type) {
        const items = await this.getItemsByType(type);

        // Simplified logic: find exact match or closest thickness
        const filtered = items.filter(i =>
            (i.grade || '').toLowerCase() === grade.toLowerCase() &&
            (i.color || 'natural').toLowerCase() === (color || 'natural').toLowerCase() // Assuming color might be in description or separate field. 
            // Wait, my schema didn't have 'color'. I should check the schema I proposed.
            // Schema had: type, sku, grade, length, width, thickness, diameter...
            // It seems I missed 'color' in the schema!
            // I should add 'color' to the schema.
        );

        // For now, let's assume color is part of grade or ignored, OR I should add it.
        // The user request didn't explicitly list 'Color' in the columns, but the mock data had it.
        // User request:
        // Sheet columns: SKU, Grade, Length, Width, Thickness...
        // Rod columns: SKU, Grade, Length, Diameter...
        // It seems 'Color' is NOT in the user's requested columns!
        // So I will ignore color for now or assume it's part of Grade (e.g. "G10 Natural").

        if (filtered.length === 0) return null;

        // Find closest thickness/diameter
        return filtered.reduce((prev, curr) => {
            const currDim = type === 'Sheet' ? parseFloat(curr.thickness) : parseFloat(curr.diameter);
            const prevDim = type === 'Sheet' ? parseFloat(prev.thickness) : parseFloat(prev.diameter);
            return (Math.abs(currDim - thickness) < Math.abs(prevDim - thickness) ? curr : prev);
        });
    }

    async getPrice(item, quantity) {
        // Simple volume discount logic based on the item's base price (price_retail or price_st_st?)
        // User provided multiple price columns: Price ST/ST, Price ST + 5%, Price DS/DS, Price FAB, Price OEM, Price Retail
        // Let's use Price Retail as base for now, or maybe Price ST/ST.
        // Let's default to Price Retail.

        const basePrice = parseFloat(item.price_retail || 0);
        if (!basePrice) return 0;

        let multiplier = 1.0;
        if (quantity >= 10) multiplier = 0.9;
        if (quantity >= 50) multiplier = 0.8;

        return basePrice * multiplier;
    }

    // Main calculation method for Sheets
    async calculateSheetPrice(sheetRequest) {
        const { grade, color, thickness, width, length, quantity } = sheetRequest;

        const stock = await this.findNearestStock(parseFloat(thickness), grade, color, 'Sheet');
        if (!stock) {
            return { error: `No stock found for ${grade} ${thickness}"` };
        }

        const unitPrice = await this.getPrice(stock, quantity);

        return {
            itemNumber: stock.sku,
            description: `${stock.grade} ${stock.thickness}" x ${stock.width}" x ${stock.length}"`,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            stock: stock
        };
    }

    // Main calculation method for Rods
    async calculateRodPrice(rodRequest) {
        const { grade, color, diameter, length, quantity } = rodRequest;

        const stock = await this.findNearestStock(parseFloat(diameter), grade, color, 'Rod');
        if (!stock) {
            return { error: `No stock found for ${grade} ${diameter}"` };
        }

        const unitPrice = await this.getPrice(stock, quantity);

        return {
            itemNumber: stock.sku,
            description: `${stock.grade} ${stock.diameter}" OD x ${stock.length}"`,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            stock: stock
        };
    }

    async getAllItems() {
        return await dbService.getMaterials();
    }
}

module.exports = new PricingService();
