using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SchedulerTryOut.Models.Utilities
{
    public class ValidTimeDiff : ValidationAttribute
    {
        private readonly string DateToCompareFieldName;

        public ValidTimeDiff(string dateToCompareFieldName)
        {
            DateToCompareFieldName = dateToCompareFieldName;
        }
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            DateTime? laterDate = (DateTime?)value;
            DateTime earlierDate = (DateTime)validationContext.ObjectType.GetProperty(DateToCompareFieldName).GetValue(validationContext.ObjectInstance, null);

            if (laterDate > earlierDate || laterDate == null)
            {
                return ValidationResult.Success;
            }
            else { 
                return new ValidationResult(string.Format("{0} Moet eerder zijn dan deze datum!", DateToCompareFieldName));
            }
        }
    }
}
