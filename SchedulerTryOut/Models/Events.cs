using SchedulerTryOut.Models.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SchedulerTryOut.Models
{
    public class Events
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Subject { get; set; }
        public string Description { get; set; }
        [Required]
        public DateTime Start { get; set; }
        [ValidTimeDiff("Start")]
        public DateTime? End { get; set; }
        public string ThemeColor { get; set; }
        [Required]
        public bool IsFullDay { get; set; }
    }
}
