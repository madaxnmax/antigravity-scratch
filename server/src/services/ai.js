const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const synonymMappings = require('./synonym_dictionary.json');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.synonymMappings = synonymMappings;
    }

    replaceSynonyms(text) {
        if (!text) return "unknown";

        // Replace "x" in dimensions to avoid replacing it as a synonym
        text = text.replace(/(\d+)\s*[xX]\s*(\d+)/g, '$1 _x_ $2');

        for (const [standard, synonyms] of Object.entries(this.synonymMappings)) {
            for (const synonym of synonyms) {
                if (text.toLowerCase() === synonym.toLowerCase()) {
                    text = standard;
                    break;
                }
            }
        }

        if (text.toLowerCase() === "nat") text = "natural";
        return text.replace(/_x_/g, 'x');
    }

    validateColor(color) {
        if (!color) return null;
        const validColors = ["natural", "blue", "red", "pistachio", "yellow", "green", "brown", "black"];
        const words = color.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (validColors.includes(word)) return word;
        }
        return null;
    }

    async parseEmail(content) {
        const prompt = `
        We are an organization that sells various grades of plastic in different forms—sheets, rods, tubes, and rings. Each quote is customized based on the customer’s request, which is often presented in unstructured email formats. To generate accurate quotes, we need to convert this information into a structured table format. Different materials and larger sizes have higher costs, so our columns include all the variables necessary for our quote configurator to deliver precise pricing. We receive quotation requests from customers via email.

        Extract the order details from the following email and format it into structured JSON data for cut pieces.
        The customer may request the same item multiple times but with different quantities.
        For each distinct request, generate a separate JSON entry with the following fields for sheets, rods, and tubes:

        For sheets: Grade, Color, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Width, Width + Tolerance, Width - Tolerance, Width Unit of Measure, Thickness, Thickness + Tolerance, Thickness - Tolerance, Thickness Unit of Measure, Number of Masked Sides, Number of Sanded Sides, Grain Direction, Quantity, Quantity Unit of Measure, Testing Required, Domestic Material.
        1. For the "Number of Masked Sides" key, identify if 'M1S' (Mask One Side) or 'M2S' (Mask Two Sides) is mentioned in the email content. Set the value to '1' if 'M1S' is present and '2' if 'M2S' is present.
        2. For the "Number of Sanded Sides" key, identify if 'S1S' or 'S2S' is mentioned in the email content. Set the value to '1' if 'S1S' is present and '2' if 'S2S' is present. Do not include 'S1S' or 'S2S' in the value, only the corresponding numeric quantity.

        For rods: Grade, Color, Diameter, Diameter + Tolerance, Diameter - Tolerance, Diameter Unit of Measure, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Quantity, Quantity Unit of Measure, Hex Rod, Rolled and Molded, Testing Required, Domestic Material.

        For rings or washers: rings or washers mentioned in email-body Grade, Color, Outer Diameter, Outer Diameter + Tolerance, Outer Diameter - Tolerance, Outer Diameter Unit of Measure, Inner Diameter, Inner Diameter + Tolerance, Inner Diameter - Tolerance, Inner Diameter Unit of Measure, Thickness, Thickness + Tolerance, Thickness - Tolerance, Thickness Unit of Measure, Quantity, Quantity Unit of Measure, Testing Required, Domestic Material, Flag_Ring.

        For tubes: Grade, Color, Outer Diameter, Outer Diameter + Tolerance, Outer Diameter - Tolerance, Outer Diameter Unit of Measure, Inner Diameter, Inner Diameter + Tolerance, Inner Diameter - Tolerance, Inner Diameter Unit of Measure, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Quantity, Quantity Unit of Measure, Testing Required, Domestic Material.

        Use the subject line as a potential source for global attributes like shape, grade, thickness, or any other details that apply to the entire order.
        If the email contains "or" when describing items or quantities, treat each option as a separate line item. For example:
        "4, 5, or 7 pieces" should be quoted as three separate lines, one for 4 pieces, one for 5 pieces, and one for 7 pieces.
        "G10 or FR4" should be quoted as two separate lines, one for G10 and one for FR4.
        If the customer specifies both domestic and import options, create multiple entries with "domestic material" set to "true" and "false" accordingly.(In json true and false value must be in string)
        Additionally, if a customer specifies a wall thickness and an outer or inner diameter, calculate and provide both the inner and outer diameters in the response.

        If the tolerance value is present and not zero, the model must strictly append a '+' sign for fields like 'diameter + tolerance' and a '-' sign for fields like 'inner diameter - tolerance.' The model must not perform any arithmetic and should only append these signs ('+' or '-') to the values as instructed. If the tolerance value is zero or not provided in the email, no signs should be added. The model must strictly adhere to the rule that if no tolerance information is provided in the content, the tolerance field must be left blank and no value should be assigned.

        If the email content contains the following color codes: 'nat' or 'natu', set the "color" key value to "Natural"; if it contains 'blk', set the "color" key value to "black"; and if it contains 'grn', set the "color" key value to "green." If no color is mentioned in the email, leave the "color" key empty or omit it from the output.

        If the email content contains fractional values such as '1/8' or '1 1/4,' convert them to their decimal equivalents. For example, '1/8' should be converted to '0.125' and '1 1/8' should be converted to '1.125' before displaying on the GUI.

        For "testing required" set the value to "true" if the email content includes any of the following phrases: "TEST REPORTS Required," "+ testing," "lot testing," "lot test," "certs," "certification," "material certification," "traceability," "must have traceability," "all materials must come with certification," or "all material needs testing."

        For the 'Hex Rod' column, add a Boolean field Hex Rod for rods. Set this field to true only if the customer explicitly mentions 'hex' or 'hex rod' in the description; otherwise, set it to false.

        For the 'rolled and molded' column in rods, set it to 'true' if the email content contains any of the following phrases: 'Molded rod,' 'rolled rod,' or 'rolled and molded' for a rod. If none of these phrases are present, set it to 'false.'

        For "domestic material," set the value to "true" if the email content includes phrases such as "domestic," "DFARS," "Berry compliant," "material must be domestic," or "all materials must be domestic."

        Classify an item as a 'washer' or 'ring' only if the description explicitly mentions 'washer' or 'ring.' Classify all other items based on their description, ensuring tubes are not misclassified as washers or rings unless explicitly stated.

        Do not repeat or duplicate values for any items that have the same details, even if they are mentioned multiple times in the email only add them once.

        When a range is specified for Length, Width, Thickness, Diameter, Outer Diameter, or Inner Diameter, select the nominal midpoint as the target value, ensuring measurements stay within the customer’s minimum and maximum limits. If a tolerance range is included, use the midpoint of that tolerance range as well. If no tolerance range is provided, apply the given value directly, and omit any tolerance if it’s not specified.

        For quantity unit of measure, when extracting quantity, represent it as a numeric value without appending terms like 'total' or 'overall'. For quantity units, use specific material units (such as pieces, sheets, rods, etc.) and avoid general terms. Only include standard measurement units for dimensions and quantities.

        For Grade mapping, use the dictionary ${JSON.stringify(this.synonymMappings)} to assign the appropriate grade to sheets, rods, tubes, and rings.

        Identify all grade types from the email content by checking each term separately against each entry in the synonym mappings. For each grade term identified, independently add the grade to the list if it has a match within the mappings. Make sure that each term is compared exhaustively to capture multiple matches. For example, if 'G11' is there one grade is 'G11' and along with this 'MIL-I-24768/28 (GEB-F)' appears, it should trigger 'FR5' also based on the mappings, so both should be listed in 'Grades' as separate items. Double-check that the final list contains all grades linked to each detected term, ensuring completeness without missing any applicable grades. Also when responding to requests that mention 'G10' or 'G-10,' treat them as if they asked for both 'G10'

        You need to send a JSON object with the following structure:
        {
            "sheet_value": [
            { "key": "value" },
            { "key": "value2" }
            ],
            "rod_value": [
            { "key": "value" }
            ],
            "tube_value": [
            { "key": "value" }
            ],
            "ring_value": [
            { "key": "value" }
            ]
        }
        Ensure there is no additional text or explanation before or after the JSON.
        Email content: \n\n${content}
        `;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo-preview", // Using a capable model
                response_format: { type: "json_object" },
                temperature: 0,
            });

            const responseContent = completion.choices[0].message.content;
            let parsedData = JSON.parse(responseContent);

            // Post-processing (synonyms and validation)
            const processItems = (items) => {
                if (!items) return [];
                return items.map(item => {
                    if (item.Grade) item.Grade = this.replaceSynonyms(item.Grade);
                    if (item.Color) item.Color = this.validateColor(item.Color);
                    return item;
                });
            };

            parsedData.sheet_value = processItems(parsedData.sheet_value);
            parsedData.rod_value = processItems(parsedData.rod_value);
            parsedData.tube_value = processItems(parsedData.tube_value);
            parsedData.ring_value = processItems(parsedData.ring_value);

            return parsedData;

        } catch (error) {
            console.error("AI Parsing Error:", error);
            throw error;
        }
    }
}

module.exports = new AIService();
