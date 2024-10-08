﻿using Humanizer.Localisation.TimeToClockNotation;

namespace LabPortal.Models.Dto
{
    public class ItemDto
    {
        public int ItemId { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public string? SerialNum { get; set; }
        public int Lab { get; set; }
        public string? Picture { get; set; }
    }
}
