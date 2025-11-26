using AtlasConfigurator.Models.CutAlgorithm;

namespace AtlasConfigurator.Services.CutAlgorithm
{
    public class Calculation
    {
        public OptimizationResult Calculate(OptimizationRequest request)
        {


            // Ensure StackHeight is valid
            if (request.Saw.StackHeight <= 0)
            {
                request.Saw.StackHeight = 1;
            }


            // Initialize the algorithm
            var algorithm = new MaximalRectanglesAlgorithm(request.Saw);

            // Perform optimization
            var cuttingPlans = algorithm.OptimizeCuttingPlans(request.Stocks, request.Parts);

            // Group identical cutting plans
            var groupedPlans = new Dictionary<string, CuttingPlan>();

            foreach (var plan in cuttingPlans)
            {
                var key = plan.GetPlanKey();

                if (groupedPlans.ContainsKey(key))
                {
                    // Increment the quantity
                    groupedPlans[key].Quantity += plan.Quantity;
                }
                else
                {
                    // Set StackHeight and initial TotalSets
                    plan.StackHeight = request.Saw.StackHeight;
                    plan.TotalSets = 1; // Will be recalculated later
                    groupedPlans.Add(key, plan);
                }
            }

            var uniqueCuttingPlans = groupedPlans.Values.ToList();

            // Calculate total cost and prepare visualizations
            double totalCost = 0;
            var imageList = new List<byte[]>();

            foreach (var plan in uniqueCuttingPlans)
            {
                // Recalculate TotalSets
                plan.TotalSets = (int)Math.Ceiling((double)plan.Quantity / plan.StackHeight);

                // Generate visualization
                var imageBytes = GenerateCuttingPlanImage(plan);
                var base64Image = Convert.ToBase64String(imageBytes);
                plan.Visualization = $"data:image/png;base64,{base64Image}";

                // Add image to the list
                imageList.Add(imageBytes);
                // Calculate total cost
                totalCost += plan.Quantity * plan.Stock.Cost;
            }

            // Generate PDF from images
            // var pdfBytes = GeneratePdfFromImages(imageList);

            // Identify any unplaced parts
            var unplacedParts = algorithm.GetUnplacedParts();

            // Prepare and return the result
            var result = new OptimizationResult
            {
                CuttingPlans = uniqueCuttingPlans,
                TotalCost = totalCost,
                UnplacedParts = unplacedParts,
                //PdfReport = $"data:application/pdf;base64,{Convert.ToBase64String(pdfBytes)}"

            };

            return result;
        }
        private byte[] GenerateCuttingPlanImage(CuttingPlan plan)
        {
            // Determine image dimensions
            int imageWidth = 1000;
            int imageHeight = (int)(plan.Stock.Length / plan.Stock.Width * 1000) + 100; // Extra space for annotations

            using var bitmap = new SkiaSharp.SKBitmap(imageWidth, imageHeight);
            using var canvas = new SkiaSharp.SKCanvas(bitmap);
            canvas.Clear(SkiaSharp.SKColors.White);

            // Scale factors
            double scaleX = imageWidth / plan.Stock.Width;
            double scaleY = (imageHeight - 100) / plan.Stock.Length; // Adjust for annotation space

            // Draw stock rectangle
            var stockRect = new SkiaSharp.SKRect(0, 100, imageWidth, imageHeight);
            canvas.DrawRect(stockRect, new SkiaSharp.SKPaint { Color = SkiaSharp.SKColors.LightGray });

            // Draw placed parts
            foreach (var placement in plan.PartsPlaced)
            {
                double partWidth = placement.Rotation == 90 ? placement.Part.Length : placement.Part.Width;
                double partHeight = placement.Rotation == 90 ? placement.Part.Width : placement.Part.Length;

                double x = placement.X * scaleX;
                double y = placement.Y * scaleY + 100; // Adjust for annotation space
                double width = partWidth * scaleX;
                double height = partHeight * scaleY;

                var partRect = new SkiaSharp.SKRect((float)x, (float)y, (float)(x + width), (float)(y + height));

                var paint = new SkiaSharp.SKPaint { Color = SkiaSharp.SKColors.Blue, Style = SkiaSharp.SKPaintStyle.Fill };
                canvas.DrawRect(partRect, paint);

                // Draw part size label
                paint.Color = SkiaSharp.SKColors.White;
                paint.TextSize = 14;
                var partSizeText = $"{placement.Part.Width} x {placement.Part.Length}";
                var textBounds = new SkiaSharp.SKRect();
                paint.MeasureText(partSizeText, ref textBounds);
                canvas.DrawText(partSizeText, (float)(x + (width - textBounds.Width) / 2), (float)(y + (height + textBounds.Height) / 2), paint);
            }

            // Draw annotations at the top
            var annotationPaint = new SkiaSharp.SKPaint { Color = SkiaSharp.SKColors.Black, TextSize = 24, IsAntialias = true };
            float annotationY = 30;

            // Stock size
            string stockSizeText = $"Stock Size: {plan.Stock.Width} x {plan.Stock.Length}";
            canvas.DrawText(stockSizeText, 10, annotationY, annotationPaint);
            annotationY += 30;

            // Stack size and total sets
            string stackSizeText = $"Stack Height: {plan.StackHeight}";
            string totalSetsText = $"Total Sets: {plan.TotalSets}";
            canvas.DrawText(stackSizeText, 10, annotationY, annotationPaint);
            canvas.DrawText(totalSetsText, imageWidth / 2, annotationY, annotationPaint);
            annotationY += 30;

            // Convert canvas to image
            using var image = SkiaSharp.SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SkiaSharp.SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }
    }
}


