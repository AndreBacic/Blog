using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BlogAPI.Models
{
    public class EditPasswordModel
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
