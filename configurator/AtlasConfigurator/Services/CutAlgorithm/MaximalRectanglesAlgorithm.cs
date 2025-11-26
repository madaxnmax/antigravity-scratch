using AtlasConfigurator.Models.CutAlgorithm;

namespace AtlasConfigurator.Services.CutAlgorithm
{
    public class MaximalRectanglesAlgorithm
    {
        private readonly Saw _saw;
        private readonly double _kerf;
        private List<Part> _partsToPlace;

        public MaximalRectanglesAlgorithm(Saw saw)
        {
            _saw = saw;
            _kerf = saw.BladeWidth;
        }

        public List<CuttingPlan> OptimizeCuttingPlans(List<Stock> stocks, List<Part> parts)
        {
            var cuttingPlans = new List<CuttingPlan>();
            _partsToPlace = parts.Select(p => p.Clone()).ToList();

            // Sort parts in decreasing order by area
            _partsToPlace.Sort((a, b) => (b.Length * b.Width).CompareTo(a.Length * a.Width));

            // Loop through available stocks
            foreach (var stock in stocks)
            {
                while (_partsToPlace.Any(p => p.Quantity > 0))
                {
                    var placements = new List<PartPlacement>();
                    var freeRectangles = new List<MaximalRectangle>
            {
                new MaximalRectangle { X = 0, Y = 0, Width = stock.Width, Height = stock.Length }
            };

                    // Place parts using Maximal Rectangles algorithm
                    foreach (var part in _partsToPlace.Where(p => p.Quantity > 0).ToList())
                    {
                        int partsPlaced = 0;

                        for (int qty = 0; qty < part.Quantity; qty++)
                        {
                            var placement = PlacePartInFreeRectangles(part, freeRectangles);
                            if (placement != null)
                            {
                                placements.Add(placement);
                                partsPlaced++;
                            }
                            else
                            {
                                // Cannot place more of this part on this sheet
                                break;
                            }
                        }

                        // Reduce the part quantity by the number of parts placed
                        part.Quantity -= partsPlaced;

                        if (part.Quantity == 0)
                        {
                            _partsToPlace.Remove(part);
                        }
                    }

                    // Add the cutting plan
                    if (placements.Any())
                    {
                        var usedStock = new Stock
                        {
                            Name = stock.Name,
                            Length = stock.Length,
                            Width = stock.Width,
                            Thickness = stock.Thickness,
                            Quantity = 1,
                            AutoAdd = stock.AutoAdd,
                            Type = stock.Type,
                            Cost = stock.Cost
                        };

                        cuttingPlans.Add(new CuttingPlan
                        {
                            Stock = usedStock,
                            PartsPlaced = placements,
                            Offcuts = GetOffcuts(freeRectangles),
                            Quantity = 1 // Each sheet represents one unit
                        });
                    }
                    else
                    {
                        // No more parts can be placed on this stock
                        break;
                    }

                    // Adjust stock quantity if not unlimited
                    if (!stock.AutoAdd && stock.Quantity > 0)
                    {
                        stock.Quantity--;
                        if (stock.Quantity <= 0)
                        {
                            break; // Move to next stock
                        }
                    }
                }
            }

            // Check if there are still parts that couldn't be placed
            if (_partsToPlace.Any(p => p.Quantity > 0))
            {
                throw new InvalidOperationException("Not all parts could be placed with the available stocks.");
            }

            return cuttingPlans;
        }

        private PartPlacement PlacePartInFreeRectangles(Part part, List<MaximalRectangle> freeRectangles)
        {
            MaximalRectangle bestRect = null;
            bool bestRotated = false;
            double bestScore = double.MaxValue;

            foreach (var rect in freeRectangles)
            {
                // Try both orientations
                for (int rotation = 0; rotation <= 90; rotation += 90)
                {
                    if (rotation == 90 && part.OrientationLock == true)
                        continue; // Skip rotation if not allowed

                    double partWidth = rotation == 90 ? part.Length : part.Width;
                    double partHeight = rotation == 90 ? part.Width : part.Length;

                    if (CanFit(partWidth, partHeight, rect.Width, rect.Height))
                    {
                        double score = ScoreRectangleFit(partWidth, partHeight, rect.Width, rect.Height);
                        if (score < bestScore)
                        {
                            bestScore = score;
                            bestRect = rect;
                            bestRotated = rotation == 90;
                        }
                    }
                }
            }

            if (bestRect != null)
            {
                // Place the part
                var placement = new PartPlacement
                {
                    Part = part.Clone(),
                    X = bestRect.X,
                    Y = bestRect.Y,
                    Rotation = bestRotated ? 90 : 0
                };

                // Update free rectangles
                SplitFreeRectangles(bestRect, placement.Part, bestRotated, freeRectangles);

                return placement;
            }

            // Cannot place the part
            return null;
        }

        private bool CanFit(double partWidth, double partHeight, double rectWidth, double rectHeight)
        {
            // Adjust for kerf
            double requiredWidth = partWidth + _kerf;
            double requiredHeight = partHeight + _kerf;

            return requiredWidth <= rectWidth && requiredHeight <= rectHeight;
        }

        private double ScoreRectangleFit(double partWidth, double partHeight, double rectWidth, double rectHeight)
        {
            double leftoverHoriz = rectWidth - partWidth;
            double leftoverVert = rectHeight - partHeight;

            double shortSideFit = Math.Min(leftoverHoriz, leftoverVert);
            double longSideFit = Math.Max(leftoverHoriz, leftoverVert);
            double areaFit = leftoverHoriz * leftoverVert;

            // Combine heuristics into a single score
            return areaFit + shortSideFit + longSideFit;
        }


        private void SplitFreeRectangles(MaximalRectangle rect, Part part, bool rotated, List<MaximalRectangle> freeRectangles)
        {
            double partWidth = rotated ? part.Length : part.Width;
            double partHeight = rotated ? part.Width : part.Length;

            // Adjust for kerf
            partWidth += _kerf;
            partHeight += _kerf;

            // Occupied area
            var usedRect = new MaximalRectangle
            {
                X = rect.X,
                Y = rect.Y,
                Width = partWidth,
                Height = partHeight
            };

            var newRectangles = new List<MaximalRectangle>();

            // Generate new free rectangles
            // Split horizontally
            if (rect.Width - partWidth > 0)
            {
                newRectangles.Add(new MaximalRectangle
                {
                    X = rect.X + partWidth,
                    Y = rect.Y,
                    Width = rect.Width - partWidth,
                    Height = rect.Height
                });
            }

            // Split vertically
            if (rect.Height - partHeight > 0)
            {
                newRectangles.Add(new MaximalRectangle
                {
                    X = rect.X,
                    Y = rect.Y + partHeight,
                    Width = partWidth,
                    Height = rect.Height - partHeight
                });
            }

            // Replace the used rectangle
            freeRectangles.Remove(rect);

            // Add new free rectangles
            freeRectangles.AddRange(newRectangles);

            // Optionally merge free rectangles to reduce fragmentation
            MergeFreeRectangles(freeRectangles);
        }

        private void MergeFreeRectangles(List<MaximalRectangle> freeRectangles)
        {
            for (int i = 0; i < freeRectangles.Count; i++)
            {
                for (int j = i + 1; j < freeRectangles.Count; j++)
                {
                    var rect1 = freeRectangles[i];
                    var rect2 = freeRectangles[j];

                    if (rect1.X == rect2.X && rect1.Width == rect2.Width)
                    {
                        // Vertically adjacent
                        if (rect1.Y + rect1.Height == rect2.Y)
                        {
                            // Merge rect2 above rect1
                            rect1.Height += rect2.Height;
                            freeRectangles.RemoveAt(j);
                            j--;
                        }
                        else if (rect2.Y + rect2.Height == rect1.Y)
                        {
                            // Merge rect1 above rect2
                            rect1.Y = rect2.Y;
                            rect1.Height += rect2.Height;
                            freeRectangles.RemoveAt(j);
                            j--;
                        }
                    }
                    else if (rect1.Y == rect2.Y && rect1.Height == rect2.Height)
                    {
                        // Horizontally adjacent
                        if (rect1.X + rect1.Width == rect2.X)
                        {
                            // Merge rect2 to the right of rect1
                            rect1.Width += rect2.Width;
                            freeRectangles.RemoveAt(j);
                            j--;
                        }
                        else if (rect2.X + rect2.Width == rect1.X)
                        {
                            // Merge rect1 to the right of rect2
                            rect1.X = rect2.X;
                            rect1.Width += rect2.Width;
                            freeRectangles.RemoveAt(j);
                            j--;
                        }
                    }
                }
            }
        }

        private List<Offcut> GetOffcuts(List<MaximalRectangle> freeRectangles)
        {
            var offcuts = new List<Offcut>();

            foreach (var rect in freeRectangles)
            {
                if (rect.Width > _kerf && rect.Height > _kerf)
                {
                    offcuts.Add(new Offcut
                    {
                        Width = rect.Width - _kerf,
                        Length = rect.Height - _kerf,
                        Quantity = 1
                    });
                }
            }

            return offcuts;
        }

        public List<Part> GetUnplacedParts()
        {
            return _partsToPlace.Where(p => p.Quantity > 0).ToList();
        }

        // Nested class for Maximal Rectangles
        public class MaximalRectangle
        {
            public double X { get; set; }
            public double Y { get; set; }
            public double Width { get; set; }
            public double Height { get; set; }
        }
    }
}
