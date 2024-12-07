using System.Collections;
using System.Linq;
using Microsoft.AspNetCore.Identity;

namespace SteadySteps.BLL
{
    public class IdentityException(IEnumerable<IdentityError> errors) : Exception
    {
        public override IDictionary Data
        {
            get
            {
                return errors
                    .Select((item, index) => new { item, index })
                    .ToDictionary(x => x.index, x => x.item);
            }
        }

        public override string Message
        {
            get
            {
                return errors
                    .Aggregate("", (s, error) => s += $"{error.Code}: {error.Description}\n");
            }
        }
    }
}